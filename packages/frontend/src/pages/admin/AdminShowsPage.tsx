import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import styles from './Admin.module.css';

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

  if (isLoading) return <p className={styles.loading}>読み込み中...</p>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>番組管理</h1>
        <Link to="/admin/shows/new" className={styles.primaryBtn}>
          + 新規作成
        </Link>
      </div>

      {!shows?.length ? (
        <p className={styles.empty}>番組がありません</p>
      ) : (
        <div className={styles.list}>
          {shows.map((show) => (
            <div key={show.id} className={styles.row}>
              <div className={styles.rowInfo}>
                <Link to={`/admin/shows/${show.id}`} className={styles.rowTitle}>
                  {show.title}
                </Link>
                <div className={styles.rowActions}>
                  <Link
                    to={`/admin/shows/${show.id}/episodes`}
                    className={styles.rowLink}
                  >
                    エピソード管理
                  </Link>
                  <span className={styles.dot}>&#183;</span>
                  <Link
                    to={`/admin/shows/${show.id}/analytics`}
                    className={styles.rowLink}
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
                className={styles.dangerBtn}
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
