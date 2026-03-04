import type { Show } from '@maycast/shared';
import { ShowCard } from './ShowCard.js';
import styles from './ShowList.module.css';

interface Props {
  shows: Show[];
}

export function ShowList({ shows }: Props) {
  if (shows.length === 0) {
    return <p className={styles.empty}>番組がありません</p>;
  }

  return (
    <div className={styles.list}>
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  );
}
