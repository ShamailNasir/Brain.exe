'use client';

import { useState, useRef, useEffect } from 'react';
import useTasks, { getTodayStr } from '@/features/tasks/hooks/useTasks';
import useBossTask from '@/features/boss-task/hooks/useBossTask';
import useGamification from '@/features/gamification/hooks/useGamification';

export default function DashboardPage() {
  const { tasks, addTask, toggleTask, deleteTask, editTask, isCompletedOn } = useTasks();
  const gamification = useGamification();
  const bossTaskHook = useBossTask(tasks, gamification);

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const todayStr = getTodayStr();
  const isToday = selectedDate === todayStr;

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('daily'); // 'daily' or 'one-time'
  const [newCategory, setNewCategory] = useState('Development');
  const [newPriority, setNewPriority] = useState('Med'); // 'High', 'Med', 'Low'

  // Ref and State for dragging wheel
  const wheelRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Generate 7 days centered around selectedDate
  const [days, setDays] = useState([]);

  useEffect(() => {
    const centerDate = new Date(todayStr + 'T00:00:00');
    const tempDays = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = -3; i <= 3; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      tempDays.push({
        name: dayNames[d.getDay()],
        num: d.getDate(),
        dateStr: dateString,
        isCurrent: dateString === selectedDate
      });
    }
    setDays(tempDays);
  }, [selectedDate, todayStr]);

  // Handle Date Wheel Dragging
  const handleMouseDown = (e) => {
    isDownRef.current = true;
    startXRef.current = e.pageX - wheelRef.current.offsetLeft;
    scrollLeftRef.current = wheelRef.current.scrollLeft;
    wheelRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
    if (wheelRef.current) wheelRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
    if (wheelRef.current) wheelRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDownRef.current) return;
    e.preventDefault();
    const x = e.pageX - wheelRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    wheelRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  // Filter tasks based on selected day
  const dailyTasks = tasks.filter(t => t.type === 'daily');
  const oneTimeTasks = tasks.filter(t => t.type === 'one-time' && t.date === selectedDate);

  const completedDailyCount = dailyTasks.filter(t => isCompletedOn(t, selectedDate)).length;
  const totalDailyCount = dailyTasks.length;

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      type: newType,
      category: newCategory,
      priority: newPriority.toLowerCase(),
      date: newType === 'daily' ? null : selectedDate
    });

    setNewTitle('');
  };

  const { bossTask, isLoading: bossLoading, completeBossTask } = bossTaskHook;

  return (
    <div className="grid grid-cols-12 gap-8 max-w-[1200px] mx-auto select-none pb-24">
      
      {/* Date Wheel (Horizontal Scroll) */}
      <div className="col-span-12 zen-panel py-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl px-6 relative mb-4">
        <div className="date-wheel-container w-full overflow-hidden">
          <div 
            ref={wheelRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ cursor: 'grab' }}
            className="flex items-center justify-between text-on-surface-variant transition-transform duration-500 px-8 gap-6 overflow-x-auto select-none no-scrollbar"
          >
            {days.map((d, index) => {
              const isActive = d.dateStr === selectedDate;
              return (
                <div 
                  key={index} 
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`flex-none text-center cursor-pointer transition-all duration-300 py-2.5 px-6 rounded-xl ${
                    isActive 
                      ? 'text-white scale-135 z-20 font-extrabold relative bg-primary/15 border-2 border-primary/60 shadow-[0_0_40px_rgba(139,92,246,0.4)]' 
                      : 'opacity-30 scale-90 blur-[0.4px] hover:blur-none hover:opacity-75 hover:scale-100 hover:bg-white/[0.02]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary"></div>
                  )}
                  <p className={`font-label-caps text-[9px] mb-1 tracking-wider ${isActive ? 'text-primary font-bold' : ''}`}>{d.name}</p>
                  <p className={`font-headline-md text-[20px] ${isActive ? 'text-white font-extrabold' : ''}`}>{d.num}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quest Banner (Shortened) */}
      <div className="col-span-12 zen-panel rounded-xl overflow-hidden group border border-white/[0.03] bg-primary/5 flex items-center justify-between p-6 relative">
        <div className="flex items-center gap-6 z-10 relative w-full">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[24px]">vpn_key</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-label-caps text-[9px] text-primary tracking-widest font-semibold bg-primary/10 px-2 py-0.5 rounded">PRIME DIRECTIVE</span>
              <h3 className="font-headline-md text-[18px] text-white font-semibold">
                {bossTask?.title || "Decrypt the Core Legacy Modules"}
              </h3>
            </div>
            <p className="font-body-md text-on-surface-variant/70 text-[13px]">
              {bossTask?.description || "Locate the encryption key and restore data integrity."}
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="font-stat-value text-[18px] text-primary font-bold">
                {bossTask?.xpReward || 100} <span className="font-label-caps text-[9px] text-on-surface-variant font-semibold">XP</span>
              </div>
            </div>
            {bossTask?.completed ? (
              <button 
                disabled
                className="bg-success/20 text-success font-body-md font-semibold text-[13px] px-6 py-2 rounded-full border border-success/30 flex items-center gap-1.5 select-none"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                Completed
              </button>
            ) : (
              <button 
                onClick={completeBossTask}
                className="bg-primary/20 text-primary font-body-md font-semibold text-[13px] px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-colors duration-300 border border-primary/25 cursor-pointer shadow-md"
              >
                Accept Quest
              </button>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Task Creation Form Panel */}
      <div className="col-span-12 bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 mb-2">
        <form onSubmit={handleAddTaskSubmit} className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Create new task..." 
              className="w-full bg-[#131b2e] border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 text-[13px] transition-colors"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto justify-between md:justify-start">
            <select 
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2 text-[12px] text-on-surface focus:outline-none cursor-pointer focus:border-primary/50"
            >
              <option value="daily">Daily Habits</option>
              <option value="one-time">One-Time Tasks</option>
            </select>

            <select 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2 text-[12px] text-on-surface focus:outline-none cursor-pointer focus:border-primary/50"
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
              className="bg-[#131b2e] border border-outline-variant/30 rounded-xl px-3 py-2 text-[12px] text-on-surface focus:outline-none cursor-pointer focus:border-primary/50"
            >
              <option value="High">High Priority</option>
              <option value="Med">Med Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <button 
              type="submit" 
              className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">add</span>
              Create Task
            </button>
          </div>
        </form>
      </div>

      {/* Daily Habits Panel (7 Columns) */}
      <div className="col-span-12 lg:col-span-7 pt-4">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="font-headline-md text-[18px] text-on-surface/90 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">sync</span>
            Daily Focus Habits
          </h2>
          <span className="font-label-caps text-[10px] text-primary/70 font-semibold bg-primary/5 border border-primary/10 px-2 py-0.5 rounded">
            {completedDailyCount}/{totalDailyCount} Complete
          </span>
        </div>
        
        <div className="space-y-2">
          {dailyTasks.length === 0 ? (
            <p className="text-[13px] text-on-surface-variant/40 italic text-center py-6 bg-white/[0.01] border border-dashed border-white/[0.03] rounded-xl">
              No daily habits registered. Create one above.
            </p>
          ) : (
            dailyTasks.map((t) => {
              const isDone = isCompletedOn(t, selectedDate);
              return (
                <div 
                  key={t.id} 
                  className={`flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02] border border-white/[0.01] hover:border-white/[0.03] transition-all group ${
                    isDone ? 'opacity-40' : ''
                  }`}
                >
                  {isDone ? (
                    <div 
                      onClick={() => toggleTask(t.id, selectedDate)}
                      className="w-4 h-4 rounded bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                    </div>
                  ) : (
                    <div 
                      onClick={() => toggleTask(t.id, selectedDate)}
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

                      {/* Delete actions */}
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

      {/* Scheduled Tasks Panel (5 Columns) */}
      <div className="col-span-12 lg:col-span-5 pt-4">
        <h2 className="font-headline-md text-[18px] text-on-surface/90 mb-6 px-2 font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">calendar_month</span>
          Scheduled Tasks
        </h2>
        
        <div className="flex flex-col gap-2">
          {oneTimeTasks.length === 0 ? (
            <p className="text-[13px] text-on-surface-variant/40 italic text-center py-6 bg-white/[0.01] border border-dashed border-white/[0.03] rounded-xl">
              No upcoming tasks for this date.
            </p>
          ) : (
            oneTimeTasks.map((t) => {
              const isDone = isCompletedOn(t, selectedDate);
              return (
                <div 
                  key={t.id}
                  className={`p-3 rounded-lg hover:bg-white/[0.02] border border-white/[0.01] hover:border-white/[0.03] transition-all group flex items-center gap-4 ${
                    isDone ? 'opacity-40' : ''
                  }`}
                >
                  <span 
                    onClick={() => toggleTask(t.id, selectedDate)}
                    className={`material-symbols-outlined transition-colors text-[20px] shrink-0 cursor-pointer ${
                      isDone 
                        ? 'text-primary' 
                        : 'text-on-surface-variant/50 group-hover:text-primary'
                    }`}
                  >
                    {isDone ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5 gap-2">
                      <p className={`font-body-md text-[13px] truncate text-on-surface/90 font-medium ${isDone ? 'line-through text-on-surface-variant' : ''}`}>
                        {t.title}
                      </p>
                      <span className="font-label-caps text-[8px] text-on-surface-variant/50 shrink-0 font-semibold bg-white/[0.02] border border-white/5 px-1.5 py-0.5 rounded">
                        {t.category || 'General'}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant/60">{t.description || 'Command backlog task'}</p>
                  </div>

                  <button 
                    onClick={() => deleteTask(t.id)}
                    className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all p-1 cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      
    </div>
  );
}
