import type { Episode } from '@maycast/shared';
import { usePlayer } from '../player/PlayerContext.js';

interface Props {
  episode: Episode;
  artworkUrl?: string | null;
  showTitle?: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function EpisodeCard({ episode, artworkUrl, showTitle }: Props) {
  const { play, episode: currentEpisode, isPlaying, togglePlayPause } = usePlayer();
  const isCurrent = currentEpisode?.id === episode.id;

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      play(episode, { artworkUrl, showTitle });
    }
  };

  return (
    <div
      className={`flex gap-3.5 p-[18px] bg-surface border border-border rounded-[var(--theme-radius)] transition-all duration-200 hover:shadow-[var(--theme-shadow-card-hover)] cursor-pointer ${isCurrent ? 'border-primary bg-primary-subtle' : ''}`}
      onClick={handlePlay}
    >
      <button
        className="size-11 rounded-full border-none bg-primary text-bg text-[15px] flex items-center justify-center shrink-0 self-center transition-all duration-150 font-bold hover:enabled:bg-primary-hover hover:enabled:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={handlePlay}
        disabled={!episode.audioUrl}
      >
        {isCurrent && isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <h4 className="font-[var(--font-display)] text-[15px] font-semibold mb-1 tracking-[-0.01em]">{episode.title}</h4>
        <p className="text-[13px] text-text-secondary mb-1.5">
          {episode.publishedAt &&
            new Date(episode.publishedAt).toLocaleDateString('ja-JP')}
          {episode.audioDuration && ` · ${formatDuration(episode.audioDuration)}`}
        </p>
        {episode.description && (
          <p className="text-[13px] text-text-secondary leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">{episode.description}</p>
        )}
      </div>
    </div>
  );
}
