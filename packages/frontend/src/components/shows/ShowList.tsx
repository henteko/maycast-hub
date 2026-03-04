import type { Show } from '@maycast/shared';
import { ShowCard } from './ShowCard.js';

interface Props {
  shows: Show[];
}

export function ShowList({ shows }: Props) {
  if (shows.length === 0) {
    return <p className="text-center py-16 px-4 text-text-secondary text-[15px]">番組がありません</p>;
  }

  return (
    <div className="grid gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  );
}
