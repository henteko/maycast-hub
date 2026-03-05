import { useState } from 'react';
import { usePlayer } from './PlayerContext.js';
import { LinkedText } from '../LinkedText.js';
import { mediaUrl } from '../../utils/media.js';

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer() {
  const {
    episode,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    artworkKey,
    showTitle,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    setPlaybackRate,
  } = usePlayer();
  const [expanded, setExpanded] = useState(false);

  if (!episode) return null;

  const remaining = duration > 0 ? duration - currentTime : 0;

  return (
    <>
      {/* Mini Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-100 bg-surface border-t border-border backdrop-blur-[16px]">
        <div className="max-w-[var(--theme-max-width)] mx-auto px-5 py-2.5 flex items-center gap-3">
          <button className="w-12 h-12 rounded-[var(--theme-radius-sm)] overflow-hidden shrink-0 border-none p-0 bg-transparent cursor-pointer" onClick={() => setExpanded(true)}>
            {artworkKey ? (
              <img src={mediaUrl(artworkKey)} alt="" className="w-full h-full object-cover rounded-[var(--theme-radius-sm)]" />
            ) : (
              <div className="w-full h-full bg-border rounded-[var(--theme-radius-sm)]" />
            )}
          </button>
          <button className="flex-1 min-w-0 flex flex-col gap-0.5 bg-transparent border-none p-0 cursor-pointer text-left text-text" onClick={() => setExpanded(true)}>
            <span className="font-display text-sm font-semibold truncate">{episode.title}</span>
            {showTitle && <span className="text-xs text-text-secondary truncate">{showTitle}</span>}
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button className="w-9 h-9 rounded-full border-none bg-transparent text-text flex items-center justify-center transition-colors duration-150 hover:text-primary hover:bg-primary-subtle" onClick={() => skipBackward(15)} aria-label="15秒戻る">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700">15</text>
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full border-none bg-primary text-bg flex items-center justify-center transition-colors duration-150 hover:bg-primary-hover" onClick={togglePlayPause} aria-label={isPlaying ? '一時停止' : '再生'}>
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button className="w-9 h-9 rounded-full border-none bg-transparent text-text flex items-center justify-center transition-colors duration-150 hover:text-primary hover:bg-primary-subtle" onClick={() => skipForward(15)} aria-label="15秒進む">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
                <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700">15</text>
              </svg>
            </button>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className="h-[3px] bg-border">
          <div
            className="h-full bg-primary transition-[width] duration-300 ease-linear"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Expanded Player Overlay */}
      {expanded && (
        <div className="fixed inset-0 z-200 bg-black/50 flex items-end justify-center animate-fade-in md:items-center" onClick={() => setExpanded(false)}>
          <div className="bg-surface rounded-t-[20px] w-full max-w-[480px] max-h-[90vh] overflow-y-auto px-6 pt-4 pb-10 animate-slide-up md:rounded-2xl md:max-h-[85vh] md:shadow-[0_24px_48px_rgba(0,0,0,0.3)] md:animate-scale-in max-sm:max-w-full max-sm:px-4 max-sm:pb-8 max-sm:pt-3" onClick={(e) => e.stopPropagation()}>
            <button className="flex items-center justify-center w-full p-1 border-none bg-transparent text-text-secondary cursor-pointer mb-4 hover:text-text" onClick={() => setExpanded(false)} aria-label="閉じる">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Artwork */}
            <div className="w-60 h-60 mx-auto mb-6 rounded-[var(--theme-radius)] overflow-hidden shadow-[var(--theme-shadow-card)] max-sm:w-[200px] max-sm:h-[200px]">
              {artworkKey ? (
                <img src={mediaUrl(artworkKey)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-border to-surface-hover" />
              )}
            </div>

            {/* Episode Info */}
            <div className="text-center mb-6">
              <h2 className="font-display text-xl font-bold tracking-[-0.02em] mb-1">{episode.title}</h2>
              {showTitle && <p className="text-sm text-primary font-medium">{showTitle}</p>}
            </div>

            {/* Progress */}
            <div className="mb-5">
              <input
                type="range"
                className="w-full h-1.5 accent-primary cursor-pointer mb-1.5"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
              />
              <div className="flex justify-between">
                <span className="text-xs font-medium text-text-secondary tabular-nums">{formatTime(currentTime)}</span>
                <span className="text-xs font-medium text-text-secondary tabular-nums">-{formatTime(remaining)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-7">
              <button className="w-12 h-12 rounded-full border-none bg-transparent text-text flex items-center justify-center transition-[color,background] duration-150 hover:text-primary hover:bg-primary-subtle" onClick={() => skipBackward(15)} aria-label="15秒戻る">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700">15</text>
                </svg>
              </button>
              <button className="w-16 h-16 rounded-full border-none bg-primary text-bg flex items-center justify-center transition-[background,transform] duration-150 hover:bg-primary-hover hover:scale-105" onClick={togglePlayPause} aria-label={isPlaying ? '一時停止' : '再生'}>
                {isPlaying ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button className="w-12 h-12 rounded-full border-none bg-transparent text-text flex items-center justify-center transition-[color,background] duration-150 hover:text-primary hover:bg-primary-subtle" onClick={() => skipForward(15)} aria-label="15秒進む">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
                  <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700">15</text>
                </svg>
              </button>
            </div>

            {/* Speed Control */}
            <div className="mb-7">
              <span className="block text-xs font-semibold text-text-secondary uppercase tracking-[0.04em] mb-2.5 text-center">再生速度</span>
              <div className="flex justify-center gap-1.5 max-sm:gap-1">
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    className={`px-3 py-1.5 border border-border rounded-[20px] bg-transparent text-text-secondary text-[13px] font-semibold tabular-nums transition-all duration-150 hover:border-primary hover:text-primary max-sm:px-2 max-sm:py-[5px] max-sm:text-xs ${
                      playbackRate === rate
                        ? 'bg-primary border-primary text-bg hover:bg-primary-hover hover:border-primary-hover hover:text-bg'
                        : ''
                    }`}
                    onClick={() => setPlaybackRate(rate)}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            {episode.description && (
              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold mb-2">概要</h3>
                <LinkedText>{episode.description}</LinkedText>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
