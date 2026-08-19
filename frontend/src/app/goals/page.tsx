'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGoals, createGoal, Goal } from '@/lib/api';
import { useState } from 'react';
import { Target, PlusCircle, LayoutGrid, Activity } from 'lucide-react';
import Modal from '@/components/Modal';

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('general');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const { data: goals, isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  });

  const mutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setTitle('');
      setDescription('');
      setDomain('general');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ title, description, domain, status: 'active' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-panel-border pb-6 flex items-center gap-4">
        <Target size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">
            Strategic Goals
          </h1>
          <p className="text-slate-400 mt-1">Define and track your high-level domains.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-200">
          <PlusCircle size={20} className="text-primary" />
          Initialize New Goal
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
              <input 
                type="text" 
                className="glass-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="e.g. Master AI Development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Domain</label>
              <select className="glass-input" value={domain} onChange={e => setDomain(e.target.value)}>
                <option value="software">Software</option>
                <option value="ai">AI</option>
                <option value="networking">Networking</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="business">Business</option>
                <option value="finance">Finance</option>
                <option value="communication">Communication</option>
                <option value="confidence">Confidence</option>
                <option value="brand">Brand</option>
                <option value="career">Career</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
            <textarea 
              className="glass-input" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3}
              placeholder="Detailed parameters of this objective..."
            />
          </div>
          <div className="flex justify-end pt-4 pr-6 pb-2">
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Processing...' : 'Execute Genesis'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-wider mb-6 flex items-center gap-2">
          <LayoutGrid size={24} className="text-slate-400" />
          Active Database
        </h2>
        
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-critical/20 border border-critical/50 text-critical rounded-lg">
            System Error: Unable to retrieve databanks.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals?.map(goal => (
              <div 
                key={goal.id} 
                className="glass-panel p-5 border-l-4 border-l-primary hover:border-l-warning cursor-pointer transition-colors"
                onClick={() => setSelectedGoal(goal)}
              >
                <h3 className="text-lg font-bold mb-3 text-slate-100">{goal.title}</h3>
                <div className="flex gap-2 mb-4">
                  <span className="badge-sci border-primary/40 text-primary bg-primary/10 flex items-center gap-1">
                    <Target size={12} /> {goal.domain}
                  </span>
                  <span className="badge-sci border-slate-600 text-slate-300 flex items-center gap-1">
                    <Activity size={12} /> {goal.status}
                  </span>
                </div>
                {goal.description && <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{goal.description}</p>}
              </div>
            ))}
            {goals?.length === 0 && (
              <p className="text-slate-500 col-span-2 text-center py-8">No objectives found. System idle.</p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedGoal} onClose={() => setSelectedGoal(null)} title="Objective Details">
        {selectedGoal && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-100 tracking-wide">{selectedGoal.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge-sci border-primary/40 text-primary bg-primary/10 flex items-center gap-1">
                <Target size={14} /> Domain: {selectedGoal.domain}
              </span>
              <span className="badge-sci border-slate-600 text-slate-300 flex items-center gap-1">
                <Activity size={14} /> Status: {selectedGoal.status}
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-2">Description / Parameters</h4>
              <p className="text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded border border-slate-700 whitespace-pre-wrap">
                {selectedGoal.description || "No specific details provided for this objective."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
