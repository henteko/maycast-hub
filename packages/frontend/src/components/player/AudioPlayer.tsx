import { usePlayer } from './PlayerContext.js';
import styles from './AudioPlayer.module.css';

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer() {
  const { episode, isPlaying, currentTime, duration, togglePlayPause, seek } =
    usePlayer();

  if (!episode) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.player}>
      <div className={styles.inner}>
        <button className={styles.playBtn} onClick={togglePlayPause}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className={styles.info}>
          <span className={styles.title}>{episode.title}</span>
          <div className={styles.progressRow}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
