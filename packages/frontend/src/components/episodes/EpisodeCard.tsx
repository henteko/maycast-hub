import type { Episode } from '@maycast/shared';
import { usePlayer } from '../player/PlayerContext.js';
import styles from './EpisodeCard.module.css';

interface Props {
  episode: Episode;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function EpisodeCard({ episode }: Props) {
  const { play, episode: currentEpisode, isPlaying, togglePlayPause } = usePlayer();
  const isCurrent = currentEpisode?.id === episode.id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      play(episode);
    }
  };

  return (
    <div className={`${styles.card} ${isCurrent ? styles.active : ''}`}>
      <button
        className={styles.playBtn}
        onClick={handlePlay}
        disabled={!episode.audioUrl}
      >
        {isCurrent && isPlaying ? '⏸' : '▶'}
      </button>
      <div className={styles.info}>
        <h4 className={styles.title}>{episode.title}</h4>
        <p className={styles.meta}>
          {episode.publishedAt &&
            new Date(episode.publishedAt).toLocaleDateString('ja-JP')}
          {episode.audioDuration && ` · ${formatDuration(episode.audioDuration)}`}
        </p>
        {episode.description && (
          <p className={styles.description}>{episode.description}</p>
        )}
      </div>
    </div>
  );
}
