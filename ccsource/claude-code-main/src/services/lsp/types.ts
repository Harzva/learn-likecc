/**
 * LSP types stub - not implemented
 */

export interface LSPServer {
  name: string
  command: string
  args: string[]
}

export interface LSPClient {
  id: string
  server: LSPServer
  status: 'starting' | 'running' | 'stopped'
}

export interface LSPCompletion {
  label: string
  kind: number
  detail?: string
}

export interface LSPDiagnostic {
  range: {
    start: { line: number; character: number }
    end: { line: number; character: number }
  }
  severity: number
  message: string
}

// LspServerState can be a string status or an object with status
export type LspServerState = 'starting' | 'running' | 'stopped' | 'error' | 'not_initialized' | {
  status: 'starting' | 'running' | 'stopped' | 'error' | 'not_initialized'
  pid?: number
  error?: string
}

export interface ScopedLspServerConfig {
  scope: 'local' | 'user' | 'project'
  config: Record<string, unknown>
  restartOnCrash?: boolean
  shutdownTimeout?: number
  startupTimeout?: number
  maxRestarts?: number
  command?: string
  args?: string[]
  env?: Record<string, string>
  workspaceFolder?: string
  initializationOptions?: Record<string, unknown>
}
