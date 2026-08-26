import React, { useRef, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Bookmark, ArrowRight } from 'lucide-react';
import { KeyMoment } from '../types';

interface KeyMomentsBarProps {
  keyMoments: KeyMoment[];
  activeMomentId: string | null;
  onSelectMoment: (moment: KeyMoment) => void;
  currentPlaybackTime: number;
}

export const KeyMomentsBar: React.FC<KeyMomentsBarProps> = ({
  keyMoments,
  activeMomentId,
  onSelectMoment,
  currentPlaybackTime,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLButtonElement | null>(null);

  // Auto determine active moment based on currentPlaybackTime if activeMomentId not explicitly set
  const currentActiveMoment =
    keyMoments.find((m) => m.id === activeMomentId) ||
    [...keyMoments].reverse().find((m) => currentPlaybackTime >= m.start) ||
    keyMoments[0];

  // Scroll active chip into view horizontally
  useEffect(() => {
    if (activeChipRef.current && scrollContainerRef.current) {
      activeChipRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentActiveMoment?.id]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  if (!keyMoments || keyMoments.length === 0) {
    return null;
  }

  return (
    <div
      id="key-moments-navigation-bar"
      className="bg-zinc-50/90 border-b border-zinc-200/70 px-3 py-2.5 flex flex-col gap-2 font-['Poppins',sans-serif] transition-colors"
      aria-label="Key Moments navigation"
    >
      {/* Top micro header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Key Moments</span>
          <span className="px-1.5 py-0.2 bg-zinc-200/80 text-zinc-700 text-[10px] font-bold rounded-full">
            {keyMoments.length}
          </span>
          <span className="hidden sm:inline text-[11px] font-normal text-zinc-500">
            — Jump to summary sections
          </span>
        </div>

        {/* Scroll navigation arrows */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleScrollLeft}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 transition-colors cursor-pointer"
            aria-label="Scroll key moments left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 transition-colors cursor-pointer"
            aria-label="Scroll key moments right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal scrolling chips list */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {keyMoments.map((moment, idx) => {
          const isActive = currentActiveMoment?.id === moment.id;

          return (
            <button
              key={moment.id}
              ref={isActive ? activeChipRef : null}
              type="button"
              onClick={() => onSelectMoment(moment)}
              className={`group shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none text-left border ${
                isActive
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200/80 hover:border-zinc-300 shadow-2xs'
              }`}
              title={`${moment.title} (${moment.timestamp})\n${moment.summary}`}
            >
              {/* Timestamp badge */}
              <span
                className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-zinc-800 text-amber-300'
                    : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200'
                }`}
              >
                {moment.timestamp}
              </span>

              {/* Title */}
              <span className="truncate max-w-[150px] sm:max-w-[200px] font-medium">
                {moment.title}
              </span>

              {/* Keyword pill (optional, shown if space permits) */}
              {moment.keywords.length > 0 && (
                <span
                  className={`hidden md:inline text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  #{moment.keywords[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
