/**
 * Message Types - 重建的类型定义
 *
 * 这些类型定义基于源码 import 分析重建
 * 原文件缺失，此为学习用途的近似定义
 */

import type { UUID } from 'crypto'
import type {
  ContentBlockParam,
  ToolUseBlock,
  ToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/index.mjs'
import type { AgentId } from './ids.js'

// ============================================================================
// Base Message Types
// ============================================================================

export type MessageRole =
  | 'user'
  | 'assistant'
  | 'system'
  | 'progress'
  | 'attachment'
  | 'tool_use_summary'
  | 'tombstone'
  | 'system_local_command'

export interface BaseMessage {
  id: UUID
  role: MessageRole
  timestamp: number
  sessionId?: string
}

// ============================================================================
// User Message
// ============================================================================

export interface UserMessage extends BaseMessage {
  role: 'user'
  content: string | ContentBlockParam[]
  attachments?: Attachment[]
}

export interface Attachment {
  type: 'image' | 'file' | 'pdf'
  name: string
  path?: string
  data?: string // base64
  mimeType: string
}

// ============================================================================
// Assistant Message
// ============================================================================

export interface AssistantMessage extends BaseMessage {
  role: 'assistant'
  content: string | ContentBlockParam[]
  toolCalls?: ToolCall[]
  thinking?: ThinkingBlock[]
  usage?: MessageUsage
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ThinkingBlock {
  type: 'thinking'
  thinking: string
}

export interface MessageUsage {
  inputTokens: number
  outputTokens: number
  cacheCreationInputTokens?: number
  cacheReadInputTokens?: number
}

// ============================================================================
// System Message
// ============================================================================

export interface SystemMessage extends BaseMessage {
  role: 'system'
  content: string
  type?: 'init' | 'compact' | 'boundary'
}

// ============================================================================
// Progress Message
// ============================================================================

export interface ProgressMessage extends BaseMessage {
  role: 'progress'
  toolUseId: string
  toolName: string
  status: 'pending' | 'running' | 'complete' | 'error'
  progress?: number
  message?: string
}

// ============================================================================
// Attachment Message
// ============================================================================

export interface AttachmentMessage extends BaseMessage {
  role: 'attachment'
  attachments: Attachment[]
  caption?: string
}

// ============================================================================
// Tool Use Summary Message
// ============================================================================

export interface ToolUseSummaryMessage extends BaseMessage {
  role: 'tool_use_summary'
  toolUseId: string
  toolName: string
  summary: string
  success: boolean
}

// ============================================================================
// Tombstone Message (deleted/compact boundary)
// ============================================================================

export interface TombstoneMessage extends BaseMessage {
  role: 'tombstone'
  originalRole: MessageRole
  reason: 'compact' | 'delete' | 'snip'
  originalMessageCount: number
}

// ============================================================================
// System Local Command Message
// ============================================================================

export interface SystemLocalCommandMessage extends BaseMessage {
  role: 'system_local_command'
  command: string
  result?: unknown
  error?: string
}

// ============================================================================
// Stream Events
// ============================================================================

export interface StreamEvent {
  type: 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_start' | 'message_delta' | 'message_stop'
  index?: number
  delta?: {
    type: 'text_delta' | 'input_json_delta' | 'thinking_delta'
    text?: string
    partial_json?: string
    thinking?: string
  }
  content_block?: ContentBlockParam
  message?: {
    id: string
    role: 'assistant'
    content: ContentBlockParam[]
    model: string
    usage: MessageUsage
  }
  usage?: {
    output_tokens: number
  }
}

export interface RequestStartEvent {
  type: 'request_start'
  requestId: string
  timestamp: number
}

// ============================================================================
// Union Type
// ============================================================================

export type Message =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | ProgressMessage
  | AttachmentMessage
  | ToolUseSummaryMessage
  | TombstoneMessage
  | SystemLocalCommandMessage
