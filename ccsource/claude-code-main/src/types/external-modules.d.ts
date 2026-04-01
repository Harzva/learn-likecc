/**
 * Type declarations for external npm modules that may not be installed.
 */

declare module 'cli-highlight' {
  export function highlight(code: string, options?: { language?: string }): string
}

declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: { headingStyle?: string; hr?: string; bulletListMarker?: string })
    turndown(html: string): string
    addRule(name: string, rule: unknown): this
  }
}

declare module 'fflate' {
  export function unzip(data: Uint8Array, cb: (err: Error | null, result: Record<string, Uint8Array>) => void): void
  export function zip(data: Record<string, Uint8Array>, cb: (err: Error | null, result: Uint8Array) => void): void
  export function gzip(data: Uint8Array, cb: (err: Error | null, result: Uint8Array) => void): void
  export function gunzip(data: Uint8Array, cb: (err: Error | null, result: Uint8Array) => void): void
}

declare module 'plist' {
  export function parse(xml: string): Record<string, unknown>
  export function build(obj: Record<string, unknown>): string
}

declare module 'cacache' {
  export function get(cachePath: string, key: string): Promise<{ data: Buffer; metadata: unknown }>
  export function put(cachePath: string, key: string, data: Buffer | string, options?: { metadata?: unknown }): Promise<string>
  export function rm(cachePath: string, key: string): Promise<void>
  export function clear(cachePath: string): Promise<void>
}

declare module '@anthropic-ai/mcpb' {
  export function encode(data: unknown): Buffer
  export function decode(data: Buffer): unknown
}

declare module '@anthropic-ai/claude-agent-sdk' {
  export function createAgent(config: unknown): unknown
  export function runAgent(agent: unknown, input: unknown): unknown
  export const Agent: unknown
}

declare module '@aws-sdk/client-bedrock' {
  export class BedrockClient {
    constructor(config?: unknown)
    send(command: unknown): Promise<unknown>
  }
}

declare module '@aws-sdk/credential-providers' {
  export function fromNodeProviderChain(): unknown
  export function fromEnv(): unknown
}

declare module '@azure/identity' {
  export class DefaultAzureCredential {
    constructor()
  }
}

declare module '@opentelemetry/exporter-trace-otlp-http' {
  export class OTLPTraceExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-trace-otlp-proto' {
  export class OTLPTraceExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-trace-otlp-grpc' {
  export class OTLPTraceExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-logs-otlp-http' {
  export class OTLPLogExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-logs-otlp-proto' {
  export class OTLPLogExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-logs-otlp-grpc' {
  export class OTLPLogExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-metrics-otlp-http' {
  export class OTLPMetricExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-metrics-otlp-proto' {
  export class OTLPMetricExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-metrics-otlp-grpc' {
  export class OTLPMetricExporter {
    constructor(options?: unknown)
  }
}

declare module '@opentelemetry/exporter-prometheus' {
  export class PrometheusExporter {
    constructor(options?: unknown)
  }
}

// ============================================================================
// Additional SDK modules
// ============================================================================
declare module '@anthropic-ai/vertex-sdk' {
  export class VertexClient {
    constructor(config?: unknown)
    send(command: unknown): Promise<unknown>
  }
}

declare module '@anthropic-ai/foundry-sdk' {
  export class FoundryClient {
    constructor(config?: unknown)
    send(command: unknown): Promise<unknown>
  }
}

declare module '@anthropic-ai/bedrock-sdk' {
  export class BedrockClient {
    constructor(config?: unknown)
    send(command: unknown): Promise<unknown>
  }
}

declare module '@aws-sdk/client-sts' {
  export class STSClient {
    constructor(config?: unknown)
    send(command: unknown): Promise<unknown>
  }
  export class AssumeRoleCommand {
    constructor(input: unknown)
  }
  export class GetCallerIdentityCommand {
    constructor()
  }
}

// ============================================================================
// Anthropic SDK type augmentations
// ============================================================================
declare module '@anthropic-ai/sdk/resources/beta/messages/messages.mjs' {
  export interface BetaJSONOutputFormat {
    type: 'json'
    [key: string]: unknown
  }
  export interface BetaOutputConfig {
    type: 'json'
    [key: string]: unknown
  }
  export interface BetaRequestDocumentBlock {
    type: 'document'
    source: unknown
    [key: string]: unknown
  }
  export type BetaStopReason = 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | string
}

