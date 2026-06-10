'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const CATEGORIES = ["General", "Networks", "Computer Science", "LeetCode", "Math", "Personal"];

const PREPOPULATED_NOTES = [
  {
    id: 'mock-1',
    title: 'OSPF Neighbor States & Transitions',
    category: 'Networks',
    content: `# OSPF Neighbor State Transition Guide

OSPF neighbors transition through the following states for convergence:

1. **DOWN**: No hello packets received yet.
2. **INIT**: Hello packet received, but Router ID is not listed in the neighbor list.
3. **2-WAY**: Bidirectional communication established. DR/BDR election happens here.
4. **EXSTART**: Master/Slave election to decide initial sequence number.
5. **EXCHANGE**: Routers exchange Database Description (DBD) packets containing LSA headers.
6. **LOADING**: Link-State Requests (LSR) sent for missing database segments. Link-State Updates (LSU) return the full LSA records.
7. **FULL**: Databases are completely synchronized. Convergence achieved.

> [!NOTE]
> Multicast LSUs are sent to 224.0.0.5 (All OSPF Routers) or 224.0.0.6 (All DR/BDR Routers).`,
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'mock-2',
    title: 'LeetCode 121: Buy/Sell Stock Optimization',
    category: 'LeetCode',
    content: `# Stock Trading Strategy (Max Profit)

Given an array of stock prices, find the maximum profit by buying on one day and selling on a future day.

## O(N) Greedy Approach:
Keep track of the minimum price seen so far, and compute the profit of selling today.

\`\`\`js
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  
  for (let price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}
\`\`\`

- **Time Complexity**: O(N) — single pass.
- **Space Complexity**: O(1) — constant storage.`,
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'mock-3',
    title: 'Fundamental Theorem of Calculus',
    category: 'Math',
    content: `# Calculus I: Integration Rules

The Fundamental Theorem of Calculus links differentiation and integration:

## Part 1 (Area Function Derivative):
$$ g(x) = \\int_{a}^{x} f(t) dt \\implies g'(x) = f(x) $$

## Part 2 (Evaluation of Definite Integrals):
$$ \\int_{a}^{b} f(x) dx = F(b) - F(a) $$
where $F'(x) = f(x)$.

> [!TIP]
> Use integration by parts when evaluating functions of type $x^n \\cdot e^x$ or $x^n \\cdot \\ln(x)$.`,
    createdAt: Date.now() - 3600000 * 48,
    updatedAt: Date.now() - 3600000 * 48,
  }
];

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolderFilter, setActiveFolderFilter] = useState('All');
  const [isSavedPulse, setIsSavedPulse] = useState(true);
  
  const textareaRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('quantum_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length === 0) {
          setNotes(PREPOPULATED_NOTES);
          localStorage.setItem('quantum_notes', JSON.stringify(PREPOPULATED_NOTES));
          setActiveId(PREPOPULATED_NOTES[0].id);
        } else {
          setNotes(parsed);
          setActiveId(parsed[0].id);
        }
      } catch (e) {
        setNotes(PREPOPULATED_NOTES);
        localStorage.setItem('quantum_notes', JSON.stringify(PREPOPULATED_NOTES));
        setActiveId(PREPOPULATED_NOTES[0].id);
      }
    } else {
      setNotes(PREPOPULATED_NOTES);
      localStorage.setItem('quantum_notes', JSON.stringify(PREPOPULATED_NOTES));
      setActiveId(PREPOPULATED_NOTES[0].id);
    }
  }, []);

  const saveNotes = useCallback((updated) => {
    setNotes(updated);
    localStorage.setItem('quantum_notes', JSON.stringify(updated));
    // Trigger brief save pulse
    setIsSavedPulse(false);
    setTimeout(() => setIsSavedPulse(true), 600);
  }, []);

  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Study Note',
      content: '',
      category: 'General',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newNote, ...notes];
    saveNotes(updated);
    setActiveId(newNote.id);
  };

  const updateNote = (id, field, value) => {
    const updated = notes.map(n =>
      n.id === id ? { ...n, [field]: value, updatedAt: Date.now() } : n
    );
    saveNotes(updated);
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
    if (activeId === id) {
      setActiveId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const activeNote = notes.find(n => n.id === activeId);

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Cursor Markdown Injector Helper
  const injectMarkdown = (prefix, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea || !activeNote) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const replacement = prefix + (selected || placeholder || suffix) + (selected ? suffix : '');
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    updateNote(activeNote.id, 'content', newContent);
    
    // Reset focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selected || placeholder || suffix).length + (selected ? suffix.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Live Stats calculations
  const getWordCount = (content) => {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(Boolean).length;
  };

  const getCharCount = (content) => {
    if (!content) return 0;
    return content.length;
  };

  const getReadTime = (content) => {
    const words = getWordCount(content);
    return Math.ceil(words / 200);
  };

  // Catalog Filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = activeFolderFilter === 'All' || note.category === activeFolderFilter;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="max-w-[1100px] mx-auto select-none pb-24 h-[calc(100vh-160px)] flex flex-col">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 px-2 shrink-0">
        <div>
          <h2 className="font-headline-lg text-[24px] text-white font-bold tracking-tight">Memory Notebook</h2>
          <p className="font-body-md text-[13px] text-on-surface-variant/70">Store system notations, revision guides, and student worksheets</p>
        </div>
        <button 
          onClick={addNote}
          className="bg-primary hover:bg-primary-container text-white px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/15"
        >
          <span className="material-symbols-outlined text-[16px] font-bold">add</span>
          New Note
        </button>
      </div>

      {/* Main split-panel box */}
      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Left Side: Note Folder Tabs & Note Catalog */}
        <div className="w-80 bg-white/[0.01] border border-white/[0.03] rounded-2xl flex flex-col overflow-hidden">
          
          {/* Note Search Input */}
          <div className="p-3 border-b border-white/[0.03] bg-white/[0.005] shrink-0">
            <div className="w-full relative flex items-center bg-[#131b2e] border border-outline-variant/20 rounded-xl px-3 py-1.5">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant/50 mr-2">search</span>
              <input 
                type="text" 
                placeholder="Search notebooks..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none text-[12px]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-white ml-1">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Folder tabs grid */}
          <div className="px-3 py-2 bg-white/[0.005] border-b border-white/[0.03] flex gap-1 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => setActiveFolderFilter('All')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 uppercase tracking-wider ${
                activeFolderFilter === 'All'
                  ? 'bg-primary/20 text-primary border border-primary/20'
                  : 'text-on-surface-variant/60 hover:text-white border border-transparent'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFolderFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 uppercase tracking-wider ${
                  activeFolderFilter === cat
                    ? 'bg-primary/20 text-primary border border-primary/20'
                    : 'text-on-surface-variant/60 hover:text-white border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Note Catalog List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <span className="material-symbols-outlined text-on-surface-variant/20 text-[32px] mb-2">sticky_note_2</span>
                <p className="text-[12px] text-on-surface-variant/40 italic">Folder catalog empty.</p>
              </div>
            ) : (
              filteredNotes.map(note => {
                const isActive = note.id === activeId;
                const words = getWordCount(note.content);
                return (
                  <button
                    key={note.id}
                    onClick={() => setActiveId(note.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-primary/5 border-primary/25 shadow-lg shadow-primary/5' 
                        : 'bg-[#131b2e]/10 border-white/[0.01] hover:border-white/[0.03] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className={`text-[13px] font-semibold truncate flex-1 ${isActive ? 'text-white font-bold' : 'text-on-surface/85'}`}>
                        {note.title || 'Untitled note'}
                      </p>
                      <span className="font-label-caps text-[7px] text-primary/70 shrink-0 font-bold bg-primary/10 border border-primary/15 px-1.5 py-0.5 rounded leading-none uppercase">
                        {note.category || 'General'}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant/65 truncate leading-relaxed">
                      {note.content ? note.content.slice(0, 45) : 'Empty scratch notes...'}
                    </p>
                    <div className="flex justify-between items-center mt-2.5 text-[9px] text-on-surface-variant/50 font-mono">
                      <span>{formatDate(note.createdAt)}</span>
                      <span>{words} word{words !== 1 ? 's' : ''}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Note Editor Panel */}
        <div className="flex-1 bg-white/[0.01] border border-white/[0.03] rounded-2xl flex flex-col overflow-hidden relative">
          {activeNote ? (
            <>
              {/* Editor Header controls */}
              <div className="p-4 border-b border-white/[0.03] bg-[#131b2e]/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex-1 min-w-0">
                  <input
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, 'title', e.target.value)}
                    placeholder="Note title..."
                    className="bg-transparent border-none text-[16px] text-white font-bold placeholder:text-on-surface-variant/30 focus:outline-none w-full"
                  />
                </div>
                
                <div className="flex items-center gap-3.5 shrink-0 justify-between md:justify-end">
                  {/* Category Selection Dropdown */}
                  <select
                    value={activeNote.category || 'General'}
                    onChange={(e) => updateNote(activeNote.id, 'category', e.target.value)}
                    className="bg-[#131b2e] border border-outline-variant/35 rounded-lg px-2.5 py-1 text-[11px] text-primary font-bold focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>

                  <span className="text-[10px] text-on-surface-variant/50 flex items-center gap-1 font-mono font-medium">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    {formatDate(activeNote.updatedAt)}
                  </span>

                  <button 
                    onClick={() => deleteNote(activeNote.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors cursor-pointer border border-white/[0.02] hover:border-error/20"
                    title="Trash note"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="px-4 py-2 border-b border-white/[0.03] bg-white/[0.005] flex flex-wrap gap-1.5 shrink-0 items-center select-none">
                <button 
                  onClick={() => injectMarkdown('**', '**', 'Bold')} 
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[10px] text-on-surface-variant hover:text-white font-semibold flex items-center gap-1"
                  title="Bold text"
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">format_bold</span>
                </button>
                <button 
                  onClick={() => injectMarkdown('*', '*', 'Italic')} 
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[10px] text-on-surface-variant hover:text-white font-semibold flex items-center gap-1"
                  title="Italic text"
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">format_italic</span>
                </button>
                <div className="w-[1px] h-3.5 bg-white/10 mx-1"></div>
                <button 
                  onClick={() => injectMarkdown('### ', '', 'Heading 3')} 
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[10px] text-on-surface-variant hover:text-white font-semibold"
                  title="Add Heading"
                >
                  H3
                </button>
                <button 
                  onClick={() => injectMarkdown('- ', '', 'List item')} 
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[10px] text-on-surface-variant hover:text-white font-semibold flex items-center gap-1"
                  title="Bullet list"
                >
                  <span className="material-symbols-outlined text-[13px]">format_list_bulleted</span>
                </button>
                <button 
                  onClick={() => injectMarkdown('- [ ] ', '', 'Task item')} 
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[10px] text-on-surface-variant hover:text-white font-semibold flex items-center gap-1"
                  title="Task list item"
                >
                  <span className="material-symbols-outlined text-[13px]">checklist</span>
                </button>
                <div className="w-[1px] h-3.5 bg-white/10 mx-1"></div>
                <button 
                  onClick={() => injectMarkdown('\n```js\n', '\n```\n', 'const test = 1;')} 
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[10px] text-on-surface-variant hover:text-white font-semibold flex items-center gap-1"
                  title="Javascript Code Block"
                >
                  <span className="material-symbols-outlined text-[13px]">code</span>
                  Code
                </button>
                <button 
                  onClick={() => injectMarkdown('\n> [!NOTE]\n> ', '', 'Study focus guidelines...')} 
                  className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-[10px] text-on-surface-variant hover:text-white font-semibold flex items-center gap-1"
                  title="Alert Box"
                >
                  <span className="material-symbols-outlined text-[13px]">info</span>
                  Alert
                </button>
              </div>

              {/* Text Editor area */}
              <div className="flex-1 p-5 overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={activeNote.content}
                  onChange={(e) => updateNote(activeNote.id, 'content', e.target.value)}
                  placeholder="Initiate writing system notations, memory logs, or brainstorming guidelines..."
                  className="w-full h-full bg-transparent border-none text-[13.5px] text-on-surface/90 placeholder:text-on-surface-variant/30 focus:outline-none resize-none leading-relaxed overflow-y-auto"
                />
              </div>

              {/* Editor Footer Visual Stats */}
              <div className="px-5 py-2.5 border-t border-white/[0.03] bg-[#131b2e]/15 shrink-0 flex items-center justify-between text-[10.5px] text-on-surface-variant/50 font-mono">
                <div className="flex gap-4">
                  <span>Words: <strong className="text-white">{getWordCount(activeNote.content)}</strong></span>
                  <span>Chars: <strong className="text-white">{getCharCount(activeNote.content)}</strong></span>
                  <span>Est. Read: <strong className="text-white">{getReadTime(activeNote.content)} min</strong></span>
                </div>
                <div>
                  <span className={`flex items-center gap-1.5 font-bold transition-opacity duration-300 ${
                    isSavedPulse ? 'opacity-100' : 'opacity-30'
                  }`}>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    DRAFT AUTO-SAVED
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <span className="material-symbols-outlined text-primary/10 text-[64px] mb-4">edit_note</span>
              <p className="text-[14px] text-on-surface-variant/50 font-medium">Select a note or deploy a new notebook</p>
              <button 
                onClick={addNote}
                className="mt-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-5 py-2 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Add Scratch Note
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
