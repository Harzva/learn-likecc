import { useEffect, useId, useMemo, useState } from 'react';
import {
  Braces,
  ChevronRight,
  FileJson2,
  GitBranch,
  Layers3,
  ListTree,
  Network,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import traceSamples from '@/data/traceSamples.json';
import { normalizeTrace } from '@/trace/normalize';
import { buildPromptSteps } from '@/trace/promptSteps';
import type { PromptPart, PromptStep, TraceTool } from '@/trace/types';

const kindStyles: Record<PromptPart['kind'], { label: string; color: string; bg: string; border: string }> = {
  system: { label: 'System layer', color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
  reminder: { label: 'Runtime layer', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
  tools: { label: 'Tools layer', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  user: { label: 'User layer', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
};

const layerOrder: PromptPart['kind'][] = ['system', 'reminder', 'tools', 'user'];

type PartDisplayGroup =
  | { type: 'single'; part: PromptPart }
  | { type: 'parent'; title: string; description?: string; parts: PromptPart[]; chars: number };

type ToolCategory = 'all' | 'files' | 'runtime' | 'workflow' | 'automation' | 'web' | 'mcp' | 'interaction';

const toolCategoryOrder: Exclude<ToolCategory, 'all'>[] = ['files', 'runtime', 'workflow', 'automation', 'web', 'mcp', 'interaction'];

const toolCategoryMeta: Record<ToolCategory, { label: string; color: string; bg: string; border: string }> = {
  all: { label: 'All tools', color: '#0f172a', bg: '#fffaf3', border: '#fed7aa' },
  files: { label: 'Files', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
  runtime: { label: 'Runtime', color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
  workflow: { label: 'Workflow', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  automation: { label: 'Automation', color: '#0891b2', bg: '#ecfeff', border: '#67e8f9' },
  web: { label: 'Web', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  mcp: { label: 'MCP', color: '#9333ea', bg: '#faf5ff', border: '#d8b4fe' },
  interaction: { label: 'Interaction', color: '#be123c', bg: '#fff1f2', border: '#fda4af' },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function estimateTokens(chars: number) {
  return Math.ceil(chars / 4);
}

function excerpt(text: string, max = 360) {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max)}...`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function classifyTool(tool: TraceTool): Exclude<ToolCategory, 'all'> {
  const name = tool.name.toLowerCase();
  if (name.startsWith('mcp__')) return 'mcp';
  if (['read', 'write', 'edit', 'notebookedit'].includes(name)) return 'files';
  if (['bash', 'enterworktree', 'exitworktree', 'skill'].includes(name)) return 'runtime';
  if (name.startsWith('task') || name === 'agent' || name.includes('planmode')) return 'workflow';
  if (name.includes('cron') || name.includes('schedule') || name.includes('monitor') || name.includes('notification') || name.includes('trigger')) return 'automation';
  if (name.startsWith('web')) return 'web';
  return 'interaction';
}

function schemaProperties(tool: TraceTool) {
  const schema = asRecord(tool.input_schema);
  const properties = asRecord(schema?.properties);
  const required = Array.isArray(schema?.required) ? new Set(schema.required.filter((item): item is string => typeof item === 'string')) : new Set<string>();
  if (!properties) return [];

  return Object.entries(properties).map(([name, value]) => {
    const property = asRecord(value);
    const type = typeof property?.type === 'string' ? property.type : Array.isArray(property?.enum) ? 'enum' : 'value';
    const description = typeof property?.description === 'string' ? property.description : '';
    return { name, type, description, required: required.has(name) };
  });
}

function codeBlock(text: string) {
  return (
    <pre
      className="agent-loop-terminal-scroll overflow-auto whitespace-pre-wrap break-words rounded-lg border p-4 text-[12px] leading-relaxed"
      style={{
        maxHeight: 'min(520px, calc(100dvh - 260px))',
        backgroundColor: '#0f172a',
        borderColor: 'rgba(51,65,85,0.9)',
        color: '#e6e6e6',
      }}
    >
      {text}
    </pre>
  );
}

function joinPromptParts(parts: PromptPart[]) {
  return parts.map((part) => part.text).join('\n\n');
}

function anatomyColumns(groups: ReturnType<typeof groupedParts>, total: number) {
  const minWeight = Math.max(1, Math.round(total * 0.025));
  return groups.map((group) => `${Math.max(group.chars, minWeight)}fr`).join(' ');
}

function groupedParts(parts: PromptPart[]) {
  return layerOrder.map((kind) => {
    const items = parts.filter((part) => part.kind === kind);
    return {
      kind,
      items,
      chars: items.reduce((sum, part) => sum + part.text.length, 0),
    };
  });
}

function partGroups(parts: PromptPart[]) {
  const groups: PartDisplayGroup[] = [];

  for (const part of parts) {
    if (!part.parentTitle) {
      groups.push({ type: 'single', part });
      continue;
    }

    const previous = groups[groups.length - 1];
    if (previous?.type === 'parent' && previous.title === part.parentTitle) {
      previous.parts.push(part);
      previous.chars += part.text.length;
      continue;
    }

    groups.push({
      type: 'parent',
      title: part.parentTitle,
      description: part.parentDescription,
      parts: [part],
      chars: part.text.length,
    });
  }

  return groups;
}

function mermaidFlowSource(groups: ReturnType<typeof groupedParts>, displayGroups: PartDisplayGroup[]) {
  const core = displayGroups.find((item): item is Extract<PartDisplayGroup, { type: 'parent' }> => item.type === 'parent' && item.title === 'Core operating contract');
  const system = groups.find((group) => group.kind === 'system');
  const runtime = groups.find((group) => group.kind === 'reminder');
  const tools = groups.find((group) => group.kind === 'tools');
  const user = groups.find((group) => group.kind === 'user');
  const coreLabel = core ? `Core operating contract<br/>${core.parts.length} sections` : 'Core operating contract';
  return `flowchart LR
  A["Claude Code request"] --> B["System scaffold<br/>${system?.items.length ?? 0} blocks"]
  B --> B1["CLI metadata"]
  B --> B2["Claude Code identity"]
  B --> B3["${coreLabel}"]
  B3 --> B31["Safety / task rules"]
  B3 --> B32["Tool-use protocol"]
  B3 --> B33["Tone / memory / environment"]
  A --> C["Runtime context<br/>${runtime?.items.length ?? 0} reminders"]
  A --> D["Tool catalog<br/>${tools?.items.length ?? 0} catalog block"]
  A --> E["User message<br/>${user?.items.length ?? 0} block"]
  C --> F["Final request body"]
  D --> F
  E --> F
  B --> F
  classDef system fill:#fff7ed,stroke:#fb923c,color:#1e293b;
  classDef runtime fill:#eff6ff,stroke:#60a5fa,color:#1e293b;
  classDef tools fill:#f5f3ff,stroke:#a78bfa,color:#1e293b;
  classDef user fill:#f0fdf4,stroke:#22c55e,color:#1e293b;
  classDef final fill:#0f172a,stroke:#0f172a,color:#ffffff;
  class B,B1,B2,B3,B31,B32,B33 system;
  class C runtime;
  class D tools;
  class E user;
  class F final;`;
}

export default function TracePromptSimulator() {
  const traces = useMemo(() => {
    return traceSamples.map((sample) => normalizeTrace(sample.id, sample.label, sample));
  }, []);

  const [traceId, setTraceId] = useState(traces[0]?.id ?? 'kimi-1');
  const [stepId, setStepId] = useState('user');
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [activeAnatomyKind, setActiveAnatomyKind] = useState<PromptPart['kind']>('system');
  const [toolQuery, setToolQuery] = useState('');
  const [toolCategory, setToolCategory] = useState<ToolCategory>('all');
  const [selectedToolName, setSelectedToolName] = useState<string | null>(null);
  const [showRawPretty, setShowRawPretty] = useState(true);

  const trace = useMemo(() => traces.find((t) => t.id === traceId) ?? traces[0], [traceId, traces]);
  const prompt = useMemo(() => buildPromptSteps(trace), [trace]);
  const steps = prompt.steps;
  const currentStepIdx = Math.max(0, steps.findIndex((s) => s.id === stepId));
  const currentStep = steps[currentStepIdx] ?? steps[steps.length - 1];
  const visibleParts = currentStep?.parts ?? [];
  const finalParts = steps[steps.length - 1]?.parts ?? visibleParts;
  const finalTotalChars = finalParts.reduce((sum, part) => sum + part.text.length, 0);
  const finalGroups = groupedParts(finalParts);
  const activeAnatomyGroup = finalGroups.find((group) => group.kind === activeAnatomyKind) ?? finalGroups.find((group) => group.items.length) ?? finalGroups[0];
  const displayGroups = partGroups(finalParts);
  const flowSource = mermaidFlowSource(groupedParts(finalParts), partGroups(finalParts));
  const selectedPart = selectedPartId ? finalParts.find((part) => part.id === selectedPartId) : undefined;
  const activeStepPartIds = useMemo(() => new Set((currentStep?.added ?? []).map((part) => part.id)), [currentStep]);

  const filteredTools = useMemo(() => {
    const q = toolQuery.trim().toLowerCase();
    return trace.tools.filter((tool) => {
      const matchesCategory = toolCategory === 'all' || classifyTool(tool) === toolCategory;
      const matchesQuery = !q || `${tool.name}\n${tool.description ?? ''}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [toolCategory, toolQuery, trace.tools]);
  const toolCounts = useMemo(() => {
    const counts: Record<ToolCategory, number> = {
      all: trace.tools.length,
      files: 0,
      runtime: 0,
      workflow: 0,
      automation: 0,
      web: 0,
      mcp: 0,
      interaction: 0,
    };
    trace.tools.forEach((tool) => {
      counts[classifyTool(tool)] += 1;
    });
    return counts;
  }, [trace.tools]);
  const groupedTools = useMemo(() => {
    return toolCategoryOrder
      .map((category) => ({
        category,
        tools: filteredTools.filter((tool) => classifyTool(tool) === category),
      }))
      .filter((group) => group.tools.length > 0);
  }, [filteredTools]);
  const selectedTool =
    filteredTools.find((tool) => tool.name === selectedToolName) ??
    trace.tools.find((tool) => tool.name === selectedToolName) ??
    filteredTools[0] ??
    trace.tools[0];

  const selectStep = (id: string) => {
    setStepId(id);
    setSelectedPartId(null);
  };

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: 'var(--bg-page)' }}>
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(255,251,245,0.92)', borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-[1560px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
              <Layers3 size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Trace Prompt Simulator
              </div>
              <div className="truncate text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Deconstruct one Claude Code request into system, runtime, tool, and user layers.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {traces.map((item) => (
              <Button
                key={item.id}
                variant={item.id === traceId ? 'default' : 'secondary'}
                className="h-9 px-3 text-[13px]"
                onClick={() => {
                  setTraceId(item.id);
                  setStepId('user');
                  setSelectedPartId(null);
                  setActiveAnatomyKind('system');
                  setToolCategory('all');
                  setToolQuery('');
                  setSelectedToolName(null);
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1560px] px-4 py-5 sm:px-6">
        <section className="min-w-0 rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="mb-4 flex flex-col gap-3 rounded-lg border px-4 py-3 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {trace.label}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                <span>model: {trace.model ?? '-'}</span>
                <span>provider: {trace.provider ?? '-'}</span>
                <span>status: {trace.status ?? '-'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border px-2 py-1 text-[12px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                ~{formatNumber(prompt.tokens)} tokens
              </span>
              <span className="rounded-md border px-2 py-1 text-[12px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {steps.length} assembly steps
              </span>
            </div>
          </div>

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="map" className="gap-2">
                <ListTree size={14} /> Map
              </TabsTrigger>
              <TabsTrigger value="step" className="gap-2">
                <Layers3 size={14} /> Step
              </TabsTrigger>
              <TabsTrigger value="tools" className="gap-2">
                <Wrench size={14} /> Tools
              </TabsTrigger>
              <TabsTrigger value="raw" className="gap-2">
                <FileJson2 size={14} /> Raw
              </TabsTrigger>
              <TabsTrigger value="response" className="gap-2">
                <Braces size={14} /> Response
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="mb-4 grid gap-3 sm:grid-cols-4">
                    <Metric label="Blocks" value={String(finalParts.length)} />
                    <Metric label="Chars" value={formatNumber(finalTotalChars)} />
                    <Metric label="Est. tokens" value={formatNumber(estimateTokens(finalTotalChars))} />
                    <Metric label="Tools" value={String(trace.tools.length)} />
                  </div>

                  <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <Sparkles size={15} style={{ color: 'var(--primary)' }} />
                    Prompt anatomy
                  </div>
                  <div className="grid h-6 overflow-hidden rounded-md border" style={{ borderColor: 'var(--border)', gridTemplateColumns: anatomyColumns(finalGroups, finalTotalChars) }}>
                    {finalGroups.map((group) => {
                      const style = kindStyles[group.kind];
                      const pct = finalTotalChars ? Math.round((group.chars / finalTotalChars) * 100) : 0;
                      return (
                        <button
                          key={group.kind}
                          aria-label={`${style.label}: ${pct}%`}
                          className="group relative h-full transition-opacity hover:opacity-90"
                          onMouseEnter={() => setActiveAnatomyKind(group.kind)}
                          onFocus={() => setActiveAnatomyKind(group.kind)}
                          onClick={() => {
                            setActiveAnatomyKind(group.kind);
                            setSelectedPartId(group.items[0]?.id ?? null);
                          }}
                          style={{
                            backgroundColor: style.color,
                          }}
                        >
                          <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-[10px] font-semibold text-white group-hover:flex">
                            {pct}%
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <AnatomySummary group={activeAnatomyGroup} totalChars={finalTotalChars} onSelectPart={setSelectedPartId} />

                  <div className="mb-4">
                    <AssemblyFlow steps={steps} activeStepId={currentStep?.id} onSelectStep={selectStep} />
                  </div>

                  <TemplateGraph groups={displayGroups} activeStep={currentStep} activePartIds={activeStepPartIds} selectedPartId={selectedPart?.id} onSelectPart={setSelectedPartId} />

                  <MermaidFlow chart={flowSource} />
                </div>

                <div className="2xl:sticky 2xl:top-[92px] 2xl:self-start">
                  <Inspector part={selectedPart} step={currentStep} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step" className="mt-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="mb-4 grid gap-3 md:grid-cols-4">
                    {steps.map((step, index) => {
                      const active = step.id === currentStep?.id;
                      const delta = step.added.reduce((sum, part) => sum + part.text.length, 0);
                      return (
                        <button
                          key={step.id}
                          className="rounded-lg border p-3 text-left"
                          onClick={() => selectStep(step.id)}
                          style={{
                            borderColor: active ? 'rgba(234,88,12,0.42)' : 'var(--border)',
                            backgroundColor: active ? 'rgba(234,88,12,0.08)' : '#fffaf3',
                          }}
                        >
                          <div className="text-[12px] font-semibold" style={{ color: active ? 'var(--primary)' : 'var(--text-primary)' }}>
                            {index + 1}. {step.title}
                          </div>
                          <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            +{formatNumber(delta)} chars
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.max(4, Math.round((step.cumulativeChars / prompt.assembled.length) * 100))}%`, backgroundColor: active ? 'var(--primary)' : '#fdba74' }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mb-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
                    <div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {currentStepIdx + 1}. {currentStep?.title ?? 'Step'}
                    </div>
                    <div className="mt-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      This stage adds {currentStep?.added.length ?? 0} prompt block(s), with {formatNumber(currentStep?.cumulativeChars ?? 0)} cumulative chars.
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {partGroups(currentStep?.added ?? []).map((item, index) => {
                      if (item.type === 'single') {
                        return <StepPart key={item.part.id} part={item.part} onSelect={setSelectedPartId} active={selectedPart?.id === item.part.id} />;
                      }

                      const firstPart = item.parts[0];
                      const style = kindStyles[firstPart.kind];
                      const active = item.parts.some((part) => selectedPart?.id === part.id);
                      return (
                        <div key={`${item.title}-${index}`} className="rounded-lg border p-4" style={{ borderColor: active ? style.color : style.border, backgroundColor: style.bg }}>
                          <button className="w-full text-left" onClick={() => setSelectedPartId(firstPart.id)}>
                            <div className="text-[13px] font-semibold" style={{ color: style.color }}>
                              {item.title}
                            </div>
                            <div className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                              {item.description}
                            </div>
                          </button>
                          <div className="mt-3 grid gap-2 md:grid-cols-2">
                            {item.parts.map((part) => (
                              <StepPart key={part.id} part={part} onSelect={setSelectedPartId} active={selectedPart?.id === part.id} compact />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {(currentStep?.added.length ?? 0) === 0 ? (
                      <div className="rounded-lg border p-4 text-[13px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        No new visible prompt block in this stage.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="2xl:sticky 2xl:top-[92px] 2xl:self-start">
                  <Inspector part={selectedPart} step={currentStep} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
                  <div className="mb-4 grid gap-3 md:grid-cols-4">
                    <Metric label="Tools exposed" value={String(trace.tools.length)} />
                    <Metric label="Visible after filters" value={String(filteredTools.length)} />
                    <Metric label="Categories" value={String(toolCategoryOrder.filter((category) => toolCounts[category] > 0).length)} />
                    <Metric label="With schema" value={String(trace.tools.filter((tool) => schemaProperties(tool).length > 0).length)} />
                  </div>

                  <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Tool catalog map
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(['all', ...toolCategoryOrder] as ToolCategory[]).map((category) => {
                          const meta = toolCategoryMeta[category];
                          const active = category === toolCategory;
                          return (
                            <button
                              key={category}
                              className="rounded-md border px-3 py-1.5 text-[12px] font-medium"
                              onClick={() => setToolCategory(category)}
                              style={{
                                borderColor: active ? meta.color : meta.border,
                                backgroundColor: active ? meta.bg : '#ffffff',
                                color: active ? meta.color : 'var(--text-muted)',
                              }}
                            >
                              {meta.label} <span className="ml-1 font-semibold">{toolCounts[category]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="relative xl:w-[420px]">
                      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                      <Input value={toolQuery} onChange={(e) => setToolQuery(e.target.value)} placeholder="Search tools by name or description" className="h-9 pl-9" />
                    </div>
                  </div>

                  {filteredTools.length ? (
                    <div className="grid gap-4">
                      {groupedTools.map((group) => {
                        const meta = toolCategoryMeta[group.category];
                        return (
                          <section key={group.category} className="rounded-lg border p-3" style={{ borderColor: meta.border, backgroundColor: meta.bg }}>
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="text-[13px] font-semibold" style={{ color: meta.color }}>
                                {meta.label}
                              </div>
                              <div className="rounded-md bg-white/75 px-2 py-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                {group.tools.length} tools
                              </div>
                            </div>
                            <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
                              {group.tools.map((tool) => (
                                <ToolCard key={tool.name} tool={tool} active={selectedTool?.name === tool.name} onSelect={setSelectedToolName} />
                              ))}
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-5 text-[13px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      No tools match the current filter.
                    </div>
                  )}
                </div>

                <div className="2xl:sticky 2xl:top-[92px] 2xl:self-start">
                  <ToolInspector tool={selectedTool} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  Sanitized request body subset.
                </div>
                <Button variant="secondary" className="h-9 px-3 text-[13px]" onClick={() => setShowRawPretty((v) => !v)}>
                  {showRawPretty ? 'Compact' : 'Pretty'}
                </Button>
              </div>
              {codeBlock(showRawPretty ? JSON.stringify(trace.requestBody, null, 2) : JSON.stringify(trace.requestBody))}
            </TabsContent>

            <TabsContent value="response" className="mt-4">
              {codeBlock((trace.responseText ?? '').trim() || '(empty)')}
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function AnatomySummary({
  group,
  totalChars,
  onSelectPart,
}: {
  group?: ReturnType<typeof groupedParts>[number];
  totalChars: number;
  onSelectPart: (id: string) => void;
}) {
  if (!group) return null;

  const style = kindStyles[group.kind];
  const pct = totalChars ? Math.round((group.chars / totalChars) * 100) : 0;
  const firstPart = group.items[0];

  return (
    <div className="mb-4 mt-3 rounded-lg border p-3" style={{ borderColor: style.border, backgroundColor: style.bg }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold" style={{ color: style.color }}>
            {style.label}
          </div>
          <div className="mt-1 text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {pct}%
          </div>
          <div className="mt-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {group.items.length} blocks / {formatNumber(group.chars)} chars
          </div>
        </div>
        {firstPart ? (
          <Button variant="secondary" className="h-8 px-3 text-[12px]" onClick={() => onSelectPart(firstPart.id)}>
            Inspect first block
          </Button>
        ) : null}
      </div>

      {group.items.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {group.items.slice(0, 8).map((part) => (
            <button
              key={part.id}
              className="max-w-[180px] truncate rounded-md border bg-white/70 px-2 py-1 text-[11px]"
              onClick={() => onSelectPart(part.id)}
              style={{ borderColor: style.border, color: 'var(--text-primary)' }}
            >
              {part.title}
            </button>
          ))}
          {group.items.length > 8 ? (
            <span className="rounded-md bg-white/70 px-2 py-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              +{group.items.length - 8} more
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MermaidFlow({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('mermaid')
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            primaryColor: '#fff7ed',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#fb923c',
            lineColor: '#fb923c',
            secondaryColor: '#eff6ff',
            tertiaryColor: '#f5f3ff',
            fontFamily: 'Geist, Microsoft YaHei, sans-serif',
          },
        });
        return mermaid.render(`prompt-flow-${id}`, chart);
      })
      .then((result) => {
        if (!cancelled) {
          setSvg(result.svg);
          setError('');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSvg('');
          setError(err instanceof Error ? err.message : 'Failed to render Mermaid chart.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  return (
    <section className="mb-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          <GitBranch size={15} style={{ color: 'var(--primary)' }} />
          Mermaid flowchart
        </div>
        <Button variant="secondary" className="h-8 px-3 text-[12px]" onClick={() => setShowSource((value) => !value)}>
          {showSource ? 'Hide source' : 'Show source'}
        </Button>
      </div>
      <div className="agent-loop-terminal-scroll overflow-auto rounded-lg border bg-white p-3" style={{ borderColor: 'rgba(234,88,12,0.28)' }}>
        {error ? (
          <pre className="whitespace-pre-wrap text-[12px]" style={{ color: 'var(--text-muted)' }}>
            {error}
          </pre>
        ) : (
          <div className="min-w-[760px]" dangerouslySetInnerHTML={{ __html: svg }} />
        )}
      </div>
      {showSource ? (
        <pre
          className="agent-loop-terminal-scroll mt-3 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-lg border p-3 text-[12px]"
          style={{ backgroundColor: '#0f172a', color: '#e6e6e6', borderColor: 'rgba(51,65,85,0.9)' }}
        >
          {chart}
        </pre>
      ) : null}
    </section>
  );
}

function AssemblyFlow({
  steps,
  activeStepId,
  onSelectStep,
}: {
  steps: PromptStep[];
  activeStepId?: string;
  onSelectStep: (id: string) => void;
}) {
  return (
    <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        <GitBranch size={15} style={{ color: 'var(--primary)' }} />
        Assembly flow
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const active = step.id === activeStepId;
          const addedKinds = Array.from(new Set(step.added.map((part) => part.kind)));
          return (
            <button
              key={step.id}
              className="relative rounded-lg border px-3 py-2 text-left"
              onClick={() => onSelectStep(step.id)}
              style={{
                borderColor: active ? 'rgba(234,88,12,0.42)' : 'var(--border)',
                backgroundColor: active ? 'rgba(234,88,12,0.08)' : '#ffffff',
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold"
                  style={{
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: active ? 'var(--primary)' : '#ffffff',
                    color: active ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {index + 1}
                </span>
                <div className="truncate text-[12px] font-semibold" style={{ color: active ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {step.title}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {addedKinds.length ? (
                  addedKinds.map((kind) => (
                    <span key={kind} className="rounded px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: kindStyles[kind].bg, color: kindStyles[kind].color }}>
                      {kindStyles[kind].label}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    no visible block
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TemplateGraph({
  groups,
  activeStep,
  activePartIds,
  selectedPartId,
  onSelectPart,
}: {
  groups: PartDisplayGroup[];
  activeStep?: PromptStep;
  activePartIds: Set<string>;
  selectedPartId?: string;
  onSelectPart: (id: string) => void;
}) {
  return (
    <section className="mb-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        <Network size={15} style={{ color: 'var(--primary)' }} />
        Prompt assembly blueprint
      </div>
      <div className="mb-3 rounded-lg border bg-white/60 px-3 py-2 text-[12px]" style={{ borderColor: 'rgba(234,88,12,0.22)', color: 'var(--text-muted)' }}>
        Always shows the final request structure. The highlighted nodes are appended by the selected Assembly flow stage
        {activeStep ? `: ${activeStep.title}.` : '.'}
      </div>
      <div className="rounded-lg border bg-white p-4" style={{ borderColor: 'rgba(234,88,12,0.28)' }}>
        <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
          <div className="mb-3 text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Template outline
          </div>
          <div className="grid gap-2">
            {groups.map((item, index) =>
              item.type === 'single' ? (
                <GraphNode
                  key={item.part.id}
                  part={item.part}
                  selected={selectedPartId === item.part.id}
                  active={activePartIds.has(item.part.id)}
                  onSelectPart={onSelectPart}
                />
              ) : (
                <OutlineParentNode
                  key={`${item.title}-${index}`}
                  item={item}
                  selectedPartId={selectedPartId}
                  activePartIds={activePartIds}
                  onSelectPart={onSelectPart}
                />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function OutlineParentNode({
  item,
  selectedPartId,
  activePartIds,
  onSelectPart,
}: {
  item: Extract<PartDisplayGroup, { type: 'parent' }>;
  selectedPartId?: string;
  activePartIds: Set<string>;
  onSelectPart: (id: string) => void;
}) {
  const firstPart = item.parts[0];
  const style = kindStyles[firstPart.kind];
  const selected = item.parts.some((part) => part.id === selectedPartId);
  const active = item.parts.some((part) => activePartIds.has(part.id));
  const [expanded, setExpanded] = useState(active || selected || item.title === 'Core operating contract');
  return (
    <div
      className="rounded-lg border p-2"
      style={{
        borderColor: selected || active ? style.color : style.border,
        backgroundColor: active ? style.bg : 'rgba(255,255,255,0.75)',
        boxShadow: active ? `inset 3px 0 0 ${style.color}` : undefined,
      }}
    >
      <button
        className="flex w-full min-w-0 items-center justify-between gap-2 text-left"
        onClick={() => {
          setExpanded((value) => !value);
          onSelectPart(firstPart.id);
        }}
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold" style={{ color: style.color }}>
            {item.title}
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {item.parts.length} sections / {formatNumber(item.chars)} chars
          </div>
        </div>
        <ChevronRight size={14} className="shrink-0 transition-transform" style={{ color: style.color, transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
      </button>
      {expanded ? (
        <div className="mt-2 grid gap-1.5 border-t pt-2" style={{ borderColor: style.border }}>
          {item.description ? (
            <div className="rounded-md bg-white/70 px-2 py-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {item.description}
            </div>
          ) : null}
          {item.parts.map((part, index) => (
            <button
              key={part.id}
              className="flex min-w-0 items-center gap-2 rounded-md border bg-white/75 px-2 py-1.5 text-left"
              onClick={(event) => {
                event.stopPropagation();
                onSelectPart(part.id);
              }}
              style={{
                borderColor: selectedPartId === part.id || activePartIds.has(part.id) ? style.color : style.border,
                backgroundColor: activePartIds.has(part.id) ? 'rgba(234,88,12,0.08)' : 'rgba(255,255,255,0.75)',
              }}
            >
              <span className="shrink-0 text-[10px] font-mono" style={{ color: style.color }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="truncate text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {part.title}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GraphNode({
  part,
  selected,
  active,
  onSelectPart,
  compact = false,
}: {
  part: PromptPart;
  selected: boolean;
  active?: boolean;
  onSelectPart: (id: string) => void;
  compact?: boolean;
}) {
  const style = kindStyles[part.kind];
  return (
    <button
      className={`min-w-0 rounded-lg border text-left ${compact ? 'px-2 py-1.5' : 'p-2'}`}
      onClick={() => onSelectPart(part.id)}
      style={{
        borderColor: selected || active ? style.color : style.border,
        backgroundColor: active ? style.bg : selected ? '#ffffff' : compact ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.72)',
        boxShadow: active ? `inset 3px 0 0 ${style.color}` : undefined,
      }}
    >
      <div className="truncate text-[12px] font-semibold" style={{ color: selected ? style.color : 'var(--text-primary)' }}>
        {part.title}
      </div>
      {!compact ? (
        <div className="mt-1 line-clamp-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {part.description}
        </div>
      ) : null}
    </button>
  );
}

function StepPart({
  part,
  onSelect,
  active,
  compact = false,
}: {
  part: PromptPart;
  onSelect: (id: string) => void;
  active?: boolean;
  compact?: boolean;
}) {
  const style = kindStyles[part.kind];
  return (
    <button
      className={`rounded-lg border text-left ${compact ? 'p-3' : 'p-4'}`}
      onClick={() => onSelect(part.id)}
      style={{
        borderColor: active ? style.color : compact ? 'rgba(255,255,255,0.9)' : style.border,
        backgroundColor: active ? '#ffffff' : compact ? 'rgba(255,255,255,0.62)' : style.bg,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold" style={{ color: active ? style.color : 'var(--text-primary)' }}>
            {part.title}
          </div>
          <div className="mt-2 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {excerpt(part.text, compact ? 160 : 240)}
          </div>
        </div>
        <div className="shrink-0 rounded-md px-2 py-1 text-[11px]" style={{ backgroundColor: style.bg, color: style.color }}>
          {formatNumber(part.text.length)}
        </div>
      </div>
    </button>
  );
}

function ToolCard({ tool, active, onSelect }: { tool: TraceTool; active?: boolean; onSelect: (name: string) => void }) {
  const category = classifyTool(tool);
  const meta = toolCategoryMeta[category];
  const properties = schemaProperties(tool);
  return (
    <button
      className="min-w-0 rounded-lg border p-3 text-left"
      onClick={() => onSelect(tool.name)}
      style={{
        borderColor: active ? meta.color : meta.border,
        backgroundColor: active ? '#ffffff' : 'rgba(255,255,255,0.72)',
        boxShadow: active ? `inset 3px 0 0 ${meta.color}` : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold" style={{ color: active ? meta.color : 'var(--text-primary)' }}>
            {tool.name}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {properties.length ? `${properties.length} input fields` : 'no input schema'}
          </div>
        </div>
        <span className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold" style={{ backgroundColor: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </div>
      <div className="mt-2 line-clamp-3 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {tool.description ?? '(no description)'}
      </div>
    </button>
  );
}

function ToolInspector({ tool }: { tool?: TraceTool }) {
  if (!tool) {
    return (
      <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Select a tool to inspect its definition.
        </div>
      </div>
    );
  }

  const category = classifyTool(tool);
  const meta = toolCategoryMeta[category];
  const properties = schemaProperties(tool);

  return (
    <div className="min-w-0 rounded-lg border p-4" style={{ borderColor: meta.border, backgroundColor: meta.bg }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold" style={{ color: meta.color }}>
            {meta.label}
          </div>
          <div className="mt-1 truncate text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {tool.name}
          </div>
          <div className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Callable tool exposed to this request.
          </div>
        </div>
        <div className="shrink-0 rounded-md bg-white px-2 py-1 text-[12px]" style={{ color: meta.color }}>
          {properties.length} fields
        </div>
      </div>

      <Separator className="my-4" />

      <div className="mb-2 text-[12px] font-semibold" style={{ color: meta.color }}>
        Description
      </div>
      <div className="rounded-lg border bg-white/75 p-3 text-[12px] leading-relaxed" style={{ borderColor: meta.border, color: 'var(--text-secondary)' }}>
        {tool.description ?? '(no description)'}
      </div>

      {properties.length ? (
        <>
          <div className="mb-2 mt-4 text-[12px] font-semibold" style={{ color: meta.color }}>
            Input fields
          </div>
          <div className="grid gap-2">
            {properties.map((property) => (
              <div key={property.name} className="rounded-lg border bg-white/75 p-2" style={{ borderColor: meta.border }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 truncate text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {property.name}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px]" style={{ color: meta.color }}>
                      {property.type}
                    </span>
                    {property.required ? (
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px]" style={{ color: '#dc2626' }}>
                        required
                      </span>
                    ) : null}
                  </div>
                </div>
                {property.description ? (
                  <div className="mt-1 line-clamp-2 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {property.description}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {tool.input_schema ? (
        <>
          <div className="mb-2 mt-4 text-[12px] font-semibold" style={{ color: meta.color }}>
            Raw schema
          </div>
          {codeBlock(JSON.stringify(tool.input_schema, null, 2))}
        </>
      ) : null}
    </div>
  );
}

function Inspector({ part, step }: { part?: PromptPart; step?: PromptStep }) {
  if (!part) {
    if (step) {
      const assembledText = joinPromptParts(step.parts);
      return (
        <div className="min-w-0 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[12px] font-semibold" style={{ color: 'var(--primary)' }}>
                Assembly stage
              </div>
              <div className="mt-1 truncate text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {step.title}
              </div>
              <div className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Full cumulative prompt after this stage. Click a blueprint node to inspect a single block.
              </div>
            </div>
            <div className="shrink-0 rounded-md bg-white px-2 py-1 text-[12px]" style={{ color: 'var(--primary)' }}>
              {formatNumber(step.cumulativeChars)} chars
            </div>
          </div>

          <Separator className="my-4" />

          <div className="mb-2 text-[12px] font-semibold" style={{ color: 'var(--primary)' }}>
            Full prompt at this stage
          </div>
          {codeBlock(assembledText)}
        </div>
      );
    }

    return (
      <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
        <div className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Select a layer to inspect its source text.
        </div>
      </div>
    );
  }

  const style = kindStyles[part.kind];
  return (
    <div className="min-w-0 rounded-lg border p-4" style={{ borderColor: style.border, backgroundColor: style.bg }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {part.parentTitle ? (
            <div className="mb-1 text-[12px] font-semibold" style={{ color: style.color }}>
              {part.parentTitle}
            </div>
          ) : null}
          <div className="truncate text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {part.title}
          </div>
          <div className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {part.description}
          </div>
        </div>
        <div className="shrink-0 rounded-md px-2 py-1 text-[12px]" style={{ backgroundColor: '#ffffff', color: style.color }}>
          {formatNumber(part.text.length)} chars
        </div>
      </div>

      <Separator className="my-4" />

      <div className="mb-2 text-[12px] font-semibold" style={{ color: style.color }}>
        Source excerpt
      </div>
      {codeBlock(part.text)}
    </div>
  );
}
