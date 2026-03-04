import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { usePlayer } from '../components/player/PlayerContext.js';
import { LinkedText } from '../components/LinkedText.js';

export function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const { play, episode: currentEpisode, isPlaying, togglePlayPause } = usePlayer();

  const { data: episode, isLoading } = useQuery({
    queryKey: ['episodes', id],
    queryFn: () => api.episodes.get(id!),
    enabled: !!id,
  });

  const { data: show } = useQuery({
    queryKey: ['shows', episode?.showId],
    queryFn: () => api.shows.get(episode!.showId),
    enabled: !!episode?.showId,
  });

  if (isLoading) return <p className="py-12 px-4 text-center text-text-secondary">読み込み中...</p>;
  if (!episode) return <p className="py-12 px-4 text-center text-text-secondary">エピソードが見つかりません</p>;

  const isCurrent = currentEpisode?.id === episode.id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      play(episode, { artworkUrl: show?.artworkUrl, showTitle: show?.title });
    }
  };

  return (
    <div className="max-w-[640px]">
      <h1 className="text-[26px] font-bold tracking-[-0.02em]">{episode.title}</h1>
      {episode.publishedAt && (
        <p className="text-text-secondary mt-1.5 text-sm">
          {new Date(episode.publishedAt).toLocaleDateString('ja-JP')}
        </p>
      )}

      {episode.audioUrl && (
        <button
          onClick={handlePlay}
          className="mt-5 py-3 px-7 bg-primary text-bg border-none rounded-(--theme-radius) font-bold text-base font-[var(--font-body)] transition-[background,transform] duration-150 tracking-[0.02em] hover:bg-primary-hover hover:-translate-y-px"
        >
          {isCurrent && isPlaying ? '一時停止' : '再生'}
        </button>
      )}

      {episode.description && (
        <div className="mt-6">
          <LinkedText>{episode.description}</LinkedText>
        </div>
      )}

      {episode.videoUrl && (
        <div className="mt-8">
          <h3 className="text-base font-semibold mb-3">プロモーション動画</h3>
          <video
            src={episode.videoUrl}
            controls
            className="w-full rounded-(--theme-radius) bg-bg"
          />
        </div>
      )}
    </div>
  );
}
