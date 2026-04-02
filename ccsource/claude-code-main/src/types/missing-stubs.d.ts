/**
 * Missing stubs - ambient module declarations for missing exports
 */

// SSH types
declare module '*/ssh/SSHSessionManager.js' {
  export class SSHSessionManager {
    connect(): Promise<void>
    disconnect(): Promise<void>
    isConnected(): boolean
  }
  export interface SSHPermissionRequest {
    host: string
    port?: number
    action: 'connect' | 'execute'
  }
}

// Ink event types
declare module '*/ink/events/paste-event.js' {
  export interface PasteEvent {
    data: string
    target: EventTarget | null
  }
}

declare module '*/ink/events/resize-event.js' {
  export interface ResizeEvent {
    columns: number
    rows: number
  }
}

// Ink cursor
declare module '*/ink/cursor.js' {
  export interface Cursor {
    x: number
    y: number
    hidden: boolean
  }
}

// Query transitions
declare module '*/query/transitions.js' {
  export type Terminal = 'bash' | 'zsh' | 'fish' | 'sh'
  export type Continue = 'auto' | 'manual' | 'skip'
}

// LSP types
declare module '*/services/lsp/types.js' {
  export interface LspServerState {
    status: 'starting' | 'running' | 'stopped' | 'error'
    pid?: number
    error?: string
  }
  export interface ScopedLspServerConfig {
    scope: 'local' | 'user' | 'project'
    config: Record<string, unknown>
  }
}

// OAuth additional types
declare module '*/services/oauth/types.js' {
  export interface OAuthTokenExchangeResponse {
    access_token: string
    refresh_token?: string
    expires_in?: number
    token_type: string
  }
  export type RateLimitTier = 'free' | 'standard' | 'premium' | 'enterprise'
  export interface UserRolesResponse {
    roles: string[]
    permissions: string[]
  }
}

// Tips types
declare module '*/services/tips/types.js' {
  export interface Tip {
    id: string
    title: string
    content: string
    category: string
  }
  export interface TipRegistry {
    tips: Tip[]
    lastUpdated: number
  }
}

// Secure storage types
declare module '*/utils/secureStorage/types.js' {
  export interface SecureStorage {
    get(key: string): Promise<string | undefined>
    set(key: string, value: string): Promise<void>
    delete(key: string): Promise<void>
  }
}

// LocalAgentTask export alias
declare module '*/tasks/LocalAgentTask/LocalAgentTask.js' {
  export { LocalAgentTask as LocalWorkflowTask } from './LocalAgentTask'
  export * from './LocalAgentTask'
}

// Beta Web Search Tool types
declare module '@anthropic-ai/sdk/resources/beta/messages/messages.mjs' {
  export interface BetaWebSearchTool20250305 {
    type: 'web_search_20250305' | 'web_search_tool_20250305'
    name?: string
    allowed_domains?: string[]
    blocked_domains?: string[]
    max_uses?: number
  }
}
