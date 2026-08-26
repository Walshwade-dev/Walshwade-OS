'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BriefcaseBusiness, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { fetchJobOpportunities, createJobOpportunity, updateJobOpportunityStatus, fetchJobSkillGap, JobOpportunity } from '@/lib/api';

export default function CareerPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [url, setUrl] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [gap, setGap] = useState<{ matched: string[]; missing: string[]; match_percentage: number } | null>(null);

  const { data: jobs, isLoading } = useQuery({ queryKey: ['jobs'], queryFn: fetchJobOpportunities });

  const mutation = useMutation({
    mutationFn: createJobOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setTitle('');
      setCompany('');
      setUrl('');
      setRequiredSkills('');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateJobOpportunityStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const openGap = async (job: JobOpportunity) => {
    setSelectedJob(job);
    const result = await fetchJobSkillGap(job.id);
    setGap(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title,
      company,
      url,
      required_skills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  const statusOptions = ['interested', 'applied', 'interviewing', 'rejected', 'offer', 'withdrawn'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-panel-border pb-6 flex items-center gap-4">
        <BriefcaseBusiness size={32} className="text-warning" />
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-warning">Career</h1>
          <p className="text-slate-400 mt-1">Track job opportunities and map your real skill readiness.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><PlusCircle size={20} className="text-warning" /> Add Job Opportunity</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={title} onChange={e => setTitle(e.target.value)} className="glass-input" placeholder="Role title" required />
            <input value={company} onChange={e => setCompany(e.target.value)} className="glass-input" placeholder="Company" required />
          </div>
          <input value={url} onChange={e => setUrl(e.target.value)} className="glass-input" placeholder="Job URL (optional)" />
          <input value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} className="glass-input" placeholder="Required skills (comma separated)" />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Create Opportunity'}</button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold mb-4">Tracked Opportunities</h3>
          {isLoading ? <p className="text-slate-400">Loading opportunities...</p> : (
            <div className="space-y-3">
              {jobs?.map(job => (
                <div key={job.id} className="p-4 rounded border border-panel-border bg-slate-900/40">
                  <div className="flex justify-between gap-3">
                    <button type="button" onClick={() => openGap(job)} className="text-left font-semibold text-slate-100 hover:text-primary">{job.title}</button>
                    <span className="text-xs uppercase tracking-wide text-warning">{job.status}</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{job.company}</div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.required_skills.map(skill => (
                      <span key={skill} className="badge-sci border-slate-600 text-slate-300">{skill}</span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <select value={job.status} onChange={e => statusMutation.mutate({ id: job.id, status: e.target.value })} className="glass-input py-2 text-sm">
                      {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {jobs?.length === 0 && <p className="text-slate-500">No opportunities recorded yet.</p>}
            </div>
          )}
        </div>

        <div className="glass-panel p-6">
          {selectedJob ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Skill Gap: {selectedJob.title}</h3>
              {gap ? (
                <div className="space-y-5">
                  <div className="text-3xl font-bold text-primary">{Math.round((gap.match_percentage || 0) * 100)}% match</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded border border-green-500/40 bg-green-500/10">
                      <div className="flex items-center gap-2 text-green-300 font-semibold mb-3"><CheckCircle size={18} /> Matched</div>
                      <div className="space-y-2 text-sm text-slate-200">
                        {gap.matched.length ? gap.matched.map(s => <div key={s}>{s}</div>) : <div className="text-slate-400">None</div>}
                      </div>
                    </div>
                    <div className="p-4 rounded border border-amber-500/40 bg-amber-500/10">
                      <div className="flex items-center gap-2 text-amber-300 font-semibold mb-3"><XCircle size={18} /> Missing</div>
                      <div className="space-y-2 text-sm text-slate-200">
                        {gap.missing.length ? gap.missing.map(s => <div key={s}>{s}</div>) : <div className="text-slate-400">None</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : <p className="text-slate-400">Loading gap analysis...</p>}
            </>
          ) : (
            <div className="text-slate-500 pt-10 text-center">Select a job to view its skill match profile.</div>
          )}
        </div>
      </div>
    </div>
  );
}
