import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Clock,
  Lock,
  Radio,
  FileQuestion,
  HelpCircle,
  RotateCcw,
  X,
  ExternalLink,
  PlayCircle,
} from 'lucide-react';
import { ErrorScenarioDetail, TranscriptErrorCode } from '../types';
import { SAMPLE_VIDEOS } from './UrlInput';

interface ErrorDisplayProps {
  error: string | null;
  errorCode?: TranscriptErrorCode | string;
  errorDetails?: ErrorScenarioDetail;
  retryAfter?: number;
  onRetry?: () => void;
  onDismiss: () => void;
  onSelectSample?: (url: string) => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  errorCode = 'UNKNOWN',
  errorDetails,
  retryAfter,
  onRetry,
  onDismiss,
  onSelectSample,
}) => {
  const [countdown, setCountdown] = useState<number>(retryAfter || 0);

  useEffect(() => {
    if (!retryAfter || retryAfter <= 0) return;
    setCountdown(retryAfter);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfter]);

  if (!error) return null;

  const title = errorDetails?.title || getTitleForCode(errorCode);
  const message = errorDetails?.message || error;
  const suggestions = errorDetails?.suggestions || getSuggestionsForCode(errorCode);
  const isRetryable = errorDetails?.retryable ?? (errorCode === 'FETCH_ERROR' || errorCode === 'NETWORK_ERROR' || errorCode === 'RATE_LIMITED');

  const icon = getIconForCode(errorCode);

  return (
    <div className="mt-4 p-4 sm:p-5 bg-red-50/95 border border-red-200/90 rounded-2xl text-red-900 shadow-xs animate-fadeIn font-['Poppins',sans-serif]">
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-red-100 rounded-xl text-red-700 shrink-0 mt-0.5">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-bold text-red-950 tracking-tight">
              {title}
            </h3>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 text-red-500 hover:text-red-800 hover:bg-red-100/80 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-red-800 leading-relaxed">
            {message}
          </p>

          {/* Rate limit countdown bar */}
          {errorCode === 'RATE_LIMITED' && countdown > 0 && (
            <div className="mt-3 p-3 bg-red-100/70 border border-red-200 rounded-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-red-900 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  Rate limit cooldown active:
                </span>
                <span className="font-mono bg-red-200/80 px-2 py-0.5 rounded-md text-red-950">
                  {countdown}s remaining
                </span>
              </div>
              <div className="w-full h-1.5 bg-red-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all duration-1000 ease-linear rounded-full"
                  style={{
                    width: `${Math.max(0, 100 - (countdown / (retryAfter || 10)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Suggestions checklist */}
          {suggestions && suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-red-200/70">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-900/70 block mb-1.5">
                Troubleshooting Suggestions:
              </span>
              <ul className="space-y-1 text-xs text-red-800">
                {suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sample videos fallback (especially helpful for NO_CAPTIONS or INVALID_URL) */}
          {(errorCode === 'NO_CAPTIONS' || errorCode === 'INVALID_URL') && onSelectSample && (
            <div className="mt-3.5 pt-3 border-t border-red-200/70 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-red-900/80">Try a working video:</span>
              {SAMPLE_VIDEOS.map((sample) => (
                <button
                  key={sample.url}
                  type="button"
                  onClick={() => onSelectSample(sample.url)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 hover:bg-white text-zinc-800 border border-red-200/80 rounded-lg text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                >
                  <PlayCircle className="w-3 h-3 text-red-600" />
                  <span className="truncate max-w-[140px]">{sample.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3.5 flex items-center gap-2.5">
            {isRetryable && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={errorCode === 'RATE_LIMITED' && countdown > 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{countdown > 0 ? `Wait ${countdown}s` : 'Try Again'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              className="px-3 py-1.5 text-xs font-medium text-red-800 hover:text-red-950 hover:bg-red-100/60 rounded-xl transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getIconForCode(code: TranscriptErrorCode | string) {
  switch (code) {
    case 'RATE_LIMITED':
      return <Clock className="w-5 h-5" />;
    case 'PRIVATE_VIDEO':
      return <Lock className="w-5 h-5" />;
    case 'LIVE_STREAM':
      return <Radio className="w-5 h-5 animate-pulse" />;
    case 'NO_CAPTIONS':
      return <FileQuestion className="w-5 h-5" />;
    case 'INVALID_URL':
      return <HelpCircle className="w-5 h-5" />;
    case 'FETCH_ERROR':
    case 'NETWORK_ERROR':
    case 'VIDEO_NOT_FOUND':
    default:
      return <AlertCircle className="w-5 h-5" />;
  }
}

function getTitleForCode(code: TranscriptErrorCode | string): string {
  switch (code) {
    case 'INVALID_URL':
      return 'Invalid YouTube Link';
    case 'NO_CAPTIONS':
      return 'No Transcript Available';
    case 'VIDEO_NOT_FOUND':
      return 'Video Not Found';
    case 'PRIVATE_VIDEO':
      return 'Private or Age-Restricted Video';
    case 'LIVE_STREAM':
      return 'Live Stream in Progress';
    case 'RATE_LIMITED':
      return 'Too Many Requests (Rate Limit)';
    case 'NETWORK_ERROR':
      return 'Network Connection Error';
    case 'FETCH_ERROR':
    default:
      return 'Could Not Load Transcript';
  }
}

function getSuggestionsForCode(code: TranscriptErrorCode | string): string[] {
  switch (code) {
    case 'INVALID_URL':
      return [
        'Check the link for typos or incomplete copy-pastes',
        'Use standard formats: youtube.com/watch?v=... or youtu.be/...',
        'Direct links to YouTube Shorts (youtube.com/shorts/...) are also supported',
      ];
    case 'NO_CAPTIONS':
      return [
        'Check on YouTube if the video has the "CC" (Closed Captions) button',
        'Videos without spoken dialogue or recently uploaded videos may lack captions',
        'Try another YouTube video that contains speech',
      ];
    case 'PRIVATE_VIDEO':
      return [
        'Ensure the video is public and viewable without needing a login',
        'Transcripts cannot be retrieved for private or members-only videos',
      ];
    case 'LIVE_STREAM':
      return [
        'Full transcripts become available once live streams finish broadcasting and processing',
        'Try viewing on-demand completed videos',
      ];
    case 'RATE_LIMITED':
      return [
        'Please wait for the short cooldown period to finish',
        'You can view previously loaded transcripts in your History without making new requests',
      ];
    case 'FETCH_ERROR':
    case 'NETWORK_ERROR':
      return [
        'Check your internet connection',
        'Click "Try Again" to retry fetching the transcript',
      ];
    default:
      return ['Check the video URL and try again.'];
  }
}
