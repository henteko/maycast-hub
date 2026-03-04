import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isAdmin
          ? 'bg-[var(--theme-gradient-header)] border-b-2 border-primary shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
          : 'bg-surface border-b border-border shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="max-w-[calc(var(--theme-max-width)+40px)] w-full h-[var(--theme-header-height)] mx-auto px-5 flex items-center justify-between">
        <Link
          to={isAdmin ? '/admin' : '/'}
          className="flex items-center gap-2 no-underline text-text hover:no-underline"
        >
          {isAdmin ? (
            <>
              <span className="font-display font-bold text-xl tracking-tight">
                Maycast Hub
              </span>
              <span className="inline-block px-2 py-0.5 bg-primary text-[#0F172A] text-[10px] font-bold font-body tracking-widest rounded uppercase leading-snug">
                ADMIN
              </span>
            </>
          ) : (
            <span className="font-display font-bold text-[22px] tracking-tight">
              Maycast Hub
            </span>
          )}
        </Link>

        <nav className="hidden sm:flex gap-1 items-center">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className="text-sm font-medium text-text no-underline px-3 py-1.5 rounded-[var(--theme-radius-sm)] transition-[background,color] duration-150 hover:bg-primary-subtle hover:text-primary hover:no-underline"
              >
                番組管理
              </Link>
              <Link
                to="/"
                className="text-[13px] text-text-secondary no-underline px-3 py-1.5 rounded-[var(--theme-radius-sm)] transition-[background,color] duration-150 hover:bg-primary-subtle hover:text-primary hover:no-underline"
              >
                リスナー画面
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="text-sm font-medium text-text no-underline px-3 py-1.5 rounded-[var(--theme-radius-sm)] transition-[background,color] duration-150 hover:bg-primary-subtle hover:text-primary hover:no-underline"
              >
                ホーム
              </Link>
              <Link
                to="/admin"
                className="text-[13px] text-text-secondary no-underline px-3 py-1.5 rounded-[var(--theme-radius-sm)] transition-[background,color] duration-150 hover:bg-primary-subtle hover:text-primary hover:no-underline"
              >
                管理
              </Link>
            </>
          )}
        </nav>

        <button
          className="flex sm:hidden flex-col justify-center gap-[5px] w-9 h-9 p-1.5 bg-transparent border-none cursor-pointer rounded-[var(--theme-radius-sm)] transition-[background] duration-150 hover:bg-primary-subtle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <span
            className="block w-full h-0.5 bg-text rounded-sm transition-[transform,opacity] duration-200"
            style={menuOpen ? { transform: 'translateY(7px) rotate(45deg)' } : undefined}
          />
          <span
            className="block w-full h-0.5 bg-text rounded-sm transition-[transform,opacity] duration-200"
            style={menuOpen ? { opacity: 0 } : undefined}
          />
          <span
            className="block w-full h-0.5 bg-text rounded-sm transition-[transform,opacity] duration-200"
            style={menuOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : undefined}
          />
        </button>
      </div>

      {menuOpen && (
        <div
          className="flex sm:hidden flex-col px-5 pb-4 pt-2 border-t border-border bg-surface"
          onClick={() => setMenuOpen(false)}
        >
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className="block px-3 py-2.5 text-[15px] font-medium text-text no-underline rounded-[var(--theme-radius-sm)] transition-[background,color] duration-150 hover:bg-primary-subtle hover:text-primary hover:no-underline"
              >
                番組管理
              </Link>
              <Link
                to="/"
                className="block px-3 py-2.5 text-[15px] font-medium text-text no-underline rounded-[var(--theme-radius-sm)] transition-[background,color] duration-150 hover:bg-primary-subtle hover:text-primary hover:no-underline"
              >
                リスナー画面
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="block px-3 py-2.5 text-[15px] font-medium text-text no-underline rounded-[var(--theme-radius-sm)] transition-[background,color] duration-150 hover:bg-primary-subtle hover:text-primary hover:no-underline"
              >
                ホーム
              </Link>
              <Link
                to="/admin"
                className="block px-3 py-2.5 text-[15px] font-medium text-text no-underline rounded-[var(--theme-radius-sm)] transition-[background,color] duration-150 hover:bg-primary-subtle hover:text-primary hover:no-underline"
              >
                管理
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
