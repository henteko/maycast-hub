import type { Episode } from '@maycast/shared';

interface Props {
  episodes: Episode[];
  onVideoSelect: (index: number) => void;
}

export function ShortVideoCarousel({ episodes, onVideoSelect }: Props) {
  if (episodes.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4 tracking-[-0.01em]">ショート動画</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {episodes.map((ep, index) => (
          <button
            key={ep.id}
            className="w-[120px] shrink-0 bg-transparent border-none p-0 cursor-pointer group text-left"
            onClick={() => onVideoSelect(index)}
          >
            <div className="w-[120px] aspect-[9/16] rounded-[var(--theme-radius-sm)] bg-[#1a1a1a] overflow-hidden relative">
              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <span className="text-white text-[11px] font-medium leading-tight line-clamp-2">
                  {ep.title}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
