/**
 * @anthropic-ai/sandbox-runtime stub - not implemented
 * This is an internal Anthropic package for sandbox execution
 */

import { z } from 'zod'

// Network types
export interface NetworkHostPattern {
  host: string
  port?: number
}

export interface NetworkRestrictionConfig {
  allow?: NetworkHostPattern[]
  deny?: NetworkHostPattern[]
}

// Filesystem types
export interface FsReadRestrictionConfig {
  allow?: string[]
  deny?: string[]
}

export interface FsWriteRestrictionConfig {
  allow?: string[]
  deny?: string[]
}

export interface IgnoreViolationsConfig {
  tools?: string[]
  patterns?: string[]
}

export interface SandboxViolationEvent {
  timestamp: number
  type: 'read' | 'write' | 'network' | 'execute'
  resource: string
  message: string
}

export type SandboxAskCallback = (question: NetworkHostPattern | string) => Promise<boolean>

export interface SandboxDependencyCheck {
  name: string
  version?: string
  required?: boolean
}

export const SandboxRuntimeConfigSchema = z.object({
  timeout: z.number().optional(),
  memory: z.number().optional(),
  env: z.record(z.string()).optional(),
  network: z.custom<NetworkRestrictionConfig>().optional(),
  fsRead: z.custom<FsReadRestrictionConfig>().optional(),
  fsWrite: z.custom<FsWriteRestrictionConfig>().optional(),
  ignoreViolations: z.custom<IgnoreViolationsConfig>().optional(),
})

export type SandboxRuntimeConfig = z.infer<typeof SandboxRuntimeConfigSchema>
export type SandboxConfig = SandboxRuntimeConfig

export interface SandboxResult {
  stdout: string
  stderr: string
  exitCode: number
}

export async function createSandbox(_config?: SandboxConfig): Promise<string> {
  throw new Error('Sandbox runtime not implemented in stub')
}

export async function runInSandbox(
  _id: string,
  _command: string,
  _args?: string[]
): Promise<SandboxResult> {
  throw new Error('Sandbox runtime not implemented in stub')
}

export async function destroySandbox(_id: string): Promise<void> {
  throw new Error('Sandbox runtime not implemented in stub')
}

export const sandboxRuntime = {
  create: createSandbox,
  run: runInSandbox,
  destroy: destroySandbox,
}

// Additional exports for compatibility
export class SandboxViolationStore {
  private violations: SandboxViolationEvent[] = []

  addViolation(event: SandboxViolationEvent): void
  addViolation(message: string): void
  addViolation(eventOrMessage: SandboxViolationEvent | string): void {
    if (typeof eventOrMessage === 'string') {
      this.violations.push({
        timestamp: Date.now(),
        type: 'execute',
        resource: '',
        message: eventOrMessage,
      })
    } else {
      this.violations.push(eventOrMessage)
    }
  }

  getViolations(): SandboxViolationEvent[] {
    return [...this.violations]
  }

  clear(): void {
    this.violations = []
  }
}

export const SANDBOX_DEFAULT_TIMEOUT = 60000
export const SANDBOX_DEFAULT_MEMORY = 512 * 1024 * 1024

// SandboxManager class
export class SandboxManager {
  private sandboxes: Map<string, SandboxConfig> = new Map()
  private config: SandboxRuntimeConfig
  private askCallback?: SandboxAskCallback

  constructor(config?: SandboxRuntimeConfig) {
    this.config = config || {}
  }

  setAskCallback(callback: SandboxAskCallback): void {
    this.askCallback = callback
  }

  async create(config?: SandboxConfig): Promise<string> {
    const id = `sandbox-${Date.now()}`
    this.sandboxes.set(id, config || {})
    return id
  }

  async run(id: string, command: string, args?: string[]): Promise<SandboxResult> {
    if (!this.sandboxes.has(id)) {
      throw new Error(`Sandbox ${id} not found`)
    }
    throw new Error('SandboxManager.run not implemented in stub')
  }

  async destroy(id: string): Promise<void> {
    this.sandboxes.delete(id)
  }

  list(): string[] {
    return Array.from(this.sandboxes.keys())
  }

  getConfig(): SandboxRuntimeConfig {
    return this.config
  }
}

// Default instance
export const sandboxManager = new SandboxManager()
