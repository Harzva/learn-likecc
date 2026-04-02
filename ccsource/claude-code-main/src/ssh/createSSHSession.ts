/**
 * SSH session creation stub - not implemented
 */

export interface SSHSessionOptions {
  host: string
  port?: number
  username?: string
}

export interface SSHSession {
  id: string
  connected: boolean
}

export async function createSSHSession(_options: SSHSessionOptions): Promise<SSHSession> {
  throw new Error('SSH session not implemented in stub')
}

export function createLocalSSHSession(_options: unknown): Promise<SSHSession> {
  throw new Error('Local SSH session not implemented in stub')
}

export class SSHSessionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SSHSessionError'
  }
}
