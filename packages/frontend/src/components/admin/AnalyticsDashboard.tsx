import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import styles from './AnalyticsDashboard.module.css';

interface Props {
  showId: string;
}

export function AnalyticsDashboard({ showId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'shows', showId],
    queryFn: () => api.analytics.showStats(showId),
  });

  if (isLoading) return <p>読み込み中...</p>;
  if (!data) return null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{data.totalPlays}</span>
          <span className={styles.statLabel}>総再生回数</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{data.uniqueListeners}</span>
          <span className={styles.statLabel}>ユニークリスナー</span>
        </div>
      </div>

      {data.episodes.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>エピソード</th>
              <th>再生回数</th>
              <th>ユニーク</th>
            </tr>
          </thead>
          <tbody>
            {data.episodes.map((ep) => (
              <tr key={ep.episodeId}>
                <td>{ep.episodeId.slice(0, 8)}...</td>
                <td>{ep.totalPlays}</td>
                <td>{ep.uniqueListeners}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
