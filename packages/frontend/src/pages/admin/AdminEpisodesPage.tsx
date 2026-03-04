import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import type { Episode } from '@maycast/shared';
import styles from './Admin.module.css';

function StatusBadge({ status }: { status: Episode['status'] }) {
  const className =
    status === 'published'
      ? styles.badgePublished
      : status === 'unpublished'
        ? styles.badgeUnpublished
        : styles.badgeDraft;

  return (
    <span className={`${styles.badge} ${className}`}>
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

  if (isLoading) return <p className={styles.loading}>読み込み中...</p>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{show?.title ?? ''} - エピソード管理</h1>
          <Link to="/admin" className={styles.backLink}>
            &#8592; 番組一覧に戻る
          </Link>
        </div>
        <Link
          to={`/admin/shows/${showId}/episodes/new`}
          className={styles.primaryBtn}
        >
          + 新規作成
        </Link>
      </div>

      {!episodes?.length ? (
        <p className={styles.empty}>エピソードがありません</p>
      ) : (
        <div className={styles.list}>
          {episodes.map((ep) => (
            <div key={ep.id} className={styles.row}>
              <div className={styles.rowInfo}>
                <Link
                  to={`/admin/shows/${showId}/episodes/${ep.id}`}
                  className={styles.rowTitle}
                >
                  {ep.title}
                </Link>
                <div style={{ marginTop: 6 }}>
                  <StatusBadge status={ep.status} />
                </div>
              </div>
              <div className={styles.btnGroup}>
                {ep.status !== 'published' ? (
                  <button
                    onClick={() => publishMutation.mutate(ep.id)}
                    className={styles.successBtn}
                  >
                    公開
                  </button>
                ) : (
                  <button
                    onClick={() => unpublishMutation.mutate(ep.id)}
                    className={styles.mutedBtn}
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
                  className={styles.dangerBtn}
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
