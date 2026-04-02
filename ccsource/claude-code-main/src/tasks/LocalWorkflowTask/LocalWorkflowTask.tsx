export { LocalWorkflowTask } from '../LocalAgentTask/LocalAgentTask'

import type { TaskStateBase } from '../../Tool.js'

export type LocalWorkflowTaskState = TaskStateBase & {
  status: 'pending' | 'running' | 'complete' | 'error'
  progress?: number
}

export function killWorkflowTask(_taskId: string, _setAppState?: unknown): void {
  throw new Error('killWorkflowTask not implemented in stub')
}

export function skipWorkflowAgent(_workflowId: string, _agentId: string, _setAppState?: unknown): void {
  throw new Error('skipWorkflowAgent not implemented in stub')
}

export function retryWorkflowAgent(_workflowId: string, _agentId: string, _setAppState?: unknown): void {
  throw new Error('retryWorkflowAgent not implemented in stub')
}
