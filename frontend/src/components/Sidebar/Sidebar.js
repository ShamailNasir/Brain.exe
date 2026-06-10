'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/', icon: 'grid_view', label: 'Dashboard' },
  { href: '/tasks', icon: 'task_alt', label: 'Task Workspace' },
  { href: '/calendar', icon: 'calendar_month', label: 'Calendar' },
  { href: '/notes', icon: 'edit_note', label: 'Memory Notebook' },
  { href: '/insights', icon: 'psychology', label: 'Study Insights' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);
    
    window.addEventListener('sidebar-toggle', handleToggle);
    // Auto-close sidebar on route/back button pop
    window.addEventListener('popstate', handleClose);
    
    return () => {
      window.removeEventListener('sidebar-toggle', handleToggle);
      window.removeEventListener('popstate', handleClose);
    };
  }, []);

  const handleDeepWork = () => {
    window.dispatchEvent(new Event('deep-work-toggle'));
    setIsOpen(false);
  };

  const handleLogOut = (e) => {
    e.preventDefault();
    localStorage.removeItem('quantum_token');
    router.push('/login');
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay for mobile screen */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full flex flex-col z-40 w-56 bg-background/95 border-r border-white/[0.02] select-none transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Header */}
        <div className="p-8 pb-6 flex justify-between items-center">
          <h1 className="font-headline-md text-[18px] text-on-surface tracking-tight flex items-center gap-2 font-bold">
            Brain.exe
          </h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* User profile details */}
        <div className="px-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover opacity-80 border border-white/10" 
                src="/katana_avatar.jpg"
              />
            </div>
            <div>
              <p className="font-body-md text-[12px] text-on-surface/80 font-medium">Shamail Nasir</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 flex flex-col gap-1 px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-4 py-2 flex items-center gap-3 transition-all ${
                  isActive 
                    ? 'text-primary bg-primary/5 font-semibold' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.02]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] font-light">
                  {item.icon}
                </span>
                <span className="font-body-md text-[13px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Button & Actions */}
        <div className="p-6 mt-auto">
          <button 
            onClick={handleDeepWork}
            className="w-full text-primary font-body-md text-[13px] py-2 rounded-lg hover:bg-primary/5 transition-all active:scale-95 font-medium flex justify-center items-center gap-2 cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:animate-pulse">
              bolt
            </span>
            Deep Work
          </button>
          
          <a 
            href="#" 
            onClick={handleLogOut}
            className="mt-4 text-on-surface-variant hover:text-on-surface px-4 py-2 flex justify-center items-center gap-2 transition-colors text-[12px] opacity-50 hover:opacity-100 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Log Out</span>
          </a>
        </div>
      </aside>
    </>
  );
}
