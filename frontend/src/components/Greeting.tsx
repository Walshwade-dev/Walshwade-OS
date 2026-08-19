'use client';

import { useState, useEffect } from 'react';
import { Terminal, Clock as ClockIcon } from 'lucide-react';

export default function Greeting() {
  const [time, setTime] = useState<Date | null>(null);
  const [quote, setQuote] = useState<{ quote: string, author: string } | null>(null);

  useEffect(() => {
    // Set initial time
    setTime(new Date());
    
    // Update clock every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Fetch quote
    fetch('https://dummyjson.com/quotes/random')
      .then(res => res.json())
      .then(data => setQuote({ quote: data.quote, author: data.author }))
      .catch(err => console.error("Failed to fetch quote:", err));

    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const hours = time.getHours();
  let greeting = 'Good Evening';
  if (hours < 12) greeting = 'Good Morning';
  else if (hours < 18) greeting = 'Good Afternoon';

  return (
    <div className="glass-panel p-6 mb-8 border-l-4 border-l-primary flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-widest text-slate-100 mb-2">
          {greeting}, Wade.
        </h2>
        {quote ? (
          <div className="text-slate-400 italic flex gap-2">
            <Terminal size={16} className="text-primary mt-1 flex-shrink-0" />
            <div>
              <p>"{quote.quote}"</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">— {quote.author}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 animate-pulse">Establishing secure link for daily directive...</p>
        )}
      </div>
      
      <div className="flex flex-col items-end text-right min-w-[140px]">
        <div className="flex items-center gap-2 text-warning mb-1">
          <ClockIcon size={18} />
          <span className="text-2xl font-[family-name:var(--font-orbitron)] font-bold tracking-widest">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
        <span className="text-sm text-slate-400 font-bold tracking-wider uppercase">
          {time.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
