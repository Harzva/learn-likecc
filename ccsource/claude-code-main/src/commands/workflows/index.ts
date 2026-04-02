/**
 * Workflows commands stub - not implemented
 */

export interface WorkflowCommandOptions {
  name?: string
  template?: string
}

export async function createWorkflow(_options: WorkflowCommandOptions): Promise<void> {
  throw new Error('Workflows not implemented in stub')
}

export async function listWorkflows(): Promise<string[]> {
  return []
}

export default {
  createWorkflow,
  listWorkflows,
}