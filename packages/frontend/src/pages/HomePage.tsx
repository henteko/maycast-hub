import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { ShowList } from '../components/shows/ShowList.js';

export function HomePage() {
  const { data: shows, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: api.shows.list,
  });

  if (isLoading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {(error as Error).message}</p>;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>番組一覧</h1>
      <ShowList shows={shows ?? []} />
    </div>
  );
}
