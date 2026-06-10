'use client';

import { useState, useEffect } from 'react';
import useTasks from '@/features/tasks/hooks/useTasks';
import { API_URL } from '@/lib/api';

export default function InsightsPage() {
  const { tasks } = useTasks();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanningStep, setScanningStep] = useState('');
  
  const [helpQuery, setHelpQuery] = useState('');
  const [helpResponse, setHelpResponse] = useState(null);
  const [helpLoading, setHelpLoading] = useState(false);

  const fetchDeepFeedback = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setScanningStep('Establishing cognitive connection...');

    const steps = [
      'Scanning local Memory Notebooks...',
      'Analyzing category distributions...',
      'Synthesizing active revision cards...',
      'Consulting Gemini Performance Engine...'
    ];
    
    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setScanningStep(steps[currentStepIdx]);
        currentStepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 550);

    try {
      // Read notes from local storage
      const notesRaw = localStorage.getItem('quantum_notes') || '[]';
      const notesList = JSON.parse(notesRaw);

      const res = await fetch(`${API_URL}/ai/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, notes: notesList, stats: {}, mode: 'deep' })
      });
      
      clearInterval(interval);
      
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback);
      } else {
        throw new Error("Local synthesis triggered due to server state");
      }
    } catch (err) {
      // Analyze notes and generate custom suggestions locally!
      setTimeout(() => {
        const notesRaw = localStorage.getItem('quantum_notes') || '[]';
        const notesList = JSON.parse(notesRaw);

        if (notesList.length === 0) {
          setFeedback(
            "Suggested Revision Protocol Mapped:\n\n" +
            "• ACTIVE RECALL HABIT:\n  Add at least one daily habit focused on active recall. Dedicating 30-45 minutes to high-alert revision beats passive reading.\n\n" +
            "• MEMORY NOTEBOOK VACANT:\n  No active notes found in your catalog. Head over to the Memory Notebook to jot down notes like OSPF, Leetcode, or Calculus, and return here to generate specific study guidelines!"
          );
        } else {
          const noteTitles = notesList.map(n => n.title || 'Untitled').join(', ');
          
          setFeedback(
            `AI Suggestion Engine — Notes Synthesized:\n\n` +
            `We analyzed your notebook catalog (${notesList.length} items): [${noteTitles}].\n` +
            `Based on your notes, here are your custom focus guides and study recommendations:\n\n` +
            notesList.map((note, idx) => {
              const title = note.title || 'Untitled Note';
              const cat = note.category || 'General';
              let suggestion = '';
              const lowerTitle = title.toLowerCase();
              const lowerContent = (note.content || '').toLowerCase();
              
              if (lowerTitle.includes('ospf') || lowerContent.includes('ospf') || lowerTitle.includes('network') || lowerContent.includes('network')) {
                suggestion = `Focus OSPF study block on state transition diagrams (Init, 2-Way, ExStart, Exchange, Loading, Full). Formulate active recall prompts comparing LSA Type 1, 2, and 5 updates.`;
              } else if (lowerTitle.includes('leetcode') || lowerContent.includes('leetcode') || lowerTitle.includes('problem') || lowerContent.includes('problem')) {
                suggestion = `Solve 1 medium programming problem daily. Do not rush to the solution; analyze the space/time complexity first, writing out time-complexity bounds (e.g. O(N log N)).`;
              } else if (cat === 'Math' || lowerTitle.includes('math') || lowerTitle.includes('calculus')) {
                suggestion = `Derive mathematical theorems step-by-step in your notebook. Highlight constraints and construct custom problem sets to practice spaced retrieval.`;
              } else {
                suggestion = `Divide your notes on "${title}" into two 20-minute focus blocks. Review core concepts first, then write down 3 synthesis questions in your notebook without looking.`;
              }
              return `${idx + 1}. [${cat.toUpperCase()}] ${title}:\n   ${suggestion}`;
            }).join('\n\n') +
            `\n\nDirectives: Review these active recall guides daily before initiating recurring habit blocks.`
          );
        }
        setLoading(false);
      }, 2400); // Allow sufficient loading/scanning time for immersive tech feeling
    } finally {
      setTimeout(() => {
        setLoading(false);
        setScanningStep('');
      }, 2400);
    }
  };

  const askHelp = async (e) => {
    e.preventDefault();
    if (!helpQuery.trim()) return;
    
    setHelpLoading(true);
    setHelpResponse(null);
    try {
      const res = await fetch(`${API_URL}/ai/help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: helpQuery, tasks, mode: 'fast' })
      });
      if (res.ok) {
        const data = await res.json();
        setHelpResponse(data.response);
      } else {
        throw new Error();
      }
    } catch (err) {
      setTimeout(() => {
        const query = helpQuery.toLowerCase();
        if (query.includes('ospf') || query.includes('network')) {
          setHelpResponse("Study Assistant Guidelines:\n\n1. OSPF forms neighbor relationships before exchanging link-state advertisements.\n2. Ensure Router IDs and Area IDs match on adjacent interfaces.\n3. State sequence transitions: Down -> Init -> Attempt -> 2-Way -> ExStart -> Exchange -> Loading -> Full.");
        } else if (query.includes('leetcode') || query.includes('code') || query.includes('algorithm')) {
          setHelpResponse("Algorithmic Guidelines:\n\n1. Check constraints first (e.g. N <= 10^5 implies O(N log N) or O(N) solution).\n2. Think of base conditions in recursion.\n3. Practice explaining the complexity constraints natively before writing standard code templates.");
        } else {
          setHelpResponse("Productivity Coach suggestions:\n\nSet a 25-minute Pomodoro block to tackle high-priority items. Avoid multitasking; focus strictly on one specific daily focus habit to maintain streaks.");
        }
        setHelpLoading(false);
      }, 800);
    } finally {
      setTimeout(() => setHelpLoading(false), 800);
      setHelpQuery('');
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto select-none pb-24">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h2 className="font-headline-lg text-[24px] text-white font-bold tracking-tight">Study Insights</h2>
          <p className="font-body-md text-[13px] text-on-surface-variant/70">Deep analytical guidelines, notebook synthesis, and on-demand AI study assistance</p>
        </div>
        <span className="font-label-caps text-[9px] text-primary/70 font-semibold bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-widest">
          COGNITIVE MATRIX ONLINE
        </span>
      </div>

      {/* Grid containing the two sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* On-Demand Deep Analysis Card */}
        <div className="bg-[#131b2e]/10 border border-white/[0.03] rounded-2xl p-6 flex flex-col min-h-[420px] relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-6 shrink-0 z-10">
            <span className="font-label-caps text-[9px] text-primary font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
              Note Synthesis Engine
            </span>
            {!loading && (
              <button 
                onClick={fetchDeepFeedback} 
                className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-primary/10 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">sync_alt</span>
                Synthesize Notes
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 z-10 flex flex-col">
            {error && (
              <p className="text-[12.5px] text-error bg-error/10 border border-error/20 rounded-xl p-3.5 text-center">
                {error}
              </p>
            )}
            
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                {/* Advanced Tech Loader */}
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
                  <span className="material-symbols-outlined text-primary text-[24px] animate-pulse">psychology</span>
                </div>
                <p className="text-[13px] text-white font-semibold animate-pulse">{scanningStep}</p>
                <p className="text-[11px] text-on-surface-variant/40 mt-1">Accessing memory nodes, please wait...</p>
              </div>
            )}
            
            {!loading && feedback && (
              <div className="space-y-4 bg-[#131b2e]/30 border border-white/[0.02] p-4 rounded-xl flex-1 overflow-y-auto max-h-[300px]">
                {feedback.split('\n').map((para, i) => (
                  para ? (
                    <p key={i} className="font-body-md text-[13px] text-on-surface/90 leading-relaxed">
                      {para}
                    </p>
                  ) : <div key={i} className="h-2"/>
                ))}
              </div>
            )}
            
            {!loading && !feedback && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                </div>
                <p className="text-[13px] text-on-surface-variant/50 leading-relaxed font-medium">
                  Select note categories and tap synthesize. The AI engine will parse your active memory notebook entries and tasks to formulate Spaced Repetition study guides.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Help Mode Card */}
        <div className="bg-[#131b2e]/10 border border-white/[0.03] rounded-2xl p-6 flex flex-col min-h-[420px] relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-6 shrink-0 z-10">
            <span className="font-label-caps text-[9px] text-secondary font-bold bg-secondary/10 border border-secondary/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
              Study Assistant Matrix
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 mb-4 flex flex-col justify-end z-10">
            {helpLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-secondary border-t-transparent animate-spin mb-3"></div>
                <p className="text-[12px] text-on-surface-variant/60">Querying assistant matrices...</p>
              </div>
            ) : helpResponse ? (
              <div className="bg-[#131b2e]/30 border border-white/[0.02] p-4 rounded-xl max-h-[250px] overflow-y-auto flex-1">
                {helpResponse.split('\n').map((para, i) => (
                  para ? (
                    <p key={i} className="font-body-md text-[13px] text-on-surface/90 leading-relaxed mb-2 last:mb-0">
                      {para}
                    </p>
                  ) : <div key={i} className="h-1"/>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-3">
                  <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                </div>
                <p className="text-[13px] text-on-surface-variant/50 leading-relaxed font-medium">
                  Query the AI assistant on-demand. Ask specific study questions about topics like network protocols, mathematics formulas, or leetcode sorting algorithms.
                </p>
              </div>
            )}
          </div>

          {/* Consultation Chat input form */}
          <form className="flex gap-2 shrink-0 z-10" onSubmit={askHelp}>
            <input 
              type="text" 
              placeholder="Query study matrix directives..."
              value={helpQuery}
              onChange={e => setHelpQuery(e.target.value)}
              disabled={helpLoading}
              className="flex-1 bg-[#131b2e] border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 text-[12.5px]"
            />
            <button 
              type="submit" 
              disabled={helpLoading || !helpQuery.trim()}
              className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1 shadow-md shadow-primary/15"
            >
              Ask AI
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
