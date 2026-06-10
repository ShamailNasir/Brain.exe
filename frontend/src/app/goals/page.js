'use client';

import { useState, useEffect } from 'react';

export default function GoalsPage() {
  const [goals, setGoals] = useState({ weekly: [], major: [] });
  const [newGoal, setNewGoal] = useState('');
  const [goalType, setGoalType] = useState('weekly');

  useEffect(() => {
    const saved = localStorage.getItem('quantum_goals');
    if (saved) {
      try { setGoals(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (goals.weekly.length > 0 || goals.major.length > 0) {
      localStorage.setItem('quantum_goals', JSON.stringify(goals));
    }
  }, [goals]);

  const addGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    
    const goal = {
      id: Date.now().toString(),
      title: newGoal.trim(),
      progress: 0,
      createdAt: Date.now(),
      completed: false,
    };

    setGoals(prev => ({
      ...prev,
      [goalType]: [...prev[goalType], goal],
    }));
    setNewGoal('');
  };

  const updateProgress = (type, id, delta) => {
    setGoals(prev => ({
      ...prev,
      [type]: prev[type].map(g => {
        if (g.id !== id) return g;
        const nextProgress = Math.max(0, Math.min(100, g.progress + delta));
        return {
          ...g,
          progress: nextProgress,
          completed: nextProgress >= 100
        };
      })
    }));
  };

  const deleteGoal = (type, id) => {
    setGoals(prev => ({
      ...prev,
      [type]: prev[type].filter(g => g.id !== id),
    }));
  };

  return (
    <div className="max-w-[900px] mx-auto select-none pb-24">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="font-headline-lg text-[24px] text-white font-bold tracking-tight">Prime Matrix Targets</h2>
          <p className="font-body-md text-[13px] text-on-surface-variant/70">Establish weekly targets and long-term major operational goals</p>
        </div>
      </div>

      {/* Goal Injector Panel */}
      <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 mb-8">
        <form onSubmit={addGoal} className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              placeholder="Inject new prime matrix target..."
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              className="w-full bg-[#131b2e] border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 text-[13px]"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex bg-[#131b2e] border border-outline-variant/30 rounded-xl p-1 shrink-0">
              <button
                type="button"
                className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                  goalType === 'weekly' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'
                }`}
                onClick={() => setGoalType('weekly')}
              >
                Weekly
              </button>
              <button
                type="button"
                className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                  goalType === 'major' ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'
                }`}
                onClick={() => setGoalType('major')}
              >
                Major
              </button>
            </div>

            <button 
              type="submit" 
              disabled={!newGoal.trim()}
              className="bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] font-bold">add</span>
              Target
            </button>
          </div>
        </form>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weekly Goals block */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6">
          <h3 className="font-headline-md text-[16px] text-white font-semibold mb-6 flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
              Weekly Objectives
            </span>
            <span className="text-[11px] text-primary/70 font-semibold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
              {goals.weekly.length} Tracked
            </span>
          </h3>
          
          <div className="space-y-4">
            {goals.weekly.length === 0 ? (
              <p className="text-[13px] text-on-surface-variant/40 italic text-center py-8 bg-white/[0.005] border border-dashed border-white/[0.02] rounded-xl">
                No weekly goals established yet.
              </p>
            ) : (
              goals.weekly.map(goal => (
                <GoalItem key={goal.id} goal={goal} type="weekly" onProgress={updateProgress} onDelete={deleteGoal} />
              ))
            )}
          </div>
        </div>

        {/* Major Goals block */}
        <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-6">
          <h3 className="font-headline-md text-[16px] text-white font-semibold mb-6 flex justify-between items-center">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">track_changes</span>
              Major Targets
            </span>
            <span className="text-[11px] text-secondary/70 font-semibold bg-secondary/10 border border-secondary/20 px-2.5 py-0.5 rounded-full">
              {goals.major.length} Tracked
            </span>
          </h3>
          
          <div className="space-y-4">
            {goals.major.length === 0 ? (
              <p className="text-[13px] text-on-surface-variant/40 italic text-center py-8 bg-white/[0.005] border border-dashed border-white/[0.02] rounded-xl">
                No major goals established yet.
              </p>
            ) : (
              goals.major.map(goal => (
                <GoalItem key={goal.id} goal={goal} type="major" onProgress={updateProgress} onDelete={deleteGoal} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalItem({ goal, type, onProgress, onDelete }) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      goal.completed 
        ? 'bg-success/5 border-success/20 opacity-60' 
        : 'bg-white/[0.01] border-white/[0.03] hover:border-white/[0.06] group'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <span className={`text-[13px] font-medium flex items-center gap-2 ${
          goal.completed ? 'text-success/90 line-through' : 'text-on-surface'
        }`}>
          <span className="material-symbols-outlined text-[18px]">
            {goal.completed ? 'check_circle' : 'adjust'}
          </span>
          {goal.title}
        </span>
        <button 
          onClick={() => onDelete(type, goal.id)}
          className="text-on-surface-variant hover:text-error transition-all p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3 shrink-0">
        <div className="flex-1 bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${goal.progress}%`,
              backgroundColor: goal.completed ? '#10b981' : '#8b5cf6'
            }} 
          />
        </div>
        <span className="text-[10px] font-mono text-on-surface-variant font-medium leading-none shrink-0">{goal.progress}%</span>
      </div>

      {!goal.completed && (
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => onProgress(type, goal.id, -10)}
            className="px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.06] text-on-surface-variant text-[9px] font-semibold transition-colors cursor-pointer border border-white/5"
          >
            -10%
          </button>
          <button 
            onClick={() => onProgress(type, goal.id, 10)}
            className="px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-semibold transition-colors cursor-pointer border border-primary/15"
          >
            +10%
          </button>
          <button 
            onClick={() => onProgress(type, goal.id, 25)}
            className="px-2.5 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary text-[9px] font-semibold transition-colors cursor-pointer border border-primary/25"
          >
            +25%
          </button>
        </div>
      )}
    </div>
  );
}
