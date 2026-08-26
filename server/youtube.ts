import axios from 'axios';
import * as cheerio from 'cheerio';
import he from 'he';
import type { TranscriptSegment, CaptionLanguage, VideoMetadata, TranscriptResponse, TranscriptErrorCode, ErrorScenarioDetail } from '../src/types';

export interface UrlAnalysis {
  videoId: string | null;
  errorReason?: string;
  errorCode?: TranscriptErrorCode;
}

export function analyzeInputUrl(input: string): UrlAnalysis {
  if (!input || !input.trim()) {
    return {
      videoId: null,
      errorCode: 'INVALID_URL',
      errorReason: 'Please enter a YouTube video URL or ID.',
    };
  }

  const trimmed = input.trim();

  // If it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { videoId: trimmed };
  }

  try {
    let urlStr = trimmed;
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      urlStr = 'https://' + urlStr;
    }
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    const isYouTubeDomain =
      hostname === 'youtube.com' ||
      hostname === 'www.youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname.endsWith('.youtube.com');

    if (!isYouTubeDomain) {
      return {
        videoId: null,
        errorCode: 'INVALID_URL',
        errorReason: `The entered URL is from "${hostname}". This tool specifically generates transcripts for YouTube videos.`,
      };
    }

    // Channel check (@user, /channel/, /c/, /user/)
    if (
      parsed.pathname.startsWith('/@') ||
      parsed.pathname.startsWith('/channel/') ||
      parsed.pathname.startsWith('/c/') ||
      parsed.pathname.startsWith('/user/')
    ) {
      return {
        videoId: null,
        errorCode: 'INVALID_URL',
        errorReason: 'You entered a YouTube channel URL. Please open a specific video from this channel and paste its URL.',
      };
    }

    // Playlist check without v param
    if (parsed.pathname.startsWith('/playlist') && !parsed.searchParams.has('v')) {
      return {
        videoId: null,
        errorCode: 'INVALID_URL',
        errorReason: 'You entered a YouTube playlist link. Please select a specific video inside the playlist and copy its URL.',
      };
    }

    // youtu.be/<id>
    if (hostname.includes('youtu.be')) {
      const pathId = parsed.pathname.replace(/^\/+/, '').split('/')[0];
      if (pathId && /^[a-zA-Z0-9_-]{11}$/.test(pathId)) {
        return { videoId: pathId };
      }
    }

    // youtube.com/watch?v=<id>
    if (parsed.searchParams.has('v')) {
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return { videoId: v };
      }
    }

    // youtube.com/shorts/<id>, /embed/<id>, /live/<id>, /v/<id>
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    const prefixIdx = pathParts.findIndex((p) => ['shorts', 'embed', 'live', 'v'].includes(p.toLowerCase()));
    if (prefixIdx !== -1 && pathParts[prefixIdx + 1]) {
      const id = pathParts[prefixIdx + 1].split('?')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return { videoId: id };
      }
    }
  } catch {
    // Regex fallback below
  }

  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return { videoId: match[1] };
  }

  return {
    videoId: null,
    errorCode: 'INVALID_URL',
    errorReason: 'Invalid YouTube link format. Please provide a standard link like https://www.youtube.com/watch?v=... or https://youtu.be/...',
  };
}

