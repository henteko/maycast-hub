import { useState } from 'react';
import { usePlayer } from './PlayerContext.js';
import styles from './AudioPlayer.module.css';

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
    artworkUrl,
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
      <div className={styles.miniPlayer}>
        <div className={styles.miniInner}>
          <button className={styles.miniArtwork} onClick={() => setExpanded(true)}>
            {artworkUrl ? (
              <img src={artworkUrl} alt="" className={styles.miniArtworkImg} />
            ) : (
              <div className={styles.miniArtworkPlaceholder} />
            )}
          </button>
          <button className={styles.miniInfo} onClick={() => setExpanded(true)}>
            <span className={styles.miniTitle}>{episode.title}</span>
            {showTitle && <span className={styles.miniShow}>{showTitle}</span>}
          </button>
          <div className={styles.miniControls}>
            <button className={styles.miniSkipBtn} onClick={() => skipBackward(15)} aria-label="15秒戻る">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700">15</text>
              </svg>
            </button>
            <button className={styles.miniPlayBtn} onClick={togglePlayPause} aria-label={isPlaying ? '一時停止' : '再生'}>
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <button className={styles.miniSkipBtn} onClick={() => skipForward(15)} aria-label="15秒進む">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
                <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700">15</text>
              </svg>
            </button>
          </div>
        </div>
        {/* Mini progress bar */}
        <div className={styles.miniProgress}>
          <div
            className={styles.miniProgressFill}
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Expanded Player Overlay */}
      {expanded && (
        <div className={styles.overlay} onClick={() => setExpanded(false)}>
          <div className={styles.expandedPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setExpanded(false)} aria-label="閉じる">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Artwork */}
            <div className={styles.artworkContainer}>
              {artworkUrl ? (
                <img src={artworkUrl} alt="" className={styles.artworkImg} />
              ) : (
                <div className={styles.artworkPlaceholder} />
              )}
            </div>

            {/* Episode Info */}
            <div className={styles.episodeInfo}>
              <h2 className={styles.episodeTitle}>{episode.title}</h2>
              {showTitle && <p className={styles.episodeShow}>{showTitle}</p>}
            </div>

            {/* Progress */}
            <div className={styles.progressSection}>
              <input
                type="range"
                className={styles.progressSlider}
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
              />
              <div className={styles.timeRow}>
                <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
                <span className={styles.timeLabel}>-{formatTime(remaining)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
              <button className={styles.skipBtn} onClick={() => skipBackward(15)} aria-label="15秒戻る">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700">15</text>
                </svg>
              </button>
              <button className={styles.playBtn} onClick={togglePlayPause} aria-label={isPlaying ? '一時停止' : '再生'}>
                {isPlaying ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button className={styles.skipBtn} onClick={() => skipForward(15)} aria-label="15秒進む">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
                  <text x="12" y="16" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700">15</text>
                </svg>
              </button>
            </div>

            {/* Speed Control */}
            <div className={styles.speedSection}>
              <span className={styles.speedLabel}>再生速度</span>
              <div className={styles.speedOptions}>
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    className={`${styles.speedBtn} ${playbackRate === rate ? styles.speedBtnActive : ''}`}
                    onClick={() => setPlaybackRate(rate)}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            {episode.description && (
              <div className={styles.descriptionSection}>
                <h3 className={styles.descriptionTitle}>概要</h3>
                <p className={styles.descriptionText}>{episode.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
