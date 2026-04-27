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
