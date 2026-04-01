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
