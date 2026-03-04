import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { ShowList } from '../components/shows/ShowList.js';
import styles from './HomePage.module.css';

export function HomePage() {
  const { data: shows, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: api.shows.list,
  });

  if (isLoading) return <p className={styles.loading}>読み込み中...</p>;
  if (error) return <p className={styles.error}>エラーが発生しました: {(error as Error).message}</p>;

  return (
    <div>
      <div className={styles.hero}>
        <h1 className={styles.title}>番組一覧</h1>
        <p className={styles.subtitle}>お気に入りの番組を見つけよう</p>
      </div>
      <ShowList shows={shows ?? []} />
    </div>
  );
}
