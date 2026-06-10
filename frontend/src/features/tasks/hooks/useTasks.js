import { useState, useEffect } from 'react';
import useGamification from '../../gamification/hooks/useGamification';
import { API_URL } from '@/lib/api';

const STORAGE_KEY = 'ai_productivity_tasks';

// Helper to get today's date as YYYY-MM-DD
export function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Sample data seeded on first-ever load
const SAMPLE_TASKS = [
  { id: 'sample-1', title: 'Revise OSPF',        type: 'daily',    category: 'Study',   completedDates: [], date: null, createdAt: Date.now() },
  { id: 'sample-2', title: 'Solve 2 LeetCode problems', type: 'daily', category: 'Study', completedDates: [], date: null, createdAt: Date.now() },
  { id: 'sample-3', title: 'Workout',             type: 'daily',    category: 'Health',  completedDates: [], date: null, createdAt: Date.now() },
  { id: 'sample-4', title: 'Drink water (8 glasses)', type: 'daily', category: 'Health', completedDates: [], date: null, createdAt: Date.now() },
  { id: 'sample-5', title: 'Read 20 pages',       type: 'daily',    category: 'Growth',  completedDates: [], date: null, createdAt: Date.now() },
  { id: 'sample-6', title: 'Skincare routine',    type: 'daily',    category: 'Health',  completedDates: [], date: null, createdAt: Date.now() },
  { id: 'sample-7', title: 'Buy gift for Ali',    type: 'one-time', category: 'Personal', completedDates: [], date: getTodayStr(), createdAt: Date.now() },
  { id: 'sample-8', title: 'Submit assignment',   type: 'one-time', category: 'Study',    completedDates: [], date: getTodayStr(), createdAt: Date.now() },
  { id: 'sample-9', title: 'Research new tech',   type: 'one-time', category: 'Growth',   completedDates: [], date: getTodayStr(), createdAt: Date.now() },
];

function migrateLegacyTask(task) {
  return {
    id: task.id,
    title: task.title || '',
    type: task.type || 'one-time',
    category: task.category || 'General',
    completedDates: task.completedDates || (task.completed ? [getTodayStr()] : []),
    date: task.date || task.dueDate || null,
    createdAt: task.createdAt || Date.now(),
    priority: task.priority || 'p4',
    description: task.description || '',
    subtasks: task.subtasks || [],
    tags: task.tags || [],
  };
}

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { addXP, removeXP } = useGamification();

  // Load on mount
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('quantum_token');
        if (!token) throw new Error('No token');
        const res = await fetch(`${API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const dbTasks = await res.json();
          if (dbTasks.length > 0) {
            setTasks(dbTasks);
            setIsLoaded(true);
            return;
          }
        }
      } catch (e) {}

      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setTasks(parsed.map(migrateLegacyTask));
        } else {
          setTasks(SAMPLE_TASKS);
        }
      } catch {
        setTasks(SAMPLE_TASKS);
      }
      setIsLoaded(true);
    }
    loadData();
  }, []);

  // Save on change
  useEffect(() => {
    if (isLoaded) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
      const token = localStorage.getItem('quantum_token');
      if (token) {
        fetch(`${API_URL}/api/tasks`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(tasks)
        }).catch(() => {});
      }
    }
  }, [tasks, isLoaded]);

  // Add task
  const addTask = (taskData) => {
    const title = typeof taskData === 'string' ? taskData : taskData.title;
    if (!title?.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      type: taskData.type || 'one-time',
      category: taskData.category?.trim() || 'General',
      completedDates: [],
      date: taskData.type === 'daily' ? null : (taskData.date || getTodayStr()),
      createdAt: Date.now(),
      priority: taskData.priority || 'p4',
      description: taskData.description || '',
      subtasks: taskData.subtasks || [],
      tags: taskData.tags || [],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Toggle task for a specific date
  const toggleTask = (id, dateStr) => {
    const target = dateStr || getTodayStr();
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== id) return task;
        const alreadyDone = task.completedDates.includes(target);
        
        if (alreadyDone) {
          removeXP(task.type === 'daily' ? 10 : 25);
        } else {
          addXP(task.type === 'daily' ? 10 : 25);
        }

        return {
          ...task,
          completedDates: alreadyDone
            ? task.completedDates.filter(d => d !== target)
            : [...task.completedDates, target],
        };
      })
    );
  };

  // Delete task
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Helpers
  const isCompletedOn = (task, dateStr) => {
    const target = dateStr || getTodayStr();
    return task.completedDates.includes(target);
  };

  const getDailyTasks = () => tasks.filter(t => t.type === 'daily');

  const getOneTimeTasks = (dateStr) => {
    const target = dateStr || getTodayStr();
    return tasks.filter(t => t.type === 'one-time' && t.date === target);
  };

  const getTasksForDate = (dateStr) => {
    const daily = getDailyTasks();
    const oneTime = getOneTimeTasks(dateStr);
    return [...daily, ...oneTime];
  };

  // Edit task
  const editTask = (id, updates) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (typeof updates === 'string') return { ...t, title: updates };
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  // Group daily tasks by category
  const getDailyByCategory = () => {
    const daily = getDailyTasks();
    const grouped = {};
    daily.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });
    return grouped;
  };

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    isLoaded,
    isCompletedOn,
    getDailyTasks,
    getOneTimeTasks,
    getTasksForDate,
    getDailyByCategory,
  };
}
