'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  fetchSkills, 
  fetchSkillEvidence, 
  fetchContentItems, 
  fetchGoals, 
  fetchProjects, 
  Skill, 
  SkillEvidence, 
  ContentItem, 
  Goal, 
  Project 
} from '@/lib/api';
import { 
  Share2, 
  FileBadge, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  Target, 
  ExternalLink, 
  Printer, 
  Code2, 
  Briefcase, 
  Globe, 
  Mail, 
  MapPin, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useState } from 'react';

export default function ResumePage() {
  const [copied, setCopied] = useState(false);

  const { data: skills } = useQuery({ queryKey: ['skills'], queryFn: () => fetchSkills() });
  const { data: evidence } = useQuery({ queryKey: ['skill-evidence'], queryFn: () => fetchSkillEvidence() });
  const { data: publishedContent } = useQuery({ queryKey: ['content-items', 'published'], queryFn: () => fetchContentItems('published') });
  const { data: goals } = useQuery({ queryKey: ['goals'], queryFn: () => fetchGoals() });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => fetchProjects() });

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

  // Group skills by domain for executive clarity
  const groupedSkills: Record<string, Skill[]> = (skills || []).reduce((acc, skill) => {
    const domainKey = skill.domain || 'Backend & Core Systems';
    if (!acc[domainKey]) acc[domainKey] = [];
    acc[domainKey].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <>
      {/* Print Specific Styling */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          /* Hide navigation, sidebar, print buttons */
          aside, header, nav, .print-hide {
            display: none !important;
          }
          .resume-container {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-black-text {
            color: #0f172a !important;
          }
          .print-gray-text {
            color: #475569 !important;
          }
          .print-border {
            border-color: #cbd5e1 !important;
          }
          .print-badge {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8 pb-16">
        {/* Action Bar (Hidden on Print) */}
        <div className="border-b border-panel-border pb-6 flex flex-wrap items-center justify-between gap-4 print-hide">
          <div className="flex items-center gap-4">
            <FileBadge size={36} className="text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-300 to-warning">
                Verified Executive Resume
              </h1>
              <p className="text-slate-400 mt-1">Real-time profile automatically populated from verified execution data.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={copyShareLink} 
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Share2 size={16} />
              {copied ? 'Link Copied!' : 'Share Resume URL'}
            </button>
            <button 
              onClick={handlePrint} 
              className="glass-panel px-4 py-2 hover:border-primary text-slate-300 hover:text-white transition-all text-sm flex items-center gap-2"
            >
              <Printer size={16} />
              Export PDF / Print
            </button>
          </div>
        </div>

        {/* Main Modern Resume Document Container */}
        <div className="resume-container glass-panel p-8 md:p-12 space-y-10 border-primary/30 relative overflow-hidden bg-slate-900/90 backdrop-blur-xl rounded-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none print-hide" />

          {/* Executive Header */}
          <div className="border-b border-slate-800 print-border pb-8 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-100 tracking-tight print-black-text">Walsh Wade</h1>
                <p className="text-xl text-primary font-bold mt-1 tracking-wide print-black-text flex items-center gap-2">
                  <Code2 size={22} className="print-hide" />
                  Lead Backend & API Systems Specialist
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-1.5 print-hide">
                <span className="px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                  <Sparkles size={12} /> Live Verified Profile
                </span>
                <span className="text-xs text-slate-500 font-mono">Updated: Real-time</span>
              </div>
            </div>

            {/* Meta Contact Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 font-mono pt-2 print-gray-text">
              <span className="flex items-center gap-1.5"><Mail size={16} className="text-primary print-hide" /> wade@dev.local</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-warning print-hide" /> Remote / Global</span>
              <span className="flex items-center gap-1.5"><Globe size={16} className="text-green-400 print-hide" /> API Integration & Microservices</span>
            </div>

            {/* Executive Bio */}
            <p className="text-slate-300 leading-relaxed font-body text-base pt-2 print-black-text">
              Specialist backend engineer dedicated to building resilient API architectures, microservice integrations, and deterministic execution environments. 
              Proven expertise in HTTP specs, Webhook lifecycle design, OAuth2/JWT security, rate-limiting, and automated database orchestration using FastAPI, Python, and Node.js.
            </p>
          </div>

          {/* Categorized Skills Matrix */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-wider flex items-center gap-2 text-slate-100 uppercase border-b border-slate-800/80 pb-2 print-black-text print-border">
              <Award size={22} className="text-primary print-hide" /> Categorized Competency & Technical Skills Matrix
            </h2>

            {Object.keys(groupedSkills).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedSkills).map(([domain, domainSkills]) => (
                  <div key={domain} className="p-5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-3 print-badge">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary font-mono print-black-text flex items-center gap-2">
                      <Layers size={16} className="print-hide" /> {domain}
                    </h3>
                    <div className="space-y-2.5">
                      {domainSkills.map((skill) => (
                        <div key={skill.id} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-200 print-black-text">{skill.name}</span>
                            <span className="uppercase px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono border border-primary/30 print-badge">
                              {skill.proficiency_level}
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden print-hide">
                            <div 
                              className={`h-full rounded-full ${
                                skill.proficiency_level === 'expert' ? 'w-full bg-gradient-to-r from-primary to-green-400' :
                                skill.proficiency_level === 'advanced' ? 'w-3/4 bg-primary' :
                                'w-1/2 bg-warning'
                              }`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4 print-gray-text">No skill records populated yet.</p>
            )}
          </div>

          {/* Key Projects & Experience Timeline */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-wider flex items-center gap-2 text-slate-100 uppercase border-b border-slate-800/80 pb-2 print-black-text print-border">
              <Briefcase size={22} className="text-warning print-hide" /> Active Projects & Engineering Architecture
            </h2>
            <div className="relative border-l-2 border-primary/30 ml-3 pl-6 space-y-6 print-border">
              {projects?.map((proj: Project) => (
                <div key={proj.id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-slate-900 print-hide" />
                  <div className="p-5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2 print-badge">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100 print-black-text">{proj.title}</h3>
                      <span className={`text-xs uppercase px-2.5 py-0.5 rounded font-mono font-bold ${
                        proj.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-primary/20 text-primary border border-primary/30'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                    {proj.description && (
                      <p className="text-sm text-slate-300 font-body leading-relaxed print-gray-text">{proj.description}</p>
                    )}
                  </div>
                </div>
              ))}
              {(!projects || projects.length === 0) && (
                <p className="text-slate-500 py-2 print-gray-text">No active engineering projects listed.</p>
              )}
            </div>
          </div>

          {/* Verified Deliverables & Skill Evidence */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-wider flex items-center gap-2 text-slate-100 uppercase border-b border-slate-800/80 pb-2 print-black-text print-border">
              <CheckCircle2 size={22} className="text-green-400 print-hide" /> Verified Deliverables & Code Evidence
            </h2>
            <div className="space-y-3">
              {evidence?.map((item: SkillEvidence) => (
                <div key={item.id} className="p-5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print-badge">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base print-black-text">{item.title}</h3>
                    {item.description && <p className="text-xs text-slate-400 mt-1 font-body leading-relaxed print-gray-text">{item.description}</p>}
                  </div>
                  {item.evidence_url && (
                    <a 
                      href={item.evidence_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1 shrink-0 print-hide"
                    >
                      View Code Artifact <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
              {(!evidence || evidence.length === 0) && (
                <p className="text-slate-500 text-center py-4 print-gray-text">No evidence items logged yet.</p>
              )}
            </div>
          </div>

          {/* Published Engineering Writings */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-wider flex items-center gap-2 text-slate-100 uppercase border-b border-slate-800/80 pb-2 print-black-text print-border">
              <BookOpen size={22} className="text-amber-400 print-hide" /> Published Technical Articles & Documentation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedContent?.map((item: ContentItem) => (
                <div key={item.id} className="p-5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between print-badge">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-warning font-mono font-bold">Verified Publication</span>
                    <h3 className="font-bold text-slate-100 text-base mt-1 print-black-text">{item.title}</h3>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono print-gray-text">
                    Engineering Notes Stream
                  </div>
                </div>
              ))}
              {(!publishedContent || publishedContent.length === 0) && (
                <p className="text-slate-500 col-span-2 text-center py-4 print-gray-text">No published articles yet.</p>
              )}
            </div>
          </div>

          {/* Strategic Career Goals */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-wider flex items-center gap-2 text-slate-100 uppercase border-b border-slate-800/80 pb-2 print-black-text print-border">
              <Target size={22} className="text-blue-400 print-hide" /> Professional Milestones & Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals?.map((goal: Goal) => (
                <div key={goal.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 print-badge">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-100 text-sm print-black-text">{goal.title}</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono print-gray-text">Domain: {goal.domain}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
