import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { ShowList } from '../components/shows/ShowList.js';

export function HomePage() {
  const { data: shows, isLoading, error } = useQuery({
    queryKey: ['shows'],
    queryFn: api.shows.list,
  });

  if (isLoading) return <p className="py-12 px-4 text-center text-text-secondary">読み込み中...</p>;
  if (error) return <p className="py-12 px-4 text-center text-text-secondary">エラーが発生しました: {(error as Error).message}</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">番組一覧</h1>
        <p className="text-text-secondary mt-1 text-[15px]">お気に入りの番組を見つけよう</p>
      </div>
      <ShowList shows={shows ?? []} />
    </div>
  );
}
