import { useState } from 'react';
import { Check, Clipboard } from 'lucide-react';

export function CodePanel({ title, meta, text }: { title: string; meta?: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border shadow-inner" style={{ borderColor: 'rgba(51,65,85,0.9)', backgroundColor: '#0f172a' }}>
      <div className="flex min-w-0 items-center justify-between gap-3 border-b px-3 py-2" style={{ borderColor: 'rgba(148,163,184,0.18)', backgroundColor: '#111c31' }}>
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold" style={{ color: '#e2e8f0' }}>
            {title}
          </div>
          {meta ? (
            <div className="mt-0.5 text-[11px]" style={{ color: '#94a3b8' }}>
              {meta}
            </div>
          ) : null}
        </div>
        <button
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors hover:bg-white/10"
          onClick={copyText}
          style={{ borderColor: 'rgba(148,163,184,0.24)', color: copied ? '#22c55e' : '#cbd5e1' }}
        >
          {copied ? <Check size={13} /> : <Clipboard size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className="agent-loop-terminal-scroll overflow-auto whitespace-pre-wrap break-words p-4 text-[12px] leading-relaxed"
        style={{
          maxHeight: 'min(560px, calc(100dvh - 260px))',
          color: '#e6e6e6',
        }}
      >
        {text}
      </pre>
    </div>
  );
}
