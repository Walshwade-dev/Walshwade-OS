import Link from 'next/link';
import { Target, FolderKanban, CheckSquare, CalendarDays, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-6xl 2xl:max-w-screen-2xl mx-auto transition-all duration-300">
      <div className="mb-12 border-b border-panel-border pb-6 flex items-center gap-4">
        <Zap size={32} className="text-warning animate-pulse" />
        <div>
          <h1 className="text-4xl font-bold tracking-widest uppercase text-primary">
            System Dashboard
          </h1>
          <p className="text-slate-400 mt-2 tracking-wide">Operational overview and quick access links.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/goals" className="glass-panel p-6 flex flex-col items-center text-center group">
          <div className="p-4 rounded-full bg-slate-800/50 text-primary mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Target size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-wide uppercase text-slate-200 group-hover:text-primary transition-colors">Goals</h3>
          <p className="text-sm text-slate-400">Define high-level objectives and domains.</p>
        </Link>
        
        <Link href="/projects" className="glass-panel p-6 flex flex-col items-center text-center group">
          <div className="p-4 rounded-full bg-slate-800/50 text-primary mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <FolderKanban size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-wide uppercase text-slate-200 group-hover:text-primary transition-colors">Projects</h3>
          <p className="text-sm text-slate-400">Break goals down into actionable projects.</p>
        </Link>

        <Link href="/tasks" className="glass-panel p-6 flex flex-col items-center text-center group">
          <div className="p-4 rounded-full bg-slate-800/50 text-warning mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <CheckSquare size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-wide uppercase text-slate-200 group-hover:text-warning transition-colors">Tasks</h3>
          <p className="text-sm text-slate-400">Execute specific actions to move forward.</p>
        </Link>

        <Link href="/weekly-plans" className="glass-panel p-6 flex flex-col items-center text-center group">
          <div className="p-4 rounded-full bg-slate-800/50 text-critical mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(234,88,12,0.3)]">
            <CalendarDays size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-wide uppercase text-slate-200 group-hover:text-critical transition-colors">Weekly Plans</h3>
          <p className="text-sm text-slate-400">Strategize your week and attach tasks.</p>
        </Link>
      </div>
    </div>
  );
}
