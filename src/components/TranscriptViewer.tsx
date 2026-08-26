import React, { useEffect, useRef } from 'react';
import { Play, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { TranscriptSegment, TranscriptViewMode } from '../types';
import { escapeRegExp } from '../utils/textUtils';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  originalSegments?: TranscriptSegment[];
  translatedSegments?: TranscriptSegment[];
  viewMode?: TranscriptViewMode;
  targetLanguageName?: string;
  targetLanguageCode?: string;
  targetLanguageFlag?: string;
  activeSegmentId: number | null;
  onSeek: (seconds: number, segmentId: number) => void;
  onShareSegment?: (segment: TranscriptSegment) => void;
  searchQuery: string;
  matchedSegmentIds: number[];
  currentMatchIndex: number;
  showTimestamps?: boolean;
  autoScroll?: boolean;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  segments,
  originalSegments,
  translatedSegments,
  viewMode = 'original',
  targetLanguageName,
  targetLanguageCode,
  targetLanguageFlag,
  activeSegmentId,
  onSeek,
  onShareSegment,
  searchQuery,
  matchedSegmentIds,
  currentMatchIndex,
  showTimestamps = true,
  autoScroll = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const currentMatchedSegmentId = matchedSegmentIds[currentMatchIndex] || null;

  // Auto-scroll to current search match when user navigates search
  useEffect(() => {
    if (currentMatchedSegmentId && segmentRefs.current[currentMatchedSegmentId]) {
      segmentRefs.current[currentMatchedSegmentId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentMatchedSegmentId, currentMatchIndex]);

  // Auto-scroll to active video playback segment to keep it centered
  useEffect(() => {
    // If search is currently being navigated, give priority to search match view
    if (searchQuery.trim() && currentMatchedSegmentId) return;

    if (autoScroll && activeSegmentId && segmentRefs.current[activeSegmentId]) {
      const activeEl = segmentRefs.current[activeSegmentId];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeSegmentId, autoScroll, searchQuery, currentMatchedSegmentId]);

  // Helper to render text with search query highlighted
  const renderHighlightedText = (text: string) => {
    if (!searchQuery.trim()) return text;

    try {
      const regex = new RegExp(`(${escapeRegExp(searchQuery.trim())})`, 'gi');
      const parts = text.split(regex);

      return (
        <>
          {parts.map((part, index) => {
            if (part.toLowerCase() === searchQuery.trim().toLowerCase()) {
              return (
                <mark
                  key={index}
                  className="bg-amber-200/90 text-zinc-900 font-semibold px-1 rounded"
                >
                  {part}
                </mark>
              );
            }
            return part;
          })}
        </>
      );
    } catch {
      return text;
    }
  };

  const isBilingual = viewMode === 'side-by-side' && translatedSegments && originalSegments;

  return (
    <motion.div
      ref={containerRef}
      id="transcript-scroll-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 overflow-y-auto divide-y divide-zinc-100/80 p-2 sm:p-3.5 max-h-[560px] lg:max-h-[620px] scroll-smooth font-['Poppins',sans-serif]"
    >
      {/* Side-by-Side Column Headers if in bilingual view */}
      {isBilingual && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-3 py-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-200/70 text-xs font-semibold text-zinc-500 shadow-2xs">
          <div className="flex items-center gap-1.5 text-zinc-700">
            <span>Original Transcript</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
            <span>{targetLanguageFlag}</span>
            <span>Translated ({targetLanguageName || 'Selected Language'})</span>
          </div>
        </div>
      )}

      {segments.map((segment, index) => {
        const isActive = activeSegmentId === segment.id;
        const isSearchMatch = matchedSegmentIds.includes(segment.id);
        const isCurrentSearchMatch = currentMatchedSegmentId === segment.id;

        const origSeg = originalSegments?.[index] || segment;
        const transSeg = translatedSegments?.[index];

        return (
          <motion.div
            key={segment.id}
            ref={(el) => (segmentRefs.current[segment.id] = el)}
            onClick={() => onSeek(segment.start, segment.id)}
            id={`transcript-segment-${segment.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: Math.min(index * 0.015, 0.35),
              ease: 'easeOut',
            }}
            className={`group flex items-start gap-3 p-3 sm:p-3.5 rounded-xl cursor-pointer transition-all duration-150 ${
              isCurrentSearchMatch
                ? 'bg-amber-50/90 ring-2 ring-amber-400 shadow-xs'
                : isActive
                ? 'bg-zinc-100/90 ring-1 ring-zinc-300/70 shadow-xs'
                : isSearchMatch
                ? 'bg-amber-50/50'
                : 'hover:bg-zinc-50/80'
            }`}
          >
            {/* Timestamp Badge / Play trigger */}
            {showTimestamps && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(segment.start, segment.id);
                }}
                className={`shrink-0 inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs scale-102'
                    : 'bg-zinc-100/90 text-zinc-700 hover:bg-zinc-900 hover:text-white group-hover:bg-zinc-900 group-hover:text-white'
                }`}
                title={`Jump to ${segment.timestamp}`}
              >
                <Play className={`w-2.5 h-2.5 ${isActive ? 'fill-white' : 'fill-current'}`} />
                <span>{segment.timestamp}</span>
              </button>
            )}

            {/* Segment Content: Single Column or Dual-Column Side-by-Side */}
            {isBilingual ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start select-text text-sm leading-relaxed">
                {/* Left: Original Text */}
                <div
                  className={`transition-colors ${
                    isActive
                      ? 'text-zinc-950 font-medium'
                      : 'text-zinc-700 font-normal group-hover:text-zinc-900'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block md:hidden mb-0.5">
                    Original:
                  </span>
                  {renderHighlightedText(origSeg.text)}
                </div>

                {/* Right: Translated Text */}
                <div
                  dir="auto"
                  className={`md:border-l md:border-zinc-200/80 md:pl-4 transition-colors ${
                    isActive
                      ? 'text-indigo-950 font-medium'
                      : 'text-zinc-800 font-normal group-hover:text-indigo-950'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block md:hidden mb-0.5" dir="ltr">
                    {targetLanguageName || 'Translated'}:
                  </span>
                  {renderHighlightedText(transSeg ? transSeg.text : segment.text)}
                </div>
              </div>
            ) : (
              /* Standard Single View (Original or Translated) */
              <div
                dir={viewMode === 'translated' ? 'auto' : 'ltr'}
                className={`flex-1 text-sm leading-relaxed tracking-normal select-text transition-colors ${
                  isActive
                    ? 'text-zinc-950 font-medium'
                    : 'text-zinc-700 font-normal group-hover:text-zinc-900'
                }`}
              >
                {renderHighlightedText(segment.text)}
              </div>
            )}

            {/* Quick Share hover button */}
            {onShareSegment && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShareSegment(segment);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/80 cursor-pointer shrink-0"
                title={`Share link to [${segment.timestamp}]`}
                aria-label={`Share moment at ${segment.timestamp}`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
