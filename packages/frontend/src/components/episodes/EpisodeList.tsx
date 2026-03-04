import type { Episode } from '@maycast/shared';
import { EpisodeCard } from './EpisodeCard.js';

interface Props {
  episodes: Episode[];
  artworkUrl?: string | null;
  showTitle?: string;
}

export function EpisodeList({ episodes, artworkUrl, showTitle }: Props) {
  if (episodes.length === 0) {
    return <p className="text-center py-16 px-4 text-text-secondary text-[15px]">エピソードがありません</p>;
  }

  return (
    <div className="grid gap-2.5">
      {episodes.map((ep) => (
        <EpisodeCard key={ep.id} episode={ep} artworkUrl={artworkUrl} showTitle={showTitle} />
      ))}
    </div>
  );
}
