/**
 * Create workflow command stub - not implemented
 */

export interface CreateWorkflowCommandOptions {
  name: string
  template?: string
}

export async function createWorkflowCommand(_options: CreateWorkflowCommandOptions): Promise<void> {
  throw new Error('Create workflow not implemented in stub')
}