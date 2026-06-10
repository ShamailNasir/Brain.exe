'use client';

import { useState } from 'react';
import styles from './TaskInput.module.css';
import aiStyles from '@/components/AI/AI.module.css';
import { HoverGlowButton } from '@/components/ui/HoverGlowButton';
import { API_URL } from '@/lib/api';

export default function TaskInput({ onAdd, tasks }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('daily');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Trigger smart contextual suggestion dynamically if input is empty but tasks exist
  const fetchSuggestion = async () => {
    if (tasks && tasks.length > 0 && !title) {
      setLoadingSuggestion(true);
      try {
        const res = await fetch(`${API_URL}/ai/smart-suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tasks, stats: {} })
        });
        if (res.ok) {
          const data = await res.json();
          // Remove bullet points and quotes to make it a clean actionable input
          const cleanText = data.suggestions.replace(/^[-* 1.]\s*/, '').replace(/["']/g, '');
          setSuggestion(cleanText);
        }
      } catch (err) {
        console.error("Smart suggestion failed");
      } finally {
        setLoadingSuggestion(false);
      }
    }
  };

  const handleFocus = () => {
    if (!suggestion) fetchSuggestion();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, type, category, date: date || undefined });
    setTitle('');
    setCategory('');
    setDate('');
    setSuggestion(null);
  };

  const acceptSuggestion = () => {
    setTitle(suggestion);
    setSuggestion(null);
  };

  return (
    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
      <form className={styles.form} style={{ marginBottom: suggestion ? 'var(--spacing-sm)' : '0' }} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <input
            type="text"
            className={styles.input}
            placeholder="What needs to be done?"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (suggestion) setSuggestion(null);
            }}
            onFocus={handleFocus}
            required
          />
          <HoverGlowButton type="submit" className={styles.button} disabled={!title.trim()}>
            + Add
          </HoverGlowButton>
        </div>

        <div className={styles.options}>
          <div className={styles.toggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${type === 'daily' ? styles.toggleActive : ''}`}
              onClick={() => setType('daily')}
            >
              🔁 Daily
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${type === 'one-time' ? styles.toggleActive : ''}`}
              onClick={() => setType('one-time')}
            >
              📌 One-time
            </button>
          </div>

          <input
            type="text"
            className={styles.optionInput}
            placeholder="Category (e.g. Study)"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />

          {type === 'one-time' && (
            <input
              type="date"
              className={styles.optionInput}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          )}
        </div>
      </form>
      
      {suggestion && !title && (
        <div className={aiStyles.smartSuggestionBlock} onClick={acceptSuggestion}>
          <span>💡 AI Suggestion: <strong>{suggestion}</strong></span>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>(Click to apply)</span>
        </div>
      )}
      {loadingSuggestion && !title && !suggestion && (
        <div className={aiStyles.smartSuggestionBlock} style={{ opacity: 0.5, cursor: 'default' }}>
          <span className={aiStyles.loader} style={{ width: '12px', height: '12px', borderWidth: '1px' }}></span>
          <span> AI is thinking of what you should do next...</span>
        </div>
      )}
    </div>
  );
}
