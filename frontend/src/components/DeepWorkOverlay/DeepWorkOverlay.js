'use client';

import { useState, useEffect, useRef } from 'react';
import useTasks, { getTodayStr } from '@/features/tasks/hooks/useTasks';

export default function DeepWorkOverlay() {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 min default
  const [isRunning, setIsRunning] = useState(false);
  
  // Ambient Sound Simulator State
  const [ambientMode, setAmbientMode] = useState('Off'); // 'Off', 'Lofi', 'Rain', 'White Noise'
  
  const timerRef = useRef(null);
  const { tasks, isCompletedOn, toggleTask } = useTasks();

  useEffect(() => {
    const handleToggle = () => {
      setIsActive(prev => {
        const next = !prev;
        if (next) {
          setTimeLeft(1500);
          setIsRunning(true);
        } else {
          setIsRunning(false);
          setAmbientMode('Off');
        }
        return next;
      });
    };

    window.addEventListener('deep-work-toggle', handleToggle);
    return () => {
      window.removeEventListener('deep-work-toggle', handleToggle);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            alert("Deep Focus block complete! Integrity and excellence achieved, Commander.");
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  if (!isActive) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr();
  const dailyTasks = tasks.filter(t => t.type === 'daily');

  const handleExitClick = () => {
    if (confirm("Are you sure you want to terminate Deep Work? Active focus session statistics will reset.")) {
      setIsActive(false);
      setIsRunning(false);
      setAmbientMode('Off');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0b1326]/98 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-8 select-none animate-fadeIn">
      
      {/* Dynamic gradient glowing indicators */}
      <div className="aura-sphere bg-primary top-[10%] left-[25%] opacity-15 blur-[120px] pointer-events-none"></div>
      <div className="aura-sphere bg-secondary bottom-[10%] right-[25%] opacity-10 blur-[120px] pointer-events-none"></div>

      {/* Focus HUD Container */}
      <div className="max-w-[580px] w-full flex flex-col items-center text-center">
        
        <span className="material-symbols-outlined text-primary text-[42px] mb-4 animate-pulse">
          bolt
        </span>
        <h2 className="font-headline-lg text-[26px] text-white font-extrabold tracking-tight mb-2">
          DEEP WORK FOCUS CHAMBER
        </h2>
        <p className="text-[12.5px] text-on-surface-variant/80 mb-8 max-w-sm">
          System navigation and statistics are offline. Dedicate your full energy to your daily recurring directives.
        </p>

        {/* Floating Timer Circle */}
        <div className="relative w-52 h-52 flex items-center justify-center mb-8 bg-white/[0.01] border border-white/5 rounded-full shadow-[0_0_60px_rgba(139,92,246,0.15)]">
          <div className="absolute inset-4 rounded-full border border-dashed border-primary/20 flex flex-col items-center justify-center">
            <span className="font-mono text-[42px] text-white font-extrabold tracking-widest leading-none">
              {formatTime(timeLeft)}
            </span>
            <span className="font-label-caps text-[8px] text-primary/80 mt-2.5 font-bold tracking-widest uppercase">
              {isRunning ? 'CHAMBER ACTIVE' : 'CHAMBER PAUSED'}
            </span>
          </div>
        </div>

        {/* Timer Control row */}
        <div className="flex gap-4 mb-8 shrink-0">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-[13px] hover:bg-primary-container transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isRunning ? 'pause' : 'play_arrow'}
            </span>
            {isRunning ? 'Pause Block' : 'Resume Block'}
          </button>
          <button 
            onClick={() => setTimeLeft(1500)}
            className="px-6 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-on-surface-variant hover:text-white transition-colors cursor-pointer border border-white/5 text-[13px] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              restart_alt
            </span>
            Reset
          </button>
        </div>

        {/* Ambient Sound Simulator Panel */}
        <div className="w-full bg-[#131b2e]/30 border border-white/[0.03] rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div className="text-left flex items-center gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              music_note
            </span>
            <div>
              <p className="text-[11px] text-on-surface-variant/50 font-bold uppercase tracking-wider">FOCUS AUDIO</p>
              <p className="text-[12.5px] text-white font-semibold">{ambientMode === 'Off' ? 'No track selected' : `${ambientMode} (Simulated)`}</p>
            </div>
          </div>
          
          {/* Simulated frequency waves if audio playing */}
          {ambientMode !== 'Off' && (
            <div className="flex gap-[3px] items-end h-[16px] px-2">
              <span className="w-[3px] bg-secondary rounded-full animate-pulse h-3"></span>
              <span className="w-[3px] bg-secondary rounded-full animate-bounce h-4"></span>
              <span className="w-[3px] bg-secondary rounded-full animate-pulse h-2.5"></span>
              <span className="w-[3px] bg-secondary rounded-full animate-bounce h-3.5"></span>
            </div>
          )}

          <div className="flex bg-[#131b2e] border border-white/5 rounded-lg p-0.5 shrink-0">
            {['Off', 'Lofi', 'Rain', 'Noise'].map((mode) => {
              const displayMode = mode === 'Noise' ? 'White Noise' : mode;
              const isActiveMode = ambientMode === displayMode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAmbientMode(displayMode)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isActiveMode
                      ? 'bg-secondary text-on-secondary'
                      : 'text-on-surface-variant/70 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Focused Daily Habits list */}
        <div className="w-full bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 mb-8 text-left max-h-[180px] overflow-y-auto scrollbar-thin">
          <h3 className="font-label-caps text-[9px] text-on-surface-variant/50 mb-3.5 tracking-widest font-semibold flex items-center gap-1.5 uppercase">
            <span className="material-symbols-outlined text-[13px] text-primary">sync</span>
            Active Focus Checklist
          </h3>

          <div className="space-y-1.5">
            {dailyTasks.length === 0 ? (
              <p className="text-[12px] text-on-surface-variant/40 italic text-center py-4">No daily focus habits registered today.</p>
            ) : (
              dailyTasks.map(t => {
                const isDone = isCompletedOn(t, todayStr);
                return (
                  <div 
                    key={t.id}
                    onClick={() => toggleTask(t.id, todayStr)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isDone 
                        ? 'bg-primary/5 border-primary/20 opacity-50' 
                        : 'bg-[#131b2e]/20 border-white/[0.01] hover:border-white/[0.03] hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary transition-transform duration-200 hover:scale-110">
                      {isDone ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span className={`text-[12.5px] ${isDone ? 'line-through text-on-surface-variant/65' : 'text-on-surface/90 font-medium'}`}>
                      {t.title}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Exit link */}
        <button 
          onClick={handleExitClick}
          className="text-on-surface-variant hover:text-white text-[12px] font-bold tracking-wider transition-colors cursor-pointer border border-dashed border-white/10 hover:border-white/20 px-4 py-1.5 rounded-lg bg-white/[0.01] hover:bg-white/[0.03]"
        >
          EXIT DEEP WORK
        </button>

      </div>
    </div>
  );
}
