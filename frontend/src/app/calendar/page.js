'use client';

import { useState } from 'react';
import useTasks, { getTodayStr } from '@/features/tasks/hooks/useTasks';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function CalendarPage() {
  const { tasks, isCompletedOn, toggleTask, deleteTask, addTask } = useTasks();
  const [newCalTaskTitle, setNewCalTaskTitle] = useState('');
  const [newCalTaskType, setNewCalTaskType] = useState('one-time');
  const [newCalTaskCategory, setNewCalTaskCategory] = useState('Study');
  const [newCalTaskPriority, setNewCalTaskPriority] = useState('med');

  const handleAddCalendarTask = (e) => {
    e.preventDefault();
    if (!newCalTaskTitle.trim()) return;
    addTask({
      title: newCalTaskTitle.trim(),
      type: newCalTaskType,
      category: newCalTaskCategory,
      priority: newCalTaskPriority,
      date: newCalTaskType === 'daily' ? null : selectedDate
    });
    setNewCalTaskTitle('');
  };

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const calendarSlots = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(prevMonthDate.getDate()).padStart(2, '0')}`;
    calendarSlots.push({ dayNum, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarSlots.push({ dayNum: i, dateStr, isCurrentMonth: true });
  }

  // Next month padding days to round up to full rows (multiples of 7)
  const remaining = 42 - calendarSlots.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextMonthDate.getDate()).padStart(2, '0')}`;
    calendarSlots.push({ dayNum: i, dateStr, isCurrentMonth: false });
  }

  // Gather tasks for selected day
  const dailyTasks = tasks.filter(t => t.type === 'daily');
  const oneTimeTasks = tasks.filter(t => t.type === 'one-time' && t.date === selectedDate);
  const selectedDayTasks = [...dailyTasks, ...oneTimeTasks];

  const getTasksForDate = (dateStr) => {
    const daily = tasks.filter(t => t.type === 'daily');
    const oneTime = tasks.filter(t => t.type === 'one-time' && t.date === dateStr);
    return [...daily, ...oneTime];
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="max-w-[900px] mx-auto select-none pb-24">
      {/* Calendar Header block */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="font-headline-lg text-[24px] text-white font-bold tracking-tight">Calendar Planning</h2>
          <p className="font-body-md text-[13px] text-on-surface-variant/70">Plan and coordinate scheduled habits and one-time tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(getTodayStr());
            }}
            className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">today</span>
            Today
          </button>
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.03] p-1.5 rounded-xl">
            <button 
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] text-on-surface-variant hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="font-headline-md text-[14px] text-white font-semibold px-2 min-w-[120px] text-center">
              {MONTH_NAMES[month]} {year}
            </span>
            <button 
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.04] text-on-surface-variant hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid card */}
      <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 mb-8">
        <div className="grid grid-cols-7 gap-2 mb-4 text-center">
          {WEEKDAYS.map((day) => (
            <span key={day} className="font-label-caps text-[9px] text-on-surface-variant/40 tracking-wider font-semibold">
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarSlots.map((slot, index) => {
            const isSelected = slot.dateStr === selectedDate;
            const isCurrentToday = slot.dateStr === getTodayStr();
            const scheduledTasks = getTasksForDate(slot.dateStr);
            const highPriorityTasks = scheduledTasks.filter(t => t.priority === 'high');
            const isWeekend = index % 7 === 0 || index % 7 === 6;

            return (
              <div 
                key={index}
                onClick={() => setSelectedDate(slot.dateStr)}
                className={`min-h-[75px] p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                  slot.isCurrentMonth 
                    ? `${isWeekend ? 'bg-[#1c253d]/15' : 'bg-[#131b2e]/30'} border-white/[0.02] hover:bg-white/[0.04]` 
                    : 'bg-transparent border-transparent opacity-20'
                } ${
                  isSelected 
                    ? 'border-primary/40 bg-primary/5 font-bold shadow-lg shadow-primary/5 scale-[1.02]' 
                    : ''
                }`}
              >
                {/* Active Indicator bar */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary"></div>
                )}
                
                <span className={`text-[12px] ${
                  isSelected 
                    ? 'text-primary' 
                    : isCurrentToday 
                      ? 'text-white underline decoration-primary decoration-2 underline-offset-4' 
                      : 'text-on-surface'
                }`}>
                  {slot.dayNum}
                </span>

                {/* Scheduled indicator dots */}
                {scheduledTasks.length > 0 && (
                  <div className="flex gap-1 items-center mt-2 flex-wrap">
                    {scheduledTasks.slice(0, 3).map((t, idx) => (
                      <span 
                        key={idx}
                        className={`w-1 h-1 rounded-full ${
                          t.priority === 'high' 
                            ? 'bg-error animate-pulse' 
                            : t.type === 'daily' 
                              ? 'bg-primary' 
                              : 'bg-secondary'
                        }`}
                      ></span>
                    ))}
                    {scheduledTasks.length > 3 && (
                      <span className="text-[7px] font-mono text-on-surface-variant/50 leading-none">+{scheduledTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks detail card for selected date */}
      <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6">
        
        {/* Inline Task Scheduler form directly under selected date */}
        <form onSubmit={handleAddCalendarTask} className="flex flex-wrap md:flex-nowrap gap-3 mb-6 items-center bg-[#131b2e]/50 border border-white/5 p-3 rounded-xl shrink-0">
          <input 
            type="text" 
            value={newCalTaskTitle}
            onChange={(e) => setNewCalTaskTitle(e.target.value)}
            placeholder="Schedule a new task for this day..."
            className="flex-1 bg-[#131b2e] border border-outline-variant/20 rounded-lg px-3 py-1.5 text-[12.5px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
          />
          <select 
            value={newCalTaskType}
            onChange={(e) => setNewCalTaskType(e.target.value)}
            className="bg-[#131b2e] border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-[11.5px] text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="one-time">One-Time</option>
            <option value="daily">Daily Habit</option>
          </select>
          <select 
            value={newCalTaskCategory}
            onChange={(e) => setNewCalTaskCategory(e.target.value)}
            className="bg-[#131b2e] border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-[11.5px] text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="Study">Study</option>
            <option value="Development">Development</option>
            <option value="Health">Health</option>
            <option value="Personal">Personal</option>
            <option value="Growth">Growth</option>
          </select>
          <select 
            value={newCalTaskPriority}
            onChange={(e) => setNewCalTaskPriority(e.target.value)}
            className="bg-[#131b2e] border border-outline-variant/20 rounded-lg px-2.5 py-1.5 text-[11.5px] text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="high">High Priority</option>
            <option value="med">Med Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <button 
            type="submit" 
            className="bg-primary hover:bg-primary-container text-white px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Schedule
          </button>
        </form>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-headline-md text-[16px] text-white font-semibold">
              Tasks for Selected Date
            </h3>
            <p className="text-[11px] text-on-surface-variant/60 mt-0.5">
              {formatDateLabel(selectedDate)}
            </p>
          </div>
          <span className="font-label-caps text-[9px] text-primary/70 font-semibold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded">
            {selectedDayTasks.length} Objective{selectedDayTasks.length !== 1 ? 's' : ''} Scheduled
          </span>
        </div>

        <div className="space-y-2">
          {selectedDayTasks.length === 0 ? (
            <p className="text-[13px] text-on-surface-variant/40 italic text-center py-8 bg-white/[0.005] border border-dashed border-white/[0.02] rounded-xl">
              No tasks scheduled for this date.
            </p>
          ) : (
            selectedDayTasks.map((t) => {
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
                      className="w-4 h-4 rounded bg-primary flex items-center justify-center cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-95 animate-scaleIn"
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
                      <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{t.category || 'General'} • {t.type === 'daily' ? 'Daily Habit' : 'One-Time Task'}</p>
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

                      {/* Delete Action */}
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
  );
}
