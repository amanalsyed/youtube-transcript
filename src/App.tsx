import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { VideoPlayer } from './components/VideoPlayer';
import { TranscriptControls } from './components/TranscriptControls';
import { TranscriptViewer } from './components/TranscriptViewer';
import { TranslationBar, POPULAR_TARGET_LANGUAGES } from './components/TranslationBar';
import { KeyMomentsBar } from './components/KeyMomentsBar';
import { ShareModal } from './components/ShareModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { HowTranscriptionWorks } from './components/HowTranscriptionWorks';
import { FaqSection } from './components/FaqSection';
import { AboutCtaSection } from './components/AboutCtaSection';
import { Footer } from './components/Footer';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsConditions } from './components/TermsConditions';
import { ContactUs } from './components/ContactUs';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  TranscriptResponse,
  CaptionLanguage,
  CopyFormat,
  ExportFormat,
  HistoryItem,
  TranscriptErrorCode,
  ErrorScenarioDetail,
  KeyMoment,
  TranscriptSegment,
  TranscriptViewMode,
  TargetTranslationLanguage,
  TranslatedTranscriptData,
  TranslationResponse,
} from './types';
import {
  formatSegmentsToText,
  downloadTranscriptFile,
  formatTimeSeconds,
  findMatches,
} from './utils/textUtils';
import { extractKeyMoments } from './utils/keyMoments';
import {
  loadHistory,
  saveTranscriptToHistory,
  removeHistoryItem,
  clearHistory,
  saveActiveTranscript,
  loadActiveTranscript,
  clearActiveTranscript,
} from './utils/historyStorage';
import { ArrowLeft, RefreshCw, AlertCircle, FileText, Share2, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [transcriptData, setTranscriptData] = useState<TranscriptResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Fetching video...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<TranscriptErrorCode>('UNKNOWN');
  const [errorDetails, setErrorDetails] = useState<ErrorScenarioDetail | undefined>(undefined);
  const [retryAfter, setRetryAfter] = useState<number | undefined>(undefined);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Share Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetSegment, setShareTargetSegment] = useState<TranscriptSegment | null>(null);

  // Key Moments state
  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Active View / Page State
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'terms' | 'contact'>('home');

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Passive scroll listener for Back-to-Top performance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Keyboard Shortcuts (Escape to close modals/drawers)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isShareModalOpen) setIsShareModalOpen(false);
        if (isHistoryOpen) setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShareModalOpen, isHistoryOpen]);

  // Player & seeking state
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState<number>(0);
  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null);

  // Auto-scroll state
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Language loading state
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);

  // Timestamps toggle state (ON / OFF)
  const [showTimestamps, setShowTimestamps] = useState(true);

  // Translation state
  const [selectedTargetLang, setSelectedTargetLang] = useState<TargetTranslationLanguage>(
    POPULAR_TARGET_LANGUAGES[0]
  );
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedData, setTranslatedData] = useState<TranslatedTranscriptData | null>(null);
  const [viewMode, setViewMode] = useState<TranscriptViewMode>('original');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to parse time string like "120", "120s", "02:15", "1h2m3s"
  const parseTimeString = (tStr: string | null): number => {
    if (!tStr) return 0;
    const clean = tStr.trim().toLowerCase();
    if (/^\d+s?$/.test(clean)) {
      return parseInt(clean.replace('s', ''), 10) || 0;
    }
    if (clean.includes(':')) {
      const parts = clean.split(':').map((p) => parseInt(p, 10) || 0);
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  // Sync browser URL without full-page navigation
  const syncUrlWithState = (videoId?: string, timeSec?: number) => {
    if (typeof window === 'undefined') return;
    try {
      if (!videoId) {
        if (window.location.search) {
          window.history.replaceState({}, '', window.location.pathname);
        }
        return;
      }
      const params = new URLSearchParams();
      params.set('v', videoId);
      if (timeSec && timeSec > 0) {
        params.set('t', `${Math.floor(timeSec)}s`);
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({ videoId }, '', newUrl);
    } catch {
      // Ignore in strict environments
    }
  };

  // Fetch transcript from API
  const handleFetchTranscript = async (url: string, targetLang?: string, initialSeekSec?: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode('UNKNOWN');
    setErrorDetails(undefined);
    setRetryAfter(undefined);
    setLoadingStep('Fetching video...');
    setCurrentUrl(url);

    const stepTimer = setTimeout(() => {
      setLoadingStep('Getting transcript...');
    }, 450);

    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, lang: targetLang }),
      });

      clearTimeout(stepTimer);
      let data: TranscriptResponse;

      try {
        data = await response.json();
      } catch {
        setErrorMessage('Failed to parse server response. Please try again.');
        setErrorCode('FETCH_ERROR');
        return;
      }

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "We couldn't find a transcript for this video.");
        setErrorCode(data.errorCode || (response.status === 429 ? 'RATE_LIMITED' : 'FETCH_ERROR'));
        setErrorDetails(data.errorDetails);
        setRetryAfter(data.retryAfter || (response.status === 429 ? 15 : undefined));
        setTranscriptData(null);
        clearActiveTranscript();
        return;
      }

      setTranscriptData(data);
      setTranslatedData(null);
      setViewMode('original');
      setSearchQuery('');
      setCurrentMatchIndex(0);

      // Persist active session in sessionStorage
      saveActiveTranscript(data, url);
      syncUrlWithState(data.video.id, initialSeekSec);

      // Handle initial deep-link seek
      if (initialSeekSec && initialSeekSec > 0 && data.segments.length > 0) {
        const matchingSeg =
          data.segments.find(
            (s) => initialSeekSec >= s.start && initialSeekSec <= (s.end || s.start + 5)
          ) ||
          [...data.segments].reverse().find((s) => s.start <= initialSeekSec) ||
          data.segments[0];

        setSeekTime(initialSeekSec);
        setCurrentPlaybackTime(initialSeekSec);
        setActiveSegmentId(matchingSeg.id);
      } else {
        setActiveSegmentId(data.segments[0]?.id || null);
      }

      // Save to local history
      const updatedHistory = saveTranscriptToHistory(data);
      setHistory(updatedHistory);

      addToast({
        type: 'success',
        title: 'Transcript Loaded',
        description: `Retrieved ${data.segments.length} segments (${data.wordCount.toLocaleString()} words).`,
      });
    } catch (err: unknown) {
      clearTimeout(stepTimer);
      const msg = err instanceof Error ? err.message : 'Network error';
      setErrorMessage(`Network error while fetching transcript (${msg}). Please check your connection.`);
      setErrorCode('NETWORK_ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  // Check URL query parameters or active session cache on mount to survive page refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const videoParam = params.get('v') || params.get('video') || params.get('url') || params.get('id');
    const timeParam = params.get('t') || params.get('time') || params.get('start');
    const seekSec = parseTimeString(timeParam);

    const cachedSession = loadActiveTranscript();

    if (videoParam) {
      // Check if session cache matches requested video
      const isMatch =
        cachedSession &&
        (cachedSession.data.video.id === videoParam ||
          videoParam.includes(cachedSession.data.video.id));

      if (isMatch && cachedSession) {
        setTranscriptData(cachedSession.data);
        setCurrentUrl(cachedSession.url);
        if (seekSec && seekSec > 0 && cachedSession.data.segments.length > 0) {
          const matchingSeg =
            cachedSession.data.segments.find(
              (s) => seekSec >= s.start && seekSec <= (s.end || s.start + 5)
            ) ||
            [...cachedSession.data.segments].reverse().find((s) => s.start <= seekSec) ||
            cachedSession.data.segments[0];
          setSeekTime(seekSec);
          setCurrentPlaybackTime(seekSec);
          setActiveSegmentId(matchingSeg.id);
        } else {
          setActiveSegmentId(cachedSession.data.segments[0]?.id || null);
        }
        return;
      }

      // Otherwise fetch from API
      const fullUrl = videoParam.startsWith('http')
        ? videoParam
        : `https://www.youtube.com/watch?v=${videoParam}`;
      handleFetchTranscript(fullUrl, undefined, seekSec);
    } else if (cachedSession && cachedSession.data) {
      // Page refreshed on base route without ?v= query, restore previous active session
      setTranscriptData(cachedSession.data);
      setCurrentUrl(cachedSession.url);
      setActiveSegmentId(cachedSession.data.segments[0]?.id || null);
      syncUrlWithState(cachedSession.data.video.id);
    }
  }, []);

  // Compute Key Moments from transcript segments
  const keyMoments = useMemo<KeyMoment[]>(() => {
    if (!transcriptData?.segments || transcriptData.segments.length === 0) return [];
    return extractKeyMoments(transcriptData.segments);
  }, [transcriptData?.segments]);

  // Language change
  const handleLanguageSelect = async (lang: CaptionLanguage) => {
    if (!transcriptData || !currentUrl) return;
    setIsLanguageLoading(true);
    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: currentUrl, lang: lang.code }),
      });
      const data: TranscriptResponse = await response.json();
      if (data.success) {
        setTranscriptData(data);
        setSearchQuery('');
        setCurrentMatchIndex(0);

        // Update active session & history with new language
        saveActiveTranscript(data, currentUrl);
        syncUrlWithState(data.video.id, currentPlaybackTime);

        const updated = saveTranscriptToHistory(data);
        setHistory(updated);

        addToast({
          type: 'info',
          title: 'Language Updated',
          description: `Loaded transcript in ${lang.name}.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Language Switch Failed',
          description: data.error || 'Could not load this language transcript.',
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to switch language track.',
      });
    } finally {
      setIsLanguageLoading(false);
    }
  };

  // History Actions
  const handleSelectHistory = (item: HistoryItem) => {
    const targetUrl = item.url || `https://www.youtube.com/watch?v=${item.videoId}`;
    if (item.data && item.data.segments && item.data.segments.length > 0) {
      setTranscriptData(item.data);
      setTranslatedData(null);
      setViewMode('original');
      setCurrentUrl(targetUrl);
      setErrorMessage(null);
      setSearchQuery('');
      setCurrentMatchIndex(0);
      setActiveSegmentId(item.data.segments[0]?.id || null);

      saveActiveTranscript(item.data, targetUrl);
      syncUrlWithState(item.videoId);

      addToast({
        type: 'info',
        title: 'Loaded from History',
        description: `Opened "${item.title}".`,
      });

      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleFetchTranscript(targetUrl);
    }
  };

  const handleRemoveHistoryItem = (id: string) => {
    const updated = removeHistoryItem(id);
    setHistory(updated);
    addToast({
      type: 'info',
      title: 'Item Removed',
      description: 'Transcript removed from local history.',
    });
  };

  const handleClearAllHistory = () => {
    clearHistory();
    setHistory([]);
    addToast({
      type: 'info',
      title: 'History Cleared',
      description: 'All saved transcripts have been removed.',
    });
  };

  const handleQuickCopyHistory = (item: HistoryItem) => {
    if (item.data) {
      const plainText = item.data.segments.map((s) => s.text).join(' ');
      navigator.clipboard.writeText(plainText);
      addToast({
        type: 'success',
        title: 'Copied to Clipboard',
        description: `Copied full transcript for "${item.title}".`,
      });
    }
  };

  // Seek handler
  const handleSeek = (seconds: number, segmentId: number) => {
    setSeekTime(seconds);
    setCurrentPlaybackTime(seconds);
    setActiveSegmentId(segmentId);
  };

  // Player time update
  const handleTimeUpdate = useCallback(
    (seconds: number) => {
      setCurrentPlaybackTime(seconds);
      if (!transcriptData?.segments.length) return;

      const activeSeg = transcriptData.segments.find(
        (seg) => seconds >= seg.start && seconds < (seg.end || seg.start + seg.duration)
      );

      if (activeSeg && activeSeg.id !== activeSegmentId) {
        setActiveSegmentId(activeSeg.id);
      }
    },
    [transcriptData, activeSegmentId]
  );

  // Handle Translation
  const handleTranslate = async (overrideTargetLang?: TargetTranslationLanguage) => {
    if (!transcriptData || !transcriptData.segments || transcriptData.segments.length === 0) return;
    const target = overrideTargetLang || selectedTargetLang;
    setIsTranslating(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: transcriptData.segments,
          targetLang: target.code,
          videoId: transcriptData.video.id,
        }),
      });

      const data: TranslationResponse = await response.json();
      if (!response.ok || !data.success || !data.segments || !data.targetLanguage) {
        addToast({
          type: 'error',
          title: 'Translation Failed',
          description: data.error || 'Could not translate transcript. Please try again.',
        });
        return;
      }

      const transResult: TranslatedTranscriptData = {
        targetLanguage: data.targetLanguage,
        segments: data.segments,
        fullText: data.fullText || data.segments.map((s) => s.text).join(' '),
        wordCount: data.wordCount || data.segments.length,
      };

      setTranslatedData(transResult);
      setViewMode('translated');
      setSearchQuery('');
      setCurrentMatchIndex(0);

      addToast({
        type: 'success',
        title: 'Translation Ready',
        description: `Translated into ${target.name} (${transResult.wordCount.toLocaleString()} words).`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      addToast({
        type: 'error',
        title: 'Translation Error',
        description: `Network error while translating: ${msg}`,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClearTranslation = () => {
    setTranslatedData(null);
    setViewMode('original');
    setSearchQuery('');
    setCurrentMatchIndex(0);
    addToast({
      type: 'info',
      title: 'Translation Reset',
      description: 'Switched back to original transcript view.',
    });
  };

  // Active display segments depending on current view mode
  const activeDisplaySegments = useMemo<TranscriptSegment[]>(() => {
    if (!transcriptData?.segments) return [];
    if (viewMode === 'translated' && translatedData?.segments) {
      return translatedData.segments;
    }
    return transcriptData.segments;
  }, [transcriptData?.segments, viewMode, translatedData?.segments]);

  // Copy transcript
  const handleCopy = (format: CopyFormat) => {
    if (!transcriptData) return;
    const segsToCopy =
      viewMode === 'translated' && translatedData?.segments
        ? translatedData.segments
        : transcriptData.segments;

    const textToCopy = formatSegmentsToText(
      segsToCopy,
      format,
      transcriptData.video,
      translatedData?.segments,
      translatedData?.targetLanguage?.name
    );

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        const labels: Record<CopyFormat, string> = {
          'text-only':
            viewMode === 'translated'
              ? `Plain text (${translatedData?.targetLanguage.name})`
              : 'Plain text',
          'with-timestamps':
            viewMode === 'translated'
              ? `Timestamps (${translatedData?.targetLanguage.name})`
              : 'Text with timestamps',
          markdown: 'Markdown formatted',
          bilingual: `Bilingual (${translatedData?.targetLanguage.name} + Original)`,
        };
        addToast({
          type: 'success',
          title: 'Copied to Clipboard',
          description: `${labels[format] || 'Transcript'} copied successfully.`,
        });
      })
      .catch(() => {
        addToast({
          type: 'error',
          title: 'Copy Failed',
          description: 'Failed to copy to clipboard. Please check browser permissions.',
        });
      });
  };

  // Download transcript
  const handleDownload = (format: ExportFormat) => {
    if (!transcriptData) return;
    const segsToDownload =
      viewMode === 'translated' && translatedData?.segments
        ? translatedData.segments
        : transcriptData.segments;

    const langSuffix =
      viewMode === 'translated' || viewMode === 'side-by-side'
        ? translatedData?.targetLanguage?.code
        : undefined;

    downloadTranscriptFile(segsToDownload, transcriptData.video, format, langSuffix);

    const labels: Record<ExportFormat, string> = {
      'txt-timestamps': 'TXT (with timestamps)',
      'txt-plain': 'TXT (plain text)',
      srt: 'SRT Subtitles file',
      vtt: 'WebVTT Subtitles file',
      pdf: 'PDF Document',
      markdown: 'Markdown Document',
    };
    addToast({
      type: 'success',
      title: 'Download Started',
      description: `Exporting ${langSuffix ? `(${langSuffix.toUpperCase()}) ` : ''}transcript as ${labels[format]}.`,
    });
  };

  // Search logic (aware of original, translated, and side-by-side views)
  const matchedSegmentIds = useMemo(() => {
    if (!transcriptData?.segments || !searchQuery.trim()) return [];
    if (viewMode === 'side-by-side' && translatedData?.segments) {
      const query = searchQuery.trim().toLowerCase();
      const matchedIds: number[] = [];
      for (let i = 0; i < transcriptData.segments.length; i++) {
        const origText = transcriptData.segments[i].text.toLowerCase();
        const transText = (translatedData.segments[i]?.text || '').toLowerCase();
        if (origText.includes(query) || transText.includes(query)) {
          matchedIds.push(transcriptData.segments[i].id);
        }
      }
      return matchedIds;
    }
    return findMatches(activeDisplaySegments, searchQuery);
  }, [transcriptData?.segments, searchQuery, viewMode, translatedData?.segments, activeDisplaySegments]);

  const totalDurationSeconds = transcriptData?.video?.lengthSeconds || 0;
  const progressPercent =
    totalDurationSeconds > 0
      ? Math.min(100, (currentPlaybackTime / totalDurationSeconds) * 100)
      : 0;

  const handleNextMatch = () => {
    if (matchedSegmentIds.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchedSegmentIds.length);
  };

  const handlePrevMatch = () => {
    if (matchedSegmentIds.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matchedSegmentIds.length) % matchedSegmentIds.length);
  };

  // Key Moment Selection
  const handleSelectMoment = (moment: KeyMoment) => {
    setActiveMomentId(moment.id);
    handleSeek(moment.start, moment.startSegmentId);
    addToast({
      type: 'info',
      title: moment.title,
      description: `Jumped to summary section at ${moment.timestamp}.`,
    });
  };

  // Share handlers
  const handleOpenShareModal = () => {
    if (!transcriptData) return;
    const currentSeg =
      transcriptData.segments.find((s) => s.id === activeSegmentId) ||
      transcriptData.segments.find(
        (s) => currentPlaybackTime >= s.start && currentPlaybackTime <= (s.end || s.start + 5)
      ) ||
      transcriptData.segments[0] ||
      null;
    setShareTargetSegment(currentSeg);
    setIsShareModalOpen(true);
  };

  const handleShareSegment = (seg: TranscriptSegment) => {
    setShareTargetSegment(seg);
    setIsShareModalOpen(true);
  };

  // Reset to input view
  const handleReset = () => {
    setCurrentPage('home');
    setTranscriptData(null);
    setTranslatedData(null);
    setViewMode('original');
    setErrorMessage(null);
    setErrorCode('UNKNOWN');
    setErrorDetails(undefined);
    setRetryAfter(undefined);
    setSearchQuery('');
    setSeekTime(null);
    setActiveMomentId(null);
    setShareTargetSegment(null);
    clearActiveTranscript();
    syncUrlWithState(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/70 text-zinc-900 font-['Poppins',sans-serif] antialiased selection:bg-zinc-900 selection:text-white">
      <Header
        onReset={handleReset}
        hasTranscript={!!transcriptData}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
      />

      <main id="main-content" className="flex-1">
        {currentPage === 'privacy' && (
          <PrivacyPolicy onBack={() => setCurrentPage('home')} />
        )}

        {currentPage === 'terms' && (
          <TermsConditions onBack={() => setCurrentPage('home')} />
        )}

        {currentPage === 'contact' && (
          <ContactUs
            onBack={() => setCurrentPage('home')}
            onToast={(msg, type) =>
              addToast({
                type,
                title: type === 'success' ? 'Message Sent' : 'Notice',
                description: msg,
              })
            }
          />
        )}

        {currentPage === 'home' && (
          <>
            {/* Top Hero / URL input banner */}
        <div className={`transition-all duration-300 ${transcriptData ? 'py-6 bg-white border-b border-zinc-200/60' : 'py-12 sm:py-20'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <UrlInput
              onSubmit={(url) => handleFetchTranscript(url)}
              isLoading={isLoading}
              loadingStep={loadingStep}
              errorMessage={errorMessage}
              errorCode={errorCode}
              errorDetails={errorDetails}
              retryAfter={retryAfter}
              onRetry={() => currentUrl && handleFetchTranscript(currentUrl)}
              onClearError={() => {
                setErrorMessage(null);
                setErrorCode('UNKNOWN');
                setErrorDetails(undefined);
                setRetryAfter(undefined);
              }}
              history={history}
              onSelectHistory={handleSelectHistory}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          </div>
        </div>

        {/* Transcript Result Section */}
        {transcriptData && (
          <section className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
            {/* Top breadcrumb & quick actions */}
            <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-zinc-200/60 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200/70 rounded-xl hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>New Search</span>
                </button>
                <span className="text-zinc-300 hidden xs:inline">/</span>
                <span className="text-xs font-medium text-zinc-600 truncate min-w-0 flex-1">
                  {transcriptData.video.title}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-500 shrink-0">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Ready to read &amp; copy
                </span>
              </div>
            </div>

            {/* Main Result Grid (Desktop: Side-by-Side, Mobile: Stacked) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Video Player & Metadata (5 cols on lg) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                <VideoPlayer
                  video={transcriptData.video}
                  seekTime={seekTime}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>

              {/* Right Column: Transcript Card & Controls (7 cols on lg) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/70 shadow-sm flex flex-col relative">
                {/* Progress bar at top of transcript section */}
                <div className="w-full bg-zinc-50/80 border-b border-zinc-100 flex flex-col rounded-t-2xl overflow-hidden">
                  {/* Slim colored progress track */}
                  <div
                    className="w-full h-1 bg-zinc-200/70 relative overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(progressPercent)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Video playback progress"
                  >
                    <div
                      className="h-full bg-zinc-900 transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Progress info subheader */}
                  <div className="px-4 py-2 flex items-center justify-between text-[11px] text-zinc-500 font-medium border-b border-zinc-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-700">Video Progress:</span>
                      <span className="font-mono text-zinc-600">
                        {formatTimeSeconds(currentPlaybackTime)} / {formatTimeSeconds(totalDurationSeconds)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-zinc-800">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                  </div>
                </div>

                <TranscriptControls
                  video={transcriptData.video}
                  viewMode={viewMode}
                  translatedTargetLanguage={translatedData?.targetLanguage || null}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  onOpenShare={handleOpenShareModal}
                  searchQuery={searchQuery}
                  onSearchChange={(q) => {
                    setSearchQuery(q);
                    setCurrentMatchIndex(0);
                  }}
                  matchCount={matchedSegmentIds.length}
                  currentMatchIndex={currentMatchIndex}
                  onNextMatch={handleNextMatch}
                  onPrevMatch={handlePrevMatch}
                  availableLanguages={transcriptData.availableLanguages}
                  selectedLanguage={transcriptData.selectedLanguage}
                  onLanguageSelect={handleLanguageSelect}
                  isLanguageLoading={isLanguageLoading}
                  totalWords={
                    viewMode === 'translated' && translatedData
                      ? translatedData.wordCount
                      : transcriptData.wordCount
                  }
                  totalSegments={
                    viewMode === 'translated' && translatedData
                      ? translatedData.segments.length
                      : transcriptData.segments.length
                  }
                  showTimestamps={showTimestamps}
                  onToggleTimestamps={() => setShowTimestamps((prev) => !prev)}
                  autoScroll={autoScroll}
                  onToggleAutoScroll={() => setAutoScroll((prev) => !prev)}
                />

                {/* Instant Free Translation Bar & Toggleable Views */}
                <TranslationBar
                  originalLanguageName={transcriptData.selectedLanguage?.name || 'English'}
                  selectedTargetLang={selectedTargetLang}
                  onSelectTargetLang={(lang) => {
                    setSelectedTargetLang(lang);
                  }}
                  onTranslate={() => handleTranslate(selectedTargetLang)}
                  isTranslating={isTranslating}
                  translatedData={translatedData}
                  viewMode={viewMode}
                  onChangeViewMode={(mode) => setViewMode(mode)}
                  onClearTranslation={handleClearTranslation}
                />

                {/* Key Moments Section Navigation Bar */}
                {keyMoments.length > 0 && (
                  <KeyMomentsBar
                    keyMoments={keyMoments}
                    activeMomentId={activeMomentId}
                    onSelectMoment={handleSelectMoment}
                    currentPlaybackTime={currentPlaybackTime}
                  />
                )}

                <TranscriptViewer
                  segments={activeDisplaySegments}
                  originalSegments={transcriptData.segments}
                  translatedSegments={translatedData?.segments}
                  viewMode={viewMode}
                  targetLanguageName={translatedData?.targetLanguage?.name}
                  targetLanguageCode={translatedData?.targetLanguage?.code}
                  targetLanguageFlag={translatedData?.targetLanguage?.flag}
                  activeSegmentId={activeSegmentId}
                  onSeek={handleSeek}
                  onShareSegment={handleShareSegment}
                  searchQuery={searchQuery}
                  matchedSegmentIds={matchedSegmentIds}
                  currentMatchIndex={currentMatchIndex}
                  showTimestamps={showTimestamps}
                  autoScroll={autoScroll}
                />
              </div>
            </div>

            {/* Share Deep Link Modal */}
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              video={transcriptData.video}
              currentTime={shareTargetSegment ? shareTargetSegment.start : currentPlaybackTime}
              activeSegment={shareTargetSegment}
              onToast={addToast}
            />
          </section>
        )}

        {/* Informational & SEO Sections (Always visible for users, navigation & crawlers) */}
        <HowItWorks />
        <Features />
        <HowTranscriptionWorks />
        <FaqSection />
        <AboutCtaSection
          onNavigateContact={() => setCurrentPage('contact')}
          onScrollToTop={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const inputEl = document.getElementById('youtube-url-input');
            if (inputEl) {
              setTimeout(() => inputEl.focus(), 350);
            }
          }}
        />
          </>
        )}
      </main>

      <Footer onNavigate={(page) => setCurrentPage(page)} />

      {/* Floating Scroll to Top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="scroll-to-top-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 cursor-pointer transition-all hover:-translate-y-0.5"
            aria-label="Scroll to top of page"
            title="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistory}
        onRemove={handleRemoveHistoryItem}
        onClearAll={handleClearAllHistory}
        onQuickCopy={handleQuickCopyHistory}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
