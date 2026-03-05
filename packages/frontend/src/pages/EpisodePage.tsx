import { useCallback, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { LinkedText } from '../components/LinkedText.js';
import { usePlayer } from '../components/player/PlayerContext.js';
import { ShortVideoCarousel } from '../components/video/ShortVideoCarousel.js';
import { ShortVideoPlayer } from '../components/video/ShortVideoPlayer.js';
import { mediaUrl } from '../utils/media.js';
import type { VideoItem } from './ShowPage.js';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function EpisodePage() {
  const { showId, episodeId } = useParams<{ showId: string; episodeId: string }>();
  const { play, episode: currentEpisode, isPlaying, togglePlayPause, pause, resume } = usePlayer();
  const [videoPlayerIndex, setVideoPlayerIndex] = useState<number | null>(null);
  const wasPlayingRef = { current: false };

  const { data: show, isLoading: showLoading } = useQuery({
    queryKey: ['shows', showId],
    queryFn: () => api.shows.get(showId!),
    enabled: !!showId,
  });

  const { data: episode, isLoading: episodeLoading } = useQuery({
    queryKey: ['episodes', episodeId],
    queryFn: () => api.episodes.get(episodeId!),
    enabled: !!episodeId,
  });

  const isCurrent = currentEpisode?.id === episodeId;

  const handlePlay = useCallback(() => {
    if (!episode) return;
    if (isCurrent) {
      togglePlayPause();
    } else {
      play(episode, { artworkKey: show?.artworkKey, showTitle: show?.title });
    }
  }, [episode, isCurrent, togglePlayPause, play, show?.artworkKey, show?.title]);

  const handleVideoSelect = useCallback((index: number) => {
    wasPlayingRef.current = isPlaying;
    if (isPlaying) pause();
    setVideoPlayerIndex(index);
  }, [isPlaying, pause]);

  const handleVideoClose = useCallback(() => {
    setVideoPlayerIndex(null);
    if (wasPlayingRef.current) {
      resume();
      wasPlayingRef.current = false;
    }
  }, [resume]);

  const handlePlayFromVideo = useCallback(() => {
    if (!episode) return;
    wasPlayingRef.current = false;
    setVideoPlayerIndex(null);
    play(episode, { artworkKey: show?.artworkKey, showTitle: show?.title });
  }, [episode, play, show?.artworkKey, show?.title]);

  if (showLoading || episodeLoading) return <p className="py-12 px-4 text-center text-text-secondary">読み込み中...</p>;
  if (!show || !episode) return <p className="py-12 px-4 text-center text-text-secondary">エピソードが見つかりません</p>;

  const videoItems: VideoItem[] = episode.videos.map((video) => ({
    videoId: video.id,
    videoKey: mediaUrl(video.videoKey),
    episodeId: episode.id,
    episodeTitle: episode.title,
    episode,
  }));

  return (
    <div>
      <Link
        to={`/shows/${showId}`}
        className="inline-flex items-center gap-1.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        {show.title}
      </Link>

      <div className="flex gap-8 mb-8 items-start max-md:flex-col max-md:items-center">
        {show.artworkKey && (
          <img
            src={mediaUrl(show.artworkKey)}
            alt={show.title}
            className="w-[200px] h-[200px] rounded-[var(--theme-radius)] object-cover shrink-0 shadow-[var(--theme-shadow-card)] max-md:w-[160px] max-md:h-[160px]"
          />
        )}
        <div className="min-w-0 flex-1 max-md:text-center">
          <h1 className="text-[24px] font-bold tracking-[-0.02em] max-md:text-[20px]">{episode.title}</h1>
          <p className="text-[14px] text-text-secondary mt-2 flex items-center gap-1.5 max-md:justify-center">
            {episode.publishedAt && (
              <span>{new Date(episode.publishedAt).toLocaleDateString('ja-JP')}</span>
            )}
            {episode.audioDuration && (
              <span>{episode.publishedAt ? ' · ' : ''}{formatDuration(episode.audioDuration)}</span>
            )}
          </p>
          <button
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-bg text-[14px] font-semibold transition-all duration-150 hover:enabled:bg-primary-hover hover:enabled:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handlePlay}
            disabled={!episode.audioKey}
          >
            {isCurrent && isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
            {isCurrent && isPlaying ? '一時停止' : '再生する'}
          </button>
        </div>
      </div>

      {episode.description && (
        <div className="mb-8">
          <h2 className="text-[15px] font-semibold mb-3 tracking-[-0.01em]">説明</h2>
          <LinkedText>{episode.description}</LinkedText>
        </div>
      )}

      {videoItems.length > 0 && (
        <ShortVideoCarousel
          videos={videoItems}
          onVideoSelect={handleVideoSelect}
        />
      )}

      {videoPlayerIndex !== null && (
        <ShortVideoPlayer
          videos={videoItems}
          currentIndex={videoPlayerIndex}
          showTitle={show.title}
          artworkKey={show.artworkKey}
          onClose={handleVideoClose}
          onIndexChange={setVideoPlayerIndex}
          onPlayEpisode={handlePlayFromVideo}
        />
      )}
    </div>
  );
}
