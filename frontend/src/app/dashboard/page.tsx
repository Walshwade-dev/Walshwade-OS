'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Zap, Clock, CalendarDays, CheckCircle, Trash2, PencilLine } from 'lucide-react';
import { fetchDashboardKPIs, fetchWeeklyPlans, fetchGoals, fetchProjects, fetchTasks, updateGoal, updateProject, updateTask, deleteGoal, deleteProject, deleteTask, Goal, Project, Task } from '@/lib/api';

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

  const { data: goals = [] } = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => fetchProjects() });
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => fetchTasks() });

  const queryClient = useQueryClient();
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [goalDraft, setGoalDraft] = useState<Partial<Goal>>({});
  const [projectDraft, setProjectDraft] = useState<Partial<Project>>({});
  const [taskDraft, setTaskDraft] = useState<Partial<Task>>({});

  const saveGoal = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) => updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setEditingGoalId(null);
      setGoalDraft({});
    },
  });

  const saveProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProjectId(null);
      setProjectDraft({});
    },
  });

  const saveTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTaskId(null);
      setTaskDraft({});
    },
  });

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id).then(() => queryClient.invalidateQueries({ queryKey: ['goals'] }));
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id).then(() => queryClient.invalidateQueries({ queryKey: ['projects'] }));
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id).then(() => queryClient.invalidateQueries({ queryKey: ['tasks'] }));
  };

  if (isLoading) {
    return <div className="text-center text-slate-400 py-12">Booting analytics matrix...</div>;
  }

  const exec = kpis?.execution || {};
  const time = kpis?.time || {};
  const plan = kpis?.planning || {};
  const learning = kpis?.learning || {};
  const career = kpis?.career || {};

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

      <section>
        <h2 className="text-xl font-bold tracking-wider text-slate-300 flex items-center gap-2 mb-6">
          <Zap size={20} className="text-violet-500" /> Learning Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Learning Hours</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {Number(learning.learning_hours || 0).toFixed(1)}h
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Total completed learning time within the period.</p>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Evidence Produced</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {learning.evidence_produced || 0}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Count of skill evidence entries logged.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold tracking-wider text-slate-300 flex items-center gap-2 mb-6">
          <CalendarDays size={20} className="text-amber-500" /> Career Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Relevant Opportunities</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {career.relevant_opportunities || 0}
              </span>
            </div>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Applications</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {career.applications || 0}
              </span>
            </div>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-2">Avg Skill Gap</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[family-name:var(--font-orbitron)] font-bold text-slate-100">
                {Number(career.avg_skill_gap || 0) * 100}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="border-b border-panel-border pb-4">
          <h2 className="text-xl font-bold tracking-wider text-slate-300 flex items-center gap-2">
            <PencilLine size={20} className="text-primary" /> Live Record Editor
          </h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Goals</h3>
            {goals.length === 0 ? <p className="text-slate-500">No goals.</p> : goals.slice(0, 4).map(goal => (
              <div key={goal.id} className="rounded border border-panel-border bg-slate-900/40 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm text-slate-100">{goal.title}</strong>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingGoalId(goal.id); setGoalDraft(goal); }} className="text-primary"><PencilLine size={14} /></button>
                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-critical"><Trash2 size={14} /></button>
                  </div>
                </div>
                {editingGoalId === goal.id && (
                  <div className="space-y-2">
                    <input className="glass-input w-full" value={goalDraft.title ?? ''} onChange={e => setGoalDraft(prev => ({ ...prev, title: e.target.value }))} />
                    <textarea className="glass-input w-full" value={goalDraft.description ?? ''} onChange={e => setGoalDraft(prev => ({ ...prev, description: e.target.value }))} rows={2} />
                    <select className="glass-input w-full" value={goalDraft.status ?? 'active'} onChange={e => setGoalDraft(prev => ({ ...prev, status: e.target.value as any }))}>
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="completed">completed</option>
                      <option value="abandoned">abandoned</option>
                    </select>
                    <button onClick={() => saveGoal.mutate({ id: goal.id, data: goalDraft })} className="btn-primary w-full">Save Goal</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Projects</h3>
            {projects.length === 0 ? <p className="text-slate-500">No projects.</p> : projects.slice(0, 4).map(project => (
              <div key={project.id} className="rounded border border-panel-border bg-slate-900/40 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm text-slate-100">{project.title}</strong>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingProjectId(project.id); setProjectDraft(project); }} className="text-primary"><PencilLine size={14} /></button>
                    <button onClick={() => handleDeleteProject(project.id)} className="text-critical"><Trash2 size={14} /></button>
                  </div>
                </div>
                {editingProjectId === project.id && (
                  <div className="space-y-2">
                    <input className="glass-input w-full" value={projectDraft.title ?? ''} onChange={e => setProjectDraft(prev => ({ ...prev, title: e.target.value }))} />
                    <textarea className="glass-input w-full" value={projectDraft.description ?? ''} onChange={e => setProjectDraft(prev => ({ ...prev, description: e.target.value }))} rows={2} />
                    <select className="glass-input w-full" value={projectDraft.status ?? 'active'} onChange={e => setProjectDraft(prev => ({ ...prev, status: e.target.value as any }))}>
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="completed">completed</option>
                      <option value="abandoned">abandoned</option>
                    </select>
                    <button onClick={() => saveProject.mutate({ id: project.id, data: projectDraft })} className="btn-primary w-full">Save Project</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Tasks</h3>
            {tasks.length === 0 ? <p className="text-slate-500">No tasks.</p> : tasks.slice(0, 4).map(task => (
              <div key={task.id} className="rounded border border-panel-border bg-slate-900/40 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-sm text-slate-100">{task.title}</strong>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingTaskId(task.id); setTaskDraft(task); }} className="text-primary"><PencilLine size={14} /></button>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-critical"><Trash2 size={14} /></button>
                  </div>
                </div>
                {editingTaskId === task.id && (
                  <div className="space-y-2">
                    <input className="glass-input w-full" value={taskDraft.title ?? ''} onChange={e => setTaskDraft(prev => ({ ...prev, title: e.target.value }))} />
                    <textarea className="glass-input w-full" value={taskDraft.description ?? ''} onChange={e => setTaskDraft(prev => ({ ...prev, description: e.target.value }))} rows={2} />
                    <button onClick={() => saveTask.mutate({ id: task.id, data: taskDraft })} className="btn-primary w-full">Save Task</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
