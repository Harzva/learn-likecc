/**
 * Monitor MCP task stub - not implemented
 */

import type { TaskStateBase } from '../../Tool.js'

export interface MonitorMcpTaskOptions {
  serverName: string
  interval?: number
}

export interface MonitorMcpTaskResult {
  success: boolean
  metrics?: Record<string, unknown>
}

export type MonitorMcpTaskState = TaskStateBase & {
  status: 'pending' | 'running' | 'complete' | 'error'
  serverName: string
}

export async function runMonitorMcpTask(
  _options: MonitorMcpTaskOptions
): Promise<MonitorMcpTaskResult> {
  throw new Error('Monitor MCP task not implemented in stub')
}

export function killMonitorMcp(_taskId: string, _setAppState?: unknown): void {
  throw new Error('killMonitorMcp not implemented in stub')
}
