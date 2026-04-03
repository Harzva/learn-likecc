/**
 * Type declarations for external npm modules that may not be installed.
 */

// ============================================================================
// Anthropic SDK main module
// ============================================================================
declare module '@anthropic-ai/sdk' {
  export interface ClientOptions {
    apiKey?: string
    baseURL?: string
    maxRetries?: number
    timeout?: number
    logger?: {
      error: (msg: string, ...args: unknown[]) => void
      warn: (msg: string, ...args: unknown[]) => void
      info: (msg: string, ...args: unknown[]) => void
      debug: (msg: string, ...args: unknown[]) => void
    }
    fetch?: (url: string, init?: RequestInit) => Promise<Response>
    fetchOptions?: Record<string, unknown>
    httpAgent?: unknown
    [key: string]: unknown
  }

  // Message types
  export interface MessageParam {
    role: 'user' | 'assistant'
    content: string | unknown[]
  }

  export interface TextBlockParam {
    type: 'text'
    text: string
  }

  export interface Tool {
    name: string
    description?: string
    input_schema: unknown
  }

  export type ToolChoice =
    | { type: 'auto' }
    | { type: 'any' }
    | { type: 'tool'; name: string }

  // Beta types
  export interface BetaMessage {
    id: string
    role: 'assistant'
    content: unknown[]
    model: string
    usage?: {
      input_tokens: number
      output_tokens: number
      cache_creation_input_tokens?: number
      cache_read_input_tokens?: number
    }
  }

  export interface BetaMessageParam {
    role: 'user' | 'assistant'
    content: string | unknown[]
  }

  export interface BetaToolUseBlockParam {
    type: 'tool_use'
    id: string
    name: string
    input: unknown
  }

  export interface BetaToolResultBlockParam {
    type: 'tool_result'
    tool_use_id: string
    content?: string | unknown[]
    is_error?: boolean
  }

  export interface BetaJSONOutputFormat {
    type: 'json'
    schema?: unknown
  }

  export interface BetaThinkingConfigParam {
    type: 'enabled' | 'disabled'
    budget_tokens?: number
  }

  export class APIError extends Error {
    status?: number
    headers?: Record<string, string> & { get?: (key: string) => string | null }
    request_id?: string
    error?: unknown
    constructor(status: number | undefined, error: unknown, message: string | undefined, headers: Record<string, string> | undefined)
  }

  export class APIConnectionError extends APIError {
    constructor(options?: { message?: string; cause?: Error })
  }

  export class APIConnectionTimeoutError extends APIError {
    constructor(options?: { message?: string })
  }

  export class BadRequestError extends APIError {}
  export class AuthenticationError extends APIError {}
  export class PermissionDeniedError extends APIError {}
  export class NotFoundError extends APIError {}
  export class ConflictError extends APIError {}
  export class RateLimitError extends APIError {}
  export class UnprocessableEntityError extends APIError {}
  export class InternalServerError extends APIError {}
  export class APIUserAbortError extends Error {
    constructor(message?: string)
  }

  // Namespace types for Anthropic.Beta.Messages.XXX pattern
  export interface ContentBlock {
    type: string
    [key: string]: unknown
  }

  export interface ContentBlockParam {
    type: string
    [key: string]: unknown
  }

  export type MessageContent = string | ContentBlockParam[]

  export interface BetaContentBlockParam {
    type: string
    text?: string
    source?: unknown
    [key: string]: unknown
  }

  export type BetaToolChoiceTool = { type: 'tool'; name: string }
  export type BetaToolChoiceAuto = { type: 'auto' }

  export interface BetaMessageStreamParams {
    model: string
    messages: BetaMessageParam[]
    max_tokens: number
    thinking?: BetaThinkingConfigParam
    tools?: BetaToolUnion[]
    tool_choice?: BetaToolChoiceTool | BetaToolChoiceAuto
    system?: string | unknown[]
    metadata?: unknown
    stop_sequences?: string[]
    stream?: boolean
    temperature?: number
    top_p?: number
    top_k?: number
    [key: string]: unknown
  }

  export interface BetaMessageCreateParams {
    model: string
    messages: BetaMessageParam[]
    max_tokens: number
    thinking?: BetaThinkingConfigParam
    tools?: BetaToolUnion[]
    tool_choice?: BetaToolChoiceTool | BetaToolChoiceAuto
    system?: string | unknown[]
    metadata?: unknown
    stop_sequences?: string[]
    stream?: boolean
    temperature?: number
    top_p?: number
    top_k?: number
    [key: string]: unknown
  }

