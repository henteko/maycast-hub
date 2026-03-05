import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';

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
    <div className="flex flex-col gap-7">
      <div className="flex gap-4 max-md:flex-col">
        <div className="flex-1 p-6 bg-surface border border-border rounded-[var(--theme-radius)] text-center transition-shadow duration-150 hover:shadow-[var(--shadow-card-hover)]">
          <span className="block font-[var(--font-display)] text-4xl font-bold text-primary leading-[1.2] tabular-nums">{data.totalPlays}</span>
          <span className="block text-[13px] text-text-secondary mt-1 font-medium uppercase tracking-[0.04em]">総再生回数</span>
        </div>
        <div className="flex-1 p-6 bg-surface border border-border rounded-[var(--theme-radius)] text-center transition-shadow duration-150 hover:shadow-[var(--shadow-card-hover)]">
          <span className="block font-[var(--font-display)] text-4xl font-bold text-primary leading-[1.2] tabular-nums">{data.uniqueListeners}</span>
          <span className="block text-[13px] text-text-secondary mt-1 font-medium uppercase tracking-[0.04em]">ユニークリスナー</span>
        </div>
      </div>

      {data.episodes.length > 0 && (
        <>
          <h2 className="text-base font-bold mt-2">エピソード別</h2>
          <table className="w-full border-collapse text-sm bg-surface rounded-[var(--theme-radius)] overflow-hidden border border-border [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:border-b [&_th]:border-border [&_th]:font-semibold [&_th]:text-text-secondary [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-[0.04em] [&_th]:bg-bg [&_td]:px-4 [&_td]:py-3 [&_td]:text-left [&_td]:border-b [&_td]:border-border [&_tr:last-child_td]:border-b-0 [&_tr:hover_td]:bg-primary-subtle">
            <thead>
              <tr>
                <th>エピソード</th>
                <th>再生回数</th>
                <th>ユニークリスナー</th>
              </tr>
            </thead>
            <tbody>
              {data.episodes.map((ep) => (
                <tr key={ep.episodeId}>
                  <td>{ep.episodeTitle}</td>
                  <td>{ep.totalPlays}</td>
                  <td>{ep.uniqueListeners}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
