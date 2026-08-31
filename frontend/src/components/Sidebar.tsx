'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Target, FolderKanban, CheckSquare, CalendarDays, Menu, Zap, Activity, FileText, BrainCircuit, BriefcaseBusiness, NotebookText, FileBadge, BookOpen } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const navItems = [
  { href: '/today', label: 'Today', icon: Zap },
  { href: '/dashboard', label: 'Dashboard', icon: Activity },
  { href: '/reviews', label: 'Reviews', icon: FileText },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/weekly-plans', label: 'Weekly Plans', icon: CalendarDays },
  { href: '/skills', label: 'Skills', icon: BrainCircuit },
  { href: '/career', label: 'Career', icon: BriefcaseBusiness },
  { href: '/content', label: 'Content', icon: NotebookText },
  { href: '/resume', label: 'Live Resume', icon: FileBadge },
  { href: '/blog', label: 'Public Blog', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-panel border-b border-panel-border relative before:absolute before:top-0 before:left-0 before:w-16 before:h-1 before:bg-warning">
        <Link href="/" className="flex whitespace-nowrap text-2xl font-black font-[family-name:var(--font-orbitron)] text-primary tracking-[0.2em] uppercase">
          WADE OS
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary p-3 -mr-2">
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar Content */}
      <aside className={clsx(
        "bg-panel border-r border-panel-border flex flex-col transition-transform duration-300 md:relative absolute z-50 h-full w-64 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:block relative before:absolute before:top-0 before:left-0 before:w-16 before:h-1 before:bg-warning overflow-hidden">
          <Link href="/" className="flex whitespace-nowrap text-3xl font-black font-[family-name:var(--font-orbitron)] text-primary tracking-[0.2em] uppercase">
            WADE OS
          </Link>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 sci-fi-nav-item transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-primary border-l-2 border-primary shadow-[inset_0_0_10px_rgba(14,165,233,0.2)]" 
                    : "text-foreground hover:bg-slate-800 hover:text-white hover:border-l-2 hover:border-warning"
                )}
              >
                <Icon size={20} className={isActive ? "animate-pulse" : ""} />
                <span className="font-semibold tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-panel-border text-xs text-slate-500 text-center uppercase tracking-widest">
          System Online
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
