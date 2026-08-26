import React, { useState, useEffect } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Youtube,
  Link2,
  Quote,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TranscriptSegment, VideoMetadata } from '../types';
import { formatTimeSeconds } from '../utils/textUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoMetadata;
  currentTime: number;
  activeSegment?: TranscriptSegment | null;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  video,
  currentTime,
  activeSegment,
  onToast,
}) => {
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [selectedTimestampSec, setSelectedTimestampSec] = useState(Math.max(0, Math.floor(currentTime)));
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Sync timestamp with currentTime when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTimestampSec(Math.max(0, Math.floor(currentTime)));
    }
  }, [isOpen, currentTime]);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  // App Deep Link
  const appDeepLink = includeTimestamp && selectedTimestampSec > 0
    ? `${currentOrigin}${currentPath}?v=${video.id}&t=${selectedTimestampSec}`
    : `${currentOrigin}${currentPath}?v=${video.id}`;

  // YouTube Timestamped URL
  const youtubeUrl = includeTimestamp && selectedTimestampSec > 0
    ? `https://youtu.be/${video.id}?t=${selectedTimestampSec}s`
    : `https://youtu.be/${video.id}`;

  // Quote format
  const quoteText = activeSegment
    ? `"[${activeSegment.timestamp}] ${activeSegment.text.trim()}" — from "${video.title}"\n${appDeepLink}`
    : `"${video.title}" (${formatTimeSeconds(selectedTimestampSec)})\n${appDeepLink}`;

  const handleCopy = (text: string, typeKey: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedType(typeKey);
        onToast({
          type: 'success',
          title: 'Link Copied to Clipboard',
          description: `${label} copied successfully.`,
        });
        setTimeout(() => setCopiedType(null), 2500);
      })
      .catch(() => {
        onToast({
          type: 'error',
          title: 'Copy Failed',
          description: 'Failed to copy link to clipboard.',
        });
      });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${video.title} (at ${formatTimeSeconds(selectedTimestampSec)})`,
          text: activeSegment ? `"[${activeSegment.timestamp}] ${activeSegment.text}"` : `YouTube Transcript at ${formatTimeSeconds(selectedTimestampSec)}`,
          url: appDeepLink,
        });
        onToast({
          type: 'success',
          title: 'Shared Successfully',
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleCopy(appDeepLink, 'app', 'App deep link');
        }
      }
    } else {
      handleCopy(appDeepLink, 'app', 'App deep link');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 font-['Poppins',sans-serif]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200/80 p-5 sm:p-6 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-xs">
                <Share2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                  Share Transcript Moment
                </h3>
                <p className="text-xs text-zinc-500">
                  Share this specific moment with timestamps
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Close share dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video summary chip */}
          <div className="mt-4 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/70 flex items-center gap-3">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-14 h-10 object-cover rounded-lg bg-zinc-200 shrink-0 border border-zinc-200"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-zinc-900 truncate">
                {video.title}
              </h4>
              <p className="text-[11px] text-zinc-500 truncate">
                {video.author}
              </p>
            </div>
          </div>

          {/* Timestamp inclusion control */}
          <div className="mt-4 p-3.5 bg-zinc-50/70 rounded-2xl border border-zinc-200/60 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300"
              />
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                Start at timestamp:
              </span>
            </label>

            {includeTimestamp && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-900 shadow-2xs">
                  {formatTimeSeconds(selectedTimestampSec)}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTimestampSec(Math.max(0, Math.floor(currentTime)))}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                >
                  Use current ({formatTimeSeconds(Math.floor(currentTime))})
                </button>
              </div>
            )}
          </div>

          {/* Spoken Quote Preview (if active segment exists) */}
          {activeSegment && includeTimestamp && (
            <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200/70 rounded-2xl">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 mb-1">
                <Quote className="w-3 h-3 text-amber-600" />
                <span>Selected Spoken Dialogue:</span>
              </div>
              <p className="text-xs text-amber-950 font-normal italic leading-relaxed line-clamp-2">
                "{activeSegment.text}"
              </p>
            </div>
          )}

          {/* Sharing Options */}
          <div className="mt-4 space-y-3">
            {/* 1. App Deep Link */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-zinc-500" />
                  App Deep Link (Transcript &amp; Player)
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  Recommended
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={appDeepLink}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-700 select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(appDeepLink, 'app', 'App deep link')}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
                >
                  {copiedType === 'app' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Direct YouTube Link */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                  Direct YouTube Timestamp URL
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={youtubeUrl}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-700 select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(youtubeUrl, 'yt', 'YouTube timestamp link')}
                  className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  {copiedType === 'yt' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via App...</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleCopy(quoteText, 'quote', 'Quote snippet')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-xl transition-colors cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Copy Quote</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 rounded-xl ml-auto"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
