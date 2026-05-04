import { FileJson2, GitBranch, LocateFixed, MessageSquareText, TerminalSquare } from 'lucide-react';

import type { PromptPart } from '@/trace/types';

import { formatNumber, kindStyles, percentage } from './model';

type PartGroup = {
  kind: PromptPart['kind'];
  items: PromptPart[];
  chars: number;
};

const rawTargets: Record<PromptPart['kind'], string> = {
  system: 'request.system[]',
  reminder: 'request.messages[0].content[]',
  tools: 'request.tools[]',
  user: 'request.messages[0].content[user]',
};

const responseHints: Record<PromptPart['kind'], string> = {
  system: 'Identity, task boundary, and output style constrain the final answer.',
  reminder: 'Runtime context explains environment, skill, and session-specific behavior.',
  tools: 'The tool catalog decides whether the model can emit tool_use instead of plain text.',
  user: 'The user message is the final task payload appended into the request.',
};

export function EvidenceLocator({
  groups,
  totalChars,
  activeKind,
  selectedPart,
  mode,
  onFocusKind,
  onOpenMap,
}: {
  groups: PartGroup[];
  totalChars: number;
  activeKind: PromptPart['kind'];
  selectedPart?: PromptPart;
  mode: 'raw' | 'response';
  onFocusKind: (kind: PromptPart['kind']) => void;
  onOpenMap: (kind: PromptPart['kind']) => void;
}) {
  const title = mode === 'raw' ? 'Raw / Map locator' : 'Response / Map locator';
  const Icon = mode === 'raw' ? FileJson2 : TerminalSquare;

  return (
    <section className="rounded-lg border p-3" style={{ borderColor: 'rgba(234,88,12,0.22)', backgroundColor: '#fffaf3' }}>
      <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        <Icon size={15} style={{ color: 'var(--primary)' }} />
        {title}
      </div>
      <div className="trace-safe-text mb-3 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Select a layer to pin the same Map node. Use Locate Map to jump back and inspect the first prompt block in that layer.
      </div>

      <div className="grid gap-2">
        {groups.map((group) => {
          const style = kindStyles[group.kind];
          const active = activeKind === group.kind;
          const pct = percentage(group.chars, totalChars);
          return (
            <div
              key={group.kind}
              className="rounded-lg border bg-white p-3 transition-transform hover:-translate-y-0.5"
              style={{
                borderColor: active ? style.color : style.border,
                boxShadow: active ? `inset 3px 0 0 ${style.color}` : undefined,
              }}
            >
              <button className="w-full text-left" onClick={() => onFocusKind(group.kind)}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold" style={{ color: style.color }}>
                    {style.label}
                  </span>
                  <span className="rounded-md px-2 py-1 text-[11px]" style={{ backgroundColor: style.bg, color: style.color }}>
                    {pct}%
                  </span>
                </div>
                <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {group.items.length} blocks / {formatNumber(group.chars)} chars
                </div>
                <div className="mt-2 rounded-md px-2 py-1.5 text-[11px]" style={{ backgroundColor: style.bg, color: 'var(--text-secondary)' }}>
                  {mode === 'raw' ? rawTargets[group.kind] : responseHints[group.kind]}
                </div>
              </button>
              <button
                className="mt-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                onClick={() => onOpenMap(group.kind)}
                style={{ borderColor: style.border, color: style.color }}
              >
                <LocateFixed size={13} />
                Locate Map
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border bg-white p-3" style={{ borderColor: 'var(--border)' }}>
        <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {mode === 'raw' ? <GitBranch size={14} style={{ color: 'var(--primary)' }} /> : <MessageSquareText size={14} style={{ color: 'var(--primary)' }} />}
          Current locator
        </div>
        <div className="trace-safe-text text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {selectedPart ? `${kindStyles[selectedPart.kind].label} / ${selectedPart.title}` : `${kindStyles[activeKind].label} / no concrete block pinned`}
        </div>
      </div>
    </section>
  );
}
