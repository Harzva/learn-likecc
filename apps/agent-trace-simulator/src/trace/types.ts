export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [k: string]: JsonValue };

export interface TraceTool {
  name: string;
  description?: string;
  input_schema?: JsonValue;
}

export interface TraceSystemBlock {
  text: string;
  cache_control?: JsonValue;
}

export interface TraceInjectedBlock {
  text: string;
  kind: 'system-reminder' | 'unknown';
}

export interface NormalizedTrace {
  id: string;
  label: string;
  exportedAt?: string;
  model?: string;
  provider?: string;
  targetUrl?: string;
  status?: string;
  userPrompt?: string;
  responseText?: string;
  requestBody: JsonValue;
  systemBlocks: TraceSystemBlock[];
  injectedBlocks: TraceInjectedBlock[];
  tools: TraceTool[];
}

export interface PromptPart {
  id: string;
  kind: 'system' | 'reminder' | 'tools' | 'user';
  title: string;
  description: string;
  text: string;
  parentTitle?: string;
  parentDescription?: string;
}

export interface PromptStep {
  id: string;
  title: string;
  parts: PromptPart[];
  added: PromptPart[];
  cumulativeChars: number;
}
