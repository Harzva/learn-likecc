/**
 * SSH session creation stub - not implemented
 */

export interface SSHSessionOptions {
  host: string
  port?: number
  username?: string
  cwd?: string
  localVersion?: string
  permissionMode?: string
  dangerouslySkipPermissions?: boolean
  extraCliArgs?: string[]
}

export interface SSHSessionProgressOptions {
  onProgress?: (msg: string) => void
}

import type { SSHSessionManager, SSHSessionManagerOptions } from './SSHSessionManager.js'

export interface SSHSession {
  id: string
  connected: boolean
  createManager: (options: SSHSessionManagerOptions) => SSHSessionManager
  getStderrTail: () => string
  proc?: { pid?: number; exitCode?: number; signalCode?: string; kill?: () => void }
  proxy?: { close?: () => void; stop?: () => void }
}

import { SSHSessionManager } from './SSHSessionManager.js'

export async function createSSHSession(_options: SSHSessionOptions, _progress?: SSHSessionProgressOptions): Promise<SSHSession> {
  return {
    id: 'stub-session',
    connected: false,
    createManager: () => new SSHSessionManager(),
    getStderrTail: () => '',
  }
}

export function createLocalSSHSession(_options: unknown): Promise<SSHSession> {
  throw new Error('Local SSH session not implemented in stub')
}

export class SSHSessionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SSHSessionError'
  }
}
