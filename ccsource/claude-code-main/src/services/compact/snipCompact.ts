/**
 * Snip Compact - Stub 实现
 *
 * 用于裁剪对话历史片段
 * 参考: Claude Code 源码分析
 */

import type { Message, StreamEvent, RequestStartEvent } from '../../types/message.js'

export interface SnipCompactOptions {
  messages: Message[]
  keepRecent?: number
  targetTokens?: number
}

export interface SnipCompactResult {
  snipped: Message[]
  remaining: Message[]
  tokensSaved: number
}

/**
 * 裁剪对话历史
 *
 * 将过长的对话历史裁剪，保留关键信息
 */
export async function snipCompact(
  options: SnipCompactOptions
): Promise<SnipCompactResult> {
  // Stub 实现 - 实际功能需要完整实现
  throw new Error('snipCompact not implemented in stub')
}

/**
 * 计算裁剪策略
 */
export function calculateSnipStrategy(
  messages: Message[],
  targetTokens: number
): { snipIndices: number[]; estimatedSaving: number } {
  // Stub 实现
  return {
    snipIndices: [],
    estimatedSaving: 0,
  }
}

/**
 * 检查是否需要 snip compact
 * 同步版本 - 返回结果对象而非 Promise
 */
export function snipCompactIfNeeded(
  messages: Message[],
  targetTokens?: number,
  options?: { force?: boolean }
): SnipCompactResultExtended {
  // Stub 实现 - 返回默认结果，不做任何裁剪
  return {
    snipped: [],
    remaining: messages,
    tokensSaved: 0,
    messages: messages,
    tokensFreed: 0,
  }
}

/**
 * 异步版本 - 兼容旧调用
 */
export async function snipCompactIfNeededAsync(
  messages: Message[],
  targetTokens: number,
  options?: { force?: boolean }
): Promise<SnipCompactResultExtended> {
  return snipCompactIfNeeded(messages, targetTokens, options)
}

/**
 * 执行 snip compact 操作
 */
export async function performSnipCompact(
  messages: Message[],
  targetTokens: number,
  options?: { keepRecent?: number }
): Promise<SnipCompactResultExtended> {
  // Stub 实现 - 返回默认结果
  return {
    snipped: [],
    remaining: messages,
    tokensSaved: 0,
    messages: messages,
    tokensFreed: 0,
  }
}

/**
 * 检查是否为 snip marker 消息
 */
export function isSnipMarkerMessage(message: Message): boolean {
  // Stub 实现
  return false
}

/**
 * Snip compact 结果扩展
 */
export interface SnipCompactResultExtended extends SnipCompactResult {
  messages?: Message[]
  tokensFreed?: number
  boundaryMessage?: Message | StreamEvent | RequestStartEvent
}

/**
 * 创建 snip 边界消息
 */
export function createSnipBoundaryMessage(): Message {
  return { type: 'system', uuid: '', message: { content: 'snip_boundary' } }
}

/**
 * 检查是否启用 snip runtime
 */
export function isSnipRuntimeEnabled(): boolean {
  return false
}

/**
 * SNIP 提示文本
 */
export const SNIP_NUDGE_TEXT = '[Some older context has been snipped]'

/**
 * 项目 snip 视图
 */
export function projectSnipView(_messages: Message[], _options?: unknown): { snipped: Message[]; remaining: Message[] } {
  return { snipped: [], remaining: _messages }
}