import { Link } from 'react-router-dom';
import type { Show } from '@maycast/shared';
import styles from './ShowCard.module.css';

interface Props {
  show: Show;
}

export function ShowCard({ show }: Props) {
  return (
    <Link to={`/shows/${show.id}`} className={styles.card}>
      <div className={styles.artwork}>
        {show.artworkUrl ? (
          <img src={show.artworkUrl} alt={show.title} />
        ) : (
          <div className={styles.placeholder}>🎙️</div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{show.title}</h3>
        <p className={styles.description}>{show.description}</p>
      </div>
    </Link>
  );
}
