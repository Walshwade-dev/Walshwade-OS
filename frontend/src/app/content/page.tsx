'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotebookText, PlusCircle, ArrowRight } from 'lucide-react';
import { fetchContentItems, createContentItem, updateContentItemStatus, ContentItem } from '@/lib/api';

export default function ContentPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const nextStatus: Record<string, string> = {
    idea: 'draft',
    draft: 'published',
    published: 'published',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-panel-border pb-6 flex items-center gap-4">
        <NotebookText size={32} className="text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-widest uppercase text-primary">Content</h1>
          <p className="text-slate-400 mt-1">Capture ideas, develop drafts, and track publication status.</p>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><PlusCircle size={20} className="text-primary" /> Add Content Idea</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} className="glass-input" placeholder="Title" required />
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="glass-input" rows={3} placeholder="Description" />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>{createMutation.isPending ? 'Saving...' : 'Create Content Item'}</button>
          </div>
        </form>
      </div>

      <div className="glass-panel p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold">Content Pipeline</h3>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="glass-input py-2 text-sm">
            <option value="">All statuses</option>
            <option value="idea">Idea</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {isLoading ? <p className="text-slate-400">Loading content...</p> : (
          <div className="space-y-3">
            {contentItems?.map(item => (
              <div key={item.id} className="p-4 rounded border border-panel-border bg-slate-900/40">
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <div className="font-semibold text-slate-100">{item.title}</div>
                    <div className="text-xs uppercase tracking-width text-slate-400 mt-1">{item.status}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => advanceMutation.mutate({ id: item.id, status: nextStatus[item.status] || item.status })}
                    className="btn-primary py-2 px-3 text-xs"
                    disabled={item.status === 'published'}
                  >
                    {item.status === 'published' ? 'Published' : `Advance to ${nextStatus[item.status]}`}
                  </button>
                </div>
                {item.description && <p className="text-sm text-slate-400 mt-3">{item.description}</p>}
              </div>
            ))}
            {contentItems?.length === 0 && <p className="text-slate-500">No content tracked yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
