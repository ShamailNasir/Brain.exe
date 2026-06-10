import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function useBossTask(tasks = [], stats = {}) {
  const [bossTask, setBossTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Run on mount to check if we need a new boss task
    const initializeBossTask = async () => {
      try {
        const todayStr = getTodayStr();
        const storedStr = localStorage.getItem('quantum_boss_task');
        
        let storedTask = null;
        if (storedStr) {
          storedTask = JSON.parse(storedStr);
        }

        // If no task exists, or the task is from a previous day, generate a new one
        if (!storedTask || storedTask.date !== todayStr) {
          await generateNewBossTask(todayStr);
        } else {
          setBossTask(storedTask);
        }
      } catch (err) {
        console.error("Error initializing boss task:", err);
      }
    };

    initializeBossTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to avoid infinite loops when tasks change

  const generateNewBossTask = async (todayStr) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/ai/boss-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, stats })
      });

      if (!response.ok) throw new Error("Failed to fetch boss task");
      
      const data = await response.json();
      
      const newBossTask = {
        id: `boss-${todayStr}-${Date.now()}`,
        title: data.title,
        description: data.description,
        xpReward: data.xpReward || 100,
        date: todayStr,
        completed: false
      };

      setBossTask(newBossTask);
      localStorage.setItem('quantum_boss_task', JSON.stringify(newBossTask));
    } catch (err) {
      console.error(err);
      setError(err.message);
      // Fallback
      const fallbackTask = {
        id: `boss-${todayStr}-fallback`,
        title: "The Silent Challenge",
        description: "Complete your 3 highest priority tasks today.",
        xpReward: 100,
        date: todayStr,
        completed: false
      };
      setBossTask(fallbackTask);
      localStorage.setItem('quantum_boss_task', JSON.stringify(fallbackTask));
    } finally {
      setIsLoading(false);
    }
  };

  const completeBossTask = () => {
    if (!bossTask || bossTask.completed) return;
    const updated = { ...bossTask, completed: true };
    setBossTask(updated);
    localStorage.setItem('quantum_boss_task', JSON.stringify(updated));
  };

  return {
    bossTask,
    isLoading,
    error,
    completeBossTask
  };
}
