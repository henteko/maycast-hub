import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard.js';

export function AdminAnalyticsPage() {
  const { showId } = useParams<{ showId: string }>();

  const { data: show } = useQuery({
    queryKey: ['shows', showId],
    queryFn: () => api.shows.get(showId!),
    enabled: !!showId,
  });

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[22px] font-bold tracking-[-0.01em]">{show?.title ?? ''} - アナリティクス</h1>
        <Link to="/admin" className="text-[13px] text-text-secondary no-underline transition-colors duration-150 hover:text-primary hover:no-underline">
          &#8592; 番組一覧に戻る
        </Link>
      </div>
      {showId && <AnalyticsDashboard showId={showId} />}
    </div>
  );
}