// ============================================================================
// Additional internal constants
// ============================================================================
declare module "*/constants/betas.js" {
  export const CACHE_EDITING_BETA_HEADER: string
  export const THINKING_BETA_HEADER: string
  export const INTERLEAVED_THINKING_BETA_HEADER: string
  export const MAX_TOKENS_BETA_HEADER: string
}

// ============================================================================
// Diff library augmentation
// ============================================================================
declare module 'diff' {
  export function diffArrays(oldArray: unknown[], newArray: unknown[], options?: unknown): unknown[]
  export function diffLines(oldStr: string, newStr: string, options?: unknown): unknown[]
  export function diffWordsWithSpace(oldStr: string, newStr: string, options?: unknown): unknown[]
  export function diffChars(oldStr: string, newStr: string, options?: unknown): unknown[]
  export function diffWords(oldStr: string, newStr: string, options?: unknown): unknown[]
  export function diffTrimmedLines(oldStr: string, newStr: string, options?: unknown): unknown[]
  export function diffSentences(oldStr: string, newStr: string, options?: unknown): unknown[]
  export function diffJson(oldObj: unknown, newObj: unknown, options?: unknown): unknown[]
  export interface Change {
    added?: boolean
    removed?: boolean
    value: string
    count?: number
  }
}

// ============================================================================
// Anthropic SDK additional type augmentations
// ============================================================================
declare module '@anthropic-ai/sdk/resources/beta/messages/messages.mjs' {
  export interface BetaMessageDeltaUsage {
    input_tokens?: number
    output_tokens?: number
    cache_creation_input_tokens?: number
    cache_read_input_tokens?: number
    [key: string]: unknown
  }
  export interface BetaMessageStreamParams {
    model: string
    messages: unknown[]
    max_tokens?: number
    [key: string]: unknown
  }
  export interface BetaContentBlock {
    type: 'text' | 'tool_use' | 'thinking' | 'image' | string
    text?: string
    [key: string]: unknown
  }
  export interface BetaUsage {
    input_tokens: number
    output_tokens: number
    cache_creation_input_tokens?: number
    cache_read_input_tokens?: number
    [key: string]: unknown
  }
}

// ============================================================================
// OAuth types
// ============================================================================
declare module '*/services/oauth/types.js' {
  export interface OAuthTokens {
    access_token: string
    refresh_token?: string
    expires_in?: number
    [key: string]: unknown
  }
  export interface ReferralRedemptionsResponse {
    data?: unknown[]
    [key: string]: unknown
  }
  export interface ReferrerRewardInfo {
    referralCount?: number
    [key: string]: unknown
  }
}

// ============================================================================
// Agent SDK
// ============================================================================
declare module '@anthropic-ai/claude-agent-sdk' {
  export type PermissionMode = 'ask' | 'deny' | 'allow' | 'passthrough' | string
  export interface AgentConfig {
    [key: string]: unknown
  }
  export interface AgentResult {
    [key: string]: unknown
  }
}

// ============================================================================
// Anthropic SDK Beta types - comprehensive stubs
// ============================================================================
declare module '@anthropic-ai/sdk/resources/beta/messages/messages.mjs' {
  // Content block types
  export type BetaContentBlockParam = {
    type: 'text' | 'image' | 'tool_use' | 'tool_result' | 'thinking' | string
    text?: string
    source?: unknown
    name?: string
    input?: unknown
    tool_use_id?: string
    content?: unknown
    thinking?: string
    [key: string]: unknown
  }
  export type BetaContentBlock = BetaContentBlockParam
  export type BetaImageBlockParam = {
    type: 'image'
    source: {
      type: 'base64' | 'url'
      media_type?: string
      data?: string
      url?: string
    }
  }
  export type BetaTextBlockParam = {
    type: 'text'
    text: string
  }
  export type BetaToolUseBlockParam = {
    type: 'tool_use'
    name: string
    input: unknown
    id: string
  }
  export type BetaToolResultBlockParam = {
    type: 'tool_result'
    tool_use_id: string
    content: string | BetaContentBlockParam[]
    is_error?: boolean
  }
  export type BetaThinkingBlockParam = {
    type: 'thinking'
    thinking: string
  }
  
