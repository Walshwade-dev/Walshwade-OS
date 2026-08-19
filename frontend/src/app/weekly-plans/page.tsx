'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWeeklyPlans, createWeeklyPlan, fetchTasks, attachTaskToWeeklyPlan, WeeklyPlan } from '@/lib/api';
import { useState } from 'react';
import { CalendarDays, PlusCircle, Link as LinkIcon, LayoutGrid, Clock } from 'lucide-react';
import Modal from '@/components/Modal';

export default function WeeklyPlansPage() {
  const queryClient = useQueryClient();
  const [weekStartDate, setWeekStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan | null>(null);

  const { data: plans, isLoading, error } = useQuery({
    queryKey: ['weeklyPlans'],
    queryFn: fetchWeeklyPlans,
  });

  const { data: tasks } = useQuery({ queryKey: ['tasks'], queryFn: () => fetchTasks() });

  const createMutation = useMutation({
    mutationFn: createWeeklyPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyPlans'] });
      setWeekStartDate('');
      setNotes('');
    },
  });

  const attachMutation = useMutation({
    mutationFn: () => attachTaskToWeeklyPlan(selectedPlanId, selectedTaskId),
    onSuccess: () => {
      alert("System link established successfully");
      setSelectedPlanId('');
      setSelectedTaskId('');
    },
    onError: () => {
      alert("Link failed. Data connection might already exist.");
    }
  });

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ week_start_date: weekStartDate, notes });
  };

  const handleAttachTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlanId && selectedTaskId) {
      attachMutation.mutate();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-panel-border pb-6 flex items-center gap-4">
        <CalendarDays size={32} className="text-critical" />
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-critical to-orange-400">
            Weekly Planning
          </h1>
          <p className="text-slate-400 mt-1">Schedule focus blocks and attach critical tasks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-200">
            <PlusCircle size={20} className="text-critical" />
            Initialize Time Cycle
          </h3>
          <form onSubmit={handleCreatePlan} className="space-y-4 flex flex-col flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Cycle Start Date</label>
              <input 
                type="date" 
                className="glass-input" 
                value={weekStartDate} 
                onChange={e => setWeekStartDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Cycle Parameters (Optional)</label>
              <textarea 
                className="glass-input" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={3}
              />
            </div>
            <div className="flex justify-end pt-4 pr-6 pb-2 mt-auto">
              <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Processing...' : 'Create Cycle'}
              </button>
            </div>
          </form>
        </div>

        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-200">
            <LinkIcon size={20} className="text-primary" />
            Establish Data Link
          </h3>
          <form onSubmit={handleAttachTask} className="space-y-4 flex flex-col flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target Cycle</label>
              <select 
                className="glass-input" 
                value={selectedPlanId} 
                onChange={e => setSelectedPlanId(e.target.value)} 
                required
              >
                <option value="" disabled>Select Cycle</option>
                {plans?.map(p => (
                  <option key={p.id} value={p.id}>Week of {p.week_start_date}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Task Payload</label>
              <select 
                className="glass-input" 
                value={selectedTaskId} 
                onChange={e => setSelectedTaskId(e.target.value)} 
                required
              >
                <option value="" disabled>Select Payload</option>
                {tasks?.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end pt-4 pr-6 pb-2 mt-auto">
              <button type="submit" className="btn-primary" disabled={attachMutation.isPending}>
                {attachMutation.isPending ? 'Linking...' : 'Establish Link'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-wider mb-6 flex items-center gap-2">
          <LayoutGrid size={24} className="text-slate-400" />
          Active Cycles
        </h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-slate-800 rounded"></div>
            <div className="h-16 bg-slate-800 rounded"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-critical/20 border border-critical/50 text-critical rounded-lg">
            System Error: Unable to retrieve temporal data.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans?.map(plan => (
              <div 
                key={plan.id} 
                className="glass-panel p-5 cursor-pointer transition-colors"
                onClick={() => setSelectedPlan(plan)}
              >
                <h3 className="text-lg font-bold mb-3 text-slate-100 flex items-center gap-2">
                  <Clock size={16} className="text-critical" />
                  Cycle: {plan.week_start_date}
                </h3>
                {plan.notes && <p className="font-body text-sm text-slate-400 line-clamp-2">{plan.notes}</p>}
              </div>
            ))}
            {plans?.length === 0 && (
              <p className="text-slate-500 col-span-2 text-center py-8">No cycles found. Timeline empty.</p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title="Temporal Cycle Details">
        {selectedPlan && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
              <Clock size={20} className="text-critical" />
              Week of {selectedPlan.week_start_date}
            </h3>
            <div className="mt-4">
              <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-2">Cycle Parameters</h4>
              <p className="font-body text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded border border-slate-700 whitespace-pre-wrap">
                {selectedPlan.notes || "No parameters specified for this cycle."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
