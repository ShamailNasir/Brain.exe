'use client';

import { useState } from 'react';
import styles from './TaskDetailModal.module.css';

export default function TaskDetailModal({ task, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'p4');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(task.tags || []);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleSave = () => {
    onSave(task.id, {
      title,
      description,
      priority,
      tags,
      subtasks
    });
    onClose();
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddSubtask = (e) => {
    if (e.key === 'Enter' && newSubtask.trim()) {
      e.preventDefault();
      setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (id) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (id) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <input 
            type="text" 
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <label className={styles.label}>Description</label>
            <textarea 
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or context..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.section}>
              <label className={styles.label}>Priority</label>
              <select 
                className={styles.select}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="p1">P1 (Urgent)</option>
                <option value="p2">P2 (High)</option>
                <option value="p3">P3 (Medium)</option>
                <option value="p4">P4 (Low)</option>
              </select>
            </div>
            
            <div className={styles.section}>
              <label className={styles.label}>Tags</label>
              <div className={styles.tagsWrapper}>
                {tags.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button className={styles.removeTagBtn} onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
                <input 
                  type="text"
                  className={styles.tagInput}
                  placeholder="Add tag (Enter)"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Subtasks</label>
            <div className={styles.subtaskList}>
              {subtasks.map(st => (
                <div key={st.id} className={styles.subtaskItem}>
                  <input 
                    type="checkbox" 
                    className={styles.subtaskCheck}
                    checked={st.completed}
                    onChange={() => toggleSubtask(st.id)}
                  />
                  <span className={`${styles.subtaskTitle} ${st.completed ? styles.subtaskDone : ''}`}>
                    {st.title}
                  </span>
                  <button className={styles.removeSubtaskBtn} onClick={() => removeSubtask(st.id)}>×</button>
                </div>
              ))}
              <input 
                type="text"
                className={styles.subtaskInput}
                placeholder="+ Add subtask (Enter)"
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={handleAddSubtask}
              />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={() => onDelete(task.id)}>Delete Task</button>
          <div className={styles.footerActions}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
