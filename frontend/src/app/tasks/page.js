'use client';

import { useState, useMemo } from 'react';
import useTasks, { getTodayStr } from '@/features/tasks/hooks/useTasks';

export default function TasksPage() {
  const { tasks, addTask, toggleTask, deleteTask, editTask, isCompletedOn } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('daily');
  const [newCategory, setNewCategory] = useState('Development');
  const [newPriority, setNewPriority] = useState('Med');

  const todayStr = getTodayStr();

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || t.priority?.toLowerCase() === priorityFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [tasks, searchQuery, priorityFilter, categoryFilter]);

  const dailyTasks = filteredTasks.filter(t => t.type === 'daily');
  const oneTimeTasks = filteredTasks.filter(t => t.type === 'one-time');

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      type: newType,
      category: newCategory,
      priority: newPriority.toLowerCase(),
      date: newType === 'daily' ? null : todayStr
    });

    setNewTitle('');
  };

  return (
    <div className="max-w-[1000px] mx-auto select-none pb-24">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="font-headline-lg text-[24px] text-white font-bold tracking-tight">Task Workspace</h2>
          <p className="font-body-md text-[13px] text-on-surface-variant/70">Manage all your daily habits and one-time scheduled tasks</p>
        </div>
        <span className="font-label-caps text-[10px] text-primary/70 font-semibold bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full">
          {tasks.length} Active Tasks
        </span>
      </div>

      {/* Filter and search bar card */}
      <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search box */}
          <div className="flex-1 w-full relative flex items-center bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50 mr-2">search</span>
            <input 
              type="text" 
              placeholder="Search active tasks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none text-[13px]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-3 w-full md:w-auto justify-between md:justify-start">
            <select 
              value={priorityFilter} 
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2 text-[12px] text-on-surface focus:outline-none cursor-pointer focus:border-primary/50"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="med">Med Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2 text-[12px] text-on-surface focus:outline-none cursor-pointer focus:border-primary/50"
            >
              <option value="all">All Categories</option>
              <option value="Development">Development</option>
              <option value="Study">Study</option>
              <option value="Health">Health</option>
              <option value="Personal">Personal</option>
              <option value="Growth">Growth</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quest Deployer panel */}
      <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 mb-8">
        <h3 className="font-headline-md text-[14px] text-white font-semibold mb-4 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">add_circle</span>
          Create New Task
        </h3>
        <form onSubmit={handleAddTaskSubmit} className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Create new task..." 
              className="w-full bg-[#131b2e] border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 text-[13px]"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto justify-between md:justify-start">
            <select 
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2 text-[12px] text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="daily">Daily Habits</option>
              <option value="one-time">One-Time Tasks</option>
            </select>

            <select 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2 text-[12px] text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="Development">Development</option>
              <option value="Study">Study</option>
              <option value="Health">Health</option>
              <option value="Personal">Personal</option>
              <option value="Growth">Growth</option>
            </select>

            <select 
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2 text-[12px] text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="High">High Priority</option>
              <option value="Med">Med Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <button 
              type="submit" 
              className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">add</span>
              Create Task
            </button>
          </div>
        </form>
      </div>

      {/* Grid of Quest Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Daily Quests board */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6">
          <h3 className="font-headline-md text-[16px] text-white font-semibold mb-6 flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">sync</span>
              Daily Habits
            </span>
            <span className="text-[11px] text-primary/70 font-semibold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              {dailyTasks.length} Tracked
            </span>
          </h3>

          <div className="space-y-2">
            {dailyTasks.length === 0 ? (
              <p className="text-[13px] text-on-surface-variant/40 italic text-center py-8 bg-white/[0.005] border border-dashed border-white/[0.02] rounded-xl">
                No matching habits found.
              </p>
            ) : (
              dailyTasks.map((t) => {
                const isDone = isCompletedOn(t, todayStr);
                return (
                  <div 
                    key={t.id} 
                    className={`flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02] border border-white/[0.01] hover:border-white/[0.03] transition-all group ${
                      isDone ? 'opacity-40' : ''
                    }`}
                  >
                    {isDone ? (
                      <div 
                        onClick={() => toggleTask(t.id, todayStr)}
                        className="w-4 h-4 rounded bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                      </div>
                    ) : (
                      <div 
                        onClick={() => toggleTask(t.id, todayStr)}
                        className="w-4 h-4 rounded border border-outline-variant/50 flex items-center justify-center hover:border-primary/70 transition-colors cursor-pointer active:scale-95"
                      >
                      </div>
                    )}
                    
                    <div className="flex-1 flex justify-between items-center gap-4">
                      <div className="min-w-0">
                        <p className={`font-body-md text-[14px] truncate text-on-surface/90 font-medium ${isDone ? 'line-through text-on-surface-variant' : ''}`}>
                          {t.title}
                        </p>
                        <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{t.category || 'General'}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-label-caps text-[8px] px-2 py-0.5 rounded-full border font-semibold ${
                          t.priority === 'high' 
                            ? 'text-error/80 border-error/20 bg-error/10' 
                            : t.priority === 'low'
                              ? 'text-on-surface-variant/60 border-outline-variant/20 bg-white/[0.02]'
                              : 'text-secondary/80 border-secondary/20 bg-secondary/10'
                        }`}>
                          {t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Med'}
                        </span>

                        {/* Delete action */}
                        <button 
                          onClick={() => deleteTask(t.id)}
                          className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Backlog Quests board */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6">
          <h3 className="font-headline-md text-[16px] text-white font-semibold mb-6 flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">sticky_note_2</span>
              One-Time Tasks
            </span>
            <span className="text-[11px] text-secondary/70 font-semibold bg-secondary/10 border border-secondary/20 px-2.5 py-0.5 rounded-full">
              {oneTimeTasks.length} Pending
            </span>
          </h3>

          <div className="space-y-2">
            {oneTimeTasks.length === 0 ? (
              <p className="text-[13px] text-on-surface-variant/40 italic text-center py-8 bg-white/[0.005] border border-dashed border-white/[0.02] rounded-xl">
                No matching one-time tasks scheduled.
              </p>
            ) : (
              oneTimeTasks.map((t) => {
                const isDone = isCompletedOn(t, t.date || todayStr);
                return (
                  <div 
                    key={t.id} 
                    className={`flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02] border border-white/[0.01] hover:border-white/[0.03] transition-all group ${
                      isDone ? 'opacity-40' : ''
                    }`}
                  >
                    {isDone ? (
                      <div 
                        onClick={() => toggleTask(t.id, t.date || todayStr)}
                        className="w-4 h-4 rounded bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                      </div>
                    ) : (
                      <div 
                        onClick={() => toggleTask(t.id, t.date || todayStr)}
                        className="w-4 h-4 rounded border border-outline-variant/50 flex items-center justify-center hover:border-primary/70 transition-colors cursor-pointer active:scale-95"
                      >
                      </div>
                    )}
                    
                    <div className="flex-1 flex justify-between items-center gap-4">
                      <div className="min-w-0">
                        <p className={`font-body-md text-[14px] truncate text-on-surface/90 font-medium ${isDone ? 'line-through text-on-surface-variant' : ''}`}>
                          {t.title}
                        </p>
                        <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{t.category || 'General'} • Scheduled: {t.date || todayStr}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-label-caps text-[8px] px-2 py-0.5 rounded-full border font-semibold ${
                          t.priority === 'high' 
                            ? 'text-error/80 border-error/20 bg-error/10' 
                            : t.priority === 'low'
                              ? 'text-on-surface-variant/60 border-outline-variant/20 bg-white/[0.02]'
                              : 'text-secondary/80 border-secondary/20 bg-secondary/10'
                        }`}>
                          {t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : 'Med'}
                        </span>

                        {/* Delete action */}
                        <button 
                          onClick={() => deleteTask(t.id)}
                          className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
