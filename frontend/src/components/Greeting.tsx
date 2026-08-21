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
    <div className="glass-panel p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between sticky top-0 z-40 backdrop-blur-xl shadow-2xl">
      <div>
        <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-bold tracking-widest text-slate-100 mb-2 transition-all">
          {greeting}, Wade.
        </h2>
        {quote ? (
          <div className="text-blue-200 lg:text-lg 2xl:text-xl italic flex gap-2 transition-all">
            <Terminal className="text-primary mt-1 flex-shrink-0 w-4 h-4 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6" />
            <div>
              <p>"{quote.quote}"</p>
              <p className="text-xs lg:text-sm 2xl:text-base text-blue-300/70 mt-1 uppercase tracking-wider transition-all">— {quote.author}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 animate-pulse">Establishing secure link for daily directive...</p>
        )}
      </div>

      <div className="flex flex-col items-end text-right min-w-[140px]">
        <div className="flex items-center gap-2 text-warning mb-1">
          <ClockIcon className="w-4 h-4 lg:w-6 lg:h-6 2xl:w-8 2xl:h-8 transition-all" />
          <span className="text-2xl lg:text-4xl 2xl:text-5xl font-[family-name:var(--font-orbitron)] font-bold tracking-widest tabular-nums transition-all">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
        <span className="text-sm lg:text-base 2xl:text-lg text-slate-400 font-bold tracking-wider uppercase mb-1 transition-all">
          {time.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
        <span className="text-xs lg:text-sm 2xl:text-base text-slate-500 font-mono tracking-widest transition-all">
          1.2921° S, 36.8219° E
        </span>
      </div>
    </div>
  );
}
