import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

export function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`${styles.header} ${isAdmin ? styles.admin : styles.listener}`}>
      <div className={styles.inner}>
        <Link to={isAdmin ? '/admin' : '/'} className={styles.logo}>
          {isAdmin ? (
            <>
              <span className={styles.logoText}>Maycast Hub</span>
              <span className={styles.badge}>ADMIN</span>
            </>
          ) : (
            <span className={styles.logoText}>Maycast Hub</span>
          )}
        </Link>
        <nav className={styles.nav}>
          {isAdmin ? (
            <>
              <Link to="/admin" className={styles.link}>番組管理</Link>
              <Link to="/" className={styles.linkMuted}>リスナー画面</Link>
            </>
          ) : (
            <>
              <Link to="/" className={styles.link}>ホーム</Link>
              <Link to="/admin" className={styles.linkMuted}>管理</Link>
            </>
          )}
        </nav>
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
          <span className={`${styles.hamburgerLine} ${menuOpen ? styles.open : ''}`} />
        </button>
      </div>
      {menuOpen && (
        <div className={styles.mobileMenu} onClick={() => setMenuOpen(false)}>
          {isAdmin ? (
            <>
              <Link to="/admin" className={styles.mobileLink}>番組管理</Link>
              <Link to="/" className={styles.mobileLink}>リスナー画面</Link>
            </>
          ) : (
            <>
              <Link to="/" className={styles.mobileLink}>ホーム</Link>
              <Link to="/admin" className={styles.mobileLink}>管理</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
