import type { NormalizedTrace, PromptPart, PromptStep, TraceSystemBlock } from './types';

function joinParts(parts: { text: string }[]): string {
  return parts.map((p) => p.text).join('\n\n');
}

function estTokens(chars: number): number {
  return Math.ceil(chars / 4);
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function describeCoreSection(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes('system')) {
    return 'Basic runtime rules: visible text, permission behavior, injected tags, hooks, and compression.';
  }
  if (normalized.includes('doing tasks')) {
    return 'Engineering work contract: how Claude Code should scope, edit, test, and avoid unnecessary abstraction.';
  }
  if (normalized.includes('executing actions')) {
    return 'Risk control layer for destructive, shared, or hard-to-reverse operations.';
  }
  if (normalized.includes('using your tools')) {
    return 'Tool-use protocol: when to call tools, parallelize calls, and track work.';
  }
  if (normalized.includes('tone') || normalized.includes('text output')) {
    return 'Communication contract: how updates, final answers, formatting, and concise status messages should work.';
  }
  if (normalized.includes('session-specific')) {
    return 'Session-local operating notes that adjust behavior for this environment.';
  }
  if (normalized.includes('memory')) {
    return 'Persistent-memory rules: what can be saved, what must not be saved, and how memory should be maintained.';
  }
  if (normalized.includes('environment')) {
    return 'Observed runtime context: cwd, OS, shell, repository state, and model/tool availability.';
  }
  if (normalized.includes('context management')) {
    return 'Instructions for handling long tool outputs and context pressure.';
  }
  return 'A subsection of the large Claude Code operating contract.';
}

function splitMarkdownSections(text: string): Array<{ title: string; text: string }> {
  const lines = text.split(/\r?\n/);
  const sections: Array<{ title: string; lines: string[] }> = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    const heading = line.match(/^#\s+(.+?)\s*$/);
    if (heading) {
      if (current && current.lines.join('\n').trim()) {
        sections.push(current);
      }
      current = { title: heading[1].trim(), lines: [line] };
      continue;
    }

    if (!current) {
      current = { title: 'Mission and guardrails', lines: [] };
    }
    current.lines.push(line);
  }

  if (current && current.lines.join('\n').trim()) {
    sections.push(current);
  }

  return sections.map((section) => ({
    title: section.title,
    text: section.lines.join('\n').trim(),
  }));
}

function coreSystemParts(text: string, index: number): PromptPart[] {
  const sections = splitMarkdownSections(text);
  const parentTitle = 'Core operating contract';
  const parentDescription = 'The large policy and operating contract for coding tasks, tool use, safety, planning, and tone.';

  if (sections.length <= 1) {
    return [
      {
        id: `system-core-${index}`,
        kind: 'system',
        title: parentTitle,
        description: parentDescription,
        text,
      },
    ];
  }

  return sections.map((section, sectionIndex): PromptPart => ({
    id: `system-core-${index}-${slug(section.title) || sectionIndex}`,
    kind: 'system',
    title: section.title,
    description: describeCoreSection(section.title),
    text: section.text,
    parentTitle,
    parentDescription,
  }));
}

function systemParts(block: TraceSystemBlock, index: number): PromptPart[] {
  const text = block.text.trim();
  if (!text) return [];

  if (index === 0) {
    return [
      {
        id: 'system-cli-metadata',
        kind: 'system',
        title: 'CLI metadata',
        description: 'Claude Code version, entrypoint, and route metadata injected ahead of the main instruction stack.',
        text,
      },
    ];
  }

  if (index === 1) {
    return [
      {
        id: 'system-identity',
        kind: 'system',
        title: 'Claude Code identity',
        description: 'The short identity anchor that fixes the assistant role as Claude Code.',
        text,
      },
    ];
  }

  return coreSystemParts(text, index);
}

function summarizeToolList(trace: NormalizedTrace): string {
  return trace.tools
    .map((t) => {
      const description = t.description ? ` - ${t.description}` : '';
      return `${t.name}${description}`;
    })
    .join('\n');
}

export function buildPromptSteps(trace: NormalizedTrace): { steps: PromptStep[]; assembled: string; tokens: number } {
  const steps: PromptStep[] = [];
  let accParts: PromptPart[] = [];

  const pushStep = (id: string, title: string, newParts: PromptPart[]) => {
    accParts = accParts.concat(newParts);
    const assembled = joinParts(accParts);
    steps.push({
      id,
      title,
      parts: accParts,
      added: newParts,
      cumulativeChars: assembled.length,
    });
  };

  const systemLayerParts = trace.systemBlocks.flatMap((block, index) => systemParts(block, index));
  pushStep('system', 'System scaffold', systemLayerParts);

  const reminderParts = trace.injectedBlocks
    .filter((b) => b.kind === 'system-reminder')
    .map((block, index): PromptPart => ({
      id: `reminder-${index + 1}`,
      kind: 'reminder',
      title: `System reminder ${index + 1}`,
      description: 'Runtime context injected by Claude Code before the user message, such as skills, IDE state, or date.',
      text: block.text.trim(),
    }));
  pushStep('reminders', 'Runtime reminders', reminderParts);

  const toolSummary = trace.tools.length > 0 ? summarizeToolList(trace) : '';
  pushStep(
    'tools',
    `Tool catalog (${trace.tools.length})`,
    toolSummary
      ? [
          {
            id: 'tools-catalog',
            kind: 'tools',
            title: `Tool catalog (${trace.tools.length})`,
            description: 'Names and descriptions of callable tools exposed to the model for this request.',
            text: toolSummary,
          },
        ]
      : []
  );

  const userText = (trace.userPrompt ?? '').trim();
  pushStep(
    'user',
    'User message',
    userText
      ? [
          {
            id: 'user-prompt',
            kind: 'user',
            title: 'User prompt',
            description: 'The actual user payload after Claude Code has already prepared system context and tools.',
            text: userText,
          },
        ]
      : []
  );

  const assembled = joinParts(accParts);
  return { steps, assembled, tokens: estTokens(assembled.length) };
}
