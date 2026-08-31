'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, CalendarDays, CheckCircle2 } from 'lucide-react';
import { fetchDailyReviews, submitDailyReview, fetchWeeklyPlans, submitWeeklyReview, fetchWeeklyReviews } from '@/lib/api';

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const [dailySummary, setDailySummary] = useState('');
  const [weeklySummary, setWeeklySummary] = useState('');
  const [selectedWeeklyPlanId, setSelectedWeeklyPlanId] = useState('');

  const { data: dailyReviews, isLoading: dailyLoading } = useQuery({
    queryKey: ['daily-reviews'],
    queryFn: fetchDailyReviews,
  });

  const { data: weeklyPlans } = useQuery({
    queryKey: ['weekly-plans'],
    queryFn: fetchWeeklyPlans,
  });

  const { data: weeklyReviews } = useQuery({
      queryKey: ['weekly-reviews'],
      queryFn: fetchWeeklyReviews
  });

  const dailyMutation = useMutation({
    mutationFn: () => submitDailyReview({ review_date: todayStr, summary: dailySummary }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-reviews'] });
      setDailySummary('');
      alert("Daily Review Saved!");
    }
  });

  const weeklyMutation = useMutation({
    mutationFn: () => submitWeeklyReview({ weekly_plan_id: selectedWeeklyPlanId, summary: weeklySummary }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-reviews'] });
      setWeeklySummary('');
      setSelectedWeeklyPlanId('');
      alert("Weekly Review Saved!");
    }
  });

  const todayReview = dailyReviews?.find(r => r.review_date === todayStr);

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-widest uppercase text-slate-100 flex items-center gap-3 mb-2">
          <FileText size={28} className="text-primary" />
          Execution Reviews
        </h1>
        <p className="text-slate-400">Reflect on execution performance and systemic friction.</p>
      </div>

      {/* Daily Review Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-wider text-slate-300 flex items-center gap-2 border-b border-panel-border pb-2">
          <CheckCircle2 size={20} className="text-primary" /> Daily Retrospective
        </h2>

        <div className="glass-panel p-6 border-primary/20 bg-primary/5">
          <h3 className="text-sm font-bold tracking-wider text-primary uppercase mb-4">Today ({todayStr})</h3>
          {todayReview ? (
             <div className="bg-slate-900/50 p-4 rounded border border-primary/20">
               <p className="text-slate-300 whitespace-pre-wrap font-body">{todayReview.summary}</p>
             </div>
          ) : (
            <div className="space-y-4">
               <textarea 
                  className="glass-input h-32 resize-none" 
                  placeholder="What went well? What caused friction today?"
                  value={dailySummary}
                  onChange={e => setDailySummary(e.target.value)}
               />
               <div className="flex justify-end">
                 <button 
                   onClick={() => dailyMutation.mutate()} 
                   disabled={dailyMutation.isPending || !dailySummary}
                   className="btn-primary"
                 >
                   Submit Daily Review
                 </button>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
           <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase">Past Daily Reviews</h3>
           {dailyLoading ? (
             <div className="animate-pulse h-20 bg-slate-800 rounded"></div>
           ) : (
             <div className="grid grid-cols-1 gap-4">
               {dailyReviews?.filter(r => r.review_date !== todayStr).slice(0, 5).map(review => (
                 <div key={review.id} className="glass-panel p-4">
                   <div className="text-xs font-bold text-slate-400 mb-2">{review.review_date}</div>
                   <p className="text-slate-300 whitespace-pre-wrap font-body text-sm line-clamp-3">{review.summary}</p>
                 </div>
               ))}
             </div>
           )}
        </div>
      </section>

      {/* Weekly Review Section */}
      <section className="space-y-6 pt-8 border-t border-panel-border">
        <h2 className="text-xl font-bold tracking-wider text-slate-300 flex items-center gap-2 border-b border-panel-border pb-2">
          <CalendarDays size={20} className="text-warning" /> Weekly Retrospective
        </h2>

        <div className="glass-panel p-6 border-warning/20 bg-warning/5">
          <h3 className="text-sm font-bold tracking-wider text-warning uppercase mb-4">Draft New Weekly Review</h3>
          <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select Week</label>
               <select 
                  className="glass-input" 
                  value={selectedWeeklyPlanId} 
                  onChange={e => setSelectedWeeklyPlanId(e.target.value)}
               >
                 <option value="" disabled>Choose a Weekly Plan</option>
                 {weeklyPlans?.map(p => (
                   <option key={p.id} value={p.id}>Week of {p.week_start_date}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Summary</label>
               <textarea 
                  className="glass-input h-32 resize-none" 
                  placeholder="How did this week's execution map to the plan?"
                  value={weeklySummary}
                  onChange={e => setWeeklySummary(e.target.value)}
               />
             </div>
             <div className="flex justify-end">
               <button 
                 onClick={() => weeklyMutation.mutate()} 
                 disabled={weeklyMutation.isPending || !weeklySummary || !selectedWeeklyPlanId}
                 className="px-6 py-2 rounded bg-warning text-slate-900 font-bold tracking-wider uppercase text-sm hover:bg-yellow-400 transition-colors"
               >
                 Submit Weekly Review
               </button>
             </div>
          </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase">Past Weekly Reviews</h3>
           <div className="grid grid-cols-1 gap-4">
             {weeklyReviews?.map((review: any) => {
               const plan = weeklyPlans?.find(p => p.id === review.weekly_plan_id);
               return (
                 <div key={review.id} className="glass-panel p-4">
                   <div className="text-xs font-bold text-slate-400 mb-2">
                     {plan ? `Week of ${plan.week_start_date}` : 'Unknown Week'}
                   </div>
                   <p className="text-slate-300 whitespace-pre-wrap font-body text-sm line-clamp-3">{review.summary}</p>
                 </div>
               );
             })}
           </div>
        </div>
      </section>

    </div>
  );
}