  export interface BetaMessageCreateOptions {
    signal?: AbortSignal
    timeout?: number
    headers?: Record<string, string>
    [key: string]: unknown
  }

  export interface BetaRawMessageStreamEvent {
    type: string
    message?: BetaMessage
    index?: number
    content_block?: BetaContentBlock
    delta?: unknown
    usage?: BetaUsage
    [key: string]: unknown
  }

  export interface BetaContentBlock {
    type: 'text' | 'tool_use' | 'thinking' | 'image' | string
    text?: string
    thinking?: string
    name?: string
    id?: string
    input?: unknown
    source?: unknown
    [key: string]: unknown
  }

  export interface BetaUsage {
    input_tokens: number
    output_tokens: number
    cache_creation_input_tokens?: number
    cache_read_input_tokens?: number
    [key: string]: unknown
  }

  export type EffortLevel = 'low' | 'medium' | 'high' | string

  export interface BetaToolUnion {
    name: string
    description?: string
    input_schema?: unknown
    type?: string
    [key: string]: unknown
  }

  export interface Anthropic {
    MessageParam: MessageParam
    TextBlockParam: TextBlockParam
    Tool: Tool
    ToolChoice: ToolChoice
    ContentBlock: ContentBlock
    ContentBlockParam: ContentBlockParam
    Beta: {
      Messages: {
        BetaMessage: BetaMessage
        BetaMessageParam: BetaMessageParam
        BetaJSONOutputFormat: BetaJSONOutputFormat
        BetaThinkingConfigParam: BetaThinkingConfigParam
        BetaToolUnion: BetaToolUnion
      }
    }
  }

  const Anthropic: Anthropic & {
    new (options?: ClientOptions): {
      messages: {
        create: (params: unknown) => Promise<unknown>
        stream: (params: unknown) => unknown
      }
      beta: {
        messages: {
          create: (params: BetaMessageCreateParams, options?: BetaMessageCreateOptions) => Promise<BetaMessage>
          stream: (params: unknown, options?: { signal?: AbortSignal; timeout?: number }) => unknown
        }
      }
    }
  }

  export default Anthropic

  // Export namespace for type access
  export { Anthropic }
}

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
  export interface InferenceProfileSummary {
    inferenceProfileId?: string
    inferenceProfileName?: string
    status?: string
    type?: string
  }
  export interface ListInferenceProfilesCommandInput {
    nextToken?: string
    typeEquals?: string
    maxResults?: number
  }
  export interface ListInferenceProfilesCommandOutput {
    inferenceProfileSummaries?: InferenceProfileSummary[]
    nextToken?: string
  }
  export class ListInferenceProfilesCommand {
    constructor(input: ListInferenceProfilesCommandInput)
  }
  export interface GetInferenceProfileCommandInput {
    inferenceProfileIdentifier: string
  }
  export interface GetInferenceProfileCommandOutput {
    inferenceProfileId?: string
    inferenceProfileName?: string
    models?: Array<{
      modelArn?: string
      modelName?: string
    }>
  }
  export class GetInferenceProfileCommand {
    constructor(input: GetInferenceProfileCommandInput)
  }
  export interface BedrockClientConfig {
    region?: string
    endpoint?: string
    credentials?: {
      accessKeyId: string
      secretAccessKey: string
      sessionToken?: string
    }
    requestHandler?: unknown
    httpAuthSchemes?: unknown[]
    httpAuthSchemeProvider?: () => unknown[]
  }
  export class BedrockClient {
    constructor(config?: BedrockClientConfig)
    send(command: ListInferenceProfilesCommand): Promise<ListInferenceProfilesCommandOutput>
    send(command: GetInferenceProfileCommand): Promise<GetInferenceProfileCommandOutput>
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
  export function getBearerTokenProvider(
    credential: DefaultAzureCredential,
    scopes: string | string[],
  ): () => Promise<string>
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
  export const AnthropicVertex: typeof VertexClient
}

declare module '@anthropic-ai/foundry-sdk' {
  export class FoundryClient {
    constructor(config?: unknown)
    send(command: unknown): Promise<unknown>
  }
  export const AnthropicFoundry: typeof FoundryClient
}

