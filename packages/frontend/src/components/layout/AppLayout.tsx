import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header.js';
import { AudioPlayer } from '../player/AudioPlayer.js';
import { usePlayer } from '../player/PlayerContext.js';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { episode } = usePlayer();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const hasPlayer = !!episode && !isAdmin;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isAdmin ? 'admin' : 'listener');
  }, [isAdmin]);

  return (
    <div className={`${styles.layout} ${isAdmin ? styles.admin : styles.listener}`}>
      {!isAdmin && <div className={styles.glow} />}
      <Header />
      <main className={`${styles.main} ${hasPlayer ? styles.withPlayer : ''}`}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      {!isAdmin && <AudioPlayer />}
    </div>
  );
}
