/**
 * WorkflowTool constants stub - not implemented
 */

export const WORKFLOW_TOOL_NAME = 'Workflow'

export const WORKFLOW_ACTIONS = {
  CREATE: 'create',
  LIST: 'list',
  EXECUTE: 'execute',
  DELETE: 'delete',
} as const

export const WORKFLOW_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const
