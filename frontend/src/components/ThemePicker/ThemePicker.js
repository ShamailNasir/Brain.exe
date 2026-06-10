'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { Palette } from 'lucide-react';
import { THEMES } from '../../app/providers';
import styles from './ThemePicker.module.css';

export default function ThemePicker() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const ref = useRef(null);

  useEffect(() => setMounted(true), []);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-label="Change theme"
        title="Change theme"
      >
        <Palette size={18} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.dropdownTitle}>Theme</p>
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`${styles.option} ${theme === t.id ? styles.optionActive : ''}`}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
            >
              <span className={styles.optionIcon}>{t.icon}</span>
              <div className={styles.optionText}>
                <span className={styles.optionName}>{t.name}</span>
                <span className={styles.optionDesc}>{t.description}</span>
              </div>
              {theme === t.id && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
