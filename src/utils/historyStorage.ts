import { HistoryItem, TranscriptResponse } from '../types';

const STORAGE_KEY = 'yt_transcript_history_v2';
const ACTIVE_SESSION_KEY = 'yt_active_transcript_session';
const MAX_HISTORY_ITEMS = 50;

export interface ActiveSessionData {
  data: TranscriptResponse;
  url: string;
  timestamp: number;
}

export function saveActiveTranscript(data: TranscriptResponse, url: string): void {
  if (!data || !data.success || !data.video) return;
  try {
    const sessionObj: ActiveSessionData = {
      data,
      url: url || data.video.url,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionObj));
  } catch (err) {
    console.error('Failed to save active transcript to sessionStorage:', err);
  }
}

export function loadActiveTranscript(): ActiveSessionData | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed: ActiveSessionData = JSON.parse(raw);
    if (parsed && parsed.data && parsed.data.segments && parsed.data.segments.length > 0) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to load active transcript from sessionStorage:', err);
    return null;
  }
}

export function clearActiveTranscript(): void {
  try {
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear active transcript from sessionStorage:', err);
  }
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load history from localStorage:', err);
    return [];
  }
}

export function saveTranscriptToHistory(response: TranscriptResponse): HistoryItem[] {
  if (!response || !response.success || !response.video || !response.segments.length) {
    return loadHistory();
  }

  try {
    const current = loadHistory();
    const videoId = response.video.id;

    // Filter out previous entry for same video to avoid duplicates and move to top
    const filtered = current.filter((item) => item.videoId !== videoId);

    // Create snippet from first few segments
    const snippet = response.segments
      .slice(0, 3)
      .map((s) => s.text)
      .join(' ')
      .slice(0, 160) + (response.segments.length > 3 ? '...' : '');

    const newItem: HistoryItem = {
      id: `${videoId}-${Date.now()}`,
      videoId,
      title: response.video.title || 'Untitled Video',
      author: response.video.author || 'YouTube Creator',
      thumbnailUrl: response.video.thumbnailUrl,
      durationFormatted: response.video.durationFormatted || '',
      url: response.video.url,
      fetchedAt: Date.now(),
      wordCount: response.wordCount || 0,
      segmentCount: response.segments.length || 0,
      language: response.selectedLanguage?.name || 'English',
      snippet,
      data: response,
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save transcript to history:', err);
    return loadHistory();
  }
}

export function removeHistoryItem(id: string): HistoryItem[] {
  try {
    const current = loadHistory();
    const updated = current.filter((item) => item.id !== id && item.videoId !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove history item:', err);
    return loadHistory();
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 45) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(timestamp).toLocaleDateString();
}
