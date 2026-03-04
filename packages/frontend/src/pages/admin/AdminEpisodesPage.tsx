import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import type { Episode } from '@maycast/shared';

function StatusBadge({ status }: { status: Episode['status'] }) {
  const colorClass =
    status === 'published'
      ? 'bg-[rgba(16,185,129,0.15)] text-success'
      : status === 'unpublished'
        ? 'bg-[rgba(245,158,11,0.15)] text-warning'
        : 'bg-border text-text-secondary';

  return (
    <span className={`inline-block py-0.5 px-2.5 rounded-xl text-xs font-semibold leading-[1.4] ${colorClass}`}>
      {status}
    </span>
  );
}

export function AdminEpisodesPage() {
  const { showId } = useParams<{ showId: string }>();
  const queryClient = useQueryClient();

  const { data: show } = useQuery({
    queryKey: ['shows', showId],
    queryFn: () => api.shows.get(showId!),
    enabled: !!showId,
  });

  const { data: episodes, isLoading } = useQuery({
    queryKey: ['episodes', showId, 'admin'],
    queryFn: () => api.episodes.listByShow(showId!, true),
    enabled: !!showId,
  });

  const publishMutation = useMutation({
    mutationFn: api.episodes.publish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['episodes', showId] }),
  });

  const unpublishMutation = useMutation({
    mutationFn: api.episodes.unpublish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['episodes', showId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.episodes.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['episodes', showId] }),
  });

  if (isLoading) return <p className="py-12 px-4 text-center text-text-secondary">読み込み中...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.01em]">{show?.title ?? ''} - エピソード管理</h1>
          <Link to="/admin" className="text-[13px] text-text-secondary no-underline transition-colors duration-150 hover:text-primary hover:no-underline">
            &#8592; 番組一覧に戻る
          </Link>
        </div>
        <Link
          to={`/admin/shows/${showId}/episodes/new`}
          className="inline-flex items-center gap-1 py-2 px-[18px] bg-primary text-white rounded-(--theme-radius) no-underline font-semibold text-sm border-none transition-colors duration-150 hover:bg-primary-hover hover:no-underline"
        >
          + 新規作成
        </Link>
      </div>

      {!episodes?.length ? (
        <p className="py-12 px-4 text-center text-text-secondary">エピソードがありません</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {episodes.map((ep) => (
            <div key={ep.id} className="flex items-center justify-between py-3.5 px-[18px] bg-surface border border-border rounded-(--theme-radius) gap-3 transition-shadow duration-150 hover:shadow-(--theme-shadow-card-hover) max-md:flex-wrap">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/admin/shows/${showId}/episodes/${ep.id}`}
                  className="font-semibold text-[15px] text-text no-underline hover:text-primary hover:no-underline"
                >
                  {ep.title}
                </Link>
                <div className="mt-1.5">
                  <StatusBadge status={ep.status} />
                </div>
              </div>
              <div className="flex gap-2 shrink-0 max-md:w-full max-md:justify-end">
                {ep.status !== 'published' ? (
                  <button
                    onClick={() => publishMutation.mutate(ep.id)}
                    className="py-1.5 px-3.5 border border-success text-success bg-transparent rounded-(--theme-radius) text-[13px] font-medium transition-[background,color] duration-150 shrink-0 hover:bg-success hover:text-white"
                  >
                    公開
                  </button>
                ) : (
                  <button
                    onClick={() => unpublishMutation.mutate(ep.id)}
                    className="py-1.5 px-3.5 border border-border text-text-secondary bg-transparent rounded-(--theme-radius) text-[13px] font-medium transition-colors duration-150 shrink-0 hover:bg-bg"
                  >
                    非公開
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('このエピソードを削除しますか？')) {
                      deleteMutation.mutate(ep.id);
                    }
                  }}
                  className="py-1.5 px-3.5 border border-danger text-danger bg-transparent rounded-(--theme-radius) text-[13px] font-medium transition-[background,color] duration-150 shrink-0 hover:bg-danger hover:text-white"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
