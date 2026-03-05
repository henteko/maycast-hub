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
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em]">{show?.title ?? ''} - アナリティクス</h1>
          <div className="flex gap-1 items-center mt-1">
            <Link to="/admin" className="text-[13px] text-text-secondary no-underline transition-colors duration-150 hover:text-primary hover:no-underline">
              番組一覧
            </Link>
            <span className="text-border text-[13px] leading-none">&gt;</span>
            <span className="text-[13px] text-text-secondary">アナリティクス</span>
          </div>
        </div>
        <Link
          to={`/admin/shows/${showId}/episodes`}
          className="inline-flex items-center gap-1 py-2 px-[18px] border border-border text-text-secondary rounded-(--theme-radius) no-underline font-semibold text-sm transition-colors duration-150 hover:border-primary hover:text-primary hover:no-underline"
        >
          エピソード管理
        </Link>
      </div>
      {showId && <AnalyticsDashboard showId={showId} />}
    </div>
  );
}
