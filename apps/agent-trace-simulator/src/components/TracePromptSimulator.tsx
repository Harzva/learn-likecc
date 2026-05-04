import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Braces,
  Check,
  ChevronRight,
  Clipboard,
  Cpu,
  Database,
  Eye,
  FileCode2,
  FileJson2,
  FilterX,
  Gauge,
  GitBranch,
  Home,
  Info,
  Layers3,
  ListTree,
  MousePointerClick,
  Network,
  PanelRightOpen,
  PlayCircle,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare,
  TimerReset,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { normalizeTrace } from '@/trace/normalize';
import { buildPromptSteps } from '@/trace/promptSteps';
import type { NormalizedTrace, PromptPart, PromptStep, TraceTool } from '@/trace/types';

const kindStyles: Record<PromptPart['kind'], { label: string; shortLabel: string; color: string; bg: string; border: string }> = {
  system: { label: 'System scaffold', shortLabel: 'System', color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
  reminder: { label: 'Runtime reminders', shortLabel: 'Runtime', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
  tools: { label: 'Tool catalog', shortLabel: 'Tools', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  user: { label: 'User message', shortLabel: 'User', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
};

const layerOrder: PromptPart['kind'][] = ['system', 'reminder', 'tools', 'user'];

type PartDisplayGroup =
  | { type: 'single'; part: PromptPart }
  | { type: 'parent'; title: string; description?: string; parts: PromptPart[]; chars: number };

type ToolCategory = 'all' | 'files' | 'runtime' | 'workflow' | 'automation' | 'web' | 'mcp' | 'interaction';
type ViewId = 'map' | 'step' | 'tools' | 'raw' | 'response';
type RawTraceSample = { id: string; label: string } & Record<string, unknown>;

const toolCategoryOrder: Exclude<ToolCategory, 'all'>[] = ['files', 'runtime', 'workflow', 'automation', 'web', 'mcp', 'interaction'];
const focusCycle: ViewId[] = ['map', 'step', 'tools', 'raw', 'response'];

const viewMeta: Array<{ id: ViewId; label: string; description: string; icon: ReactNode }> = [
  { id: 'map', label: 'Map', description: '四层组装总览', icon: <ListTree size={15} /> },
  { id: 'step', label: 'Step', description: '逐步累积 prompt', icon: <Layers3 size={15} /> },
  { id: 'tools', label: 'Tools', description: '工具目录与 schema', icon: <Wrench size={15} /> },
  { id: 'raw', label: 'Raw', description: '原始 request body', icon: <FileJson2 size={15} /> },
  { id: 'response', label: 'Response', description: '模型返回文本', icon: <Braces size={15} /> },
];

const viewGuides: Record<ViewId, { title: string; summary: string; action: string }> = {
  map: {
    title: '先看请求如何被装配',
    summary: '用四层结构、增量步骤和模板图谱建立全局方向，再进入单个块或工具 schema。',
    action: '点击彩色层、Assembly flow 或 blueprint 节点，右侧 inspector 会同步更新。',
  },
  step: {
    title: '逐步复盘 prompt 变厚过程',
    summary: '把一次 request 拆成阶段：系统脚手架、运行时上下文、工具目录和用户输入。',
    action: '点击阶段卡片可查看该阶段新增内容，点击块卡片可查看源文本。',
  },
  tools: {
    title: '把工具目录当作能力面板阅读',
    summary: '工具不是附录，而是模型可调用能力的边界、参数协议和执行空间。',
    action: '用能力分类或搜索定位工具，再在右侧检查 description、字段和原始 schema。',
  },
  raw: {
    title: '回到原始 request 证据',
    summary: '用 JSON 对照可视化拆解，确认页面没有凭空发明 prompt 结构。',
    action: '切换 Pretty / Compact，或复制片段去和 trace 文件做外部对照。',
  },
  response: {
    title: '把模型返回放回请求上下文',
    summary: '响应文本需要和前面的 system、runtime、tools、user 层一起看，才知道它被什么约束塑形。',
    action: '先确认 request model/provider，再对照 response chars 和返回正文。',
  },
};

const traceAccents: Record<string, { accent: string; glow: string; tag: string }> = {
  'kimi-1': {
    accent: '#fb923c',
    glow: 'rgba(251,146,60,0.22)',
    tag: 'Kimi route / CLI request',
  },
  'kimi-2': {
    accent: '#60a5fa',
    glow: 'rgba(96,165,250,0.18)',
    tag: 'Kimi route / alternate request',
  },
  'demo-a': {
    accent: '#a78bfa',
    glow: 'rgba(167,139,250,0.18)',
    tag: 'Demo trace / teaching sample',
  },
};

const emptyTrace: NormalizedTrace = {
  id: 'loading',
  label: 'Loading trace',
  requestBody: null,
  systemBlocks: [],
  injectedBlocks: [],
  tools: [],
};

function activeTraceTone(traceId: string) {
  return traceAccents[traceId] ?? traceAccents['kimi-1'];
}

function nextViewId(view: ViewId) {
  const index = focusCycle.indexOf(view);
  return focusCycle[(index + 1) % focusCycle.length];
}

function previousViewId(view: ViewId) {
  const index = focusCycle.indexOf(view);
  return focusCycle[(index - 1 + focusCycle.length) % focusCycle.length];
}

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

const toolCategoryNotes: Record<ToolCategory, string> = {
  all: '完整工具边界',
  files: '读写与编辑文件',
  runtime: '执行环境与 shell',
  workflow: '规划、代理与长任务',
  automation: '定时、监控与通知',
  web: '联网检索与获取',
  mcp: '外部 MCP 能力',
  interaction: '用户交互与其它工具',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function estimateTokens(chars: number) {
  return Math.ceil(chars / 4);
}

function percentage(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function excerpt(text: string, max = 360) {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max)}...`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function hostFromUrl(value?: string) {
  if (!value) return '-';
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
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

function layerBreakdown(parts: PromptPart[]) {
  const total = parts.reduce((sum, part) => sum + part.text.length, 0);
  return groupedParts(parts).map((group) => ({
    ...group,
    pct: percentage(group.chars, total),
  }));
}

type LayerBreakdownItem = ReturnType<typeof layerBreakdown>[number];

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
  const [traces, setTraces] = useState<NormalizedTrace[]>([]);
  const [traceLoadError, setTraceLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    import('@/data/traceSamples.json')
      .then((module) => {
        const samples = module.default as RawTraceSample[];
        const normalized = samples.map((sample) => normalizeTrace(sample.id, sample.label, sample));
        if (!cancelled) {
          setTraces(normalized);
          setTraceLoadError('');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setTraceLoadError(error instanceof Error ? error.message : 'Failed to load trace samples.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [traceId, setTraceId] = useState('kimi-1');
  const [stepId, setStepId] = useState('system');
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [activeAnatomyKind, setActiveAnatomyKind] = useState<PromptPart['kind']>('system');
  const [toolQuery, setToolQuery] = useState('');
  const [toolCategory, setToolCategory] = useState<ToolCategory>('all');
  const [selectedToolName, setSelectedToolName] = useState<string | null>(null);
  const [showRawPretty, setShowRawPretty] = useState(true);
  const [activeView, setActiveView] = useState<ViewId>('map');
  const [isPlayingSteps, setIsPlayingSteps] = useState(false);

  const trace = useMemo(() => traces.find((t) => t.id === traceId) ?? traces[0] ?? emptyTrace, [traceId, traces]);
  const isTraceLoading = traces.length === 0;
  const prompt = useMemo(() => buildPromptSteps(trace), [trace]);
  const traceTone = activeTraceTone(trace.id);
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
  const currentStepAddedChars = currentStep?.added.reduce((sum, part) => sum + part.text.length, 0) ?? 0;
  const systemChars = finalGroups.find((group) => group.kind === 'system')?.chars ?? 0;
  const toolsChars = finalGroups.find((group) => group.kind === 'tools')?.chars ?? 0;
  const dominantGroup = finalGroups.reduce((best, group) => (group.chars > best.chars ? group : best), finalGroups[0]);
  const largestDeltaStep = steps.reduce((best, step) => {
    const stepDelta = step.added.reduce((sum, part) => sum + part.text.length, 0);
    const bestDelta = best.added.reduce((sum, part) => sum + part.text.length, 0);
    return stepDelta > bestDelta ? step : best;
  }, steps[0]);
  const largestDeltaChars = largestDeltaStep?.added.reduce((sum, part) => sum + part.text.length, 0) ?? 0;
  const traceRoleCards = [
    {
      title: '驱动动态模拟器',
      body: '把真实 request、assistant/tool_use、tool_result 串成可回放的 Agent Loop，而不是手写剧情。',
      href: '../agent-loop-simulator/',
      icon: <GitBranch size={16} />,
    },
    {
      title: '生成脚本练习',
      body: '从工具 schema、命令参数和执行片段抽出练习任务，让脚本启示页有真实依据。',
      href: '../agent-script-insight/',
      icon: <FileCode2 size={16} />,
    },
    {
      title: '沉淀机制模板',
      body: '把核心运行契约、runtime reminder、工具目录抽象成可复用的提示词模板图谱。',
      href: '../topic-cc-loop-lab.html',
      icon: <Workflow size={16} />,
    },
  ];

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
  const selectedToolCategory = selectedTool ? classifyTool(selectedTool) : 'all';
  const dominantToolCategory = toolCategoryOrder.reduce((best, category) => (toolCounts[category] > toolCounts[best] ? category : best), toolCategoryOrder[0]);
  const activeViewGuide = viewGuides[activeView];
  const previousView = previousViewId(activeView);
  const nextView = nextViewId(activeView);
  const activeStepProgress = steps.length ? Math.round(((currentStepIdx + 1) / steps.length) * 100) : 0;
  const activeLayerStyle = kindStyles[activeAnatomyGroup.kind];
  const currentStepLayerBreakdown = useMemo(() => layerBreakdown(currentStep?.parts ?? []), [currentStep]);
  const currentStepAddedBreakdown = useMemo(() => layerBreakdown(currentStep?.added ?? []), [currentStep]);
  const currentStepDominantAdded = currentStepAddedBreakdown.reduce(
    (best, group) => (group.chars > best.chars ? group : best),
    currentStepAddedBreakdown[0] ?? { kind: 'system' as PromptPart['kind'], items: [], chars: 0, pct: 0 }
  );
  const selectedToolFieldCount = selectedTool ? schemaProperties(selectedTool).length : 0;
  const guideDetail =
    activeView === 'tools'
      ? { label: 'Tool focus', value: selectedTool?.name ?? 'Select a tool', color: toolCategoryMeta[selectedTool ? classifyTool(selectedTool) : 'all'].color }
      : activeView === 'raw'
        ? { label: 'Evidence', value: showRawPretty ? 'Pretty JSON' : 'Compact JSON', color: 'var(--primary)' }
        : activeView === 'response'
          ? { label: 'Evidence', value: 'Model response', color: 'var(--primary)' }
          : { label: 'Inspector', value: selectedPart?.title ?? currentStep?.title ?? trace.label, color: activeLayerStyle.color };

  const selectStep = useCallback((id: string) => {
    setStepId(id);
    setSelectedPartId(null);
  }, []);

  const selectRelativeStep = useCallback((offset: number) => {
    if (!steps.length) return;
    const nextIndex = Math.min(Math.max(currentStepIdx + offset, 0), steps.length - 1);
    selectStep(steps[nextIndex].id);
  }, [currentStepIdx, selectStep, steps]);

  useEffect(() => {
    if (!isPlayingSteps || activeView !== 'step' || steps.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setStepId((currentId) => {
        const index = Math.max(0, steps.findIndex((step) => step.id === currentId));
        if (index >= steps.length - 1) {
          setIsPlayingSteps(false);
          return currentId;
        }
        return steps[index + 1].id;
      });
      setSelectedPartId(null);
    }, 1400);

    return () => window.clearInterval(timer);
  }, [activeView, isPlayingSteps, steps]);

  const changeView = useCallback((view: ViewId) => {
    setActiveView(view);
    if (view !== 'step') {
      setIsPlayingSteps(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (target?.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;

      if (event.key === '[') {
        event.preventDefault();
        changeView(previousView);
        return;
      }

      if (event.key === ']') {
        event.preventDefault();
        changeView(nextView);
        return;
      }

      if (activeView === 'step' && event.key === 'ArrowLeft') {
        event.preventDefault();
        selectRelativeStep(-1);
        return;
      }

      if (activeView === 'step' && event.key === 'ArrowRight') {
        event.preventDefault();
        selectRelativeStep(1);
        return;
      }

      if (activeView === 'step' && event.key === ' ') {
        event.preventDefault();
        setIsPlayingSteps((value) => !value);
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        changeView('tools');
        window.setTimeout(() => document.getElementById('trace-tool-search')?.focus(), 0);
        return;
      }

      if (event.key === 'Escape') {
        setSelectedPartId(null);
        setSelectedToolName(null);
        setToolQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, changeView, nextView, previousView, selectRelativeStep]);

  return (
    <div className="min-h-[100dvh] overflow-x-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
      {isTraceLoading ? <TraceLoadingOverlay error={traceLoadError} /> : null}
      <aside className="fixed inset-y-0 left-0 z-[60] hidden w-[264px] flex-col border-r p-3 lg:flex" style={{ backgroundColor: 'rgba(255,251,245,0.96)', borderColor: 'var(--border)' }}>
        <a href="../topic-cc-loop-lab.html" className="mb-4 rounded-lg border p-3 transition-transform hover:-translate-y-0.5" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff' }}>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
              <Activity size={17} style={{ color: 'var(--primary)' }} />
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>仿真大专题</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Loop Lab</div>
            </div>
          </div>
        </a>

        <nav className="grid gap-1 text-[13px]" aria-label="仿真专题导航">
          <TraceSideLink href="../topic-cc-loop-lab.html" icon={<Home size={15} />} label="专题总入口" />
          <TraceSideLink href="../agent-loop-simulator/" icon={<GitBranch size={15} />} label="Agent Loop 动态模拟器" />
          <TraceSideLink href="../agent-script-insight/" icon={<Braces size={15} />} label="脚本启示仿真器" />
          <TraceSideLink href="./" icon={<Layers3 size={15} />} label="Trace Prompt 仿真器" active />
        </nav>

        <div className="my-4 h-px" style={{ backgroundColor: 'var(--border)' }} />

        <div className="grid gap-2">
          <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
            配套机制页
          </div>
          <nav className="grid gap-1 text-[13px]" aria-label="配套机制页">
            <TraceSideLink href="../topic-codex-loop-console.html" icon={<Network size={15} />} label="Codex Loop Console" />
            <TraceSideLink href="../topic-loop-task-board.html" icon={<ListTree size={15} />} label="任务驱动舱" />
            <TraceSideLink href="../topic-loop-mechanisms.html" icon={<Sparkles size={15} />} label="Loop 机制" />
          </nav>
        </div>

        <div className="mt-auto rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: '#fff7ed' }}>
          <div className="text-[12px] font-semibold" style={{ color: 'var(--primary)' }}>当前实验</div>
          <div className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            拆解 Claude Code 请求如何由 system、runtime、tools、user 四层组装出来。
          </div>
          <div className="mt-3 grid gap-2">
            {finalGroups.map((group) => {
              const style = kindStyles[group.kind];
              return (
                <button
                  key={group.kind}
                  className="flex items-center justify-between gap-2 rounded-md border bg-white/70 px-2 py-1.5 text-left text-[11px]"
                  onClick={() => {
                    changeView('map');
                    setActiveAnatomyKind(group.kind);
                    setSelectedPartId(group.items[0]?.id ?? null);
                  }}
                  style={{ borderColor: style.border, color: style.color }}
                >
                  <span className="truncate">{style.shortLabel}</span>
                  <span className="font-semibold">{percentage(group.chars, finalTotalChars)}%</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
      <header className="sticky top-0 z-50 max-w-full overflow-hidden border-b backdrop-blur" style={{ backgroundColor: 'rgba(255,251,245,0.92)', borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-[1600px] min-w-0 flex-col gap-3 px-4 py-2.5 sm:px-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <a href="../topic-cc-loop-lab.html" className="flex h-8 w-8 items-center justify-center rounded-md lg:hidden" aria-label="返回仿真大专题" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
              <ArrowLeft size={17} style={{ color: 'var(--primary)' }} />
            </a>
            <div className="hidden h-8 w-8 items-center justify-center rounded-md lg:flex" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
              <Layers3 size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Trace Prompt 仿真器
              </div>
              <div className="truncate text-[12px]" style={{ color: 'var(--text-muted)' }}>
                真实 trace 底座：把请求组装、工具目录、模型返回拆成可学习的工作流。
              </div>
            </div>
          </div>

          <div className="agent-loop-terminal-scroll -mx-1 flex w-full min-w-0 max-w-full items-center gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 2xl:w-auto">
            <a href="../topic-cc-loop-lab.html" className="shrink-0 rounded-md border px-3 py-2 text-[13px] font-semibold" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff', color: 'var(--text-primary)' }}>
              专题总入口
            </a>
            <TraceSwitcher
              traces={traces}
              activeTraceId={trace.id}
              tone={traceTone}
              onSelectTrace={(id) => {
                setTraceId(id);
                setStepId('system');
                setSelectedPartId(null);
                setActiveAnatomyKind('system');
                setToolCategory('all');
                setToolQuery('');
                setSelectedToolName(null);
                  changeView('map');
              }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] min-w-0 overflow-hidden px-3 py-4 sm:px-6">
        <section
          className="trace-mobile-shell mb-4 overflow-hidden rounded-lg border"
          style={{
            background: `radial-gradient(circle at 14% 12%, ${traceTone.glow}, transparent 34%), radial-gradient(circle at 92% 0%, rgba(99,102,241,0.18), transparent 28%), #0f172a`,
            borderColor: '#1e293b',
            boxShadow: '0 18px 42px rgba(15,23,42,0.16)',
          }}
        >
          <div className="grid min-w-0 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:p-5">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md px-2 py-1 text-[12px] font-semibold" style={{ backgroundColor: traceTone.glow, color: traceTone.accent }}>
                  Trace 数据底座
                </span>
                <span className="inline-flex rounded-md border px-2 py-1 text-[12px]" style={{ borderColor: 'rgba(148,163,184,0.25)', color: '#cbd5e1' }}>
                  {trace.label}
                </span>
                <span className="inline-flex rounded-md border px-2 py-1 text-[12px]" style={{ borderColor: 'rgba(148,163,184,0.25)', color: '#cbd5e1' }}>
                  {traceTone.tag}
                </span>
              </div>
              <h1 className="trace-safe-text m-0 max-w-[900px] text-[23px] font-bold leading-[1.16] sm:text-[30px] md:text-[34px]" style={{ color: '#f8fafc' }}>
                <span className="block">
                  把一次 Claude Code 请求
                </span>
                <span className="block">
                  拆成可回放、可训练、可迁移的 trace
                </span>
              </h1>
              <p className="trace-safe-text mt-3 max-w-[920px] text-[13px] leading-relaxed md:text-[14px]" style={{ color: '#cbd5e1' }}>
                这个页面不再只是“看 prompt 原文”，而是仿真大专题的真实数据底座：左边看请求如何组装，中间选择层级与步骤，右侧立即看到来源文本、schema 或响应内容。
              </p>
              <div className="mt-4 grid min-w-0 gap-2 md:grid-cols-3">
                {traceRoleCards.map((card) => (
                  <a
                    key={card.title}
                    href={card.href}
                    className="min-w-0 overflow-hidden rounded-md border px-3 py-2 transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: 'rgba(148,163,184,0.22)', backgroundColor: 'rgba(255,255,255,0.055)' }}
                  >
                    <div className="flex min-w-0 items-center gap-2 text-[12px] font-semibold" style={{ color: traceTone.accent }}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: traceTone.glow }}>
                        {card.icon}
                      </span>
                      <span className="min-w-0 truncate">{card.title}</span>
                    </div>
                    <div className="trace-safe-text mt-1 min-w-0 line-clamp-2 text-[11px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                      {card.body}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="grid min-w-0 content-end gap-3">
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <DarkMetric label="Prompt blocks" value={String(finalParts.length)} />
                <DarkMetric label="Tool catalog" value={String(trace.tools.length)} />
                <DarkMetric label="System share" value={`${percentage(systemChars, finalTotalChars)}%`} />
                <DarkMetric label="Tool share" value={`${percentage(toolsChars, finalTotalChars)}%`} />
              </div>
              <TraceFocusCard trace={trace} currentStep={currentStep} activeView={activeView} tone={traceTone} />
              <div className="min-w-0 rounded-lg border p-3" style={{ borderColor: 'rgba(148,163,184,0.22)', backgroundColor: 'rgba(255,255,255,0.055)' }}>
                <div className="mb-2 flex min-w-0 items-center justify-between gap-3 text-[12px]" style={{ color: '#cbd5e1' }}>
                  <span className="min-w-0 truncate">Assembly progress</span>
                  <span className="shrink-0 whitespace-nowrap">{steps.length} steps</span>
                </div>
                <div className="grid h-3 overflow-hidden rounded-full" style={{ gridTemplateColumns: anatomyColumns(finalGroups, finalTotalChars), backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  {finalGroups.map((group) => (
                    <span key={group.kind} style={{ backgroundColor: kindStyles[group.kind].color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <LearningPathPanel
            activeView={activeView}
            onChangeView={changeView}
            currentStepIndex={currentStepIdx}
            totalSteps={steps.length}
            selectedToolName={selectedTool?.name}
            selectedToolFieldCount={selectedToolFieldCount}
            dominantLayer={dominantGroup?.kind ?? 'system'}
          />
        </section>

        <section className="min-w-0 overflow-hidden rounded-lg border p-4" style={{ backgroundColor: 'rgba(255,251,245,0.88)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}>
          <TraceStatusStrip trace={trace} tokens={prompt.tokens} steps={steps.length} tone={traceTone} />
          <TraceInsightPanel
            dominantGroup={dominantGroup}
            totalChars={finalTotalChars}
            largestStep={largestDeltaStep}
            largestDeltaChars={largestDeltaChars}
            dominantToolCategory={dominantToolCategory}
            toolCounts={toolCounts}
            onChangeView={changeView}
          />

          <Tabs value={activeView} onValueChange={(value) => changeView(value as ViewId)} className="w-full min-w-0">
            <TabsList className="trace-sticky-tabs agent-loop-terminal-scroll sticky top-[62px] z-40 flex h-auto w-full gap-2 overflow-x-auto rounded-lg border bg-white/90 p-2 backdrop-blur md:grid md:grid-cols-5 md:overflow-visible" style={{ borderColor: 'var(--border)' }}>
              {viewMeta.map((view) => (
                <TabsTrigger
                  key={view.id}
                  value={view.id}
                  className="h-auto min-w-[172px] justify-start rounded-md border bg-white px-3 py-2.5 text-left data-[state=active]:shadow-none md:min-w-0"
                  style={{
                    borderColor: activeView === view.id ? 'rgba(234,88,12,0.48)' : 'var(--border)',
                    backgroundColor: activeView === view.id ? 'rgba(234,88,12,0.08)' : '#ffffff',
                    color: activeView === view.id ? 'var(--primary)' : 'var(--text-primary)',
                  }}
                >
                  <span className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 shrink-0">{view.icon}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold">{view.label}</span>
                      <span className="mt-0.5 block truncate text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>
                        {view.description}
                      </span>
                    </span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <WorkbenchGuide
              title={activeViewGuide.title}
              summary={activeViewGuide.summary}
              action={activeViewGuide.action}
              currentStep={`${currentStepIdx + 1}/${steps.length}`}
              progress={activeStepProgress}
              layerLabel={activeLayerStyle.label}
              layerColor={activeLayerStyle.color}
              detailLabel={guideDetail.label}
              detailValue={guideDetail.value}
              detailColor={guideDetail.color}
              previousView={viewMeta.find((view) => view.id === previousView)}
              nextView={viewMeta.find((view) => view.id === nextView)}
            onChangeView={changeView}
            />

            <TabsContent value="map" className="mt-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_440px]">
                <div className="grid min-w-0 gap-4">
                  <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
                    <div className="mb-4 grid gap-3 sm:grid-cols-4">
                      <Metric icon={<Database size={15} />} label="Blocks" value={String(finalParts.length)} />
                      <Metric icon={<FileCode2 size={15} />} label="Chars" value={formatNumber(finalTotalChars)} />
                      <Metric icon={<Gauge size={15} />} label="Est. tokens" value={formatNumber(estimateTokens(finalTotalChars))} />
                      <Metric icon={<Wrench size={15} />} label="Tools" value={String(trace.tools.length)} />
                    </div>

                    <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        <Sparkles size={15} style={{ color: 'var(--primary)' }} />
                        Prompt anatomy
                      </div>
                      <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                        Hover the bar to inspect a layer; click to pin a block in the inspector.
                      </div>
                    </div>
                    <div className="grid h-8 overflow-hidden rounded-lg border bg-white" style={{ borderColor: 'var(--border)', gridTemplateColumns: anatomyColumns(finalGroups, finalTotalChars) }}>
                      {finalGroups.map((group) => {
                        const style = kindStyles[group.kind];
                        const pct = percentage(group.chars, finalTotalChars);
                        return (
                          <button
                            key={group.kind}
                            aria-label={`${style.label}: ${pct}%`}
                            className="group relative h-full transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-300"
                            onMouseEnter={() => setActiveAnatomyKind(group.kind)}
                            onFocus={() => setActiveAnatomyKind(group.kind)}
                            onClick={() => {
                              setActiveAnatomyKind(group.kind);
                              setSelectedPartId(group.items[0]?.id ?? null);
                            }}
                            style={{ backgroundColor: style.color }}
                          >
                            <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-[10px] font-semibold text-white group-hover:flex">
                              {style.shortLabel} {pct}%
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <AnatomySummary group={activeAnatomyGroup} totalChars={finalTotalChars} onSelectPart={setSelectedPartId} />
                  </section>

                  <AssemblyFlow steps={steps} activeStepId={currentStep?.id} totalChars={prompt.assembled.length} onSelectStep={selectStep} />

                  <TemplateGraph groups={displayGroups} activeStep={currentStep} activePartIds={activeStepPartIds} selectedPartId={selectedPart?.id} onSelectPart={setSelectedPartId} />

                  <MermaidFlow chart={flowSource} />
                </div>

                <div className="trace-inspector-shell 2xl:sticky 2xl:top-[92px] 2xl:self-start">
                  <Inspector part={selectedPart} step={currentStep} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="step" className="mt-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_440px]">
                <div className="min-w-0 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
                  <div className="mb-4 grid gap-3 md:grid-cols-4">
                    <Metric icon={<Route size={15} />} label="Current step" value={`${currentStepIdx + 1}/${steps.length}`} />
                    <Metric icon={<Zap size={15} />} label="Delta chars" value={`+${formatNumber(currentStepAddedChars)}`} />
                    <Metric icon={<FileCode2 size={15} />} label="Cumulative chars" value={formatNumber(currentStep?.cumulativeChars ?? 0)} />
                    <Metric icon={<Eye size={15} />} label="Visible blocks" value={String(currentStep?.parts.length ?? 0)} />
                  </div>

                  <StepPlaybackBar
                    currentIndex={currentStepIdx}
                    total={steps.length}
                    isPlaying={isPlayingSteps}
                    onPrevious={() => selectRelativeStep(-1)}
                    onNext={() => selectRelativeStep(1)}
                    onTogglePlay={() => {
                      if (currentStepIdx >= steps.length - 1) selectStep(steps[0]?.id ?? stepId);
                      changeView('step');
                      setIsPlayingSteps((value) => !value);
                    }}
                  />

                  <StepDeltaExplainer
                    step={currentStep}
                    stepIndex={currentStepIdx}
                    totalSteps={steps.length}
                    addedChars={currentStepAddedChars}
                    cumulativeChars={currentStep?.cumulativeChars ?? 0}
                    finalChars={prompt.assembled.length}
                    layerBreakdown={currentStepLayerBreakdown}
                    addedBreakdown={currentStepAddedBreakdown}
                    dominantAddedKind={currentStepDominantAdded.kind}
                    onSelectStep={selectStep}
                    previousStep={steps[currentStepIdx - 1]}
                    nextStep={steps[currentStepIdx + 1]}
                  />

                  <StepRail steps={steps} activeStepId={currentStep?.id} totalChars={prompt.assembled.length} onSelectStep={selectStep} />

                  <div className="mb-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff' }}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {currentStepIdx + 1}. {currentStep?.title ?? 'Step'}
                        </div>
                        <div className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          This stage appends {currentStep?.added.length ?? 0} block(s). The inspector shows the full cumulative prompt until you click a specific block.
                        </div>
                      </div>
                      <Button variant="secondary" className="h-8 px-3 text-[12px]" onClick={() => setSelectedPartId(null)}>
                        <PanelRightOpen size={14} />
                        Inspect full stage
                      </Button>
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

                <div className="trace-inspector-shell 2xl:sticky 2xl:top-[92px] 2xl:self-start">
                  <Inspector part={selectedPart} step={currentStep} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_440px]">
                <div className="min-w-0 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
                  <div className="mb-4 grid gap-3 md:grid-cols-4">
                    <Metric icon={<Wrench size={15} />} label="Tools exposed" value={String(trace.tools.length)} />
                    <Metric icon={<Search size={15} />} label="Visible" value={String(filteredTools.length)} />
                    <Metric icon={<Layers3 size={15} />} label="Categories" value={String(toolCategoryOrder.filter((category) => toolCounts[category] > 0).length)} />
                    <Metric icon={<Braces size={15} />} label="With schema" value={String(trace.tools.filter((tool) => schemaProperties(tool).length > 0).length)} />
                  </div>

                  <ToolWorkbenchSummary
                    selectedTool={selectedTool}
                    selectedCategory={selectedToolCategory}
                    filteredCount={filteredTools.length}
                    totalCount={trace.tools.length}
                    toolCounts={toolCounts}
                  />

                  <ToolProtocolExplainer
                    toolCounts={toolCounts}
                    selectedCategory={selectedToolCategory}
                    selectedTool={selectedTool}
                    onSelectCategory={(category) => setToolCategory(category)}
                  />

                  <div className="mb-4 rounded-lg border bg-white p-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="mb-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <Cpu size={15} style={{ color: 'var(--primary)' }} />
                          Tool capability map
                        </div>
                        <div className="mt-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                          先按能力域缩小范围，再在右侧 inspector 读 schema。工具目录是模型能调用什么的真实边界。
                        </div>
                      </div>
                      <div className="relative xl:w-[380px]">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                        <Input
                          id="trace-tool-search"
                          value={toolQuery}
                          onChange={(e) => setToolQuery(e.target.value)}
                          placeholder="Search tools by name or description"
                          className="h-9 pl-9 text-[13px]"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                      {toolCategoryOrder.filter((category) => toolCounts[category] > 0).map((category) => {
                        const meta = toolCategoryMeta[category];
                        return (
                          <button
                            key={category}
                            className="rounded-lg border p-3 text-left transition-transform hover:-translate-y-0.5"
                            onClick={() => setToolCategory(category)}
                            style={{
                              borderColor: toolCategory === category ? meta.color : meta.border,
                              backgroundColor: toolCategory === category ? meta.bg : '#ffffff',
                              boxShadow: toolCategory === category ? `inset 3px 0 0 ${meta.color}` : undefined,
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] font-semibold" style={{ color: meta.color }}>
                                {meta.label}
                              </span>
                              <span className="rounded-md px-2 py-1 text-[11px]" style={{ backgroundColor: meta.bg, color: meta.color }}>
                                {toolCounts[category]}
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(15,23,42,0.06)' }}>
                              <span className="block h-full rounded-full" style={{ width: `${Math.max(8, percentage(toolCounts[category], trace.tools.length))}%`, backgroundColor: meta.color }} />
                            </div>
                            <div className="mt-2 line-clamp-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                              {toolCategoryNotes[category]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-white p-3 xl:flex-row xl:items-center xl:justify-between" style={{ borderColor: 'var(--border)' }}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold" style={{ backgroundColor: toolCategoryMeta[toolCategory].bg, color: toolCategoryMeta[toolCategory].color }}>
                          <ShieldCheck size={14} />
                          {toolCategoryMeta[toolCategory].label}
                        </span>
                        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                          {toolCategoryNotes[toolCategory]} / {filteredTools.length} visible
                        </span>
                        {(toolCategory !== 'all' || toolQuery.trim()) ? (
                          <button
                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]"
                            onClick={() => {
                              setToolCategory('all');
                              setToolQuery('');
                            }}
                            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                          >
                            <FilterX size={13} />
                            Clear
                          </button>
                        ) : null}
                      </div>
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

                <div className="trace-inspector-shell 2xl:sticky 2xl:top-[92px] 2xl:self-start">
                  <ToolInspector tool={selectedTool} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="min-w-0 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
                  <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        <FileJson2 size={16} style={{ color: 'var(--primary)' }} />
                        Raw request evidence
                      </div>
                      <div className="mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        Sanitized request body subset. Use this view when you need to verify that the visual decomposition did not invent structure.
                      </div>
                    </div>
                    <Button variant="secondary" className="h-9 px-3 text-[13px]" onClick={() => setShowRawPretty((v) => !v)}>
                      {showRawPretty ? 'Compact' : 'Pretty'}
                    </Button>
                  </div>
                  <CodePanel
                    title={showRawPretty ? 'Pretty request body' : 'Compact request body'}
                    meta={`${formatNumber(JSON.stringify(trace.requestBody).length)} chars`}
                    text={showRawPretty ? JSON.stringify(trace.requestBody, null, 2) : JSON.stringify(trace.requestBody)}
                  />
                </section>
                <section className="min-w-0 rounded-lg border p-4 2xl:sticky 2xl:top-[92px] 2xl:self-start" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff' }}>
                  <div className="mb-3 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Reading guide
                  </div>
                  <div className="grid gap-2">
                    <RawGuideItem label="system[]" value={`${trace.systemBlocks.length} blocks`} />
                    <RawGuideItem label="messages[0]" value={`${trace.injectedBlocks.length} injected blocks`} />
                    <RawGuideItem label="tools[]" value={`${trace.tools.length} definitions`} />
                    <RawGuideItem label="user prompt" value={`${trace.userPrompt?.length ?? 0} chars`} />
                  </div>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="response" className="mt-4">
              <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="min-w-0 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
                  <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <TerminalSquare size={16} style={{ color: 'var(--primary)' }} />
                    Model response
                  </div>
                  <CodePanel title="Response text" meta={`${formatNumber((trace.responseText ?? '').trim().length)} chars`} text={(trace.responseText ?? '').trim() || '(empty)'} />
                </section>
                <section className="min-w-0 rounded-lg border p-4 2xl:sticky 2xl:top-[92px] 2xl:self-start" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff' }}>
                  <div className="mb-3 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Response context
                  </div>
                  <div className="grid gap-2">
                    <RawGuideItem label="request model" value={trace.model ?? '-'} />
                    <RawGuideItem label="provider" value={trace.provider ?? '-'} />
                    <RawGuideItem label="status" value={String(trace.status ?? '-')} />
                    <RawGuideItem label="response chars" value={String((trace.responseText ?? '').trim().length)} />
                  </div>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      </div>
    </div>
  );
}

function TraceSwitcher({
  traces,
  activeTraceId,
  tone,
  onSelectTrace,
}: {
  traces: NormalizedTrace[];
  activeTraceId: string;
  tone: ReturnType<typeof activeTraceTone>;
  onSelectTrace: (id: string) => void;
}) {
  return (
    <div className="flex min-w-0 gap-2">
      {traces.map((item) => {
        const active = item.id === activeTraceId;
        return (
          <button
            key={item.id}
            className="min-w-[158px] shrink-0 rounded-md border px-3 py-2 text-left transition-transform hover:-translate-y-0.5"
            onClick={() => onSelectTrace(item.id)}
            style={{
              borderColor: active ? tone.accent : 'var(--border)',
              backgroundColor: active ? 'rgba(234,88,12,0.10)' : '#ffffff',
              boxShadow: active ? `inset 3px 0 0 ${tone.accent}` : undefined,
            }}
          >
            <div className="truncate text-[12px] font-semibold" style={{ color: active ? 'var(--primary)' : 'var(--text-primary)' }}>
              {item.label}
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="truncate">{item.model ?? '-'}</span>
              <span className="h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: active ? tone.accent : 'var(--border)' }} />
              <span className="truncate">{hostFromUrl(item.targetUrl)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TraceLoadingOverlay({ error }: { error: string }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[80] flex justify-center px-4 py-3 pointer-events-none">
      <div
        className="pointer-events-auto rounded-lg border px-4 py-3 text-[13px] shadow-lg"
        style={{
          borderColor: error ? '#fca5a5' : 'var(--border)',
          backgroundColor: '#ffffff',
          color: error ? '#b91c1c' : 'var(--text-secondary)',
        }}
      >
        {error ? `Trace samples 加载失败：${error}` : '正在加载真实 trace 样本...'}
      </div>
    </div>
  );
}

function LearningPathPanel({
  activeView,
  onChangeView,
  currentStepIndex,
  totalSteps,
  selectedToolName,
  selectedToolFieldCount,
  dominantLayer,
}: {
  activeView: ViewId;
  onChangeView: (view: ViewId) => void;
  currentStepIndex: number;
  totalSteps: number;
  selectedToolName?: string;
  selectedToolFieldCount: number;
  dominantLayer: PromptPart['kind'];
}) {
  const dominantStyle = kindStyles[dominantLayer];
  const path = [
    {
      id: 'map' as ViewId,
      title: '1. Map',
      text: `先看四层 request 外壳；当前最大层是 ${dominantStyle.label}。`,
      icon: <ListTree size={15} />,
      color: dominantStyle.color,
    },
    {
      id: 'step' as ViewId,
      title: '2. Step',
      text: `再回放增长过程；当前在第 ${currentStepIndex + 1}/${totalSteps} 步。`,
      icon: <Layers3 size={15} />,
      color: 'var(--primary)',
    },
    {
      id: 'tools' as ViewId,
      title: '3. Tools',
      text: selectedToolName
        ? `检查 ${selectedToolName} 的 ${selectedToolFieldCount} 个输入字段。`
        : '把工具目录读成 Claude Code 的可调用能力边界。',
      icon: <Wrench size={15} />,
      color: '#7c3aed',
    },
    {
      id: 'raw' as ViewId,
      title: '4. Raw',
      text: '回到原始 JSON 证据，验证可视化没有凭空补结构。',
      icon: <FileJson2 size={15} />,
      color: '#0f172a',
    },
    {
      id: 'response' as ViewId,
      title: '5. Response',
      text: '最后把模型回答放回 request 约束里解释。',
      icon: <Braces size={15} />,
      color: '#16a34a',
    },
  ];

  return (
    <div className="border-t px-4 py-3 xl:px-5" style={{ borderColor: 'rgba(148,163,184,0.18)', backgroundColor: 'rgba(255,255,255,0.04)' }}>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: '#f8fafc' }}>
            <BookOpen size={15} style={{ color: 'var(--primary-light)' }} />
            推荐阅读路径
          </div>
          <div className="trace-safe-text mt-1 text-[12px] leading-relaxed" style={{ color: '#cbd5e1' }}>
            这个仿真器不是线性文章，而是五个互相校验的视角：先建立结构，再看增长，再读工具协议，最后回到证据和响应。
          </div>
        </div>
        <div className="shrink-0 rounded-md border px-2 py-1 text-[11px]" style={{ borderColor: 'rgba(148,163,184,0.22)', color: '#cbd5e1' }}>
          点击卡片切换视角
        </div>
      </div>
      <div className="grid gap-2 lg:grid-cols-5">
        {path.map((item) => {
          const active = item.id === activeView;
          return (
            <button
              key={item.id}
              className="min-w-0 rounded-lg border p-3 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
              onClick={() => onChangeView(item.id)}
              style={{
                borderColor: active ? item.color : 'rgba(148,163,184,0.22)',
                backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.055)',
                boxShadow: active ? `inset 3px 0 0 ${item.color}` : undefined,
              }}
            >
              <div className="flex min-w-0 items-center gap-2 text-[12px] font-semibold" style={{ color: active ? item.color : '#f8fafc' }}>
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.title}</span>
              </div>
              <div className="trace-safe-text mt-2 line-clamp-3 text-[11px] leading-relaxed" style={{ color: '#cbd5e1' }}>
                {item.text}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TraceStatusStrip({
  trace,
  tokens,
  steps,
  tone,
}: {
  trace: NormalizedTrace;
  tokens: number;
  steps: number;
  tone: ReturnType<typeof activeTraceTone>;
}) {
  const items = [
    { icon: <Cpu size={14} />, label: 'model', value: trace.model ?? '-' },
    { icon: <Network size={14} />, label: 'provider', value: trace.provider ?? '-' },
    { icon: <ShieldCheck size={14} />, label: 'status', value: trace.status ?? '-' },
    { icon: <Target size={14} />, label: 'target', value: hostFromUrl(trace.targetUrl) },
    { icon: <Gauge size={14} />, label: 'tokens', value: `~${formatNumber(tokens)}` },
    { icon: <GitBranch size={14} />, label: 'assembly', value: `${steps} steps` },
  ];

  return (
    <div className="mb-4 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="mb-3 flex min-w-0 flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {trace.label}
            </div>
            <span className="rounded-md px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: tone.glow, color: 'var(--primary)' }}>
              real request trace
            </span>
          </div>
          <div className="mt-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
            当前 trace 的请求元数据、规模和目标端点。下方视图都围绕同一个 request 展开。
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-md border bg-white px-2 py-1.5 text-[11px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <TimerReset size={13} style={{ color: 'var(--primary)' }} />
          <span>快捷键：[ 与 ] 切视图，/ 搜工具，Esc 清空选择</span>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="min-w-0 rounded-md border bg-white px-3 py-2" style={{ borderColor: 'rgba(234,88,12,0.18)' }}>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--primary)' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <div className="mt-1 truncate text-[12px] font-semibold" title={item.value} style={{ color: 'var(--text-primary)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TraceInsightPanel({
  dominantGroup,
  totalChars,
  largestStep,
  largestDeltaChars,
  dominantToolCategory,
  toolCounts,
  onChangeView,
}: {
  dominantGroup?: ReturnType<typeof groupedParts>[number];
  totalChars: number;
  largestStep?: PromptStep;
  largestDeltaChars: number;
  dominantToolCategory: Exclude<ToolCategory, 'all'>;
  toolCounts: Record<ToolCategory, number>;
  onChangeView: (view: ViewId) => void;
}) {
  const dominantStyle = dominantGroup ? kindStyles[dominantGroup.kind] : kindStyles.system;
  const toolMeta = toolCategoryMeta[dominantToolCategory];
  const insights = [
    {
      title: '最大 prompt 层',
      value: dominantStyle.label,
      caption: `${percentage(dominantGroup?.chars ?? 0, totalChars)}% / ${formatNumber(dominantGroup?.chars ?? 0)} chars`,
      icon: <Layers3 size={15} />,
      color: dominantStyle.color,
      action: '看 Map',
      view: 'map' as ViewId,
    },
    {
      title: '最大增长阶段',
      value: largestStep?.title ?? '-',
      caption: `+${formatNumber(largestDeltaChars)} chars appended`,
      icon: <Zap size={15} />,
      color: 'var(--primary)',
      action: '看 Step',
      view: 'step' as ViewId,
    },
    {
      title: '主要工具能力',
      value: toolMeta.label,
      caption: `${toolCounts[dominantToolCategory]} / ${toolCounts.all} tools`,
      icon: <Wrench size={15} />,
      color: toolMeta.color,
      action: '看 Tools',
      view: 'tools' as ViewId,
    },
  ];

  return (
    <section className="mb-4 rounded-lg border bg-white p-3" style={{ borderColor: 'rgba(234,88,12,0.22)' }}>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            <Sparkles size={15} style={{ color: 'var(--primary)' }} />
            Trace insights
          </div>
          <div className="mt-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
            先给出这份 request 的三个入口：哪里占比最大、哪一步增长最大、工具能力主要集中在哪里。
          </div>
        </div>
        <div className="rounded-md px-2 py-1 text-[11px]" style={{ backgroundColor: '#fff7ed', color: 'var(--text-muted)' }}>
          click insight to jump
        </div>
      </div>
      <div className="grid gap-2 lg:grid-cols-3">
        {insights.map((item) => (
          <button
            key={item.title}
            className="group min-w-0 rounded-lg border px-3 py-3 text-left transition-transform hover:-translate-y-0.5"
            onClick={() => onChangeView(item.view)}
            style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: item.color }}>
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                <div className="mt-2 truncate text-[14px] font-semibold" title={item.value} style={{ color: 'var(--text-primary)' }}>
                  {item.value}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {item.caption}
                </div>
              </div>
              <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[11px] transition-colors group-hover:bg-orange-50" style={{ color: 'var(--primary)' }}>
                {item.action}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function TraceFocusCard({
  trace,
  currentStep,
  activeView,
  tone,
}: {
  trace: NormalizedTrace;
  currentStep?: PromptStep;
  activeView: ViewId;
  tone: ReturnType<typeof activeTraceTone>;
}) {
  return (
    <div className="min-w-0 rounded-lg border p-3" style={{ borderColor: 'rgba(148,163,184,0.22)', backgroundColor: 'rgba(255,255,255,0.055)' }}>
      <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold" style={{ color: tone.accent }}>
        <BookOpen size={14} />
        <span>Current reading lens</span>
      </div>
      <div className="grid gap-2">
        <DarkKeyValue label="view" value={viewMeta.find((view) => view.id === activeView)?.label ?? activeView} />
        <DarkKeyValue label="step" value={currentStep?.title ?? '-'} />
        <DarkKeyValue label="source" value={trace.model ? `${trace.model} · ${hostFromUrl(trace.targetUrl)}` : hostFromUrl(trace.targetUrl)} />
      </div>
    </div>
  );
}

function StepPlaybackBar({
  currentIndex,
  total,
  isPlaying,
  onPrevious,
  onNext,
  onTogglePlay,
}: {
  currentIndex: number;
  total: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}) {
  const progress = total ? Math.round(((currentIndex + 1) / total) * 100) : 0;
  return (
    <section className="mb-4 overflow-hidden rounded-lg border bg-white" style={{ borderColor: 'var(--border)' }}>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              <PlayCircle size={15} style={{ color: 'var(--primary)' }} />
              Step replay controls
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Arrow keys / Space
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
            <span className="block h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }} />
          </div>
          <div className="mt-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
            当前第 {currentIndex + 1} / {total} 步。播放会逐步推进 prompt 增长过程。
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t p-3 xl:border-l xl:border-t-0" style={{ borderColor: 'rgba(234,88,12,0.18)', backgroundColor: '#fff7ed' }}>
          <Button variant="secondary" className="h-9 px-2 text-[12px]" onClick={onPrevious} disabled={currentIndex <= 0}>
            上一步
          </Button>
          <Button className="h-9 px-2 text-[12px]" onClick={onTogglePlay}>
            {isPlaying ? '暂停' : currentIndex >= total - 1 ? '重播' : '播放'}
          </Button>
          <Button variant="secondary" className="h-9 px-2 text-[12px]" onClick={onNext} disabled={currentIndex >= total - 1}>
            下一步
          </Button>
        </div>
      </div>
    </section>
  );
}

function StepDeltaExplainer({
  step,
  stepIndex,
  totalSteps,
  addedChars,
  cumulativeChars,
  finalChars,
  layerBreakdown,
  addedBreakdown,
  dominantAddedKind,
  previousStep,
  nextStep,
  onSelectStep,
}: {
  step?: PromptStep;
  stepIndex: number;
  totalSteps: number;
  addedChars: number;
  cumulativeChars: number;
  finalChars: number;
  layerBreakdown: LayerBreakdownItem[];
  addedBreakdown: LayerBreakdownItem[];
  dominantAddedKind: PromptPart['kind'];
  previousStep?: PromptStep;
  nextStep?: PromptStep;
  onSelectStep: (id: string) => void;
}) {
  const dominantStyle = kindStyles[dominantAddedKind];
  const finalProgress = percentage(cumulativeChars, finalChars);
  const hasAdded = addedChars > 0;
  const addedKinds = addedBreakdown.filter((group) => group.chars > 0);

  return (
    <section className="mb-4 overflow-hidden rounded-lg border bg-white" style={{ borderColor: 'rgba(234,88,12,0.22)' }}>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                <Zap size={15} style={{ color: dominantStyle.color }} />
                本步增量解释器
              </div>
              <div className="trace-safe-text mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                第 {stepIndex + 1}/{totalSteps} 步不是单独存在的内容块，而是把新的 prompt 片段追加到前一阶段之后，形成新的累计 request。
              </div>
            </div>
            <span className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: dominantStyle.bg, color: dominantStyle.color }}>
              {hasAdded ? `主增量：${dominantStyle.label}` : '无新增文本块'}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Before</div>
              <div className="mt-1 text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {previousStep ? previousStep.title : 'Empty request'}
              </div>
              <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {formatNumber(previousStep?.cumulativeChars ?? 0)} chars
              </div>
            </div>
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: dominantStyle.border, backgroundColor: dominantStyle.bg }}>
              <div className="text-[11px]" style={{ color: dominantStyle.color }}>Append</div>
              <div className="mt-1 text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                +{formatNumber(addedChars)} chars
              </div>
              <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {step?.added.length ?? 0} block(s) added
              </div>
            </div>
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>After</div>
              <div className="mt-1 text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatNumber(cumulativeChars)} chars
              </div>
              <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {finalProgress}% of final request
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>累计 request 结构</span>
              <span>{finalProgress}% complete</span>
            </div>
            <div className="grid h-3 overflow-hidden rounded-full border bg-white" style={{ borderColor: 'var(--border)', gridTemplateColumns: anatomyColumns(layerBreakdown, cumulativeChars || 1) }}>
              {layerBreakdown.map((group) => (
                <span
                  key={group.kind}
                  title={`${kindStyles[group.kind].label}: ${formatNumber(group.chars)} chars`}
                  style={{ backgroundColor: group.chars > 0 ? kindStyles[group.kind].color : 'rgba(15,23,42,0.06)' }}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="border-t p-4 xl:border-l xl:border-t-0" style={{ borderColor: 'rgba(234,88,12,0.18)', backgroundColor: '#fff7ed' }}>
          <div className="mb-3 text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            本步新增层
          </div>
          <div className="grid gap-2">
            {hasAdded ? (
              addedKinds.map((group) => {
                const style = kindStyles[group.kind];
                return (
                  <div key={group.kind} className="rounded-md border bg-white px-3 py-2" style={{ borderColor: style.border }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold" style={{ color: style.color }}>
                        {style.label}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        +{formatNumber(group.chars)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(15,23,42,0.06)' }}>
                      <span className="block h-full rounded-full" style={{ width: `${Math.max(8, group.pct)}%`, backgroundColor: style.color }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-md border border-dashed bg-white px-3 py-2 text-[12px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                这一阶段没有追加可见 prompt 文本。
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" className="h-9 px-2 text-[12px]" disabled={!previousStep} onClick={() => previousStep && onSelectStep(previousStep.id)}>
              对比上一步
            </Button>
            <Button variant="secondary" className="h-9 px-2 text-[12px]" disabled={!nextStep} onClick={() => nextStep && onSelectStep(nextStep.id)}>
              查看下一步
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ToolWorkbenchSummary({
  selectedTool,
  selectedCategory,
  filteredCount,
  totalCount,
  toolCounts,
}: {
  selectedTool?: TraceTool;
  selectedCategory: ToolCategory;
  filteredCount: number;
  totalCount: number;
  toolCounts: Record<ToolCategory, number>;
}) {
  const selectedMeta = toolCategoryMeta[selectedCategory];
  const schemaCount = selectedTool ? schemaProperties(selectedTool).length : 0;
  const rows = [
    { label: 'visible', value: `${filteredCount}/${totalCount}` },
    { label: 'selected', value: selectedTool?.name ?? '-' },
    { label: 'category', value: selectedMeta.label },
    { label: 'fields', value: String(schemaCount) },
  ];

  return (
    <section className="mb-4 rounded-lg border bg-white p-3" style={{ borderColor: selectedMeta.border }}>
      <div className="mb-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            <ShieldCheck size={15} style={{ color: selectedMeta.color }} />
            Tool workbench
          </div>
          <div className="mt-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>
            当前选择会同步到右侧 schema inspector；过滤不会丢失原始工具目录。
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full xl:w-[260px]" style={{ backgroundColor: 'rgba(15,23,42,0.06)' }}>
          <span className="block h-full rounded-full" style={{ width: `${percentage(toolCounts[selectedCategory] ?? 0, totalCount)}%`, backgroundColor: selectedMeta.color }} />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0 rounded-md border px-3 py-2" style={{ borderColor: selectedMeta.border, backgroundColor: selectedMeta.bg }}>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {row.label}
            </div>
            <div className="mt-1 truncate text-[12px] font-semibold" title={row.value} style={{ color: row.label === 'category' ? selectedMeta.color : 'var(--text-primary)' }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ToolProtocolExplainer({
  toolCounts,
  selectedCategory,
  selectedTool,
  onSelectCategory,
}: {
  toolCounts: Record<ToolCategory, number>;
  selectedCategory: ToolCategory;
  selectedTool?: TraceTool;
  onSelectCategory: (category: Exclude<ToolCategory, 'all'>) => void;
}) {
  const selectedMeta = toolCategoryMeta[selectedCategory];
  const selectedName = selectedTool?.name ?? 'no tool selected';
  const protocolCards = [
    {
      title: '工具目录先进入 request',
      body: 'Claude Code 把工具名称、描述、输入 schema 作为能力目录交给模型。模型不是“知道所有能力”，而是读取这份目录后再决定能调用什么。',
      icon: <Database size={15} />,
    },
    {
      title: '模型只返回调用意图',
      body: 'assistant 响应里的 tool_use 是结构化意图：选哪个工具、带什么参数。真正执行由 runtime 完成。',
      icon: <Braces size={15} />,
    },
    {
      title: 'runtime 执行并回灌结果',
      body: '工具结果会以 tool_result / reminder 等形式重新进入上下文，下一轮请求会继续变厚。',
      icon: <Workflow size={15} />,
    },
  ];

  return (
    <section className="mb-4 overflow-hidden rounded-lg border bg-white" style={{ borderColor: 'rgba(234,88,12,0.22)' }}>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                <ShieldCheck size={15} style={{ color: selectedMeta.color }} />
                工具协议如何参与 prompt
              </div>
              <div className="trace-safe-text mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Tools 视图不是普通目录页，它解释 Claude Code request 里的“可调用能力层”：目录进入 prompt，调用由模型提出，执行结果再回灌上下文。
              </div>
            </div>
            <span className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: selectedMeta.bg, color: selectedMeta.color }}>
              当前：{selectedName}
            </span>
          </div>

          <div className="grid gap-2 lg:grid-cols-3">
            {protocolCards.map((card, index) => (
              <div key={card.title} className="rounded-lg border px-3 py-3" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
                <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]" style={{ backgroundColor: 'rgba(234,88,12,0.10)', color: 'var(--primary)' }}>
                    {index + 1}
                  </span>
                  <span className="shrink-0" style={{ color: 'var(--primary)' }}>{card.icon}</span>
                  <span className="min-w-0 truncate">{card.title}</span>
                </div>
                <div className="trace-safe-text text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {card.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="border-t p-4 xl:border-l xl:border-t-0" style={{ borderColor: 'rgba(234,88,12,0.18)', backgroundColor: '#fff7ed' }}>
          <div className="mb-3 text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            能力分布速览
          </div>
          <div className="grid gap-2">
            {toolCategoryOrder.filter((category) => toolCounts[category] > 0).map((category) => {
              const meta = toolCategoryMeta[category];
              const pct = percentage(toolCounts[category], toolCounts.all);
              return (
                <button
                  key={category}
                  className="rounded-md border bg-white px-3 py-2 text-left transition-transform hover:-translate-y-0.5"
                  onClick={() => onSelectCategory(category)}
                  style={{
                    borderColor: selectedCategory === category ? meta.color : meta.border,
                    boxShadow: selectedCategory === category ? `inset 3px 0 0 ${meta.color}` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {toolCounts[category]} / {pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(15,23,42,0.06)' }}>
                    <span className="block h-full rounded-full" style={{ width: `${Math.max(8, pct)}%`, backgroundColor: meta.color }} />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}

function DarkKeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.055)' }}>
      <span className="shrink-0 text-[11px]" style={{ color: '#94a3b8' }}>
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-[11px] font-semibold" title={value} style={{ color: '#e2e8f0' }}>
        {value}
      </span>
    </div>
  );
}

function TraceSideLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-md border px-3 py-2 font-medium transition-transform hover:-translate-y-0.5"
      style={{
        borderColor: active ? 'rgba(234,88,12,0.42)' : 'transparent',
        backgroundColor: active ? 'rgba(234,88,12,0.10)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-secondary)',
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
    </a>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border px-3 py-2 transition-colors hover:bg-white/10" style={{ borderColor: 'rgba(148,163,184,0.22)', backgroundColor: 'rgba(255,255,255,0.06)' }}>
      <div className="text-[11px]" style={{ color: '#94a3b8' }}>{label}</div>
      <div className="mt-1 break-words text-[14px] font-semibold" style={{ color: '#f8fafc' }}>{value}</div>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border px-3 py-2 transition-transform hover:-translate-y-0.5" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {icon ? <span className="shrink-0" style={{ color: 'var(--primary)' }}>{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="mt-1 break-words text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

function RawGuideItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <span className="min-w-0 truncate text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
      <span className="min-w-0 break-words rounded-md bg-white px-2 py-1 text-right text-[11px]" style={{ color: 'var(--text-muted)', overflowWrap: 'anywhere' }}>
        {value}
      </span>
    </div>
  );
}

function WorkbenchGuide({
  title,
  summary,
  action,
  currentStep,
  progress,
  layerLabel,
  layerColor,
  detailLabel,
  detailValue,
  detailColor,
  previousView,
  nextView,
  onChangeView,
}: {
  title: string;
  summary: string;
  action: string;
  currentStep: string;
  progress: number;
  layerLabel: string;
  layerColor: string;
  detailLabel: string;
  detailValue: string;
  detailColor: string;
  previousView?: (typeof viewMeta)[number];
  nextView?: (typeof viewMeta)[number];
  onChangeView: (view: ViewId) => void;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: 'rgba(234,88,12,0.22)', backgroundColor: '#ffffff' }}>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 p-4">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              <PlayCircle size={15} style={{ color: 'var(--primary)' }} />
              {title}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {previousView ? (
                <button
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]"
                  onClick={() => onChangeView(previousView.id)}
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  <span className="font-mono">[</span>
                  {previousView.label}
                </button>
              ) : null}
              {nextView ? (
                <button
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]"
                  onClick={() => onChangeView(nextView.id)}
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  {nextView.label}
                  <span className="font-mono">]</span>
                </button>
              ) : null}
            </div>
          </div>
          <div className="trace-safe-text text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {summary}
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-md px-3 py-2 text-[12px]" style={{ backgroundColor: 'rgba(234,88,12,0.08)', color: 'var(--text-secondary)' }}>
            <Info size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
            <span className="trace-safe-text">{action}</span>
          </div>
        </div>
        <div className="grid min-w-0 gap-2 border-t p-4 xl:border-l xl:border-t-0" style={{ borderColor: 'rgba(234,88,12,0.18)', backgroundColor: '#fff7ed' }}>
          <StatusPill label="Step" value={currentStep} />
          <StatusPill label="Pinned layer" value={layerLabel} color={layerColor} />
          <StatusPill label={detailLabel} value={detailValue} color={detailColor} />
          <StatusPill label="Keyboard" value="[ ] switch / Esc clear" />
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>Assembly progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
              <span className="block h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ label, value, color = 'var(--primary)' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border bg-white px-3 py-2" style={{ borderColor: 'rgba(234,88,12,0.18)' }}>
      <span className="shrink-0 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-[12px] font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function CodePanel({ title, meta, text }: { title: string; meta?: string; text: string }) {
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
  totalChars,
  onSelectStep,
}: {
  steps: PromptStep[];
  activeStepId?: string;
  totalChars: number;
  onSelectStep: (id: string) => void;
}) {
  return (
    <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          <GitBranch size={15} style={{ color: 'var(--primary)' }} />
          Assembly flow
        </div>
        <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Click a stage to reveal what was appended at that moment.
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const active = step.id === activeStepId;
          const addedKinds = Array.from(new Set(step.added.map((part) => part.kind)));
          const delta = step.added.reduce((sum, part) => sum + part.text.length, 0);
          const progress = percentage(step.cumulativeChars, totalChars);
          return (
            <button
              key={step.id}
              className="relative rounded-lg border px-3 py-3 text-left transition-transform hover:-translate-y-0.5"
              onClick={() => onSelectStep(step.id)}
              style={{
                borderColor: active ? 'rgba(234,88,12,0.52)' : 'var(--border)',
                backgroundColor: active ? 'rgba(234,88,12,0.08)' : '#ffffff',
                boxShadow: active ? 'inset 3px 0 0 var(--primary)' : undefined,
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
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span>+{formatNumber(delta)} chars</span>
                <span>{progress}%</span>
              </div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
                <span className="block h-full rounded-full" style={{ width: `${Math.max(4, progress)}%`, backgroundColor: active ? 'var(--primary)' : '#fdba74' }} />
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

function StepRail({
  steps,
  activeStepId,
  totalChars,
  onSelectStep,
}: {
  steps: PromptStep[];
  activeStepId?: string;
  totalChars: number;
  onSelectStep: (id: string) => void;
}) {
  return (
    <section className="mb-4 rounded-lg border bg-white p-3" style={{ borderColor: 'var(--border)' }}>
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        <MousePointerClick size={15} style={{ color: 'var(--primary)' }} />
        Prompt growth path
      </div>
      <div className="grid gap-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const active = step.id === activeStepId;
          const delta = step.added.reduce((sum, part) => sum + part.text.length, 0);
          return (
            <button
              key={step.id}
              className="rounded-lg border p-3 text-left transition-transform hover:-translate-y-0.5"
              onClick={() => onSelectStep(step.id)}
              style={{
                borderColor: active ? 'rgba(234,88,12,0.52)' : 'var(--border)',
                backgroundColor: active ? 'rgba(234,88,12,0.08)' : '#fffaf3',
                boxShadow: active ? 'inset 3px 0 0 var(--primary)' : undefined,
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
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold" style={{ color: active ? 'var(--primary)' : 'var(--text-primary)' }}>
                    {step.title}
                  </div>
                  <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    +{formatNumber(delta)} chars
                  </div>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(234,88,12,0.12)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(4, percentage(step.cumulativeChars, totalChars))}%`,
                    backgroundColor: active ? 'var(--primary)' : '#fdba74',
                  }}
                />
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
    <section className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          <Network size={15} style={{ color: 'var(--primary)' }} />
          Prompt assembly blueprint
        </div>
        <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Final structure stays visible; selected step highlights appended nodes.
        </div>
      </div>
      <div className="mb-3 rounded-lg border bg-white/60 px-3 py-2 text-[12px]" style={{ borderColor: 'rgba(234,88,12,0.22)', color: 'var(--text-muted)' }}>
        The outline below is the complete final prompt envelope. Highlighted nodes were added by {activeStep ? activeStep.title : 'the selected stage'}.
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
  const visibleExpanded = expanded || active || selected;

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
        aria-expanded={visibleExpanded}
      >
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold" style={{ color: style.color }}>
            {item.title}
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {item.parts.length} sections / {formatNumber(item.chars)} chars
          </div>
        </div>
        <ChevronRight size={14} className="shrink-0 transition-transform" style={{ color: style.color, transform: visibleExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
      </button>
      {visibleExpanded ? (
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
      className={`rounded-lg border text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-300 ${compact ? 'p-3' : 'p-4'}`}
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
      className="min-w-0 rounded-lg border p-3 text-left transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
      onClick={() => onSelect(tool.name)}
      style={{
        borderColor: active ? meta.color : meta.border,
        backgroundColor: active ? '#ffffff' : 'rgba(255,255,255,0.76)',
        boxShadow: active ? `inset 3px 0 0 ${meta.color}, 0 10px 24px rgba(15,23,42,0.06)` : undefined,
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
      <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ color: meta.color }}>
        <MousePointerClick size={13} />
        <span>Click to inspect schema</span>
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
          <CodePanel title={`${tool.name} schema`} meta={`${properties.length} fields`} text={JSON.stringify(tool.input_schema, null, 2)} />
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
          <CodePanel title={`${step.title} cumulative prompt`} meta={`${formatNumber(step.cumulativeChars)} chars`} text={assembledText} />
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
      <CodePanel title={part.title} meta={`${formatNumber(part.text.length)} chars`} text={part.text} />
    </div>
  );
}
