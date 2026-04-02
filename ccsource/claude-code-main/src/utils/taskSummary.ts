/**
 * Task Summary utilities - Stub implementation
 */

import type { Message } from '../types/message.js'

export interface TaskSummaryOptions {
  messages: Message[]
  maxTokens?: number
  systemPrompt?: unknown
  userContext?: unknown
  systemContext?: unknown
}

export interface TaskSummaryResult {
  summary: string
  tokensUsed: number
}

/**
 * Check if task summary should be generated
 */
export function shouldGenerateTaskSummary(_messages: Message[], _options?: unknown): boolean {
  return false
}

/**
 * Maybe generate task summary if conditions are met
 */
export async function maybeGenerateTaskSummary(
  _options: TaskSummaryOptions
): Promise<TaskSummaryResult | null> {
  return null
}

/**
 * Generate task summary
 */
export async function generateTaskSummary(
  _messages: Message[]
): Promise<string> {
  throw new Error('Task summary not implemented in stub')
}
