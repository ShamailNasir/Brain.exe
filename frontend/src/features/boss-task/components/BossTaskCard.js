import React from 'react';
import styles from './BossTaskCard.module.css';
import { HoverGlowButton } from '@/components/ui/HoverGlowButton';

export default function BossTaskCard({ bossTask, isLoading, onComplete }) {
  if (isLoading || !bossTask) {
    return (
      <div className={`${styles.card} ${styles.skeleton}`}>
        <div className={styles.pulse}>Generating your Boss Task...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.cardWrapper} ${bossTask.completed ? styles.completedWrapper : ''}`}>
      <div className={styles.glowEffect}></div>
      <div className={`${styles.card} ${bossTask.completed ? styles.completed : ''}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span className={styles.icon}>🔥</span> Daily Boss Task
          </h3>
          <div className={styles.xpBadge}>+{bossTask.xpReward} XP</div>
        </div>
        
        <div className={styles.content}>
          <h4 className={styles.taskTitle}>{bossTask.title}</h4>
          <p className={styles.taskDesc}>{bossTask.description}</p>
        </div>

        <HoverGlowButton 
          className={`${styles.button} ${bossTask.completed ? styles.buttonCompleted : ''}`}
          onClick={onComplete}
          disabled={bossTask.completed}
          glowColor={bossTask.completed ? "#10b981" : "#ec4899"}
          backgroundColor="var(--color-surface-hover)"
        >
          {bossTask.completed ? 'Victory Claimed!' : 'Complete Boss Task'}
        </HoverGlowButton>
      </div>
    </div>
  );
}
