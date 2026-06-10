import { useState, useEffect } from 'react';
import styles from './AI.module.css';
import { API_BASE_URL } from '@/lib/config';

export default function TaskBreakdownModal({ taskTitle, onClose }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/breakdown`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: taskTitle })
        });
        if (res.ok) {
          const data = await res.json();
          setBreakdown(data.breakdown);
        } else {
          setBreakdown("Deep AI is offline. Try breaking this down manually for now.");
        }
      } catch (err) {
        setBreakdown("Connection error targeting the AI cluster. Please check your network.");
      } finally {
        setLoading(false);
      }
    };
    fetchBreakdown();
  }, [taskTitle]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>🧠 Tactical Breakdown</h3>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Target: {taskTitle}
          </p>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={styles.loader}></span>
              <span>Analyzing deeply...</span>
            </div>
          ) : (
            <div className={styles.breakdownList}>
              {breakdown.split('\n').filter(line => line.trim()).map((line, i) => (
                <div key={i} className={styles.breakdownItem}>
                  <div className={styles.breakdownStepBadge}>{i + 1}</div>
                  <div className={styles.breakdownText}>{line.replace(/^[-* 1-9.]+\s*/, '')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
