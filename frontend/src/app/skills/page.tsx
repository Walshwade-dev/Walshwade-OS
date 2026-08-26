'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BrainCircuit, PlusCircle, FileText, Link as LinkIcon } from 'lucide-react';
import { fetchSkills, createSkill, fetchSkillEvidence, createSkillEvidence, Skill } from '@/lib/api';

export default function SkillsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('general');
  const [proficiencyLevel, setProficiencyLevel] = useState('developing');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');

  const { data: skills, isLoading } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills });
  const { data: evidence } = useQuery({
    queryKey: ['skill-evidence', selectedSkill?.id],
    queryFn: () => selectedSkill ? fetchSkillEvidence(selectedSkill.id) : Promise.resolve([]),
    enabled: !!selectedSkill,
  });

  const skillMutation = useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setName('');
      setDomain('general');
      setProficiencyLevel('developing');
    },
  });

  const evidenceMutation = useMutation({
    mutationFn: createSkillEvidence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-evidence', selectedSkill?.id] });
      setEvidenceTitle('');
      setEvidenceUrl('');
      setEvidenceDescription('');
    },
  });

  const handleSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    skillMutation.mutate({ name, domain, proficiency_level: proficiencyLevel });
  };

  const handleEvidenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;
    evidenceMutation.mutate({
      skill_id: selectedSkill.id,
      title: evidenceTitle,
      description: evidenceDescription,
      evidence_url: evidenceUrl,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-panel-border pb-6 flex items-center gap-4">
        <BrainCircuit size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-primary">Skills</h1>
          <p className="text-slate-400 mt-1">Track capability, evidence, and real proof of growth.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><PlusCircle size={20} className="text-primary" /> Add a Skill</h3>
        <form onSubmit={handleSkillSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Skill name" className="glass-input" required />
          <select value={domain} onChange={e => setDomain(e.target.value)} className="glass-input">
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
          <select value={proficiencyLevel} onChange={e => setProficiencyLevel(e.target.value)} className="glass-input">
            <option value="novice">Novice</option>
            <option value="developing">Developing</option>
            <option value="competent">Competent</option>
            <option value="proficient">Proficient</option>
            <option value="expert">Expert</option>
          </select>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" className="btn-primary" disabled={skillMutation.isPending}>{skillMutation.isPending ? 'Saving...' : 'Create Skill'}</button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold mb-4">Recorded Skills</h3>
          {isLoading ? <p className="text-slate-400">Loading skills...</p> : (
            <div className="space-y-3">
              {skills?.map(skill => (
                <button key={skill.id} type="button" onClick={() => setSelectedSkill(skill)} className="w-full text-left p-4 rounded border border-panel-border hover:border-primary/40 bg-slate-900/40">
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold text-slate-100">{skill.name}</span>
                    <span className="text-xs uppercase tracking-wide text-primary">{skill.proficiency_level}</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{skill.domain}</div>
                </button>
              ))}
              {skills?.length === 0 && <p className="text-slate-500">No skills logged yet.</p>}
            </div>
          )}
        </div>

        <div className="glass-panel p-6">
          {selectedSkill ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Evidence for {selectedSkill.name}</h3>
              <form onSubmit={handleEvidenceSubmit} className="space-y-3 mb-6">
                <input value={evidenceTitle} onChange={e => setEvidenceTitle(e.target.value)} className="glass-input" placeholder="Evidence title" required />
                <input value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} className="glass-input" placeholder="Evidence URL or repo link" />
                <textarea value={evidenceDescription} onChange={e => setEvidenceDescription(e.target.value)} className="glass-input" rows={3} placeholder="Short description" />
                <button type="submit" className="btn-primary" disabled={evidenceMutation.isPending}>{evidenceMutation.isPending ? 'Saving...' : 'Add Evidence'}</button>
              </form>

              <div className="space-y-3">
                {evidence?.map(item => (
                  <div key={item.id} className="p-4 rounded border border-panel-border bg-slate-900/40">
                    <div className="flex items-center gap-2 text-slate-100 font-semibold"><FileText size={16} className="text-primary" /> {item.title}</div>
                    {item.evidence_url && (
                      <a href={item.evidence_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"><LinkIcon size={14} /> {item.evidence_url}</a>
                    )}
                    {item.description && <p className="mt-3 text-sm text-slate-400">{item.description}</p>}
                  </div>
                ))}
                {evidence?.length === 0 && <p className="text-slate-500">No evidence linked yet.</p>}
              </div>
            </>
          ) : (
            <div className="text-slate-500 pt-10 text-center">Select a skill to attach evidence.</div>
          )}
        </div>
      </div>
    </div>
  );
}
