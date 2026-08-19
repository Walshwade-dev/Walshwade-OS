'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, fetchGoals, createProject, Project } from '@/lib/api';
import { useState } from 'react';
import { FolderKanban, PlusCircle, LayoutGrid, Target } from 'lucide-react';
import Modal from '@/components/Modal';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
  });

  const { data: goals } = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setTitle('');
      setDescription('');
      setGoalId('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ title, description, goal_id: goalId, status: 'active' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-panel-border pb-6 flex items-center gap-4">
        <FolderKanban size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">
            Active Initiatives
          </h1>
          <p className="text-slate-400 mt-1">Manage ongoing projects mapped to your core domains.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-200">
          <PlusCircle size={20} className="text-primary" />
          Deploy New Project
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Project Code</label>
              <input 
                type="text" 
                className="glass-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target Objective</label>
              <select 
                className="glass-input" 
                value={goalId} 
                onChange={e => setGoalId(e.target.value)} 
                required
              >
                <option value="" disabled>Select Objective</option>
                {goals?.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Mission Profile (Optional)</label>
            <textarea 
              className="glass-input" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={3}
            />
          </div>
          <div className="flex justify-end pt-4 pr-6 pb-2">
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Processing...' : 'Deploy Project'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-wider mb-6 flex items-center gap-2">
          <LayoutGrid size={24} className="text-slate-400" />
          Active Initiatives
        </h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-slate-800 rounded"></div>
            <div className="h-24 bg-slate-800 rounded"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-critical/20 border border-critical/50 text-critical rounded-lg">
            System Error: Unable to retrieve project data.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects?.map(project => {
              const parentGoal = goals?.find(g => g.id === project.goal_id);
              return (
                <div 
                  key={project.id} 
                  className="glass-panel p-5 cursor-pointer transition-colors"
                  onClick={() => setSelectedProject(project)}
                >
                  <h3 className="text-lg font-bold mb-3 text-slate-100">{project.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="badge-sci border-slate-600 text-slate-300 flex items-center gap-1">
                      Status: {project.status}
                    </span>
                    {parentGoal && (
                      <span className="badge-sci border-primary/40 text-primary bg-primary/10 flex items-center gap-1">
                        <Target size={12} /> {parentGoal.domain}
                      </span>
                    )}
                  </div>
                  {project.description && <p className="font-body text-sm text-slate-400 leading-relaxed line-clamp-2">{project.description}</p>}
                </div>
              );
            })}
            {projects?.length === 0 && (
              <p className="text-slate-500 col-span-2 text-center py-8">No active initiatives found. Awaiting deployment.</p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title="Initiative Details">
        {selectedProject && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-100 tracking-wide">{selectedProject.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge-sci border-slate-600 text-slate-300 flex items-center gap-1">
                Status: {selectedProject.status}
              </span>
              {goals?.find(g => g.id === selectedProject.goal_id) && (
                <span className="badge-sci border-primary/40 text-primary bg-primary/10 flex items-center gap-1">
                  <Target size={14} /> Parent Objective: {goals?.find(g => g.id === selectedProject.goal_id)?.title}
                </span>
              )}
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-2">Mission Profile</h4>
              <p className="font-body text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded border border-slate-700 whitespace-pre-wrap">
                {selectedProject.description || "No specific mission profile provided."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
