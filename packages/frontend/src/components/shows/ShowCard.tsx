import { Link } from 'react-router-dom';
import type { Show } from '@maycast/shared';
import { mediaUrl } from '../../utils/media.js';

interface Props {
  show: Show;
}

export function ShowCard({ show }: Props) {
  return (
    <Link to={`/shows/${show.id}`} className="flex gap-4 p-[18px] bg-surface border border-border rounded-[var(--theme-radius)] no-underline text-inherit transition-all duration-200 hover:shadow-[var(--theme-shadow-card-hover)] hover:border-primary hover:-translate-y-px hover:no-underline">
      <div className="size-[88px] rounded-[var(--theme-radius-sm)] overflow-hidden shrink-0 bg-bg">
        {show.artworkKey ? (
          <img src={mediaUrl(show.artworkKey)} alt={show.title} className="size-full object-cover" />
        ) : (
          <div className="size-full flex items-center justify-center text-[32px] bg-gradient-to-br from-surface to-border" />
        )}
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <h3 className="font-[var(--font-display)] text-[17px] font-semibold mb-1.5 tracking-[-0.01em]">{show.title}</h3>
        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{show.description}</p>
      </div>
    </Link>
  );
}
