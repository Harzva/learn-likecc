/**
 * Fork commands stub - not implemented
 */

export interface ForkCommandOptions {
  sessionId?: string
  branch?: string
}

export async function handleForkCommand(_options: ForkCommandOptions): Promise<void> {
  throw new Error('Fork not implemented in stub')
}