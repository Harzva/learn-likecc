/**
 * Buddy commands stub - not implemented
 */

export interface BuddyCommandOptions {
  action: 'start' | 'stop' | 'status'
}

export async function handleBuddyCommand(_options: BuddyCommandOptions): Promise<void> {
  throw new Error('Buddy not implemented in stub')
}