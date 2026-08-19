'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, fetchProjects, createTask, Task } from '@/lib/api';
import { useState } from 'react';
import { CheckSquare, PlusCircle, LayoutGrid, AlertTriangle, Clock } from 'lucide-react';
import Modal from '@/components/Modal';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
  });

  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setTitle('');
      setDescription('');
      setProjectId('');
      setPriority('medium');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ title, description, project_id: projectId, priority, status: 'todo' });
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'critical': return 'text-critical border-critical/50 bg-critical/10';
      case 'high': return 'text-warning border-warning/50 bg-warning/10';
      case 'low': return 'text-slate-400 border-slate-600 bg-slate-800/50';
      default: return 'text-primary border-primary/40 bg-primary/10';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-panel-border pb-6 flex items-center gap-4">
        <CheckSquare size={32} className="text-warning" />
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-warning to-yellow-200">
            Task Queue
          </h1>
          <p className="text-slate-400 mt-1">Execute granular directives aligned with your initiatives.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-200">
          <PlusCircle size={20} className="text-warning" />
          Queue New Task
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Task Directive</label>
              <input 
                type="text" 
                className="glass-input" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Parent Initiative</label>
              <select 
                className="glass-input" 
                value={projectId} 
                onChange={e => setProjectId(e.target.value)} 
                required
              >
                <option value="" disabled>Select Initiative</option>
                {projects?.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Priority Level</label>
              <select 
                className="glass-input" 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
              >
                <option value="low">Low - Routine</option>
                <option value="medium">Medium - Standard</option>
                <option value="high">High - Elevated</option>
                <option value="critical">Critical - Immediate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Details (Optional)</label>
              <textarea 
                className="glass-input" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 pr-6 pb-2">
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Processing...' : 'Enqueue Task'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-wider mb-6 flex items-center gap-2">
          <LayoutGrid size={24} className="text-slate-400" />
          Active Queue
        </h2>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-slate-800 rounded"></div>
            <div className="h-16 bg-slate-800 rounded"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-critical/20 border border-critical/50 text-critical rounded-lg">
            System Error: Unable to retrieve task queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tasks?.map(task => {
              const parentProject = projects?.find(p => p.id === task.project_id);
              return (
                <div 
                  key={task.id} 
                  className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-primary hover:border-l-warning cursor-pointer transition-colors"
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      {task.priority === 'critical' && <AlertTriangle size={16} className="text-critical animate-pulse" />}
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`badge-sci ${getPriorityColor(task.priority)}`}>
                        Priority: {task.priority}
                      </span>
                      <span className="badge-sci border-slate-600 text-slate-300">
                        Status: {task.status}
                      </span>
                      {parentProject && (
                        <span className="badge-sci border-primary/40 text-primary bg-primary/10">
                          {parentProject.title}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.status !== 'done' && (
                    <button className="flex items-center gap-1 text-sm font-bold tracking-wider uppercase text-warning hover:text-primary transition-colors border border-panel-border hover:border-primary/50 px-3 py-2 rounded bg-slate-800/50" onClick={(e) => { e.stopPropagation(); /* TODO: execute task action */ }}>
                      <Clock size={16} /> Mark Active
                    </button>
                  )}
                </div>
              );
            })}
            {tasks?.length === 0 && (
              <p className="text-slate-500 text-center py-8">Queue empty. Ready for new directives.</p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} title="Task Details">
        {selectedTask && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-100 tracking-wide">{selectedTask.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`badge-sci ${getPriorityColor(selectedTask.priority)}`}>
                Priority: {selectedTask.priority}
              </span>
              <span className="badge-sci border-slate-600 text-slate-300">
                Status: {selectedTask.status}
              </span>
              {projects?.find(p => p.id === selectedTask.project_id) && (
                <span className="badge-sci border-primary/40 text-primary bg-primary/10">
                  Initiative: {projects?.find(p => p.id === selectedTask.project_id)?.title}
                </span>
              )}
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-2">Details</h4>
              <p className="text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded border border-slate-700 whitespace-pre-wrap">
                {selectedTask.description || "No specific details provided for this task."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
