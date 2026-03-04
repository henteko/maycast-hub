import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header.js';
import { AudioPlayer } from '../player/AudioPlayer.js';
import { usePlayer } from '../player/PlayerContext.js';

export function AppLayout() {
  const { episode, isPlaying, pause } = usePlayer();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const hasPlayer = !!episode && !isAdmin;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isAdmin ? 'admin' : 'listener');
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && isPlaying) pause();
  }, [isAdmin, isPlaying, pause]);

  return (
    <div className="min-h-screen relative">
      {!isAdmin && (
        <div className="fixed top-0 left-0 right-0 h-[400px] bg-[var(--theme-gradient-glow)] pointer-events-none z-0" />
      )}
      <Header />
      <main className={`relative z-1 px-5 pt-8 ${hasPlayer ? 'pb-[calc(var(--theme-player-height)+32px)]' : 'pb-8'}`}>
        <div className={`mx-auto ${isAdmin ? 'max-w-[960px]' : 'max-w-[var(--theme-max-width)]'}`}>
          <Outlet />
        </div>
      </main>
      {!isAdmin && <AudioPlayer />}
    </div>
  );
}
