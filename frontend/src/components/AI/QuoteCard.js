import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import styles from './AI.module.css';
import { API_URL } from '@/lib/api';

export default function QuoteCard() {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('daily_quote');
    const cachedDate = localStorage.getItem('quote_date'); 
    const today = new Date().toDateString();

    // Check if this specific quote was favorited previously
    const checkFavorite = (qText) => {
      try {
        const favs = JSON.parse(localStorage.getItem('favorite_quotes') || '[]');
        setIsFavorited(favs.includes(qText));
      } catch (e) {}
    };

    if (cached && cachedDate === today) {
      setQuote(cached);
      checkFavorite(cached);
      return;
    }

    const fetchQuote = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/ai/quote`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          let cleanQuote = data.quote.replace(/\s+/g, ' ').trim();
          cleanQuote = cleanQuote.replace(/[-~—](.*)$/, '').trim(); 
          cleanQuote = cleanQuote.replace(/^["']|["']$/g, '').trim(); 
          setQuote(cleanQuote);
          localStorage.setItem('daily_quote', cleanQuote);
          localStorage.setItem('quote_date', today);
          setIsFavorited(false);
        }
      } catch (err) {
        console.error('Quote API failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  const toggleFavorite = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('favorite_quotes') || '[]');
      let newFavs;
      if (isFavorited) {
        newFavs = favs.filter(q => q !== quote);
      } else {
        newFavs = [quote, ...favs];
      }
      localStorage.setItem('favorite_quotes', JSON.stringify(newFavs));
      setIsFavorited(!isFavorited);
    } catch (e) {
      console.error(e);
    }
  };

  if (!quote && !loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.quoteCard}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {loading ? (
        <span className={styles.loader}></span>
      ) : (
        <>
          <p className={styles.quoteText}>"{quote}"</p>
          <button 
            onClick={toggleFavorite}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isFavorited ? '#ef4444' : 'var(--color-text-muted)',
              transition: 'color 0.2s ease, transform 0.2s ease',
              transform: isFavorited ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <Heart size={18} fill={isFavorited ? '#ef4444' : 'none'} />
          </button>
        </>
      )}
    </motion.div>
  );
}
