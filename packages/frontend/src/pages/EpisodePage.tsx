import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { usePlayer } from '../components/player/PlayerContext.js';
import styles from './EpisodePage.module.css';

export function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const { play, episode: currentEpisode, isPlaying, togglePlayPause } = usePlayer();

  const { data: episode, isLoading } = useQuery({
    queryKey: ['episodes', id],
    queryFn: () => api.episodes.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <p className={styles.loading}>読み込み中...</p>;
  if (!episode) return <p className={styles.loading}>エピソードが見つかりません</p>;

  const isCurrent = currentEpisode?.id === episode.id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      play(episode);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{episode.title}</h1>
      {episode.publishedAt && (
        <p className={styles.date}>
          {new Date(episode.publishedAt).toLocaleDateString('ja-JP')}
        </p>
      )}

      {episode.audioUrl && (
        <button onClick={handlePlay} className={styles.playBtn}>
          {isCurrent && isPlaying ? '一時停止' : '再生'}
        </button>
      )}

      {episode.description && (
        <p className={styles.description}>{episode.description}</p>
      )}

      {episode.videoUrl && (
        <div className={styles.videoSection}>
          <h3 className={styles.videoTitle}>プロモーション動画</h3>
          <video
            src={episode.videoUrl}
            controls
            className={styles.video}
          />
        </div>
      )}
    </div>
  );
}
