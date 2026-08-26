import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, User, Clock } from 'lucide-react';
import { VideoMetadata } from '../types';

interface VideoPlayerProps {
  video: VideoMetadata;
  seekTime: number | null;
  onTimeUpdate?: (currentTime: number) => void;
  isPlaying?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  seekTime,
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const iframeId = `yt-player-${video.id}`;

  // Load YouTube IFrame API once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    function initPlayer() {
      if (window.YT && window.YT.Player) {
        try {
          if (playerRef.current) {
            playerRef.current.destroy();
          }

          playerRef.current = new window.YT.Player(iframeId, {
            videoId: video.id,
            playerVars: {
              autoplay: 0,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
            },
            events: {
              onReady: () => {
                setIsPlayerReady(true);
              },
            },
          });
        } catch (e) {
          console.warn('YouTube player initialization fallback:', e);
        }
      }
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
  }, [video.id]);

  // Handle seeking when seekTime changes
  useEffect(() => {
    if (seekTime !== null && isPlayerReady && playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(seekTime, true);
      if (playerRef.current.playVideo) {
        playerRef.current.playVideo();
      }
    }
  }, [seekTime, isPlayerReady]);

  // Track playback time periodically to inform active transcript segment
  useEffect(() => {
    if (!isPlayerReady || !onTimeUpdate) return;
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getPlayerState) {
        const state = playerRef.current.getPlayerState();
        // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING
        if (state === 1) {
          const current = playerRef.current.getCurrentTime();
          onTimeUpdate(current);
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isPlayerReady, onTimeUpdate]);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/70 shadow-sm overflow-hidden flex flex-col font-['Poppins',sans-serif]">
      {/* 16:9 Video Container with soft edges */}
      <div className="relative aspect-video w-full bg-zinc-950">
        <div id={iframeId} className="w-full h-full" />
      </div>

      {/* Video Details Bar */}
      <div className="p-4 sm:p-5 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 leading-snug line-clamp-2">
            {video.title}
          </h2>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
            title="Open on YouTube"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-zinc-500 pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <a
              href={
                video.authorUrl ||
                (video.author
                  ? `https://www.youtube.com/results?search_query=${encodeURIComponent(video.author)}`
                  : video.url)
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-red-600 hover:underline transition-colors group/author"
              title={`Visit ${video.author || 'channel'} on YouTube`}
            >
              <User className="w-4 h-4 text-zinc-400 group-hover/author:text-red-500 transition-colors" />
              <span>{video.author}</span>
            </a>

            {video.durationFormatted && (
              <span className="inline-flex items-center gap-1 font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded-lg border border-zinc-200/60">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {video.durationFormatted}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
