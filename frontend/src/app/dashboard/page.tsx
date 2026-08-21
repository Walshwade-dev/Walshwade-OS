'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Zap, Clock, CalendarDays, CheckCircle } from 'lucide-react';
import { fetchDashboardKPIs, fetchWeeklyPlans } from '@/lib/api';

export default function DashboardPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  // Simple heuristic for start of week (last 7 days for now if no plan is selected)
  const d = new Date();
  d.setDate(d.getDate() - 7);
  const startStr = d.toISOString().split('T')[0];

  const [selectedWeeklyPlanId, setSelectedWeeklyPlanId] = useState<string>('');

  const { data: weeklyPlans } = useQuery({
    queryKey: ['weekly-plans'],
    queryFn: fetchWeeklyPlans,
  });

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis', startStr, todayStr, selectedWeeklyPlanId],
    queryFn: () => fetchDashboardKPIs(startStr, todayStr, selectedWeeklyPlanId || undefined),
  });

  if (isLoading) {
    return <div className="text-center text-slate-400 py-12">Booting analytics matrix...</div>;
  }

  const exec = kpis?.execution || {};
  const time = kpis?.time || {};
  const plan = kpis?.planning || {};

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-12">
      <div className="flex justify-between items-end border-b border-panel-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-slate-100 flex items-center gap-3">
            <Activity size={28} className="text-primary" />
            System Dashboard
          </h1>
          <p className="text-slate-400 mt-2">"Is the way I am working actually improving?"</p>
        </div>
        <div>
           <select 
             className="glass-input py-2 text-sm"
             value={selectedWeeklyPlanId}
             onChange={e => setSelectedWeeklyPlanId(e.target.value)}
           >
             <option value="">Default (Last 7 Days)</option>
             {weeklyPlans?.map(p => (
               <option key={p.id} value={p.id}>Week of {p.week_start_date}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Execution Group */}
      <section>
        <h2 className="text-xl font-bold tracking-wider text-slate-300 flex items-center gap-2 mb-6">
          <Zap size={20} className="text-primary" /> Execution Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Execution Reliability</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {Math.round((exec.execution_reliability || 0) * 100)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Completed + legitimately rescheduled vs total.</p>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Completion Rate</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {Math.round((exec.completion_rate || 0) * 100)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Strict completed tasks ratio.</p>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Schedule Adherence</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {Math.round((exec.schedule_adherence || 0) * 100)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Sessions completed out of scheduled.</p>
          </div>
        </div>
      </section>

      {/* Time Group */}
      <section>
        <h2 className="text-xl font-bold tracking-wider text-slate-300 flex items-center gap-2 mb-6">
          <Clock size={20} className="text-warning" /> Time Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Estimated vs Actual Variance</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {time.estimated_vs_actual_variance_minutes > 0 ? '+' : ''}
                {Math.round(time.estimated_vs_actual_variance_minutes || 0)}m
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Average drift from planned block duration.</p>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Average Task Overrun</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {((time.average_task_overrun_ratio || 1) * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Actual / Estimated duration ratio.</p>
          </div>
        </div>
      </section>

      {/* Planning Group */}
      <section>
        <h2 className="text-xl font-bold tracking-wider text-slate-300 flex items-center gap-2 mb-6">
          <CalendarDays size={20} className="text-green-500" /> Planning Metrics
        </h2>
        {!selectedWeeklyPlanId ? (
          <div className="glass-panel p-6 text-center text-slate-400">
            Select a specific Weekly Plan above to view Planning capacity metrics.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Planned Capacity</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                  {Math.round((plan.weekly_planned_capacity || 0) / 60)}h
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Total task estimation for the week.</p>
            </div>
            <div className="glass-panel p-6">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Used Capacity</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                  {Math.round((plan.weekly_used_capacity || 0) / 60)}h
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Total actual duration logged.</p>
            </div>
            <div className={`glass-panel p-6 ${plan.overcommitment ? 'border-critical bg-critical/10' : 'border-green-500/50 bg-green-500/10'}`}>
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Status</h3>
              <div className="flex items-baseline gap-2 mt-2">
                {plan.overcommitment ? (
                  <span className="text-2xl font-bold text-critical tracking-wider uppercase">Overcommitted</span>
                ) : (
                  <span className="text-2xl font-bold text-green-400 tracking-wider uppercase flex items-center gap-2">
                    <CheckCircle size={24} /> Within Limits
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
