'use client';

import { useState, useEffect, useRef } from 'react';
import useGamification from '@/features/gamification/hooks/useGamification';
import { API_URL } from '@/lib/api';

const DIRECTIVE_QUOTES = [
  "The mind is not a vessel to be filled, but a fire to be kindled.",
  "Focus on being productive instead of busy.",
  "Deep work is the superpower of the 21st century.",
  "Simplicity is the ultimate sophistication.",
  "Do not count the days, make the days count.",
  "Your focus determines your reality.",
  "Quality is not an act, it is a habit."
];

export default function RightSidebar() {
  const { level, streak, progressPercentage, isLoaded } = useGamification();
  const [quote, setQuote] = useState("The mind is not a vessel to be filled, but a fire to be kindled.");
  const [quoteFade, setQuoteFade] = useState(false); // for transitions

  // Pomodoro Focus Timer State
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Fetch initial daily quote
    const cached = localStorage.getItem('daily_quote');
    const cachedDate = localStorage.getItem('quote_date'); 
    const today = new Date().toDateString();

    if (cached && cachedDate === today) {
      setQuote(cached);
    } else {
      fetchNewQuote();
    }
  }, []);

  // Timer interval hook
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            alert("Focus block complete! Take a short break, Commander.");
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
  }, [isTimerRunning]);

  const fetchNewQuote = async () => {
    setQuoteFade(true);
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/ai/quote`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          let cleanQuote = data.quote.replace(/\s+/g, ' ').trim();
          cleanQuote = cleanQuote.replace(/[-~—](.*)$/, '').trim(); 
          cleanQuote = cleanQuote.replace(/^["']|["']$/g, '').trim(); 
          setQuote(cleanQuote);
          localStorage.setItem('daily_quote', cleanQuote);
          localStorage.setItem('quote_date', new Date().toDateString());
        } else {
          // Fallback to random local directive quotes
          const randomIdx = Math.floor(Math.random() * DIRECTIVE_QUOTES.length);
          setQuote(DIRECTIVE_QUOTES[randomIdx]);
        }
      } catch (err) {
        const randomIdx = Math.floor(Math.random() * DIRECTIVE_QUOTES.length);
        setQuote(DIRECTIVE_QUOTES[randomIdx]);
      }
      setQuoteFade(false);
    }, 300);
  };

  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimeLeft(1500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Total circumference for r=54 circle is 339
  const circumference = 339;
  const dashOffset = isLoaded 
    ? circumference - (circumference * (progressPercentage || 0)) / 100 
    : circumference;

  return (
    <aside className="fixed right-0 top-0 w-64 h-full p-8 flex flex-col gap-10 overflow-y-auto bg-background/95 border-l border-white/[0.02] xl:border-none xl:bg-transparent z-30 select-none no-scrollbar xl:flex hidden">
      
      {/* Proficiency Level Widget */}
      <div className="flex flex-col items-center text-center mt-4">
        <h3 className="font-label-caps text-[9px] text-on-surface-variant/50 mb-4 tracking-[0.2em] font-semibold">PROFICIENCY</h3>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="48" cy="48" fill="transparent" r="46" stroke="rgba(255,255,255,0.02)" strokeWidth="2"></circle>
            <circle 
              cx="48" 
              cy="48" 
              fill="transparent" 
              r="46" 
              stroke="url(#violetGradient)" 
              strokeDasharray="289" 
              strokeDashoffset={289 - (289 * (progressPercentage || 0)) / 100} 
              strokeLinecap="round" 
              strokeWidth="2"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            ></circle>
            <defs>
              <linearGradient id="violetGradient" x1="0%" x2="100%" y1="0%" x2="100%">
                <stop offset="0%" style={{ stopColor: '#8b5cf6' }}></stop>
                <stop offset="100%" style={{ stopColor: '#c4b5fd' }}></stop>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display-lg text-[32px] text-white/90 font-light tracking-tighter">{level}</span>
            <span className="font-label-caps text-[8px] text-primary/70 mt-0 font-semibold">LVL</span>
          </div>
        </div>
      </div>

      {/* Streak Count Widget */}
      <div className="flex flex-col items-center text-center">
        <h3 className="font-label-caps text-[9px] text-on-surface-variant/50 mb-2 tracking-[0.2em] font-semibold">STREAK</h3>
        <div className="flex items-center gap-3">
          <span className="font-stat-value text-[24px] text-white/90 font-semibold">{streak || 0}</span>
          <span className="material-symbols-outlined text-[20px] text-primary/80" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
        </div>
      </div>

      {/* Pomodoro Focus Timer Widget (Space Filler / Dynamic Feature) */}
      <div className="flex flex-col items-center text-center bg-white/[0.02] border border-white/[0.03] rounded-2xl p-4">
        <h3 className="font-label-caps text-[9px] text-on-surface-variant/50 mb-3 tracking-[0.2em] font-semibold">FOCUS MATRIX</h3>
        <div className="font-stat-value text-[28px] text-white/90 font-bold mb-3 tracking-wider font-mono">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleTimerToggle}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors cursor-pointer"
            title={isTimerRunning ? "Pause matrix block" : "Initiate focus block"}
          >
            <span className="material-symbols-outlined text-[16px] font-bold">
              {isTimerRunning ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button 
            onClick={handleTimerReset}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
            title="Reset focus block"
          >
            <span className="material-symbols-outlined text-[16px]">
              restart_alt
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Directive Quote Widget */}
      <div 
        onClick={fetchNewQuote}
        className="mt-auto flex flex-col relative text-center pb-4 cursor-pointer group active:scale-95 transition-transform"
        title="Decrypt new AI directive quote"
      >
        <span className="material-symbols-outlined text-primary/20 mb-3 text-[22px] group-hover:text-primary/45 transition-colors">
          format_quote
        </span>
        <p className={`font-body-lg text-on-surface/60 italic leading-relaxed text-[12.5px] px-2 transition-opacity duration-300 ${
          quoteFade ? 'opacity-0' : 'opacity-100'
        }`}>
          "{quote}"
        </p>
        <div className="mt-4">
          <p className="font-label-caps text-[8px] text-on-surface-variant/40 tracking-widest font-semibold group-hover:text-primary/50 transition-colors">
            OS DIRECTIVE 01
          </p>
        </div>
      </div>
    </aside>
  );
}
