import type { Episode } from '@maycast/shared';
import { EpisodeCard } from './EpisodeCard.js';
import styles from './EpisodeList.module.css';

interface Props {
  episodes: Episode[];
  artworkUrl?: string | null;
  showTitle?: string;
}

export function EpisodeList({ episodes, artworkUrl, showTitle }: Props) {
  if (episodes.length === 0) {
    return <p className={styles.empty}>エピソードがありません</p>;
  }

  return (
    <div className={styles.list}>
      {episodes.map((ep) => (
        <EpisodeCard key={ep.id} episode={ep} artworkUrl={artworkUrl} showTitle={showTitle} />
      ))}
    </div>
  );
}
