import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from 'react';
import type { Episode } from '@maycast/shared';
import { api } from '../../api/client.js';

interface PlayerState {
  episode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

interface PlayerContextType extends PlayerState {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: (episode: Episode) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  togglePlayPause: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const RESUME_KEY_PREFIX = 'maycast_resume_';

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

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    episode: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  const playRecordedRef = useRef<string | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const episodeIdRef = useRef<string | null>(null);

  const play = useCallback((episode: Episode) => {
    const audio = audioRef.current;
    if (!audio || !episode.audioUrl) return;

    audio.src = episode.audioUrl;
    const savedPos = getSavedPosition(episode.id);
    if (savedPos > 0) {
      audio.currentTime = savedPos;
    }
    audio.play();

    episodeIdRef.current = episode.id;

    setState({
      episode,
      isPlaying: true,
      currentTime: savedPos,
      duration: 0,
    });

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
      artist: 'Maycast Hub',
    });

    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });
  }, [state.episode, pause, resume, seek]);

  return (
    <PlayerContext.Provider
      value={{ ...state, audioRef, play, pause, resume, seek, togglePlayPause }}
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
