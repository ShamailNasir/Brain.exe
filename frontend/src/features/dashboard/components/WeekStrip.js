import { useEffect, useRef } from 'react';
import styles from './WeekStrip.module.css';

export default function WeekStrip({ selectedDate, onSelectDate, tasks, isCompletedOn }) {
  const containerRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);

  // Generate 15 days centered on today
  const today = new Date();
  const days = Array.from({ length: 15 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 7 + i);
    return d;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDateStr = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = formatDateStr(today);

  // Smoothly center the selected date in the viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const activeElement = container.querySelector(`[data-date="${selectedDate}"]`);

    if (activeElement) {
      const containerWidth = container.offsetWidth;
      const elementWidth = activeElement.offsetWidth;
      const elementLeft = activeElement.offsetLeft;

      // Use a brief timeout to let layout complete, then scroll smoothly
      const timer = setTimeout(() => {
        container.style.scrollBehavior = 'smooth';
        container.scrollTo({
          left: elementLeft - containerWidth / 2 + elementWidth / 2,
          behavior: 'smooth'
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedDate]);

  // Pointer drag event handlers for tactile roulette wheel feel
  const handlePointerDown = (e) => {
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
    containerRef.current.style.scrollBehavior = 'auto'; // Disable smooth scroll while dragging
    containerRef.current.style.cursor = 'grabbing';
  };

  const handlePointerLeave = () => {
    if (!isDown.current) return;
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handlePointerUp = () => {
    if (!isDown.current) return;
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handlePointerMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Scroll speed modifier
    if (Math.abs(walk) > 5) {
      isDragging.current = true;
    }
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleDayClick = (dateStr) => {
    if (isDragging.current) {
      return; // If dragging, don't change selection
    }
    onSelectDate(dateStr);
  };

  return (
    <div 
      ref={containerRef}
      className={styles.strip}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      style={{ cursor: 'grab', userSelect: 'none', touchAction: 'pan-y' }}
    >
      {days.map(d => {
        const dateStr = formatDateStr(d);
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === todayStr;

        // Count completions for this day
        const dailyTasks = tasks.filter(t => t.type === 'daily');
        const dailyCompleted = dailyTasks.filter(t => isCompletedOn(t, dateStr)).length;
        const dailyTotal = dailyTasks.length;
        const ratio = dailyTotal > 0 ? dailyCompleted / dailyTotal : 0;

        return (
          <button
            key={dateStr}
            data-date={dateStr}
            className={`${styles.day} ${isSelected ? styles.daySelected : ''} ${isToday ? styles.dayToday : ''}`}
            onClick={() => handleDayClick(dateStr)}
          >
            <span className={styles.dayName}>{dayNames[d.getDay()]}</span>
            <span className={styles.dayNum}>{d.getDate()}</span>
            {dailyTotal > 0 && (
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${ratio * 100}%` }} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
