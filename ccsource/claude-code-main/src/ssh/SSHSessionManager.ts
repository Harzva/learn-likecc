// Auto-generated stub
export class SSHSessionManager {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  isConnected(): boolean { return false }
}

export interface SSHPermissionRequest {
  host: string
  port?: number
  action: 'connect' | 'execute'
}
