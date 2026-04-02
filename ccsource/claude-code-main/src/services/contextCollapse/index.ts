/**
 * Context collapse service stub - not implemented
 */

import type { Message } from '../../types/message.js'

export interface ContextCollapseOptions {
  maxTokens: number
  preserveRecent: number
}

export interface ContextCollapseResult {
  success: boolean
  collapsedSections: string[]
  messages: Message[]
}

export interface OverflowRecoveryResult {
  messages: Message[]
  committed: number
}

export async function contextCollapse(
  _options: ContextCollapseOptions
): Promise<ContextCollapseResult> {
  throw new Error('Context collapse not implemented in stub')
}

/**
 * 检查是否启用 context collapse
 */
export function isContextCollapseEnabled(): boolean {
  return false
}

/**
 * 应用 collapses（如需要）
 */
export async function applyCollapsesIfNeeded(
  messages: Message[],
  _toolUseContext?: unknown,
  _querySource?: unknown
): Promise<ContextCollapseResult> {
  return {
    success: false,
    collapsedSections: [],
    messages: messages,
  }
}

/**
 * 检查 prompt 是否过长
 */
export function isWithheldPromptTooLong(_prompt: Message, _isTooLong?: unknown, _querySource?: unknown): boolean {
  return false
}

/**
 * 从溢出中恢复
 */
export function recoverFromOverflow(
  messages: Message[],
  _querySource?: unknown
): OverflowRecoveryResult {
  return { messages, committed: 0 }
}

/**
 * 获取统计信息
 */
export function getStats(): {
  totalCollapsed: number
  tokensSaved: number
  health: {
    totalSpawns: number
    totalErrors: number
    lastError?: string
    emptySpawnWarningEmitted: boolean
    totalEmptySpawns: number
  }
  collapsedSpans: unknown[]
  collapsedMessages: Message[]
  stagedSpans: unknown[]
} {
  return {
    totalCollapsed: 0,
    tokensSaved: 0,
    health: {
      totalSpawns: 0,
      totalErrors: 0,
      emptySpawnWarningEmitted: false,
      totalEmptySpawns: 0,
    },
    collapsedSpans: [],
    collapsedMessages: [],
    stagedSpans: [],
  }
}

/**
 * 订阅状态变化
 */
export function subscribe(_callback: () => void): () => void {
  return () => {}
}

/**
 * 重置 context collapse
 */
export function resetContextCollapse(): void {}
