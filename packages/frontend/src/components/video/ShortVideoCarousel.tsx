import { useRef, useState, useCallback } from 'react';
import type { VideoItem } from '../../pages/ShowPage.js';

interface Props {
  videos: VideoItem[];
  onVideoSelect: (index: number) => void;
}

function VideoThumbnail({ videoUrl }: { videoUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const handleLoaded = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0.5;
    }
  }, []);

  const handleSeeked = useCallback(() => {
    setReady(true);
  }, []);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      muted
      playsInline
      preload="metadata"
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-0'}`}
      onLoadedData={handleLoaded}
      onSeeked={handleSeeked}
    />
  );
}

export function ShortVideoCarousel({ videos, onVideoSelect }: Props) {
  if (videos.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4 tracking-[-0.01em]">ショート動画</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {videos.map((video, index) => (
          <button
            key={video.videoId}
            className="w-[120px] shrink-0 bg-transparent border-none p-0 cursor-pointer group text-left"
            onClick={() => onVideoSelect(index)}
          >
            <div className="w-[120px] aspect-[9/16] rounded-[var(--theme-radius-sm)] bg-[#1a1a1a] overflow-hidden relative">
              {/* Thumbnail via paused video */}
              <VideoThumbnail videoUrl={video.videoUrl} />
              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center z-[1]">
                <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent z-[1]">
                <span className="text-white text-[11px] font-medium leading-tight line-clamp-2">
                  {video.episodeTitle}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
