import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import type { Episode } from '@maycast/shared';
import { api } from '../../api/client.js';

interface PlayerMeta {
  artworkUrl?: string | null;
  showTitle?: string;
}

interface PlayerState {
  episode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  artworkUrl: string | null;
  showTitle: string;
}

interface PlayerContextType extends PlayerState {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: (episode: Episode, meta?: PlayerMeta) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  togglePlayPause: () => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  setPlaybackRate: (rate: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const RESUME_KEY_PREFIX = 'maycast_resume_';
const SPEED_KEY = 'maycast_playback_rate';

function getSavedPosition(episodeId: string): number {
  try {
    const val = localStorage.getItem(`${RESUME_KEY_PREFIX}${episodeId}`);
    return val ? parseFloat(val) : 0;
  } catch {
    return 0;
  }
}

function savePosition(episodeId: string, time: number) {
  try {
    localStorage.setItem(`${RESUME_KEY_PREFIX}${episodeId}`, String(time));
  } catch {
    // localStorage may be full or unavailable
  }
}

function getSavedSpeed(): number {
  try {
    const val = localStorage.getItem(SPEED_KEY);
    return val ? parseFloat(val) : 1;
  } catch {
    return 1;
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    episode: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: getSavedSpeed(),
    artworkUrl: null,
    showTitle: '',
  });
  const playRecordedRef = useRef<string | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const episodeIdRef = useRef<string | null>(null);

  const play = useCallback((episode: Episode, meta?: PlayerMeta) => {
    const audio = audioRef.current;
    if (!audio || !episode.audioUrl) return;

    audio.src = episode.audioUrl;
    const savedPos = getSavedPosition(episode.id);
    if (savedPos > 0) {
      audio.currentTime = savedPos;
    }
    const rate = getSavedSpeed();
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    audio.play();

    episodeIdRef.current = episode.id;

    setState((s) => ({
      ...s,
      episode,
      isPlaying: true,
      currentTime: savedPos,
      duration: 0,
      playbackRate: rate,
      artworkUrl: meta?.artworkUrl ?? null,
      showTitle: meta?.showTitle ?? '',
    }));

    // Record play event
    if (playRecordedRef.current !== episode.id) {
      playRecordedRef.current = episode.id;
      api.analytics.recordPlay(episode.id).catch(() => {});
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setState((s) => ({ ...s, currentTime: time }));
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [state.isPlaying, pause, resume]);

  const skipForward = useCallback((seconds = 15) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.min(audio.currentTime + seconds, audio.duration || Infinity);
      audio.currentTime = newTime;
      setState((s) => ({ ...s, currentTime: newTime }));
    }
  }, []);

  const skipBackward = useCallback((seconds = 15) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(audio.currentTime - seconds, 0);
      audio.currentTime = newTime;
      setState((s) => ({ ...s, currentTime: newTime }));
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
      audio.preservesPitch = true;
    }
    try {
      localStorage.setItem(SPEED_KEY, String(rate));
    } catch {}
    setState((s) => ({ ...s, playbackRate: rate }));
  }, []);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    };
    const onLoadedMetadata = () => {
      setState((s) => ({ ...s, duration: audio.duration }));
    };
    const onEnded = () => {
      setState((s) => ({ ...s, isPlaying: false }));
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Save position every 5 seconds (use ref to avoid stale closure)
  useEffect(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    if (state.episode && state.isPlaying) {
      saveIntervalRef.current = setInterval(() => {
        const id = episodeIdRef.current;
        if (id) {
          savePosition(id, audioRef.current?.currentTime ?? 0);
        }
      }, 5000);
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [state.episode, state.isPlaying]);

  // Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator) || !state.episode) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.episode.title,
      artist: state.showTitle || 'Maycast Hub',
      ...(state.artworkUrl ? { artwork: [{ src: state.artworkUrl }] } : {}),
    });

    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => skipForward(15));
    navigator.mediaSession.setActionHandler('seekbackward', () => skipBackward(15));
  }, [state.episode, state.artworkUrl, state.showTitle, pause, resume, seek, skipForward, skipBackward]);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        audioRef,
        play,
        pause,
        resume,
        seek,
        togglePlayPause,
        skipForward,
        skipBackward,
        setPlaybackRate,
      }}
    >
      <audio ref={audioRef} />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
