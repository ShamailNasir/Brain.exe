'use client';

import useGamification from '../hooks/useGamification';
import styles from './LevelBadge.module.css';

export default function LevelBadge() {
  const { level, currentLevelProgressXP, progressPercentage, isLoaded } = useGamification();

  if (!isLoaded) return null;

  return (
    <div className={styles.badgeContainer}>
      <div className={styles.levelIcon}>
        {level}
      </div>
      <div className={styles.stats}>
        <div className={styles.labelRow}>
          <span>Level {level}</span>
          <span className={styles.xpText}>{currentLevelProgressXP} / 100 XP</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
