'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Process markdown text into structured blocks
  const parseMarkdownBlocks = (text: string) => {
    const lines = text.split(/\r?\n/);
    const blocks: { type: string; content: string | string[]; lang?: string }[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Code Block
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        blocks.push({ type: 'code', content: codeLines.join('\n'), lang });
        i++;
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        blocks.push({ type: 'h1', content: line.slice(2).trim() });
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        blocks.push({ type: 'h2', content: line.slice(3).trim() });
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        blocks.push({ type: 'h3', content: line.slice(4).trim() });
        i++;
        continue;
      }
      if (line.startsWith('#### ')) {
        blocks.push({ type: 'h4', content: line.slice(5).trim() });
        i++;
        continue;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith('> ')) {
          quoteLines.push(lines[i].slice(2).trim());
          i++;
        }
        blocks.push({ type: 'blockquote', content: quoteLines.join(' ') });
        continue;
      }

      // Bullet Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().slice(2).trim());
          i++;
        }
        blocks.push({ type: 'unordered-list', content: listItems });
        continue;
      }

      // Numbered Lists
      if (/^\d+\.\s/.test(line.trim())) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
          i++;
        }
        blocks.push({ type: 'ordered-list', content: listItems });
        continue;
      }

      // Horizontal Rule
      if (line.trim() === '---' || line.trim() === '***') {
        blocks.push({ type: 'hr', content: '' });
        i++;
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Paragraph (gather contiguous lines)
      const paragraphLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].startsWith('#') &&
        !lines[i].startsWith('>') &&
        !lines[i].trim().startsWith('- ') &&
        !lines[i].trim().startsWith('* ') &&
        !/^\d+\.\s/.test(lines[i].trim()) &&
        lines[i].trim() !== '---'
      ) {
        paragraphLines.push(lines[i]);
        i++;
      }
      if (paragraphLines.length > 0) {
        blocks.push({ type: 'paragraph', content: paragraphLines.join(' ') });
      }
    }

    return blocks;
  };

  // Process inline styles (bold, italic, inline code, links)
  const renderInlineFormatted = (text: string): React.ReactNode[] => {
    // Helper regex tokenizer
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Inline Code: `code`
      const codeMatch = remaining.match(/`([^`]+)`/);
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      // Italic: *text*
      const italicMatch = remaining.match(/\*([^*]+)\*/);
      // Link: [text](url)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      // Find first occurring pattern
      const matches = [
        codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
        boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
        italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
        linkMatch ? { type: 'link', match: linkMatch, index: linkMatch.index! } : null,
      ].filter(Boolean).sort((a, b) => a!.index - b!.index);

      if (matches.length === 0) {
        tokens.push(remaining);
        break;
      }

      const first = matches[0]!;
      if (first.index > 0) {
        tokens.push(remaining.substring(0, first.index));
      }

      if (first.type === 'code') {
        tokens.push(
          <code key={`inline-code-${keyIdx++}`} className="px-1.5 py-0.5 rounded bg-slate-800 text-warning font-mono text-xs border border-slate-700">
            {first.match[1]}
          </code>
        );
        remaining = remaining.substring(first.index + first.match[0].length);
      } else if (first.type === 'bold') {
        tokens.push(
          <strong key={`bold-${keyIdx++}`} className="font-bold text-slate-100">
            {first.match[1]}
          </strong>
        );
        remaining = remaining.substring(first.index + first.match[0].length);
      } else if (first.type === 'italic') {
        tokens.push(
          <em key={`italic-${keyIdx++}`} className="italic text-slate-200">
            {first.match[1]}
          </em>
        );
        remaining = remaining.substring(first.index + first.match[0].length);
      } else if (first.type === 'link') {
        tokens.push(
          <a
            key={`link-${keyIdx++}`}
            href={first.match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold"
          >
            {first.match[1]}
          </a>
        );
        remaining = remaining.substring(first.index + first.match[0].length);
      }
    }

    return tokens;
  };

  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-4 text-slate-300 font-body leading-relaxed ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1 key={index} className="text-3xl font-black text-slate-100 border-b border-primary/40 pb-2 mt-6 mb-4 tracking-wide">
                {renderInlineFormatted(block.content as string)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={index} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-warning mt-6 mb-3 tracking-wide">
                {renderInlineFormatted(block.content as string)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="text-xl font-bold text-slate-100 mt-5 mb-2 tracking-wide">
                {renderInlineFormatted(block.content as string)}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={index} className="text-lg font-semibold text-slate-200 mt-4 mb-2">
                {renderInlineFormatted(block.content as string)}
              </h4>
            );
          case 'paragraph':
            return (
              <p key={index} className="text-slate-300 leading-relaxed text-base">
                {renderInlineFormatted(block.content as string)}
              </p>
            );
          case 'code':
            return (
              <div key={index} className="my-4 rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-sm overflow-x-auto shadow-inner relative group">
                {block.lang && (
                  <span className="absolute top-2 right-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {block.lang}
                  </span>
                )}
                <pre className="text-amber-200/90 leading-relaxed">
                  <code>{block.content as string}</code>
                </pre>
              </div>
            );
          case 'blockquote':
            return (
              <blockquote key={index} className="my-4 pl-4 border-l-4 border-warning bg-warning/5 py-3 pr-4 rounded-r text-slate-200 italic">
                {renderInlineFormatted(block.content as string)}
              </blockquote>
            );
          case 'unordered-list':
            return (
              <ul key={index} className="my-3 space-y-2 pl-2">
                {(block.content as string[]).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{renderInlineFormatted(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'ordered-list':
            return (
              <ol key={index} className="my-3 space-y-2 pl-2">
                {(block.content as string[]).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-xs text-warning font-bold mt-0.5 shrink-0">{idx + 1}.</span>
                    <span>{renderInlineFormatted(item)}</span>
                  </li>
                ))}
              </ol>
            );
          case 'hr':
            return <hr key={index} className="my-6 border-slate-800" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