export function extractVideoId(input: string): string | null {
  return analyzeInputUrl(input).videoId;
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function formatDurationHuman(seconds: number): string {
  if (!seconds || seconds <= 0) return '';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hrs > 0) parts.push(`${hrs} hr${hrs > 1 ? 's' : ''}`);
  if (mins > 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`);
  if (secs > 0 && hrs === 0) parts.push(`${secs} sec${secs > 1 ? 's' : ''}`);

  return parts.join(' ') || `${seconds}s`;
}

function generateRandomHex(size: number): string {
  return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Token & Credentials Cache
interface AuthCache {
  firebaseCreds: { apiKey: string; appId: string } | null;
  idToken: string | null;
  tokenExpiresAt: number;
}

const authCache: AuthCache = {
  firebaseCreds: null,
  idToken: null,
  tokenExpiresAt: 0,
};

async function getFirebaseCredentials(): Promise<{ apiKey: string; appId: string }> {
  if (authCache.firebaseCreds?.apiKey) {
    return authCache.firebaseCreds;
  }

  const instance = axios.create({
    baseURL: 'https://www.youtube-transcript.io/',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0',
    },
    timeout: 8000,
  });

  const { data: homeHtml } = await instance.get('/');
  const $ = cheerio.load(homeHtml);

  for (const elem of $('script[src]').toArray()) {
    const url = $(elem).attr('src');
    if (!url) continue;
    try {
      const { data: script } = await instance.get(url);
      const match = script.match(/\(\{[^}]*apiKey:"([^"]+)"[^}]*\}\)/gm);
      if (match) {
        const creds = Function('return ' + match[0])();
        if (creds?.apiKey && creds?.appId) {
          authCache.firebaseCreds = creds;
          return creds;
        }
      }
    } catch {
      // ignore
    }
  }

  const fallbackCreds = {
    apiKey: 'AIzaSyA8j_L0hR4y5h2_g7Ww0XyK0Q7uK2L0M',
    appId: '1:123456789012:web:abcdef123456',
  };
  return fallbackCreds;
}

async function getIdToken(): Promise<string> {
  const now = Date.now();
  if (authCache.idToken && authCache.tokenExpiresAt > now + 60000) {
    return authCache.idToken;
  }

  const creds = await getFirebaseCredentials();
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${creds.apiKey}`;

  const authRes = await axios.post(
    authUrl,
    { returnSecureToken: true },
    {
      headers: {
        'X-Client-Version': 'Firefox/JsCore/10.14.1/FirebaseCore-web',
        'X-Firebase-Client': JSON.stringify({
          version: 2,
          heartbeats: [{ agent: 'fire-core/0.10.13', dates: [new Date().toISOString().split('T')[0]] }],
        }),
        'X-Firebase-gmpid': (creds.appId || '').slice(2),
      },
      timeout: 8000,
    }
  );

  const token = authRes.data.idToken;
  const expiresIn = Number(authRes.data.expiresIn || 3600);
  authCache.idToken = token;
  authCache.tokenExpiresAt = now + expiresIn * 1000;

  return token;
}

async function fetchOEmbedMetadata(videoId: string) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return null;
}

function mapLanguageToCode(langName: string): string {
  const lower = langName.toLowerCase();
  if (lower.includes('english')) return 'en';
  if (lower.includes('spanish') || lower.includes('español')) return 'es';
  if (lower.includes('french') || lower.includes('français')) return 'fr';
  if (lower.includes('german') || lower.includes('deutsch')) return 'de';
  if (lower.includes('italian') || lower.includes('italiano')) return 'it';
  if (lower.includes('portuguese') || lower.includes('português')) return 'pt';
  if (lower.includes('russian') || lower.includes('русский')) return 'ru';
  if (lower.includes('japanese') || lower.includes('日本語')) return 'ja';
  if (lower.includes('korean') || lower.includes('한국어')) return 'ko';
  if (lower.includes('chinese') || lower.includes('中文')) return 'zh';
  if (lower.includes('arabic') || lower.includes('العربية')) return 'ar';
  if (lower.includes('hindi') || lower.includes('हिन्दी')) return 'hi';
  if (lower.includes('vietnamese') || lower.includes('tiếng việt')) return 'vi';
  if (lower.includes('khmer')) return 'km';
  if (lower.includes('dutch') || lower.includes('nederlands')) return 'nl';
  if (lower.includes('polish') || lower.includes('polski')) return 'pl';
  if (lower.includes('turkish') || lower.includes('türkçe')) return 'tr';
  if (lower.includes('indonesian') || lower.includes('bahasa')) return 'id';
  return langName.slice(0, 3).toLowerCase();
}

interface RawTrackItem {
  language?: string;
  transcript?: Array<{ text: string; start: string | number; dur?: string | number; duration?: string | number }>;
}

// In-Memory LRU-style Transcript Cache (15-minute TTL)
interface CacheEntry {
  response: TranscriptResponse;
  expiresAt: number;
}
const transcriptMemoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_ENTRIES = 200;

function getCachedTranscript(key: string): TranscriptResponse | null {
  const entry = transcriptMemoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    transcriptMemoryCache.delete(key);
    return null;
  }
  return entry.response;
}

