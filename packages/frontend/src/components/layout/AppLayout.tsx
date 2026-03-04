import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { MobileNav } from './MobileNav.js';
import { AudioPlayer } from '../player/AudioPlayer.js';
import { usePlayer } from '../player/PlayerContext.js';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { episode } = usePlayer();
  const hasPlayer = !!episode;

  return (
    <div className={styles.layout}>
      <Header />
      <main className={`${styles.main} ${hasPlayer ? styles.withPlayer : ''}`}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <MobileNav />
      <AudioPlayer />
    </div>
  );
}
