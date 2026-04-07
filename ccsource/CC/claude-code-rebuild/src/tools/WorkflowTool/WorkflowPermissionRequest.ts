/**
 * WorkflowPermissionRequest stub - not implemented
 */

export interface WorkflowPermissionRequest {
  workflowId: string
  action: string
  required: boolean
}

export function createWorkflowPermissionRequest(
  _workflowId: string,
  _action: string
): WorkflowPermissionRequest {
  throw new Error('WorkflowPermissionRequest not implemented in stub')
}
