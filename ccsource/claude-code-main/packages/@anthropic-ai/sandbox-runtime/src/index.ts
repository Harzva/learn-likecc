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

  static reset(): void {}
  static getFsReadConfig(): FsReadRestrictionConfig | null { return null }
  static getFsWriteConfig(): FsWriteRestrictionConfig | null { return null }
  static getNetworkRestrictionConfig(): NetworkRestrictionConfig | null { return null }
  static getIgnoreViolations(): IgnoreViolationsConfig | null { return null }
  static getAllowUnixSockets(): boolean { return false }
  static getAllowLocalBinding(): boolean { return false }
  static getEnableWeakerNestedSandbox(): boolean { return false }
  static getProxyPort(): number | null { return null }
  static getSocksProxyPort(): number | null { return null }
  static getLinuxHttpSocketPath(): string | null { return null }
  static getLinuxSocksSocketPath(): string | null { return null }
  static async waitForNetworkInitialization(): Promise<void> {}
  static getSandboxViolationStore(): SandboxViolationStore { return new SandboxViolationStore() }
  static annotateStderrWithSandboxFailures(_command: string, stderr: string): string { return stderr }
  static cleanupAfterCommand(): void {}
  static checkDependencies(_check: { command: string; args?: string[] }): { errors: SandboxDependencyCheck[]; warnings: SandboxDependencyCheck[] } {
    return { errors: [], warnings: [] }
  }
  static isSupportedPlatform(): boolean { return true }
  static async initialize(_config?: SandboxRuntimeConfig, _callback?: SandboxAskCallback): Promise<void> {}
  static updateConfig(_config: SandboxRuntimeConfig): void {}
  static wrapWithSandbox(command: string, _shell?: string, _config?: SandboxRuntimeConfig, _signal?: AbortSignal): string { return command }
}

// Default instance
export const sandboxManager = new SandboxManager()

// Static methods for BaseSandboxManager compatibility
export function getFsReadConfig(): FsReadRestrictionConfig | null { return null }
export function getFsWriteConfig(): FsWriteRestrictionConfig | null { return null }
export function getNetworkRestrictionConfig(): NetworkRestrictionConfig | null { return null }
export function getIgnoreViolations(): IgnoreViolationsConfig | null { return null }
export function getAllowUnixSockets(): boolean { return false }
export function getAllowLocalBinding(): boolean { return false }
export function getEnableWeakerNestedSandbox(): boolean { return false }
export function getProxyPort(): number | null { return null }
export function getSocksProxyPort(): number | null { return null }
export function getLinuxHttpSocketPath(): string | null { return null }
export function getLinuxSocksSocketPath(): string | null { return null }
export async function waitForNetworkInitialization(): Promise<void> {}
export function getSandboxViolationStore(): SandboxViolationStore { return new SandboxViolationStore() }
export function annotateStderrWithSandboxFailures(_command: string, stderr: string): string { return stderr }
export function cleanupAfterCommand(): void {}
export function checkDependencies(_check: { command: string; args?: string[] }): { errors: SandboxDependencyCheck[]; warnings: SandboxDependencyCheck[] } {
  return { errors: [], warnings: [] }
}
export function isSupportedPlatform(): boolean { return true }
export function wrapWithSandbox(command: string, _shell?: string, _config?: SandboxRuntimeConfig, _signal?: AbortSignal): string { return command }
export async function initialize(_config?: SandboxRuntimeConfig, _callback?: SandboxAskCallback): Promise<void> {}
export function updateConfig(_config: SandboxRuntimeConfig): void {}
export async function reset(): Promise<void> {}
