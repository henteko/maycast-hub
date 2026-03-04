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

  if (isLoading) return <p>読み込み中...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>番組管理</h1>
        <Link
          to="/admin/shows/new"
          style={{
            padding: '8px 16px',
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          新規作成
        </Link>
      </div>

      {!shows?.length ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>番組がありません</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shows.map((show) => (
            <div
              key={show.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <div>
                <Link to={`/admin/shows/${show.id}`} style={{ fontWeight: 600 }}>
                  {show.title}
                </Link>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <Link
                    to={`/admin/shows/${show.id}/episodes`}
                    style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}
                  >
                    エピソード管理
                  </Link>
                  <Link
                    to={`/admin/shows/${show.id}/analytics`}
                    style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}
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
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                  background: 'transparent',
                  borderRadius: 'var(--radius)',
                  fontSize: 13,
                }}
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
