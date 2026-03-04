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

function VideoSlide({
  video,
  showTitle,
  isActive,
  videoRef,
  onVideoClick,
  onSeekClick,
  onSeekTouchStart,
  onSeekTouchMove,
  progress,
  paused,
  skipIndicator,
  onClose,
  onPlayEpisode,
}: {
  video: VideoItem;
  showTitle?: string;
  isActive: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onVideoClick: (e: React.MouseEvent) => void;
  onSeekClick: (e: React.MouseEvent) => void;
  onSeekTouchStart: (e: React.TouchEvent) => void;
  onSeekTouchMove: (e: React.TouchEvent) => void;
  progress: number;
  paused: boolean;
  skipIndicator: 'forward' | 'backward' | null;
  onClose: () => void;
  onPlayEpisode?: (episode: Episode) => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        key={video.videoUrl}
        src={video.videoUrl}
        className="w-full h-full object-contain"
        playsInline
        autoPlay={isActive}
        muted={!isActive}
        preload={isActive ? 'auto' : 'metadata'}
      />

      {/* Pause overlay */}
      {isActive && paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Skip indicator */}
      {isActive && skipIndicator && (
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

      {/* Click target for play/pause and double-tap skip */}
      {isActive && (
        <div
          className="absolute inset-0 z-[1]"
          onClick={onVideoClick}
          style={{ bottom: '80px' }}
        />
      )}

      {/* Close button */}
      {isActive && (
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
      )}

      {/* Bottom overlay */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 z-[2]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
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
            data-seekbar
            className="h-[18px] flex items-end cursor-pointer px-0"
            onClick={onSeekClick}
            onTouchStart={onSeekTouchStart}
            onTouchMove={onSeekTouchMove}
          >
            <div className="w-full h-[3px] bg-white/20 relative">
              <div
                className="absolute top-0 left-0 h-full bg-white"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ShortVideoPlayer({ videos, currentIndex, showTitle, onClose, onIndexChange, onPlayEpisode }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [skipIndicator, setSkipIndicator] = useState<'forward' | 'backward' | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const lastTapTime = useRef(0);
  const lastTapX = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipIndicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swipe state
  const touchStartY = useRef<number | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const video = videos[currentIndex];
  const prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

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
    setTranslateY(0);
    setIsAnimating(false);
  }, [currentIndex]);

  // Attach event listeners to active video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => {
      if (v.duration > 0) setProgress(v.currentTime / v.duration);
    };
    const onLoadedMetadata = () => setDuration(v.duration);
    const onEnded = () => {
      if (currentIndex < videos.length - 1) {
        onIndexChange(currentIndex + 1);
      } else {
        onClose();
      }
    };
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate);
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('ended', onEnded);
    };
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
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      skipBy(isLeft ? -10 : 10);
    } else {
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
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const container = containerRef.current;
    if (!container) return;
    const seekBar = container.querySelector('[data-seekbar]') as HTMLElement | null;
    if (!seekBar) return;
    const rect = seekBar.getBoundingClientRect();
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
    if (isAnimating) return;
    touchStartY.current = e.touches[0].clientY;
  }, [isAnimating]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null || isAnimating) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    // Add resistance at boundaries
    if ((delta > 0 && !prevVideo) || (delta < 0 && !nextVideo)) {
      setTranslateY(delta * 0.3); // rubber-band effect
    } else {
      setTranslateY(delta);
    }
  }, [isAnimating, prevVideo, nextVideo]);

  const handleTouchEnd = useCallback(() => {
    if (touchStartY.current === null || isAnimating) return;
    touchStartY.current = null;
    const threshold = 80;
    const h = window.innerHeight;

    if (translateY < -threshold && nextVideo) {
      // Swipe up → next
      setIsAnimating(true);
      setTranslateY(-h);
      setTimeout(() => {
        onIndexChange(currentIndex + 1);
      }, 300);
    } else if (translateY > threshold) {
      if (prevVideo) {
        // Swipe down → previous
        setIsAnimating(true);
        setTranslateY(h);
        setTimeout(() => {
          onIndexChange(currentIndex - 1);
        }, 300);
      } else {
        // First video → close
        setIsAnimating(true);
        setTranslateY(h);
        setTimeout(() => {
          onClose();
        }, 300);
      }
    } else {
      // Snap back
      setIsAnimating(true);
      setTranslateY(0);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isAnimating, translateY, nextVideo, prevVideo, currentIndex, onIndexChange, onClose]);

  if (!video) return null;

  const noopClick = () => {};
  const noopTouch = () => {};

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative w-full h-full"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isAnimating ? 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        }}
      >
        {/* Previous video (above) */}
        {prevVideo && (
          <div className="absolute w-full h-full" style={{ top: '-100%' }}>
            <VideoSlide
              video={prevVideo}
              showTitle={showTitle}
              isActive={false}
              onVideoClick={noopClick}
              onSeekClick={noopClick}
              onSeekTouchStart={noopTouch}
              onSeekTouchMove={noopTouch}
              progress={0}
              paused={false}
              skipIndicator={null}
              onClose={onClose}
            />
          </div>
        )}

        {/* Current video */}
        <div className="absolute w-full h-full" style={{ top: 0 }}>
          <VideoSlide
            video={video}
            showTitle={showTitle}
            isActive={true}
            videoRef={videoRef}
            onVideoClick={handleVideoClick}
            onSeekClick={handleSeekClick}
            onSeekTouchStart={handleSeekTouchStart}
            onSeekTouchMove={handleSeekTouchMove}
            progress={progress}
            paused={paused}
            skipIndicator={skipIndicator}
            onClose={onClose}
            onPlayEpisode={onPlayEpisode}
          />
        </div>

        {/* Next video (below) */}
        {nextVideo && (
          <div className="absolute w-full h-full" style={{ top: '100%' }}>
            <VideoSlide
              video={nextVideo}
              showTitle={showTitle}
              isActive={false}
              onVideoClick={noopClick}
              onSeekClick={noopClick}
              onSeekTouchStart={noopTouch}
              onSeekTouchMove={noopTouch}
              progress={0}
              paused={false}
              skipIndicator={null}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
