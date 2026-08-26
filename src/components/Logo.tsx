import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'dark' | 'light';
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'dark',
  subtitle,
}) => {
  // Dimensions for the icon container
  const iconDimensions = {
    xs: { box: 'w-6 h-6 rounded-lg', iconSize: 24 },
    sm: { box: 'w-7 h-7 rounded-lg', iconSize: 28 },
    md: { box: 'w-9 h-9 rounded-xl', iconSize: 36 },
    lg: { box: 'w-11 h-11 rounded-2xl', iconSize: 44 },
    xl: { box: 'w-14 h-14 rounded-2xl', iconSize: 56 },
  }[size];

  // Font sizes for the text label
  const textStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  }[size];

  const isLight = variant === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Minimal Icon Mark */}
      <div
        className={`${iconDimensions.box} bg-zinc-900 flex items-center justify-center p-1.5 shadow-xs border border-zinc-800/80 shrink-0 transition-transform group-hover:scale-105`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Red Play Pill */}
          <rect x="2" y="8" width="16" height="24" rx="6" fill="#EF4444" />
          <polygon points="8,15 8,25 15,20" fill="#FFFFFF" />

          {/* Clean Transcript / Audio lines */}
          <rect x="21" y="11" width="17" height="3.5" rx="1.75" fill="#FFFFFF" />
          <circle cx="23" cy="20" r="1.75" fill="#EF4444" />
          <rect x="27" y="18.25" width="11" height="3.5" rx="1.75" fill="#FFFFFF" />
          <rect x="21" y="25.5" width="14" height="3.5" rx="1.75" fill="#A1A1AA" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`font-bold tracking-tight ${
                isLight ? 'text-white' : 'text-zinc-900'
              } ${textStyles}`}
            >
              YouTube
            </span>
            <span
              className={`font-medium tracking-tight ${
                isLight ? 'text-zinc-400' : 'text-zinc-500'
              } ${textStyles}`}
            >
              Transcript
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-zinc-400 font-normal tracking-wide hidden sm:block">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
