'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSkills, fetchSkillEvidence, fetchContentItems, fetchGoals, fetchProjects, Skill, SkillEvidence, ContentItem, Goal, Project } from '@/lib/api';
import { Share2, FileBadge, Award, CheckCircle2, BookOpen, Target, ExternalLink, Printer } from 'lucide-react';
import { useState } from 'react';

export default function ResumePage() {
  const [copied, setCopied] = useState(false);

  const { data: skills } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills });
  const { data: evidence } = useQuery({ queryKey: ['skill-evidence'], queryFn: () => fetchSkillEvidence() });
  const { data: publishedContent } = useQuery({ queryKey: ['content-items', 'published'], queryFn: () => fetchContentItems('published') });
  const { data: goals } = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Action Header */}
      <div className="border-b border-panel-border pb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <FileBadge size={36} className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-300 to-warning">
              Live Verified Resume & Profile
            </h1>
            <p className="text-slate-400 mt-1">Real-time auto-updating profile generated from verified learning & execution data.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={copyShareLink} 
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Share2 size={16} />
            {copied ? 'URL Copied to Clipboard!' : 'Share Resume URL'}
          </button>
          <button 
            onClick={handlePrint} 
            className="glass-panel px-4 py-2 hover:border-primary text-slate-300 hover:text-white transition-all text-sm flex items-center gap-2"
          >
            <Printer size={16} />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Main Resume Container */}
      <div className="glass-panel p-8 space-y-10 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Executive Bio */}
        <div className="border-b border-panel-border pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-100 tracking-wide">Walsh Wade</h2>
              <p className="text-lg text-primary font-medium mt-1">Backend Engineer & API Systems Specialist</p>
            </div>
            <div className="px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-mono tracking-wider uppercase">
              Live Auto-Updated Profile
            </div>
          </div>
          <p className="mt-4 text-slate-300 leading-relaxed font-body">
            Specializing in designing, consuming, securing, and integrating APIs across Node.js and Python/FastAPI applications. 
            Demonstrated mastery in HTTP protocols, RESTful architecture, webhook events, rate-limiting, authentication (OAuth2/JWT/API Keys), and microservice integration.
          </p>
        </div>

        {/* Verified Skills Matrix */}
        <div>
          <h3 className="text-xl font-bold tracking-wider mb-6 flex items-center gap-2 text-slate-200 uppercase">
            <Award size={22} className="text-primary" /> Verified Competency Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills?.map((skill: Skill) => (
              <div key={skill.id} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-100">{skill.name}</span>
                  <span className="text-xs uppercase px-2 py-0.5 rounded bg-primary/20 text-primary font-mono">
                    {skill.proficiency_level}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">Domain: {skill.domain}</div>
              </div>
            ))}
            {(!skills || skills.length === 0) && (
              <p className="text-slate-500 col-span-3 text-center py-4">No skills recorded yet. Complete tasks to auto-populate your skills matrix.</p>
            )}
          </div>
        </div>

        {/* Verified Artifacts & Evidence */}
        <div>
          <h3 className="text-xl font-bold tracking-wider mb-6 flex items-center gap-2 text-slate-200 uppercase">
            <CheckCircle2 size={22} className="text-green-400" /> Verified Skill Evidence & Deliverables
          </h3>
          <div className="space-y-4">
            {evidence?.map((item: SkillEvidence) => (
              <div key={item.id} className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-100 text-lg">{item.title}</h4>
                  {item.description && <p className="text-sm text-slate-400 mt-1 font-body leading-relaxed">{item.description}</p>}
                </div>
                {item.evidence_url && (
                  <a 
                    href={item.evidence_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn-primary py-2 px-4 text-xs flex items-center gap-1 shrink-0"
                  >
                    View Deliverable <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
            {(!evidence || evidence.length === 0) && (
              <p className="text-slate-500 text-center py-4">No evidence items logged yet. Attach project links to skills to display them here.</p>
            )}
          </div>
        </div>

        {/* Published Writings & Articles */}
        <div>
          <h3 className="text-xl font-bold tracking-wider mb-6 flex items-center gap-2 text-slate-200 uppercase">
            <BookOpen size={22} className="text-warning" /> Published Engineering Articles & Knowledge Base
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedContent?.map((item: ContentItem) => (
              <div key={item.id} className="p-5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-warning font-mono">Published Article</span>
                  <h4 className="font-bold text-slate-100 text-lg mt-1">{item.title}</h4>
                  {item.description && <p className="text-sm text-slate-400 mt-2 line-clamp-3 font-body">{item.description}</p>}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-500 font-mono">
                  Verified Publication • Project Wade OS
                </div>
              </div>
            ))}
            {(!publishedContent || publishedContent.length === 0) && (
              <p className="text-slate-500 col-span-2 text-center py-4">No published articles yet. Advance content to "Published" in the Content page to show them here.</p>
            )}
          </div>
        </div>

        {/* Strategic Goals & Projects */}
        <div>
          <h3 className="text-xl font-bold tracking-wider mb-6 flex items-center gap-2 text-slate-200 uppercase">
            <Target size={22} className="text-blue-400" /> Strategic Goals & Active Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals?.map((goal: Goal) => (
              <div key={goal.id} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-100">{goal.title}</span>
                  <span className="text-xs uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    {goal.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">Domain: {goal.domain}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
