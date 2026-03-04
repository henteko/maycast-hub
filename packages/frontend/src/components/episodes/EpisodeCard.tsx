import type { Episode } from '@maycast/shared';
import { usePlayer } from '../player/PlayerContext.js';
import styles from './EpisodeCard.module.css';

interface Props {
  episode: Episode;
  artworkUrl?: string | null;
  showTitle?: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function EpisodeCard({ episode, artworkUrl, showTitle }: Props) {
  const { play, episode: currentEpisode, isPlaying, togglePlayPause } = usePlayer();
  const isCurrent = currentEpisode?.id === episode.id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      play(episode, { artworkUrl, showTitle });
    }
  };

  return (
    <div className={`${styles.card} ${isCurrent ? styles.active : ''}`}>
      <button
        className={styles.playBtn}
        onClick={handlePlay}
        disabled={!episode.audioUrl}
      >
        {isCurrent && isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        )}
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