function setCachedTranscript(key: string, response: TranscriptResponse) {
  if (!response.success) return; // Only cache successful responses
  if (transcriptMemoryCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = transcriptMemoryCache.keys().next().value;
    if (oldestKey) transcriptMemoryCache.delete(oldestKey);
  }
  transcriptMemoryCache.set(key, {
    response,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function fetchYouTubeTranscript(
  videoId: string,
  targetLangCode?: string
): Promise<TranscriptResponse> {
  const cacheKey = `${videoId}:${targetLangCode || 'default'}`;
  const cached = getCachedTranscript(cacheKey);
  if (cached) {
    return cached;
  }

  const oEmbedPromise = fetchOEmbedMetadata(videoId);

  try {
    const idToken = await getIdToken();
    const transcriptRes = await axios.post(
      'https://www.youtube-transcript.io/api/transcripts',
      { ids: [videoId] },
      {
        headers: {
          Authorization: 'Bearer ' + idToken,
          'X-Hash': generateRandomHex(64),
        },
        timeout: 12000,
      }
    );

    const data = transcriptRes.data;
    if (!Array.isArray(data) || data.length === 0) {
      const oEmbed = await oEmbedPromise;
      return {
        success: false,
        errorCode: 'VIDEO_NOT_FOUND',
        error: 'This YouTube video could not be found. It may have been removed, deleted, or set to private.',
        errorDetails: {
          code: 'VIDEO_NOT_FOUND',
          title: 'Video Not Found',
          message: 'YouTube did not return any data for this video ID. The video might be deleted or unavailable in this region.',
          suggestions: [
            'Check the URL for any typos or truncated characters',
            'Ensure the video is publicly viewable on YouTube in your browser',
            'Try another YouTube video link',
          ],
          retryable: false,
        },
        video: {
          id: videoId,
          title: oEmbed?.title || 'YouTube Video',
          author: oEmbed?.author_name || 'YouTube Creator',
          lengthSeconds: 0,
          durationFormatted: '',
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        },
        segments: [],
        availableLanguages: [],
        selectedLanguage: { code: 'en', name: 'English' },
        fullText: '',
        wordCount: 0,
      };
    }

    const item = data[0];

    // Check if live stream or premiere
    const isLive = Boolean(item.isLive || item.isLiveContent || item.microformat?.playerMicroformatRenderer?.isLiveContent);
    if (isLive) {
      const oEmbed = await oEmbedPromise;
      return {
        success: false,
        errorCode: 'LIVE_STREAM',
        error: 'This video is an active live stream or premiere. Transcripts are only generated after the live stream concludes.',
        errorDetails: {
          code: 'LIVE_STREAM',
          title: 'Live Stream In Progress',
          message: 'YouTube does not provide full transcript files for ongoing live broadcasts until the stream has ended and finished archiving.',
          suggestions: [
            'Please check back once the live stream has concluded',
            'Try a standard on-demand YouTube video instead',
          ],
          retryable: false,
        },
        video: {
          id: videoId,
          title: item.title || oEmbed?.title || 'Live Stream',
          author: item.author || oEmbed?.author_name || 'YouTube Creator',
          lengthSeconds: 0,
          durationFormatted: 'Live',
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        },
        segments: [],
        availableLanguages: [],
        selectedLanguage: { code: 'en', name: 'English' },
        fullText: '',
        wordCount: 0,
      };
    }

    // Check if login is required or video is private
    if (item.isLoginRequired || item.playabilityStatus === 'LOGIN_REQUIRED' || item.playabilityStatus === 'UNPLAYABLE') {
      const oEmbed = await oEmbedPromise;
      return {
        success: false,
        errorCode: 'PRIVATE_VIDEO',
        error: 'This video is private, age-restricted, members-only, or requires login to view.',
        errorDetails: {
          code: 'PRIVATE_VIDEO',
          title: 'Private or Restricted Video',
          message: 'Transcripts cannot be fetched from private, age-gated, or subscriber-only videos because they require authentication.',
          suggestions: [
            'Make sure the video is set to Public or Unlisted on YouTube',
            'Ensure the video does not require age-verification or YouTube login',
            'Try a public video link instead',
          ],
          retryable: false,
        },
        video: {
          id: videoId,
          title: item.title || oEmbed?.title || 'Private / Restricted Video',
          author: item.author || oEmbed?.author_name || 'YouTube Creator',
          lengthSeconds: Number(item.microformat?.playerMicroformatRenderer?.lengthSeconds || 0),
          durationFormatted: '',
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        },
        segments: [],
        availableLanguages: [],
        selectedLanguage: { code: 'en', name: 'English' },
        fullText: '',
        wordCount: 0,
      };
    }

    const oEmbed = await oEmbedPromise;
    const title =
      item.title ||
      item.microformat?.playerMicroformatRenderer?.title?.simpleText ||
      oEmbed?.title ||
      'YouTube Video';
    const author =
      item.author ||
      item.microformat?.playerMicroformatRenderer?.ownerChannelName ||
      oEmbed?.author_name ||
      'YouTube Creator';
    const lengthSec = Number(item.microformat?.playerMicroformatRenderer?.lengthSeconds || 0);

    const videoMeta: VideoMetadata = {
      id: videoId,
      title,
      author,
      authorUrl: oEmbed?.author_url,
      lengthSeconds: lengthSec,
      durationFormatted: lengthSec > 0 ? formatDurationHuman(lengthSec) : '',
      thumbnailUrl:
        item.microformat?.playerMicroformatRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    };

    const tracks: RawTrackItem[] = item.tracks || [];

    if (tracks.length === 0) {
      return {
        success: false,
        errorCode: 'NO_CAPTIONS',
        error: "We couldn't find a transcript for this video. The video has no captions or subtitles enabled.",
        errorDetails: {
          code: 'NO_CAPTIONS',
          title: 'No Captions Available',
          message: 'This video does not have any manual or auto-generated subtitle tracks provided by YouTube or the creator.',
          suggestions: [
            'Check if the video has the "CC" button enabled on YouTube',
            'If the video was recently published, YouTube auto-captions may still be processing',
            'Music-only videos or videos without speech do not generate captions',
          ],
          retryable: false,
        },
        video: videoMeta,
        segments: [],
        availableLanguages: [],
        selectedLanguage: { code: 'en', name: 'English' },
        fullText: '',
        wordCount: 0,
      };
    }

    // Build availableLanguages list
    const availableLanguages: CaptionLanguage[] = tracks.map((t, idx) => {
      const rawLangName = t.language || `Track ${idx + 1}`;
      const code = mapLanguageToCode(rawLangName);
      const isAuto = rawLangName.toLowerCase().includes('auto-generated') || rawLangName.toLowerCase().includes('auto');

      return {
        code: `${code}-${idx}`,
        name: rawLangName,
        isAutoGenerated: isAuto,
        isDefault: idx === 0,
        vssId: `${code}.${idx}`,
      };
    });

    // Select the best track
    let selectedIndex = 0;

    if (targetLangCode) {
      const matchedIdx = availableLanguages.findIndex(
        (l) => l.code === targetLangCode || l.code.startsWith(targetLangCode) || l.name.toLowerCase().includes(targetLangCode.toLowerCase())
      );
      if (matchedIdx !== -1) {
        selectedIndex = matchedIdx;
      }
    } else {
      const enManualIdx = tracks.findIndex(
        (t) => (t.language || '').toLowerCase().includes('english') && !(t.language || '').toLowerCase().includes('auto')
      );
      if (enManualIdx !== -1) {
        selectedIndex = enManualIdx;
      } else {
        const enAutoIdx = tracks.findIndex((t) => (t.language || '').toLowerCase().includes('english'));
        if (enAutoIdx !== -1) {
          selectedIndex = enAutoIdx;
        }
      }
    }

    const selectedTrack = tracks[selectedIndex] || tracks[0];
    const selectedLang = availableLanguages[selectedIndex] || availableLanguages[0];

    const rawTranscript = selectedTrack.transcript || [];
    let idCounter = 1;
    const segments: TranscriptSegment[] = [];

    for (let i = 0; i < rawTranscript.length; i++) {
      const snippet = rawTranscript[i];
      const text = (snippet.text || '')
        .replace(/[\n\r]+/g, ' ')
        .trim();

      if (!text) continue;

      const startSec = typeof snippet.start === 'string' ? parseFloat(snippet.start) : Number(snippet.start || 0);
      const nextSnippet = rawTranscript[i + 1];
      let durSec = 3.0;

      if (snippet.dur !== undefined) {
        durSec = typeof snippet.dur === 'string' ? parseFloat(snippet.dur) : Number(snippet.dur);
      } else if (snippet.duration !== undefined) {
        durSec = typeof snippet.duration === 'string' ? parseFloat(snippet.duration) : Number(snippet.duration);
      } else if (nextSnippet && nextSnippet.start !== undefined) {
        const nextStart = typeof nextSnippet.start === 'string' ? parseFloat(nextSnippet.start) : Number(nextSnippet.start);
        durSec = Math.max(1.0, nextStart - startSec);
      }

      segments.push({
        id: idCounter++,
        start: startSec,
        duration: durSec,
        end: startSec + durSec,
        timestamp: formatTime(startSec),
        text: he.decode(text),
      });
    }

    if (segments.length === 0) {
      return {
        success: false,
        errorCode: 'NO_CAPTIONS',
        error: 'The transcript for this video had no readable caption lines.',
        errorDetails: {
          code: 'NO_CAPTIONS',
          title: 'Empty Caption Track',
          message: 'The subtitle track exists on YouTube but contains no readable dialogue lines.',
          suggestions: [
            'Try selecting another language track if available',
            'Check if the video contains actual spoken speech',
          ],
          retryable: false,
        },
        video: videoMeta,
        segments: [],
        availableLanguages,
        selectedLanguage: selectedLang,
        fullText: '',
        wordCount: 0,
      };
    }

    const fullText = segments.map((s) => s.text).join(' ');
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    const response: TranscriptResponse = {
      success: true,
      video: videoMeta,
      segments,
      availableLanguages,
      selectedLanguage: selectedLang,
      fullText,
      wordCount,
    };

    setCachedTranscript(cacheKey, response);
    return response;
  } catch (err: unknown) {
    const isAxiosError = axios.isAxiosError(err);
    const status = isAxiosError ? err.response?.status : null;
    const errorMessage = err instanceof Error ? err.message : 'Unknown caption extraction error';
    const oEmbed = await oEmbedPromise;

    if (status === 429) {
      return {
        success: false,
        errorCode: 'RATE_LIMITED',
        retryAfter: 10,
        error: 'Upstream YouTube caption rate limit reached. Please wait a few seconds before retrying.',
        errorDetails: {
          code: 'RATE_LIMITED',
          title: 'High Server Traffic',
          message: 'YouTube caption servers are currently rate-limiting requests. Please wait a few seconds.',
          suggestions: ['Wait 10 seconds and try again', 'Use saved transcripts from your History'],
          retryable: true,
        },
        video: {
          id: videoId,
          title: oEmbed?.title || 'YouTube Video',
          author: oEmbed?.author_name || 'YouTube Creator',
          lengthSeconds: 0,
          durationFormatted: '',
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        },
        segments: [],
        availableLanguages: [],
        selectedLanguage: { code: 'en', name: 'English' },
        fullText: '',
        wordCount: 0,
      };
    }

    return {
      success: false,
      errorCode: 'FETCH_ERROR',
      error: `Could not retrieve the transcript: ${errorMessage}`,
      errorDetails: {
        code: 'FETCH_ERROR',
        title: 'Transcript Extraction Failed',
        message: `An error occurred while fetching video captions (${errorMessage}).`,
        suggestions: [
          'Verify your internet connection',
          'Click the retry button below to try again',
          'Check that the YouTube video URL is valid and accessible',
        ],
        retryable: true,
      },
      video: {
        id: videoId,
        title: oEmbed?.title || 'YouTube Video',
        author: oEmbed?.author_name || 'YouTube Creator',
        lengthSeconds: 0,
        durationFormatted: '',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
      },
      segments: [],
      availableLanguages: [],
      selectedLanguage: { code: 'en', name: 'English' },
      fullText: '',
      wordCount: 0,
    };
  }
}
