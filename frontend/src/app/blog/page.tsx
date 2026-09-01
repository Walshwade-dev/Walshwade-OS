'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchContentItems, ContentItem } from '@/lib/api';
import { BookOpen, Calendar, ArrowRight, Share2 } from 'lucide-react';
import { useState } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function BlogPage() {
  const [copied, setCopied] = useState(false);
  const { data: publishedItems, isLoading } = useQuery({
    queryKey: ['content-items', 'published'],
    queryFn: () => fetchContentItems('published'),
  });

  const copyFeedLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b border-panel-border pb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BookOpen size={36} className="text-warning" />
          <div>
            <h1 className="text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-warning to-amber-200">
              Engineering Notes & Blog
            </h1>
            <p className="text-slate-400 mt-1">Public stream of technical articles, learning takeaways, and architecture breakdowns.</p>
          </div>
        </div>

        <button onClick={copyFeedLink} className="btn-primary text-sm flex items-center gap-2">
          <Share2 size={16} />
          {copied ? 'Blog Link Copied!' : 'Share Blog Feed'}
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-400 py-10 text-center">Loading engineering stream...</div>
      ) : (
        <div className="space-y-8">
          {publishedItems?.map((post: ContentItem) => {
            const wordCount = post.description ? post.description.trim().split(/\s+/).length : 0;
            const readTime = Math.max(1, Math.ceil(wordCount / 200));

            return (
              <article key={post.id} className="glass-panel p-8 hover:border-warning/50 transition-all space-y-6">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-3">
                  <span className="flex items-center gap-2 text-warning">
                    <Calendar size={14} /> Published Article • {readTime} min read
                  </span>
                  <span className="px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/30 uppercase font-mono tracking-wider">
                    Verified
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
                  {post.title}
                </h2>
                {post.description && (
                  <div className="pt-2">
                    <MarkdownRenderer content={post.description} />
                  </div>
                )}
              </article>
            );
          })}


          {(!publishedItems || publishedItems.length === 0) && (
            <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-2" />
              <h3 className="text-xl font-bold text-slate-300">No Published Articles Yet</h3>
              <p className="text-sm max-w-md mx-auto">
                Articles you write in the <strong>Content</strong> tab will appear here automatically when moved to the <strong>Published</strong> status!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
