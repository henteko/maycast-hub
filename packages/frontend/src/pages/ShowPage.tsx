import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { EpisodeList } from '../components/episodes/EpisodeList.js';
import { ShortVideoCarousel } from '../components/video/ShortVideoCarousel.js';
import { ShortVideoPlayer } from '../components/video/ShortVideoPlayer.js';

export function ShowPage() {
  const { id } = useParams<{ id: string }>();
  const [videoPlayerIndex, setVideoPlayerIndex] = useState<number | null>(null);

  const { data: show, isLoading: showLoading } = useQuery({
    queryKey: ['shows', id],
    queryFn: () => api.shows.get(id!),
    enabled: !!id,
  });

  const { data: episodes, isLoading: episodesLoading } = useQuery({
    queryKey: ['episodes', id],
    queryFn: () => api.episodes.listByShow(id!),
    enabled: !!id,
  });

  const videoEpisodes = useMemo(
    () => (episodes ?? []).filter((ep) => ep.videoUrl),
    [episodes],
  );

  if (showLoading || episodesLoading) return <p className="py-12 px-4 text-center text-text-secondary">読み込み中...</p>;
  if (!show) return <p className="py-12 px-4 text-center text-text-secondary">番組が見つかりません</p>;

  return (
    <div>
      <div className="flex gap-8 mb-8 items-start max-md:flex-col max-md:items-center">
        {show.artworkUrl && (
          <img
            src={show.artworkUrl}
            alt={show.title}
            className="w-[260px] h-[260px] rounded-(--theme-radius) object-cover shrink-0 shadow-(--theme-shadow-card) max-md:w-[200px] max-md:h-[200px]"
          />
        )}
        <div className="min-w-0 max-md:text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.02em] max-md:text-[22px]">{show.title}</h1>
          {show.description && (
            <p className="text-text-secondary mt-3 leading-[1.6]">{show.description}</p>
          )}
        </div>
      </div>
      {videoEpisodes.length > 0 && (
        <ShortVideoCarousel
          episodes={videoEpisodes}
          onVideoSelect={(index) => setVideoPlayerIndex(index)}
        />
      )}
      <h2 className="text-lg font-semibold mb-4 tracking-[-0.01em]">エピソード</h2>
      <EpisodeList episodes={episodes ?? []} artworkUrl={show.artworkUrl} showTitle={show.title} />
      {videoPlayerIndex !== null && (
        <ShortVideoPlayer
          episodes={videoEpisodes}
          currentIndex={videoPlayerIndex}
          showTitle={show.title}
          onClose={() => setVideoPlayerIndex(null)}
          onIndexChange={setVideoPlayerIndex}
        />
      )}
    </div>
  );
}
