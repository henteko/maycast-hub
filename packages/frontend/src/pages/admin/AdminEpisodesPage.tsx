import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import type { Episode } from '@maycast/shared';

function StatusBadge({ status }: { status: Episode['status'] }) {
  const colors: Record<string, { bg: string; text: string }> = {
    draft: { bg: '#f1f5f9', text: '#64748b' },
    published: { bg: '#dcfce7', text: '#16a34a' },
    unpublished: { bg: '#fef3c7', text: '#d97706' },
  };
  const c = colors[status] ?? colors.draft;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: c.bg,
        color: c.text,
      }}
    >
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

  if (isLoading) return <p>読み込み中...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>{show?.title ?? ''} - エピソード管理</h1>
          <Link to="/admin" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            ← 番組一覧に戻る
          </Link>
        </div>
        <Link
          to={`/admin/shows/${showId}/episodes/new`}
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

      {!episodes?.length ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>エピソードがありません</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {episodes.map((ep) => (
            <div
              key={ep.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  to={`/admin/shows/${showId}/episodes/${ep.id}`}
                  style={{ fontWeight: 600 }}
                >
                  {ep.title}
                </Link>
                <div style={{ marginTop: 4 }}>
                  <StatusBadge status={ep.status} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {ep.status !== 'published' ? (
                  <button
                    onClick={() => publishMutation.mutate(ep.id)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--color-success)',
                      color: 'var(--color-success)',
                      background: 'transparent',
                      borderRadius: 'var(--radius)',
                      fontSize: 13,
                    }}
                  >
                    公開
                  </button>
                ) : (
                  <button
                    onClick={() => unpublishMutation.mutate(ep.id)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid var(--color-text-secondary)',
                      color: 'var(--color-text-secondary)',
                      background: 'transparent',
                      borderRadius: 'var(--radius)',
                      fontSize: 13,
                    }}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
