export interface SessionManagerConfig {
  idleTimeoutMs?: number
  maxSessions?: number
}

export class SessionManager {
  constructor(_backend: unknown, _config?: SessionManagerConfig) {}
  async destroyAll(): Promise<void> {}
}
