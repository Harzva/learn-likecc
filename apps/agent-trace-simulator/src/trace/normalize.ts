import type { JsonValue, NormalizedTrace, TraceInjectedBlock, TraceSystemBlock, TraceTool } from './types';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function safeString(v: unknown): string | undefined {
  if (typeof v === 'string') return v;
  return undefined;
}

function asJsonValue(v: unknown): JsonValue {
  return v as JsonValue;
}

function readRequestBody(raw: unknown): JsonValue | null {
  if (!isRecord(raw)) return null;
  // sanitized samples used by the public simulator
  if (isRecord(raw.requestBody)) {
    return asJsonValue(raw.requestBody);
  }
  // kimi traces
  const rawPair = raw.rawPair;
  if (isRecord(rawPair) && isRecord(rawPair.request) && isRecord(rawPair.request.body)) {
    return asJsonValue(rawPair.request.body);
  }
  // demo trace
  const reqSummary = raw.request_summary;
  if (isRecord(reqSummary) && isRecord(reqSummary.body)) {
    return asJsonValue(reqSummary.body);
  }
  return null;
}

function readSystemBlocks(body: JsonValue): TraceSystemBlock[] {
  if (!isRecord(body)) return [];
  const sys = body.system;
  if (typeof sys === 'string') {
    return [{ text: sys }];
  }
  if (Array.isArray(sys)) {
    const blocks: TraceSystemBlock[] = [];
    for (const it of sys) {
      if (isRecord(it) && typeof it.text === 'string') {
        blocks.push({ text: it.text, cache_control: asJsonValue(it.cache_control) });
      } else if (typeof it === 'string') {
        blocks.push({ text: it });
      }
    }
    return blocks;
  }
  return [];
}

function readTools(body: JsonValue): TraceTool[] {
  if (!isRecord(body)) return [];
  const tools = body.tools;
  if (!Array.isArray(tools)) return [];
  const out: TraceTool[] = [];
  for (const t of tools) {
    if (!isRecord(t)) continue;
    const name = safeString(t.name);
    if (!name) continue;
    out.push({
      name,
      description: safeString(t.description),
      input_schema: asJsonValue(t.input_schema),
    });
  }
  return out;
}

function readInjectedBlocks(body: JsonValue): TraceInjectedBlock[] {
  if (!isRecord(body)) return [];
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) return [];
  const m0 = messages[0];
  if (!isRecord(m0)) return [];
  const content = m0.content;
  if (!Array.isArray(content)) return [];
  const blocks: TraceInjectedBlock[] = [];
  for (let i = 0; i < content.length - 1; i++) {
    const it = content[i];
    if (isRecord(it) && typeof it.text === 'string') {
      const text = it.text;
      const kind: TraceInjectedBlock['kind'] =
        text.trimStart().startsWith('<system-reminder>') ? 'system-reminder' : 'unknown';
      blocks.push({ text, kind });
    } else if (typeof it === 'string') {
      blocks.push({ text: it, kind: 'unknown' });
    }
  }
  return blocks;
}

export function normalizeTrace(id: string, label: string, raw: unknown): NormalizedTrace {
  if (!isRecord(raw)) {
    return {
      id,
      label,
      requestBody: null,
      systemBlocks: [],
      injectedBlocks: [],
      tools: [],
    };
  }

  const friendly = isRecord(raw.friendly) ? raw.friendly : raw;
  const exportedAt = safeString(raw.exported_at);
  const userPrompt = friendly ? safeString(friendly.user_prompt) : undefined;
  const responseText = friendly ? safeString(friendly.response_text) : undefined;
  const model = friendly ? safeString(friendly.model) : undefined;
  const provider = friendly ? safeString(friendly.provider) : undefined;
  const targetUrl = friendly ? safeString(friendly.target_url) : undefined;
  const status = friendly ? safeString(friendly.status) : undefined;

  const body = readRequestBody(raw) ?? null;
  const systemBlocks = body ? readSystemBlocks(body) : [];
  const injectedBlocks = body ? readInjectedBlocks(body) : [];
  const tools = body ? readTools(body) : [];

  return {
    id,
    label,
    exportedAt,
    model,
    provider,
    targetUrl,
    status,
    userPrompt,
    responseText,
    requestBody: body,
    systemBlocks,
    injectedBlocks,
    tools,
  };
}
