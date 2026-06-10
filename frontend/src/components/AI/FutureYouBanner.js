import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './AI.module.css';
import { API_URL } from '@/lib/api';

export default function FutureYouBanner({ tasks }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only fetch on mount or major task load changes
    if (tasks.length === 0) return;
    
    // Check if we already have a fresh message today to avoid spamming Deep Model
    const cached = localStorage.getItem('future_you_msg');
    const cachedDate = localStorage.getItem('future_you_date');
    const today = new Date().toDateString();

    if (cached && cachedDate === today) {
      setMessage(cached);
      return;
    }

    const fetchMessage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/ai/future-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks })
        });
        if (res.ok) {
          const data = await res.json();
          setMessage(data.message);
          localStorage.setItem('future_you_msg', data.message);
          localStorage.setItem('future_you_date', today);
        }
      } catch (err) {
        console.error('FutureYou API failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []); // Intentionally only run broadly

  if (!message && !loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={styles.futureBanner}
    >
      <span className={styles.futureIcon}>🔮</span>
      <div className={styles.futureContent}>
        <p className={styles.futureLabel}>Future You says:</p>
        {loading ? (
          <p className={styles.futureTextLoading}>Connecting to your future self...</p>
        ) : (
          <p className={styles.futureText}>{message}</p>
        )}
      </div>
    </motion.div>
  );
}
