import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { usePlayer } from '../components/player/PlayerContext.js';

export function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const { play, episode: currentEpisode, isPlaying, togglePlayPause } = usePlayer();

  const { data: episode, isLoading } = useQuery({
    queryKey: ['episodes', id],
    queryFn: () => api.episodes.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <p>読み込み中...</p>;
  if (!episode) return <p>エピソードが見つかりません</p>;

  const isCurrent = currentEpisode?.id === episode.id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      play(episode);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>{episode.title}</h1>
      {episode.publishedAt && (
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {new Date(episode.publishedAt).toLocaleDateString('ja-JP')}
        </p>
      )}

      {episode.audioUrl && (
        <button
          onClick={handlePlay}
          style={{
            marginTop: 16,
            padding: '10px 24px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {isCurrent && isPlaying ? '一時停止' : '再生'}
        </button>
      )}

      {episode.description && (
        <p style={{ marginTop: 20, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          {episode.description}
        </p>
      )}

      {episode.videoUrl && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>プロモーション動画</h3>
          <video
            src={episode.videoUrl}
            controls
            style={{ width: '100%', borderRadius: 'var(--radius)' }}
          />
        </div>
      )}
    </div>
  );
}
