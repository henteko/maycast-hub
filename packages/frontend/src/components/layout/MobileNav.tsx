import { NavLink } from 'react-router-dom';
import styles from './MobileNav.module.css';

export function MobileNav() {
  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}>🏠</span>
        <span className={styles.label}>ホーム</span>
      </NavLink>
      <NavLink to="/admin" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}>⚙️</span>
        <span className={styles.label}>管理</span>
      </NavLink>
    </nav>
  );
}
