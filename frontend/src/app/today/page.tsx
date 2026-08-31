'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, Square, Zap, Clock, AlertTriangle, X } from 'lucide-react';
import { 
  fetchTodaySchedule, 
  fetchActiveSession, 
  generateSchedule, 
  createSession, 
  startSession, 
  pauseSession,
  resumeSession,
  completeSession,
  createFailure,
  addCorrectiveAction,
  TimeBlock,
  WorkSession,
  FailureType,
  submitDailyReview
} from '@/lib/api';
import Modal from '@/components/Modal';

export default function TodayPage() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [overcommittedTasks, setOvercommittedTasks] = useState<string[]>([]);
  
  // Failure Modal State
  const [failureModalState, setFailureModalState] = useState<{isOpen: boolean, sessionId: string, taskId: string, type: 'fail' | 'reschedule'}>({ isOpen: false, sessionId: '', taskId: '', type: 'fail' });
  const [failureType, setFailureType] = useState<FailureType>('other');
  const [failureDescription, setFailureDescription] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');

  const [showEODReview, setShowEODReview] = useState(false);
  const [eodReviewNotes, setEodReviewNotes] = useState('');

  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['today-schedule'],
    queryFn: fetchTodaySchedule,
  });

  const { data: activeSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['active-session'],
    queryFn: fetchActiveSession,
  });

  const generateMutation = useMutation({
    mutationFn: (date: string) => generateSchedule(date),
    onSuccess: (data) => {
      if (data.message && data.message.includes("No active weekly plan")) {
        alert(data.message);
      } else {
        setOvercommittedTasks(data.unscheduled_task_ids);
        queryClient.invalidateQueries({ queryKey: ['today-schedule'] });
      }
      setIsGenerating(false);
    },
    onError: () => setIsGenerating(false)
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    const todayStr = new Date().toISOString().split('T')[0];
    generateMutation.mutate(todayStr);
  };

  const createAndStartMutation = useMutation({
    mutationFn: async (timeBlockId: string) => {
      const session = await createSession(timeBlockId);
      return startSession(session.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
    }
  });

  const actionMutation = useMutation({
    mutationFn: async ({ action, sessionId }: { action: 'pause' | 'resume' | 'complete', sessionId: string }) => {
      if (action === 'pause') return pauseSession(sessionId);
      if (action === 'resume') return resumeSession(sessionId);
      if (action === 'complete') return completeSession(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
    }
  });

  const failureMutation = useMutation({
    mutationFn: async () => {
      const { sessionId, taskId, type } = failureModalState;
      
      const failure = await createFailure({
        task_id: taskId,
        session_id: sessionId,
        failure_type: failureType,
        description: failureDescription || "No description provided"
      });

      if (type === 'reschedule' && correctiveAction) {
        await addCorrectiveAction(failure.id, {
          description: correctiveAction
        });
      }
      return failure;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      setFailureModalState({ isOpen: false, sessionId: '', taskId: '', type: 'fail' });
      setFailureType('other');
      setFailureDescription('');
      setCorrectiveAction('');
    }
  });

  const eodMutation = useMutation({
    mutationFn: async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      return submitDailyReview({
        review_date: todayStr,
        summary: eodReviewNotes
      });
    },
    onSuccess: () => {
      setShowEODReview(false);
      alert('Day review saved!');
    }
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeSession) return;
    
    const calculateElapsed = () => {
      if (!activeSession.started_at) return 0;
      
      let totalElapsed = 0;
      // Add 'Z' to ensure it's parsed as UTC if the backend didn't append it
      const startStr = activeSession.started_at.endsWith('Z') ? activeSession.started_at : activeSession.started_at + 'Z';
      const start = new Date(startStr).getTime();
      const now = new Date().getTime();
      
      totalElapsed = Math.floor((now - start) / 1000);
      totalElapsed -= activeSession.paused_total_seconds;
      
      if (activeSession.status === 'paused' && activeSession.last_paused_at) {
        const lastPausedStr = activeSession.last_paused_at.endsWith('Z') ? activeSession.last_paused_at : activeSession.last_paused_at + 'Z';
        const lastPaused = new Date(lastPausedStr).getTime();
        totalElapsed -= Math.floor((now - lastPaused) / 1000);
      }
      
      return Math.max(0, totalElapsed);
    };

    setElapsedSeconds(calculateElapsed());

    if (activeSession.status === 'started') {
      const interval = setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  if (scheduleLoading || sessionLoading) {
    return <div className="text-center text-slate-400 py-12">Booting scheduling matrices...</div>;
  }

  const getSessionForBlock = (block: TimeBlock): WorkSession | undefined => {
    return block.work_sessions?.length ? block.work_sessions[block.work_sessions.length - 1] : undefined;
  };
  
  const isEndOfDay = schedule && schedule.length > 0 && !activeSession && schedule.every(b => {
    const s = getSessionForBlock(b);
    return s && ['completed', 'failed', 'rescheduled'].includes(s.status);
  });

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8 border-b border-panel-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-slate-100 flex items-center gap-3">
            <Zap size={28} className="text-warning" />
            Today's Directives
          </h1>
          <p className="text-slate-400 mt-2">Active schedule and execution environment.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary flex items-center gap-2"
        >
          {isGenerating ? 'Compiling...' : 'Generate Schedule'}
        </button>
      </div>

      {isEndOfDay && (
        <div className="mb-8 p-6 glass-panel border-primary/50 text-center">
          <h2 className="text-2xl font-bold tracking-widest uppercase text-primary mb-2">All Directives Addressed</h2>
          <p className="text-slate-400 mb-6">You have reached the end of today's schedule. Time to reflect.</p>
          <button onClick={() => setShowEODReview(true)} className="btn-primary px-8">
            Complete End of Day Review
          </button>
        </div>
      )}

      {overcommittedTasks.length > 0 && (
        <div className="mb-8 p-4 bg-critical/10 border border-critical rounded-lg flex gap-4 items-start">
          <AlertTriangle className="text-critical shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-critical tracking-wider uppercase">Capacity Limit Reached</h3>
            <p className="text-sm text-critical/80 mt-1 font-body">
              {overcommittedTasks.length} task(s) could not fit into today's {360 / 60}-hour capacity block. They remain in your active queue.
            </p>
          </div>
        </div>
      )}

      {/* Active Session Highlight */}
      {activeSession && (
        <div className="mb-12">
          <h2 className="text-sm font-bold tracking-wider text-primary uppercase mb-4">Active Right Now</h2>
          <div className="glass-panel p-6 bg-primary/5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold px-2 py-1 bg-primary/20 text-primary rounded mb-3 inline-block uppercase tracking-wider">
                  {activeSession.status}
                </span>
                <h3 className="text-xl font-bold text-slate-100">{activeSession.task?.title || 'Unknown Task'}</h3>
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={14}/> Planned: {activeSession.planned_duration_minutes}m</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4">
                <div className="text-5xl font-[family-name:var(--font-orbitron)] font-bold text-warning tabular-nums tracking-widest">
                  {formatTime(elapsedSeconds)}
                </div>
                <div className="flex gap-2">
                  {activeSession.status === 'started' && (
                    <button onClick={() => actionMutation.mutate({ action: 'pause', sessionId: activeSession.id })} className="p-3 bg-slate-800 text-warning rounded hover:bg-slate-700 transition-colors" title="Pause">
                      <Pause size={20} />
                    </button>
                  )}
                  {activeSession.status === 'paused' && (
                    <button onClick={() => actionMutation.mutate({ action: 'resume', sessionId: activeSession.id })} className="p-3 bg-slate-800 text-primary rounded hover:bg-slate-700 transition-colors" title="Resume">
                      <Play size={20} />
                    </button>
                  )}
                  {(activeSession.status === 'started' || activeSession.status === 'paused') && (
                    <button onClick={() => actionMutation.mutate({ action: 'complete', sessionId: activeSession.id })} className="p-3 bg-slate-800 text-green-500 rounded hover:bg-slate-700 transition-colors" title="Complete">
                      <Square size={20} />
                    </button>
                  )}
                  <button onClick={() => setFailureModalState({ isOpen: true, sessionId: activeSession.id, taskId: activeSession.task_id, type: 'fail' })} className="p-3 bg-slate-800 text-critical rounded hover:bg-slate-700 transition-colors" title="Fail">
                      <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase mb-4">Scheduled Blocks</h2>
        
        {schedule?.length === 0 ? (
          <div className="text-center py-12 glass-panel text-slate-400">
            No directives scheduled for today. Generate a schedule to begin.
          </div>
        ) : (
          schedule?.map(block => {
            const session = getSessionForBlock(block);
            const isCompleted = session?.status === 'completed';
            
            return (
              <div key={block.id} className={`glass-panel p-5 flex flex-col md:flex-row gap-6 items-start md:items-center ${isCompleted ? 'opacity-50' : ''}`}>
                {/* Time Rail */}
                <div className="flex flex-col items-center md:items-end min-w-[100px] text-slate-400 font-mono">
                  <span className="text-lg font-bold text-slate-200">{block.start_time.substring(0,5)}</span>
                  <span className="text-xs">{block.end_time.substring(0,5)}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-100">{block.task?.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span className="bg-slate-800 px-2 py-1 rounded">{block.planned_duration_minutes}m</span>
                    {session && <span className={`px-2 py-1 rounded ${session.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'}`}>{session.status}</span>}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex gap-2">
                  {!session && !activeSession && (
                    <button 
                      onClick={() => createAndStartMutation.mutate(block.id)}
                      className="px-4 py-2 bg-slate-800 text-primary font-bold tracking-wider uppercase text-xs rounded hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Play size={14} /> Start
                    </button>
                  )}
                  {session?.status === 'started' && (
                    <button onClick={() => actionMutation.mutate({ action: 'pause', sessionId: session.id })} className="p-2 bg-slate-800 text-warning rounded hover:bg-slate-700 transition-colors">
                      <Pause size={16} />
                    </button>
                  )}
                  {session?.status === 'paused' && (
                    <button onClick={() => actionMutation.mutate({ action: 'resume', sessionId: session.id })} className="p-2 bg-slate-800 text-primary rounded hover:bg-slate-700 transition-colors">
                      <Play size={16} />
                    </button>
                  )}
                  {(session?.status === 'started' || session?.status === 'paused') && (
                    <button onClick={() => actionMutation.mutate({ action: 'complete', sessionId: session.id })} className="p-2 bg-slate-800 text-green-500 rounded hover:bg-slate-700 transition-colors">
                      <Square size={16} />
                    </button>
                  )}
                  {session && ['started', 'paused', 'ready', 'scheduled'].includes(session.status) && (
                     <button onClick={() => setFailureModalState({ isOpen: true, sessionId: session.id, taskId: block.task_id, type: 'reschedule' })} className="p-2 bg-slate-800 text-slate-500 rounded hover:bg-slate-700 transition-colors" title="Reschedule">
                       <X size={16} />
                     </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Failure Taxonomy Modal Overlay */}
      {failureModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 relative">
             <h2 className="text-xl font-bold uppercase mb-4 text-slate-100">
               {failureModalState.type === 'fail' ? 'Record Failure' : 'Reschedule Directive'}
             </h2>
             <p className="text-sm text-slate-400 mb-6">
               Please classify the reason for this outcome to maintain analytics integrity.
             </p>
             <div className="mb-4">
               <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Failure Type</label>
               <select 
                  className="glass-input" 
                  value={failureType} 
                  onChange={e => setFailureType(e.target.value as FailureType)}
               >
                 <option value="poor_estimation">Poor Estimation</option>
                 <option value="lack_of_knowledge">Lack of Knowledge</option>
                 <option value="task_too_difficult">Task Too Difficult</option>
                 <option value="task_unclear">Task Unclear</option>
                 <option value="distraction">Distraction</option>
                 <option value="fatigue">Fatigue</option>
                 <option value="unexpected_responsibility">Unexpected Responsibility</option>
                 <option value="procrastination">Procrastination</option>
                 <option value="technical_problem">Technical Problem</option>
                 <option value="emotional_resistance">Emotional Resistance</option>
                 <option value="scheduling_problem">Scheduling Problem</option>
                 <option value="missing_dependency">Missing Dependency</option>
                 <option value="other">Other</option>
               </select>
             </div>
             <div className="mb-4">
               <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">What happened? (Description)</label>
               <textarea 
                  className="glass-input h-24 resize-none" 
                  placeholder="Details..."
                  value={failureDescription}
                  onChange={e => setFailureDescription(e.target.value)}
               />
             </div>
             
             {failureModalState.type === 'reschedule' && (
               <div className="mb-6">
                 <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Corrective Action</label>
                 <p className="text-xs text-slate-400 mb-2">To legitimately reschedule this task (rather than fail it), you must record what will change.</p>
                 <textarea 
                    className="glass-input h-20 resize-none border-warning/50" 
                    placeholder="E.g., Break this down into smaller tasks, clear my calendar for 2 hours..."
                    value={correctiveAction}
                    onChange={e => setCorrectiveAction(e.target.value)}
                 />
               </div>
             )}

             <div className="flex justify-end gap-3 mt-6">
               <button onClick={() => setFailureModalState({ isOpen: false, sessionId: '', taskId: '', type: 'fail' })} className="px-4 py-2 rounded text-slate-400 hover:text-white">Cancel</button>
               <button 
                 onClick={() => failureMutation.mutate()} 
                 disabled={failureMutation.isPending}
                 className="btn-primary"
               >
                 Confirm
               </button>
             </div>
          </div>
        </div>
      )}

      {/* EOD Review Modal */}
      {showEODReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 relative">
             <h2 className="text-xl font-bold uppercase mb-4 text-slate-100">End of Day Review</h2>
             <p className="text-sm text-slate-400 mb-6">
               Capture your thoughts on today's execution. Was it productive? Were there patterns in failures?
             </p>
             <div className="mb-6">
               <textarea 
                  className="glass-input h-32 resize-none" 
                  placeholder="Reflection notes..."
                  value={eodReviewNotes}
                  onChange={e => setEodReviewNotes(e.target.value)}
               />
             </div>
             <div className="flex justify-end gap-3">
               <button onClick={() => setShowEODReview(false)} className="px-4 py-2 rounded text-slate-400 hover:text-white">Close</button>
               <button 
                 onClick={() => eodMutation.mutate()} 
                 disabled={eodMutation.isPending}
                 className="btn-primary"
               >
                 Save Review
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
