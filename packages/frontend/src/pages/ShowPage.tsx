import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { EpisodeList } from '../components/episodes/EpisodeList.js';
import styles from './ShowPage.module.css';

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

  if (showLoading || episodesLoading) return <p className={styles.loading}>読み込み中...</p>;
  if (!show) return <p className={styles.loading}>番組が見つかりません</p>;

  return (
    <div>
      <div className={styles.header}>
        {show.artworkUrl && (
          <img
            src={show.artworkUrl}
            alt={show.title}
            className={styles.artwork}
          />
        )}
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{show.title}</h1>
          {show.description && (
            <p className={styles.description}>{show.description}</p>
          )}
        </div>
      </div>
      <h2 className={styles.sectionTitle}>エピソード</h2>
      <EpisodeList episodes={episodes ?? []} />
    </div>
  );
}
