import type { PromptPart, TraceTool } from '@/trace/types';

export const kindStyles: Record<PromptPart['kind'], { label: string; shortLabel: string; color: string; bg: string; border: string }> = {
  system: { label: 'System scaffold', shortLabel: 'System', color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
  reminder: { label: 'Runtime reminders', shortLabel: 'Runtime', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
  tools: { label: 'Tool catalog', shortLabel: 'Tools', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  user: { label: 'User message', shortLabel: 'User', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
};

export type ToolCategory = 'all' | 'files' | 'runtime' | 'workflow' | 'automation' | 'web' | 'mcp' | 'interaction';

export const toolCategoryMeta: Record<ToolCategory, { label: string; color: string; bg: string; border: string }> = {
  all: { label: 'All tools', color: '#0f172a', bg: '#fffaf3', border: '#fed7aa' },
  files: { label: 'Files', color: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
  runtime: { label: 'Runtime', color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
  workflow: { label: 'Workflow', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  automation: { label: 'Automation', color: '#0891b2', bg: '#ecfeff', border: '#67e8f9' },
  web: { label: 'Web', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  mcp: { label: 'MCP', color: '#9333ea', bg: '#faf5ff', border: '#d8b4fe' },
  interaction: { label: 'Interaction', color: '#be123c', bg: '#fff1f2', border: '#fda4af' },
};

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function percentage(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function classifyTool(tool: TraceTool): Exclude<ToolCategory, 'all'> {
  const name = tool.name.toLowerCase();
  if (name.startsWith('mcp__')) return 'mcp';
  if (['read', 'write', 'edit', 'notebookedit'].includes(name)) return 'files';
  if (['bash', 'enterworktree', 'exitworktree', 'skill'].includes(name)) return 'runtime';
  if (name.startsWith('task') || name === 'agent' || name.includes('planmode')) return 'workflow';
  if (name.includes('cron') || name.includes('schedule') || name.includes('monitor') || name.includes('notification') || name.includes('trigger')) return 'automation';
  if (name.startsWith('web')) return 'web';
  return 'interaction';
}

export function schemaProperties(tool: TraceTool) {
  const schema = asRecord(tool.input_schema);
  const properties = asRecord(schema?.properties);
  const required = Array.isArray(schema?.required) ? new Set(schema.required.filter((item): item is string => typeof item === 'string')) : new Set<string>();
  if (!properties) return [];

  return Object.entries(properties).map(([name, value]) => {
    const property = asRecord(value);
    const type = typeof property?.type === 'string' ? property.type : Array.isArray(property?.enum) ? 'enum' : 'value';
    const description = typeof property?.description === 'string' ? property.description : '';
    const enumValues = Array.isArray(property?.enum) ? property.enum.filter((item): item is string | number | boolean => ['string', 'number', 'boolean'].includes(typeof item)) : [];
    return { name, type, description, required: required.has(name), enumValues };
  });
}

export type SchemaProperty = ReturnType<typeof schemaProperties>[number];
