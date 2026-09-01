'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotebookText, PlusCircle, Eye, Edit3, Heading, Bold, List, Code, Quote, Sparkles } from 'lucide-react';
import { fetchContentItems, createContentItem, updateContentItemStatus, ContentItem } from '@/lib/api';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['content-items', statusFilter],
    queryFn: () => fetchContentItems(statusFilter || undefined),
  });

  const createMutation = useMutation({
    mutationFn: createContentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-items'] });
      setTitle('');
      setDescription('');
      setMode('write');
    },
  });

  const advanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateContentItemStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content-items'] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title, description, status: 'idea' });
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    setDescription(prev => prev + `${prefix}${suffix}`);
  };

  const nextStatus: Record<string, string> = {
    idea: 'draft',
    draft: 'published',
    published: 'published',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b border-panel-border pb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <NotebookText size={36} className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-widest uppercase text-primary">Content Studio</h1>
            <p className="text-slate-400 mt-1">Write Markdown engineering posts, develop drafts, and publish to your blog.</p>
          </div>
        </div>
      </div>

      {/* Content Authoring Form */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-100">
            <PlusCircle size={20} className="text-primary" /> Create New Content Item
          </h3>
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => setMode('write')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${mode === 'write' ? 'bg-primary text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Edit3 size={14} /> Write (Markdown)
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${mode === 'preview' ? 'bg-primary text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye size={14} /> Live Preview
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Article / Post Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="glass-input text-lg font-semibold"
              placeholder="e.g. Building High-Performance Async Workflows in Python & Next.js"
              required
            />
          </div>

          {mode === 'write' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Article Body (Markdown Supported)
                </label>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => insertMarkdown('## ')} title="Add Subheading" className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-primary">
                    <Heading size={14} />
                  </button>
                  <button type="button" onClick={() => insertMarkdown('**', '**')} title="Bold Text" className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-primary">
                    <Bold size={14} />
                  </button>
                  <button type="button" onClick={() => insertMarkdown('- ')} title="Bullet List" className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-primary">
                    <List size={14} />
                  </button>
                  <button type="button" onClick={() => insertMarkdown('```typescript\n', '\n```')} title="Code Block" className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-primary">
                    <Code size={14} />
                  </button>
                  <button type="button" onClick={() => insertMarkdown('> ')} title="Quote Block" className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-primary">
                    <Quote size={14} />
                  </button>
                </div>
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="glass-input h-48 font-mono text-sm leading-relaxed"
                placeholder="Write your article in Markdown...&#10;&#10;## Architecture Highlights&#10;- Bullet point key takeaways&#10;- Add code snippets using ``` code blocks"
              />
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-slate-950 border border-slate-800 min-h-[12rem]">
              {description.trim() ? (
                <MarkdownRenderer content={description} />
              ) : (
                <p className="text-slate-500 italic text-sm">Nothing to preview yet. Switch to "Write" to add Markdown content.</p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={createMutation.isPending}>
              <Sparkles size={16} />
              {createMutation.isPending ? 'Saving...' : 'Create Content Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Content Pipeline */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold text-slate-100">Content Pipeline</h3>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="glass-input py-1.5 text-sm w-auto">
            <option value="">All Statuses</option>
            <option value="idea">Idea</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-slate-400 text-center py-8">Loading content pipeline...</p>
        ) : (
          <div className="space-y-4">
            {contentItems?.map(item => (
              <div key={item.id} className="p-5 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h4 className="font-bold text-slate-100 text-lg">{item.title}</h4>
                    <span className={`inline-block text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded mt-1 ${
                      item.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      item.status === 'draft' ? 'bg-warning/20 text-warning border border-warning/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => advanceMutation.mutate({ id: item.id, status: nextStatus[item.status] || item.status })}
                    className="btn-primary py-2 px-3 text-xs"
                    disabled={item.status === 'published'}
                  >
                    {item.status === 'published' ? 'Published to Blog' : `Advance to ${nextStatus[item.status]}`}
                  </button>
                </div>
                {item.description && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <MarkdownRenderer content={item.description} />
                  </div>
                )}
              </div>
            ))}
            {contentItems?.length === 0 && (
              <p className="text-slate-500 text-center py-8">No content tracked in this pipeline view.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

