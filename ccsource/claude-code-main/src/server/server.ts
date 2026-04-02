export interface ServerConfig {
  port?: number
  host?: string
  idleTimeoutMs?: number
  maxSessions?: number
  unix?: string
}

export interface ServerInstance {
  port?: number
  stop(graceful?: boolean): void
}

export interface Logger {
  log(message: string): void
  error(message: string): void
}

export function startServer(
  _config: ServerConfig,
  _sessionManager: unknown,
  _logger: Logger
): ServerInstance {
  return {
    port: _config.port,
    stop: () => {},
  }
}

export function createServerLogger(): Logger {
  return {
    log: (msg: string) => console.log(msg),
    error: (msg: string) => console.error(msg),
  }
}
