import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';

export function AdminShowsPage() {
  const queryClient = useQueryClient();
  const { data: shows, isLoading } = useQuery({
    queryKey: ['shows'],
    queryFn: api.shows.list,
  });

  const deleteMutation = useMutation({
    mutationFn: api.shows.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shows'] }),
  });

  if (isLoading) return <p className="py-12 px-4 text-center text-text-secondary">読み込み中...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-[22px] font-bold tracking-[-0.01em]">番組管理</h1>
        <Link to="/admin/shows/new" className="inline-flex items-center gap-1 py-2 px-[18px] bg-primary text-white rounded-(--theme-radius) no-underline font-semibold text-sm border-none transition-colors duration-150 hover:bg-primary-hover hover:no-underline">
          + 新規作成
        </Link>
      </div>

      {!shows?.length ? (
        <p className="py-12 px-4 text-center text-text-secondary">番組がありません</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {shows.map((show) => (
            <div key={show.id} className="flex items-center justify-between py-3.5 px-[18px] bg-surface border border-border rounded-(--theme-radius) gap-3 transition-shadow duration-150 hover:shadow-(--theme-shadow-card-hover) max-md:flex-wrap">
              <div className="flex-1 min-w-0">
                <Link to={`/admin/shows/${show.id}`} className="font-semibold text-[15px] text-text no-underline hover:text-primary hover:no-underline">
                  {show.title}
                </Link>
                <div className="flex gap-1 items-center mt-1">
                  <Link
                    to={`/admin/shows/${show.id}/episodes`}
                    className="text-[13px] text-text-secondary no-underline transition-colors duration-150 hover:text-primary hover:no-underline"
                  >
                    エピソード管理
                  </Link>
                  <span className="text-border text-base leading-none">&#183;</span>
                  <Link
                    to={`/admin/shows/${show.id}/analytics`}
                    className="text-[13px] text-text-secondary no-underline transition-colors duration-150 hover:text-primary hover:no-underline"
                  >
                    アナリティクス
                  </Link>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('この番組を削除しますか？')) {
                    deleteMutation.mutate(show.id);
                  }
                }}
                className="py-1.5 px-3.5 border border-danger text-danger bg-transparent rounded-(--theme-radius) text-[13px] font-medium transition-[background,color] duration-150 shrink-0 hover:bg-danger hover:text-white"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
