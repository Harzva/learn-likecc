import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import type { ContentSection } from '@/data/modules';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';

interface ModuleContentRendererProps {
  content: ContentSection[];
}

function parseInlineCode(text: string): (string | { type: 'code'; value: string })[] {
  const parts: (string | { type: 'code'; value: string })[] = [];
  const regex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ type: 'code', value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

function CodeBlock({ content, isTerminal }: { content: string; isTerminal?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  if (isTerminal) {
    return (
      <motion.div
        variants={itemVariants}
        className="my-4 overflow-hidden rounded-lg"
        style={{ backgroundColor: '#1e1e1e' }}
      >
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ backgroundColor: '#2d2d2d' }}
        >
          <span
            className="text-[12px]"
            style={{ color: '#9ca3af', fontFamily: '"JetBrains Mono", monospace' }}
          >
            terminal
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded p-1 text-[12px] transition-colors duration-150 hover:bg-white/10"
            style={{ color: '#9ca3af' }}
          >
            {copied ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
          </button>
        </div>
        <div className="p-4" style={{ backgroundColor: '#1e1e1e' }}>
          <span
            style={{
              color: '#60a5fa',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {'> '}
          </span>
          <span
            style={{
              color: '#fbbf24',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {content}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="group relative my-4 overflow-hidden rounded-lg"
      style={{ backgroundColor: '#282c34' }}
    >
      <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded bg-black/40 p-1.5 text-[12px] transition-colors duration-150 hover:bg-black/60"
          style={{ color: '#abb2bf' }}
        >
          {copied ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
        </button>
      </div>
      <pre
        className="overflow-x-auto p-5 text-[14px] leading-relaxed"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          color: '#abb2bf',
        }}
      >
        <code>{content}</code>
      </pre>
    </motion.div>
  );
}

export default function ModuleContentRenderer({ content }: ModuleContentRendererProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1"
    >
      {content.map((section, idx) => {
        if (section.type === 'text') {
          const parts = parseInlineCode(section.content);

          return (
            <motion.p
              key={idx}
              variants={itemVariants}
              className="text-[15px] leading-[1.7]"
              style={{ color: 'var(--text-primary)', marginBottom: '16px' }}
            >
              {parts.map((part, pIdx) =>
                typeof part === 'string' ? (
                  <span key={pIdx}>{part}</span>
                ) : (
                  <code
                    key={pIdx}
                    className="rounded border px-1.5 py-0.5 text-[12px]"
                    style={{
                      backgroundColor: 'var(--cream-dark)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--accent-amber)',
                      fontFamily: '"JetBrains Mono", monospace',
                    }}
                  >
                    {part.value}
                  </code>
                )
              )}
            </motion.p>
          );
        }

        if (section.type === 'code') {
          return <CodeBlock key={idx} content={section.content} />;
        }

        if (section.type === 'terminal') {
          return <CodeBlock key={idx} content={section.content} isTerminal />;
        }

        return null;
      })}
    </motion.div>
  );
}
