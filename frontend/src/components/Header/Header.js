'use client';
import { usePathname } from 'next/navigation';
import LevelBadge from '../../features/gamification/components/LevelBadge';
import ThemePicker from '../ThemePicker/ThemePicker';
import styles from "./Header.module.css";

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/calendar': 'Calendar',
  '/goals': 'Goals',
  '/notes': 'Quick Notes',
  '/insights': 'Insights',
  '/settings': 'Settings',
};

export default function Header() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/register') return null;

  const pageTitle = PAGE_TITLES[pathname] || 'Brain.exe';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <button 
            onClick={() => window.dispatchEvent(new Event('sidebar-toggle'))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: '4px',
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="lg:hidden"
            title="Toggle Menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>menu</span>
          </button>
          <span>Brain.exe</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.pageTitle}>{pageTitle}</span>
        </div>
        <div className={styles.rightSection}>
          <ThemePicker />
          <LevelBadge />
        </div>
      </div>
    </header>
  );
}
