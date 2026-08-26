import React, { useState } from 'react';
import { Search, ArrowRight, X, PlayCircle, Loader2, Clock } from 'lucide-react';
import { ErrorScenarioDetail, HistoryItem, TranscriptErrorCode } from '../types';
import { ErrorDisplay } from './ErrorDisplay';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  loadingStep?: string;
  errorMessage?: string | null;
  errorCode?: TranscriptErrorCode;
  errorDetails?: ErrorScenarioDetail;
  retryAfter?: number;
  onRetry?: () => void;
  onClearError?: () => void;
  history?: HistoryItem[];
  onSelectHistory?: (item: HistoryItem) => void;
  onOpenHistory?: () => void;
}

export const SAMPLE_VIDEOS = [
  {
    title: 'Steve Jobs 2005 Stanford Speech',
    url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
    tag: 'Classic',
  },
  {
    title: 'TED: Inside the Mind of a Master Procrastinator',
    url: 'https://www.youtube.com/watch?v=arj7oStGLkU',
    tag: 'TED Talk',
  },
  {
    title: 'Veritasium: The Big Mistake in Physics',
    url: 'https://www.youtube.com/watch?v=bHIhgxav9LY',
    tag: 'Science',
  },
];

export const UrlInput: React.FC<UrlInputProps> = ({
  onSubmit,
  isLoading,
  loadingStep,
  errorMessage,
  errorCode = 'UNKNOWN',
  errorDetails,
  retryAfter,
  onRetry,
  onClearError,
  history = [],
  onSelectHistory,
  onOpenHistory,
}) => {
  const [url, setUrl] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const validateAndSubmit = (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setInputError('Please enter a YouTube video URL or ID.');
      return;
    }

    // Check for common non-video URLs
    if (trimmed.includes('/playlist') && !trimmed.includes('v=')) {
      setInputError('This is a playlist URL. Please open a specific video inside the playlist and copy its link.');
      return;
    }

    if (trimmed.includes('/@') || trimmed.includes('/channel/') || trimmed.includes('/user/')) {
      setInputError('This is a channel URL. Please select a specific video from this channel.');
      return;
    }

    const isLikelyYoutube =
      trimmed.includes('youtube.com') ||
      trimmed.includes('youtu.be') ||
      /^[a-zA-Z0-9_-]{11}$/.test(trimmed);

    if (!isLikelyYoutube) {
      setInputError('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }

    setInputError(null);
    if (onClearError) onClearError();
    onSubmit(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSubmit(url);
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
    validateAndSubmit(sampleUrl);
  };

  const activeError = inputError || errorMessage;
  const activeErrorCode: TranscriptErrorCode | string = inputError ? 'INVALID_URL' : errorCode;

  return (
    <div className="w-full max-w-3xl mx-auto font-['Poppins',sans-serif]">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight leading-tight">
          YouTube Transcript Generator
        </h1>
        <p className="mt-3 text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Get the text from a YouTube video in a few clicks. Paste a YouTube video URL below and generate a clean transcript you can read, copy, or download.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-white rounded-2xl shadow-lg shadow-zinc-200/40 border border-zinc-200/80 transition-all focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-900/5">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="youtube-url-input"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (inputError) setInputError(null);
                if (errorMessage && onClearError) onClearError();
              }}
              placeholder="Paste YouTube video URL here (e.g., https://youtube.com/watch?v=...)"
              disabled={isLoading}
              className="w-full pl-11 pr-10 py-3.5 bg-transparent text-zinc-900 placeholder:text-zinc-400 text-sm sm:text-base outline-none font-normal leading-normal disabled:opacity-60"
            />
            {url && (
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setInputError(null);
                  if (onClearError) onClearError();
                }}
                className="absolute right-3 p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            id="get-transcript-btn"
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-sm sm:text-base rounded-xl transition-all shadow-xs hover:shadow-sm disabled:opacity-60 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                <span>{loadingStep || 'Processing...'}</span>
              </>
            ) : (
              <>
                <span>Generate Transcript</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      <p className="mt-3 text-center text-xs sm:text-sm text-zinc-500 font-normal">
        No complicated setup. Paste the link, get the transcript, and use the text however you need.
      </p>

      {/* Comprehensive Error Display */}
      {activeError && (
        <ErrorDisplay
          error={activeError}
          errorCode={activeErrorCode}
          errorDetails={errorDetails}
          retryAfter={retryAfter}
          onRetry={onRetry}
          onDismiss={() => {
            setInputError(null);
            if (onClearError) onClearError();
          }}
          onSelectSample={(sampleUrl) => handleSampleClick(sampleUrl)}
        />
      )}

      {/* Sample video shortcuts */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
        <span className="font-medium text-zinc-400">Try an example:</span>
        {SAMPLE_VIDEOS.map((sample) => (
          <button
            key={sample.url}
            type="button"
            disabled={isLoading}
            onClick={() => handleSampleClick(sample.url)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-medium transition-colors border border-zinc-200/70 hover:border-zinc-300 shadow-2xs cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span className="truncate max-w-[180px] sm:max-w-[240px]">{sample.title}</span>
          </button>
        ))}
      </div>

      {/* Recent Transcripts Chips Bar (if history exists) */}
      {history.length > 0 && onSelectHistory && (
        <div className="mt-6 pt-5 border-t border-zinc-200/60">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Recent Transcripts</span>
            </div>
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View all ({history.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {history.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectHistory(item)}
                className="flex items-center gap-2.5 p-2 bg-white hover:bg-zinc-50 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-all text-left shadow-2xs shrink-0 max-w-[240px] cursor-pointer"
                title={item.title}
              >
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-9 h-7 rounded-md object-cover bg-zinc-100 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-800 truncate leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {item.wordCount.toLocaleString()} words
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
