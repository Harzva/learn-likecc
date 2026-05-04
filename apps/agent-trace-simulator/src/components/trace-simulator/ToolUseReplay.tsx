import type { ReactNode } from 'react';
import { Braces, CheckCircle2, Database, PlayCircle, TerminalSquare } from 'lucide-react';

import type { TraceTool } from '@/trace/types';

import { classifyTool, formatNumber, schemaProperties, type SchemaProperty, toolCategoryMeta } from './model';
import { CodePanel } from './CodePanel';

function sampleValueForProperty(property: SchemaProperty): unknown {
  const name = property.name.toLowerCase();
  if (property.enumValues.length) return property.enumValues[0];
  if (property.type === 'boolean') return true;
  if (property.type === 'number' || property.type === 'integer') return 1;
  if (property.type === 'array') return name.includes('command') ? ['npm', 'run', 'build'] : [];
  if (property.type === 'object') return {};
  if (name.includes('pattern') || name.includes('glob')) return '**/*.tsx';
  if (name.includes('query') || name.includes('search')) return 'avatar OR prompt';
  if (name.includes('path') || name.includes('file')) return 'src/components/example.tsx';
  if (name.includes('command')) return 'npm run build';
  if (name.includes('description')) return 'Inspect the relevant files and summarize the result.';
  return `sample_${property.name}`;
}

function buildToolUseInput(tool?: TraceTool) {
  if (!tool) return {};

  const properties = schemaProperties(tool);
  const required = properties.filter((property) => property.required);
  const previewFields = (required.length ? required : properties).slice(0, 6);
  return Object.fromEntries(previewFields.map((property) => [property.name, sampleValueForProperty(property)]));
}

export function ToolUseReplay({ tool }: { tool?: TraceTool }) {
  const category = tool ? classifyTool(tool) : 'all';
  const meta = toolCategoryMeta[category];
  const properties = tool ? schemaProperties(tool) : [];
  const input = buildToolUseInput(tool);
  const toolUsePayload = tool
    ? {
        type: 'tool_use',
        name: tool.name,
        input,
      }
    : {
        type: 'tool_use',
        name: '(select a tool)',
        input: {},
      };
  const resultPayload = {
    type: 'tool_result',
    tool_name: tool?.name ?? '(select a tool)',
    content: tool ? `Runtime executes ${tool.name} with validated input, then appends the result back into the next context turn.` : 'Select a tool to see how schema can become a concrete call.',
  };

  return (
    <section className="mb-4 overflow-hidden rounded-lg border bg-white" style={{ borderColor: meta.border }}>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0 p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                <PlayCircle size={15} style={{ color: meta.color }} />
                tool_use 示例回放
              </div>
              <div className="trace-safe-text mt-1 text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                这不是另一个 schema 表格，而是把“工具定义如何进入 request、模型如何生成调用意图、runtime 如何回灌结果”串成一次可读回放。
              </div>
            </div>
            <span className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: meta.bg, color: meta.color }}>
              {tool?.name ?? 'No tool'}
            </span>
          </div>

          <div className="grid gap-2">
            <ReplayStage
              index={1}
              icon={<Database size={14} />}
              title="schema exposed"
              body={`${properties.length} input fields are advertised to the model before any call is made.`}
              color={meta.color}
            />
            <ReplayStage
              index={2}
              icon={<Braces size={14} />}
              title="assistant emits tool_use"
              body="The model returns structured intent: tool name plus JSON input, not an executed side effect."
              color={meta.color}
            />
            <ReplayStage
              index={3}
              icon={<TerminalSquare size={14} />}
              title="runtime appends tool_result"
              body="The runtime validates and executes the call, then feeds the observation into the following turn."
              color={meta.color}
            />
          </div>
        </div>

        <div className="min-w-0 border-t p-4 xl:border-l xl:border-t-0" style={{ borderColor: meta.border, backgroundColor: meta.bg }}>
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            <ReplayMetric label="category" value={toolCategoryMeta[category].label} color={meta.color} />
            <ReplayMetric label="schema fields" value={formatNumber(properties.length)} color={meta.color} />
            <ReplayMetric label="sample args" value={formatNumber(Object.keys(input).length)} color={meta.color} />
          </div>
          <CodePanel title="assistant tool_use payload" meta="schema-derived sample" text={JSON.stringify(toolUsePayload, null, 2)} />
          <div className="mt-3">
            <CodePanel title="runtime tool_result sketch" meta="what comes back into context" text={JSON.stringify(resultPayload, null, 2)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReplayStage({ index, icon, title, body, color }: { index: number; icon: ReactNode; title: string; body: string; color: string }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px]" style={{ backgroundColor: 'rgba(234,88,12,0.10)', color }}>
          {index}
        </span>
        <span className="shrink-0" style={{ color }}>
          {icon}
        </span>
        <span>{title}</span>
        {index === 3 ? <CheckCircle2 className="ml-auto" size={14} style={{ color }} /> : null}
      </div>
      <div className="trace-safe-text pl-8 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {body}
      </div>
    </div>
  );
}

function ReplayMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-md border bg-white/80 px-3 py-2" style={{ borderColor: 'rgba(255,255,255,0.85)' }}>
      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="mt-1 truncate text-[12px] font-semibold" title={value} style={{ color }}>
        {value}
      </div>
    </div>
  );
}
