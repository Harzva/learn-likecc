// Auto-generated stub
import type { SDKMessage } from '../remote/sdkMessageAdapter.js'

export interface SSHPermissionRequestMessage {
  tool_name: string
  tool_use_id: string
  description?: string
  input?: unknown
  permission_suggestions?: string[]
  blocked_path?: string
}

export interface SSHSessionManagerOptions {
  onMessage: (msg: SDKMessage) => void
  onPermissionRequest: (request: SSHPermissionRequestMessage, requestId: string) => void
  onConnected?: () => void
}

export class SSHSession {
  proc?: { pid: number; exitCode?: number; signalCode?: string }
  proxy?: { port: number }

  static createManager(_options: SSHSessionManagerOptions): SSHSessionManager {
    return new SSHSessionManager()
  }

  getStderrTail(): string {
    return ''
  }
}

export class SSHSessionManager {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  isConnected(): boolean { return false }
  async sendMessage(_msg: unknown): Promise<boolean> { return false }
  sendInterrupt(): void {}
  respondToPermissionRequest(_requestId: string, _response: { behavior: 'allow' | 'deny'; message?: string; updatedInput?: unknown }): void {}
}

export interface SSHPermissionRequest {
  host: string
  port?: number
  action: 'connect' | 'execute'
}
