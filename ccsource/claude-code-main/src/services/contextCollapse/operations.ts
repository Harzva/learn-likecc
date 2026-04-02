/**
 * Context collapse operations stub - not implemented
 */

import type { Message } from '../../types/message.js'

export interface CollapseOperation {
  type: 'summarize' | 'remove' | 'compress'
  target: string
}

export function createCollapseOperation(
  _type: CollapseOperation['type'],
  _target: string
): CollapseOperation {
  return { type: _type, target: _target }
}

export async function executeCollapseOperation(
  _op: CollapseOperation
): Promise<void> {
  throw new Error('Collapse operation not implemented in stub')
}

export function projectView(
  _messages: Message[]
): {
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
