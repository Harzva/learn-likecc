/**
 * Worker agent coordinator stub - not implemented
 */

export interface WorkerAgent {
  id: string
  status: 'idle' | 'running' | 'stopped'
}

export function createWorkerAgent(): WorkerAgent {
  throw new Error('Worker agent not implemented in stub')
}

export function startWorkerAgent(_agent: WorkerAgent): void {
  throw new Error('Worker agent not implemented in stub')
}

export function stopWorkerAgent(_agent: WorkerAgent): void {
  throw new Error('Worker agent not implemented in stub')
}
