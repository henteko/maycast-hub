import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { EpisodeList } from '../components/episodes/EpisodeList.js';

export function ShowPage() {
  const { id } = useParams<{ id: string }>();

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

  if (showLoading || episodesLoading) return <p>読み込み中...</p>;
  if (!show) return <p>番組が見つかりません</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        {show.artworkUrl && (
          <img
            src={show.artworkUrl}
            alt={show.title}
            style={{ width: 100, height: 100, borderRadius: 8, objectFit: 'cover' }}
          />
        )}
        <div>
          <h1>{show.title}</h1>
          {show.description && (
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {show.description}
            </p>
          )}
        </div>
      </div>
      <h2 style={{ marginBottom: 16 }}>エピソード</h2>
      <EpisodeList episodes={episodes ?? []} />
    </div>
  );
}