  // Message types
  export type BetaMessageParam = {
    role: 'user' | 'assistant'
    content: string | BetaContentBlockParam[]
    [key: string]: unknown
  }
  export type BetaMessage = {
    id: string
    role: 'assistant'
    content: BetaContentBlock[]
    model: string
    stop_reason?: BetaStopReason
    stop_sequence?: string
    usage: BetaUsage
    [key: string]: unknown
  }
  
  // Usage and streaming
  export type BetaUsage = {
    input_tokens: number
    output_tokens: number
    cache_creation_input_tokens?: number
    cache_read_input_tokens?: number
    [key: string]: unknown
  }
  export type BetaMessageDeltaUsage = BetaUsage
  export type BetaMessageStreamParams = {
    model: string
    messages: BetaMessageParam[]
    max_tokens?: number
    system?: string | BetaTextBlockParam[]
    tools?: BetaToolUnion[]
    tool_choice?: BetaToolChoiceAuto | BetaToolChoiceTool
    stream?: boolean
    [key: string]: unknown
  }
  export type BetaRawMessageStreamEvent = {
    type: 'message_start' | 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop' | string
    message?: BetaMessage
    index?: number
    content_block?: BetaContentBlock
    delta?: { type: string; [key: string]: unknown }
    usage?: BetaUsage
    [key: string]: unknown
  }
  
  // Tool types
  export type BetaToolUnion = {
    name: string
    description?: string
    input_schema?: unknown
    type?: string
    [key: string]: unknown
  }
  export type BetaToolChoiceAuto = {
    type: 'auto'
    disable_parallel_tool_use?: boolean
  }
  export type BetaToolChoiceTool = {
    type: 'tool'
    name: string
  }
  
  // Output format
  export type BetaJSONOutputFormat = {
    type: 'json'
    schema?: unknown
  }
  export type BetaOutputConfig = BetaJSONOutputFormat
  export type BetaRequestDocumentBlock = {
    type: 'document'
    source: unknown
    [key: string]: unknown
  }
  export type BetaStopReason = 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | string
}

// ============================================================================
// Anthropic Sandbox Runtime types
// ============================================================================
declare module '@anthropic-ai/sandbox-runtime' {
  export interface FsReadRestrictionConfig {
    allow?: string[]
    deny?: string[]
    [key: string]: unknown
  }
  export interface FsWriteRestrictionConfig {
    allow?: string[]
    deny?: string[]
    [key: string]: unknown
  }
  export interface IgnoreViolationsConfig {
    patterns?: string[]
    [key: string]: unknown
  }
  export type NetworkHostPattern = string | RegExp
  export interface NetworkRestrictionConfig {
    allow?: NetworkHostPattern[]
    deny?: NetworkHostPattern[]
    [key: string]: unknown
  }
  export type SandboxAskCallback = (question: string) => Promise<boolean>
  export interface SandboxDependencyCheck {
    name: string
    check: () => Promise<boolean>
    [key: string]: unknown
  }
  export interface SandboxRuntimeConfig {
    fs?: {
      read?: FsReadRestrictionConfig
      write?: FsWriteRestrictionConfig
      ignoreViolations?: IgnoreViolationsConfig
    }
    network?: NetworkRestrictionConfig
    [key: string]: unknown
  }
  export interface SandboxViolationEvent {
    type: 'fs' | 'network' | string
    operation: string
    path?: string
    pattern?: string
    [key: string]: unknown
  }
  
  // SandboxManager methods
  export class SandboxManager {
    static checkDependencies(): Promise<SandboxDependencyCheck[]>
    static isSupportedPlatform(): boolean
    static wrapWithSandbox(command: string, config: SandboxRuntimeConfig): Promise<unknown>
    static initialize(config: SandboxRuntimeConfig): Promise<void>
    static updateConfig(config: Partial<SandboxRuntimeConfig>): void
  }
  
  export const SandboxRuntimeConfigSchema: unknown
  export const SandboxViolationStore: unknown
}
