import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard.js';
import styles from './Admin.module.css';

export function AdminAnalyticsPage() {
  const { showId } = useParams<{ showId: string }>();

  const { data: show } = useQuery({
    queryKey: ['shows', showId],
    queryFn: () => api.shows.get(showId!),
    enabled: !!showId,
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className={styles.pageTitle}>{show?.title ?? ''} - アナリティクス</h1>
        <Link to="/admin" className={styles.backLink}>
          &#8592; 番組一覧に戻る
        </Link>
      </div>
      {showId && <AnalyticsDashboard showId={showId} />}
    </div>
  );
}
