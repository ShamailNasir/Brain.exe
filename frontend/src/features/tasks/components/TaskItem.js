import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import styles from './TaskItem.module.css';
import aiStyles from '@/components/AI/AI.module.css';
import TaskBreakdownModal from '@/components/AI/TaskBreakdownModal';
import TaskDetailModal from './TaskDetailModal';
import { API_URL } from '@/lib/api';

export default function TaskItem({ task, isCompleted, onToggle, onDelete, onEdit }) {
  const [isImproving, setIsImproving] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  
  // Interactive Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleImprove = async (e) => {
    e.stopPropagation();
    setIsImproving(true);
    try {
      const res = await fetch(`${API_URL}/ai/enhance-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title })
      });
      if (res.ok) {
        const data = await res.json();
        // Open edit flow natively presenting the AI rewrite dynamically
        setEditValue(data.enhanced);
        setIsEditing(true);
      }
    } catch (err) {
      console.error("AI Improvement failed", err);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    if (editValue.trim() && onEdit) {
      onEdit(task.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  return (
    <>
      <li className={`${styles.item} ${isCompleted ? styles.completed : ''}`}>
        <div className={styles.content} onClick={() => !isEditing && onToggle(task.id)}>
          {!isEditing && (
            <button
              className={`${styles.checkbox} ${isCompleted ? styles.checked : ''}`}
              aria-label="Toggle task"
            >
              {isCompleted && '✓'}
            </button>
          )}
          
          <div className={styles.details} style={{ width: isEditing ? '100%' : 'auto' }}>
            {isEditing ? (
              <div className={styles.editForm}>
                <input 
                  type="text" 
                  className={styles.editInput} 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if(e.key === 'Enter') handleSaveEdit(e);
                    if(e.key === 'Escape') handleCancelEdit(e);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className={styles.editActions}>
                  <button onClick={handleSaveEdit} className={styles.saveBtn}>Save</button>
                  <button onClick={handleCancelEdit} className={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.titleRow}>
                  <span className={`${styles.priorityIndicator} ${styles[task.priority || 'p4']}`} />
                  <span className={styles.title}>{task.title}</span>
                </div>
                <div className={styles.metaRow}>
                  {task.type === 'one-time' && task.date && (
                    <span className={styles.dateBadge}>{task.date}</span>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className={styles.tagList}>
                      {task.tags.map(tag => (
                        <span key={tag} className={styles.tagBadge}>#{tag}</span>
                      ))}
                    </div>
                  )}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className={styles.subtaskBadge}>
                      {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className={styles.actions}>
            <button 
              className={styles.aiBtn} 
              onClick={handleImprove}
              disabled={isImproving || isCompleted}
              title="✨ AI Rewrite"
            >
              {isImproving ? <span className={aiStyles.loader} style={{width:'12px', height:'12px', borderWidth:'2px'}}></span> : '✨'}
            </button>
            <button 
              className={styles.aiBtn} 
              onClick={(e) => { e.stopPropagation(); setShowBreakdown(true); }}
              title="🧠 AI Tactical Breakdown"
            >
              🧠
            </button>
            <button 
              className={styles.deleteBtn} 
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail(true);
              }}
              title="Edit Task"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}
      </li>

      {showDetail && (
        <TaskDetailModal 
          task={task}
          onClose={() => setShowDetail(false)}
          onSave={onEdit}
          onDelete={(id) => {
            setShowDetail(false);
            onDelete(id);
          }}
        />
      )}

      {showBreakdown && (
        <TaskBreakdownModal 
          taskTitle={task.title} 
          onClose={() => setShowBreakdown(false)} 
        />
      )}
    </>
  );
}
