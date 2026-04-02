/**
 * Reactive compact service stub - not implemented
 */

import type { Message, SystemMessage, UserMessage, AttachmentMessage, HookResultMessage } from '../../types/message.js'

export interface ReactiveCompactOptions {
  trigger?: 'size' | 'tokens' | 'manual'
  threshold?: number
  hasAttempted?: boolean
  querySource?: string
  aborted?: boolean
  messages?: Message[]
  cacheSafeParams?: Record<string, unknown>
}

// CompactionResult-like interface for compatibility
export interface ReactiveCompactResult {
  success: boolean
  messagesRemoved: number
  tokensSaved: number
  ok?: boolean
  reason?: string
  result?: {
    messagesRemoved: number
    tokensSaved: number
  }
  // CompactionResult fields for buildPostCompactMessages compatibility
  boundaryMarker?: SystemMessage
  summaryMessages?: UserMessage[]
  attachments?: AttachmentMessage[]
  hookResults?: HookResultMessage[]
  messagesToKeep?: Message[]
}

export async function reactiveCompact(
  _options: ReactiveCompactOptions
): Promise<ReactiveCompactResult> {
  throw new Error('Reactive compact not implemented in stub')
}

/**
 * 检查是否启用 reactive compact
 */
export function isReactiveCompactEnabled(): boolean {
  return false
}

/**
 * 检查是否为 reactive only 模式
 */
export function isReactiveOnlyMode(): boolean {
  return false
}

/**
 * 检查 prompt 是否过长
 */
export function isWithheldPromptTooLong(_prompt: Message): boolean {
  return false
}

/**
 * 当 prompt 过长时执行 reactive compact
 */
export async function reactiveCompactOnPromptTooLong(
  _messages: Message[]
): Promise<ReactiveCompactResult | null> {
  return null
}

/**
 * 检查是否为 media size 错误
 */
export function isWithheldMediaSizeError(_error: Message): boolean {
  return false
}

/**
 * Try reactive compact - wrapper that returns structured result
 */
export async function tryReactiveCompact(
  options?: ReactiveCompactOptions
): Promise<ReactiveCompactResult> {
  try {
    return await reactiveCompact(options || { trigger: 'manual' })
  } catch {
    return {
      success: false,
      messagesRemoved: 0,
      tokensSaved: 0,
      reason: 'Reactive compact failed',
    }
  }
}
