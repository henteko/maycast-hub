import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          Maycast Hub
        </Link>
        <nav className={styles.nav}>
          <Link to="/" className={styles.link}>ホーム</Link>
          <Link to="/admin" className={styles.link}>管理</Link>
        </nav>
      </div>
    </header>
  );
}