declare module '@anthropic-ai/bedrock-sdk' {
  export class BedrockClient {
    constructor(config?: unknown)
    send(command: unknown): Promise<unknown>
  }
  export const AnthropicBedrock: typeof BedrockClient
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

  export interface StructuredPatchHunk {
    oldStart: number
    oldLines: number
    newStart: number
    newLines: number
    lines: string[]
  }

  export interface StructuredPatchOptions {
    context?: number
    ignoreWhitespace?: boolean
    timeout?: number
  }

  export function structuredPatch(
    oldFileName: string,
    newFileName: string,
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string,
    options?: StructuredPatchOptions
  ): string | { hunks: StructuredPatchHunk[] }

  export interface Change {
    added?: boolean
    removed?: boolean
    value: string
    count?: number
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
    scopes?: string[]
    tokenAccount?: {
      uuid: string
      emailAddress: string
      organizationUuid: string
    }
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
  export interface OrgValidationResult {
    valid?: boolean
    message?: string
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
  export type BetaThinkingBlock = {
    type: 'thinking'
    thinking: string
  }
  export type BetaRedactedThinkingBlock = {
    type: 'redacted_thinking'
    data: string
  }
  export type BetaToolUseBlock = {
    type: 'tool_use'
    id: string
    name: string
    input: unknown
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
    max_tokens: number
    thinking?: BetaThinkingConfigParam
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
    allowed_domains?: string[]
    blocked_domains?: string[]
    max_uses?: number
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
    format?: unknown
    effort?: string
    [key: string]: unknown
  }
  export type BetaOutputConfig = {
    type?: 'json'
    schema?: unknown
    format?: unknown
    effort?: string
    [key: string]: unknown
  }
  export type BetaRequestDocumentBlock = {
    type: 'document'
    source: unknown
    [key: string]: unknown
  }
  export type BetaStopReason = 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | string
}

// ============================================================================
// highlight.js types
// ============================================================================
declare module 'highlight.js' {
  export interface HLJSApi {
    highlight(code: string, options?: { language?: string; ignoreIllegals?: boolean }): { value: string; language: string; relevance: number; secondBest?: { language: string; relevance: number } }
    highlightAuto(code: string, languageSubset?: string[]): { value: string; language: string; relevance: number; secondBest?: { language: string; relevance: number } }
    getLanguage(name: string): { name: string; aliases?: string[]; keywords?: unknown; contains?: unknown[] } | undefined
    registerLanguage(name: string, language: unknown): void
    listLanguages(): string[]
  }
  const hljs: HLJSApi
  export default hljs
  export { hljs }
}

// ============================================================================
// MCP Skills module
// ============================================================================
declare module '*/skills/mcpSkills.js' {
  export interface MCPSkill {
    id: string
    name: string
    serverName: string
    toolName: string
  }
  export interface MCPClient {
    name: string
    [key: string]: unknown
  }

  interface FetchMcpSkillsForClient {
    (_client: MCPClient): Promise<MCPSkill[]>
    cache: Map<string, unknown>
  }

  export function loadMCPSkills(): Promise<MCPSkill[]>
  export function getMCPSkill(_id: string): MCPSkill | undefined
  export const fetchMcpSkillsForClient: FetchMcpSkillsForClient
}

// ============================================================================
// Anthropic Sandbox Runtime types
// ============================================================================
declare module '@anthropic-ai/sandbox-runtime' {
  export interface FsReadRestrictionConfig {
    allow?: string[]
    deny?: string[]
    denyOnly?: string[]
    allowWithinDeny?: string[]
    [key: string]: unknown
  }
  export interface FsWriteRestrictionConfig {
    allow?: string[]
    deny?: string[]
    allowOnly?: string[]
    denyWithinAllow?: string[]
    [key: string]: unknown
  }
  export interface IgnoreViolationsConfig {
    patterns?: string[]
    [key: string]: unknown
  }
  export interface NetworkHostPattern {
    host: string
    port?: number
  }
  export interface NetworkRestrictionConfig {
    allow?: NetworkHostPattern[]
    deny?: NetworkHostPattern[]
    allowedHosts?: NetworkHostPattern[]
    deniedHosts?: NetworkHostPattern[]
    [key: string]: unknown
  }
  export type SandboxAskCallback = (question: NetworkHostPattern | string) => Promise<boolean>
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
