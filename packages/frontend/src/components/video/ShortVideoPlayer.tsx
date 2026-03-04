import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Episode } from '@maycast/shared';
import type { VideoItem } from '../../pages/ShowPage.js';

interface Props {
  videos: VideoItem[];
  currentIndex: number;
  showTitle?: string;
  artworkUrl?: string | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onPlayEpisode?: (episode: Episode) => void;
}

export function ShortVideoPlayer({ videos, currentIndex, showTitle, artworkUrl, onClose, onIndexChange, onPlayEpisode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [skipIndicator, setSkipIndicator] = useState<'forward' | 'backward' | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaY = useRef(0);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const lastTapTime = useRef(0);
  const lastTapX = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipIndicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const video = videos[currentIndex];

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Esc key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Reset state on index change
  useEffect(() => {
    setPaused(false);
    setProgress(0);
    setDuration(0);
  }, [currentIndex]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v && v.duration > 0) {
      setProgress(v.currentTime / v.duration);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v) setDuration(v.duration);
  }, []);

  const handleEnded = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      onClose();
    }
  }, [currentIndex, videos.length, onIndexChange, onClose]);

  const togglePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  }, []);

  const skipBy = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
    const dir = seconds > 0 ? 'forward' : 'backward';
    setSkipIndicator(dir);
    if (skipIndicatorTimer.current) clearTimeout(skipIndicatorTimer.current);
    skipIndicatorTimer.current = setTimeout(() => setSkipIndicator(null), 500);
  }, []);

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    const doubleTapThreshold = 300;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const isLeft = x < rect.left + rect.width / 2;

    if (now - lastTapTime.current < doubleTapThreshold) {
      // Double tap
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      skipBy(isLeft ? -10 : 10);
    } else {
      // Single tap — delay to distinguish from double tap
      if (tapTimer.current) clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => {
        togglePlayPause();
        tapTimer.current = null;
      }, doubleTapThreshold);
    }
    lastTapTime.current = now;
    lastTapX.current = x;
  }, [togglePlayPause, skipBy]);

  // Seek bar
  const seekTo = useCallback((clientX: number) => {
    const bar = seekBarRef.current;
    const v = videoRef.current;
    if (!bar || !v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  }, []);

  const handleSeekClick = useCallback((e: React.MouseEvent) => {
    seekTo(e.clientX);
  }, [seekTo]);

  const handleSeekTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    seekTo(e.touches[0].clientX);
  }, [seekTo]);

  const handleSeekTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    seekTo(e.touches[0].clientX);
  }, [seekTo]);

  // Swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const delta = touchDeltaY.current;
    touchStartY.current = null;
    const threshold = 80;

    if (delta < -threshold) {
      // Swipe up → next
      if (currentIndex < videos.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    } else if (delta > threshold) {
      // Swipe down → previous or close
      if (currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      } else {
        onClose();
      }
    }
  }, [currentIndex, videos.length, onIndexChange, onClose]);

  if (!video) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video */}
      <video
        ref={videoRef}
        key={video.videoUrl}
        src={video.videoUrl}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onClick={handleVideoClick}
      />

      {/* Pause overlay */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Skip indicator */}
      {skipIndicator && (
        <div className={`absolute top-0 bottom-0 w-1/2 flex items-center pointer-events-none ${skipIndicator === 'backward' ? 'left-0 justify-center' : 'right-0 justify-center'}`}>
          <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={skipIndicator === 'backward' ? { transform: 'scaleX(-1)' } : undefined}>
              <path d="M4 13a8 8 0 0 0 14.93 4M20 11a8 8 0 0 0-14.93-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M20 4v7h-7" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white text-[11px] font-bold mt-0.5">10秒</span>
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border-none text-white flex items-center justify-center cursor-pointer z-10"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
        onClick={onClose}
        aria-label="閉じる"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18" /><path d="M6 6l12 12" />
        </svg>
      </button>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Info */}
        <div className="px-4 pb-3 bg-gradient-to-t from-black/70 to-transparent pt-16">
          <p className="text-white font-semibold text-[15px] leading-tight mb-1">{video.episodeTitle}</p>
          <div className="flex items-center gap-2">
            {showTitle && <span className="text-white/70 text-[13px]">{showTitle}</span>}
            {video.episode.audioUrl && onPlayEpisode && (
              <button
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full border-none text-white text-[12px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayEpisode(video.episode);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                エピソードを聴く
              </button>
            )}
          </div>
        </div>
        {/* Seek bar */}
        <div
          ref={seekBarRef}
          className="h-[18px] flex items-end cursor-pointer px-0"
          onClick={handleSeekClick}
          onTouchStart={handleSeekTouchStart}
          onTouchMove={handleSeekTouchMove}
        >
          <div className="w-full h-[3px] bg-white/20 relative">
            <div
              className="absolute top-0 left-0 h-full bg-white"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
