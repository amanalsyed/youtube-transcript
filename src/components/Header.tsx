import React from 'react';
import { RefreshCw, History } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onReset?: () => void;
  hasTranscript?: boolean;
  historyCount?: number;
  onOpenHistory?: () => void;
  currentPage?: 'home' | 'privacy' | 'terms' | 'contact';
  onNavigate?: (page: 'home' | 'privacy' | 'terms' | 'contact') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  hasTranscript,
  historyCount = 0,
  onOpenHistory,
  currentPage = 'home',
  onNavigate,
}) => {
  const handleNav = (page: 'home' | 'privacy' | 'terms' | 'contact', e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    } else if (onReset && page === 'home') {
      onReset();
    }
  };

  return (
    <header className="border-b border-zinc-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-40 font-['Poppins',sans-serif] w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div
          onClick={(e) => handleNav('home', e)}
          className="cursor-pointer group select-none min-w-0 shrink"
          role="button"
          tabIndex={0}
          title="Return to Home"
        >
          <Logo size="md" />
        </div>

        {/* Right Navigation & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-zinc-600 mr-1">
            <a
              href="#how-it-works"
              onClick={(e) => {
                if (currentPage !== 'home') {
                  handleNav('home', e);
                }
              }}
              className="hover:text-zinc-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={(e) => {
                if (currentPage !== 'home') {
                  handleNav('home', e);
                }
              }}
              className="hover:text-zinc-900 transition-colors"
            >
              Features
            </a>
          </nav>

          {/* History Button */}
          {onOpenHistory && (
            <button
              id="header-history-btn"
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 active:bg-zinc-200 border border-zinc-200/80 rounded-xl transition-all shadow-2xs cursor-pointer whitespace-nowrap"
              title="View saved transcript history"
            >
              <History className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 bg-zinc-900 text-white rounded-full text-[10px] font-bold leading-tight">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* New Video Button */}
          {hasTranscript && (
            <button
              id="header-new-video-btn"
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              title="Start a new transcript search"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">New Video</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

