/**
 * Bun Global Object Polyfill
 *
 * Bun 运行时特有 API 的 polyfill 实现
 * 用于在 Node.js 环境下学习和分析源码
 */

// ============================================================================
// Bun.hash - 快速哈希
// ============================================================================

/**
 * Bun.hash polyfill - 使用 Node.js crypto 实现
 * 注意: 原版 Bun.hash 使用 wyhash，这里用 SHA256 近似
 */
function hash(input: string | Buffer | ArrayBuffer): number | bigint {
  const crypto = require('crypto')
  if (typeof input === 'string') {
    const hash = crypto.createHash('sha256').update(input).digest()
    return hash.readUInt32LE(0)
  }
  if (Buffer.isBuffer(input)) {
    const hash = crypto.createHash('sha256').update(input).digest()
    return hash.readUInt32LE(0)
  }
  if (input instanceof ArrayBuffer) {
    const hash = crypto.createHash('sha256').update(Buffer.from(input)).digest()
    return hash.readUInt32LE(0)
  }
  return 0
}

// ============================================================================
// Bun.which - 查找可执行文件
// ============================================================================

/**
 * Bun.which polyfill - 使用 which 包实现
 */
function which(command: string): string | null {
  try {
    const { which: whichSync } = require('which')
    return whichSync.sync(command) || null
  } catch {
    return null
  }
}

// ============================================================================
// Bun.stringWidth - 字符串显示宽度
// ============================================================================

/**
 * Bun.stringWidth polyfill - 使用 string-width 包实现
 */
function stringWidth(str: string): number {
  try {
    const { stringWidth: sw } = require('string-width')
    return sw(str)
  } catch {
    // Fallback: 简单计算
    return str.replace(/\x1b\[[0-9;]*m/g, '').length
  }
}

// ============================================================================
// Bun.wrapAnsi - ANSI 换行包装
// ============================================================================

/**
 * Bun.wrapAnsi polyfill - 使用 wrap-ansi 包实现
 */
function wrapAnsi(str: string, width: number, options?: { hard?: boolean; trim?: boolean }): string {
  try {
    const { default: wrapAnsiFn } = require('wrap-ansi')
    return wrapAnsiFn(str, width, options)
  } catch {
    // Fallback: 简单换行
    return str
  }
}

// ============================================================================
// Bun.YAML - YAML 解析
// ============================================================================

const YAML = {
  parse: (input: string): unknown => {
    try {
      const { parse } = require('yaml')
      return parse(input)
    } catch {
      throw new Error('YAML parsing failed. Install "yaml" package.')
    }
  },
  stringify: (input: unknown): string => {
    try {
      const { stringify } = require('yaml')
      return stringify(input)
    } catch {
      throw new Error('YAML stringify failed. Install "yaml" package.')
    }
  }
}

// ============================================================================
// Bun.semver - 版本比较
// ============================================================================

const semver = {
  order: (a: string, b: string): -1 | 0 | 1 => {
    try {
      const semverLib = require('semver')
      const cmp = semverLib.compare(a, b)
      return cmp as -1 | 0 | 1
    } catch {
      // Fallback: 简单字符串比较
      return a < b ? -1 : a > b ? 1 : 0
    }
  },
  satisfies: (version: string, range: string): boolean => {
    try {
      const semverLib = require('semver')
      return semverLib.satisfies(version, range)
    } catch {
      return false
    }
  }
}

// ============================================================================
// Bun.spawn - 进程生成
// ============================================================================

interface SpawnOptions {
  cwd?: string
  env?: Record<string, string>
  stdin?: 'inherit' | 'pipe' | 'ignore'
  stdout?: 'inherit' | 'pipe' | 'ignore'
  stderr?: 'inherit' | 'pipe' | 'ignore'
}

function spawn(command: string[], options?: SpawnOptions): {
  pid: number
  stdin: NodeJS.WritableStream | null
  stdout: NodeJS.ReadableStream | null
  stderr: NodeJS.ReadableStream | null
  exited: Promise<number>
} {
  const { spawn: nodeSpawn } = require('child_process')
  const proc = nodeSpawn(command[0], command.slice(1), {
    cwd: options?.cwd,
    env: options?.env || process.env,
    stdio: [
      options?.stdin || 'inherit',
      options?.stdout || 'inherit',
      options?.stderr || 'inherit'
    ]
  })

  const exited = new Promise<number>((resolve) => {
    proc.on('close', (code: number) => resolve(code))
  })

  return {
    pid: proc.pid,
    stdin: proc.stdin,
    stdout: proc.stdout,
    stderr: proc.stderr,
    exited
  }
}

// ============================================================================
// Bun.gc - 垃圾回收
// ============================================================================

function gc(): void {
  if (global.gc) {
    global.gc()
  }
}

// ============================================================================
// Bun.listen - 网络监听
// ============================================================================

interface ListenOptions {
  hostname?: string
  port: number
  socket?: {
    data?: (socket: unknown, data: Buffer) => void
    error?: (socket: unknown, error: Error) => void
    close?: (socket: unknown) => void
  }
}

function listen<T = unknown>(options: ListenOptions): {
  port: number
  hostname: string
  stop: () => void
} {
  const net = require('net')
  const server = net.createServer((socket: unknown) => {
    // Socket handling
  })

  server.listen(options.port, options.hostname || '0.0.0.0')

  return {
    port: options.port,
    hostname: options.hostname || '0.0.0.0',
    stop: () => server.close()
  }
}

// ============================================================================
// Bun.embeddedFiles - 嵌入文件 (编译时)
// ============================================================================

const embeddedFiles: unknown[] = []

// ============================================================================
// 导出 Bun 对象
// ============================================================================

const Bun = {
  hash,
  which,
  stringWidth,
  wrapAnsi,
  YAML,
  semver,
  spawn,
  gc,
  listen,
  embeddedFiles,
  // 版本信息
  version: '1.0.0-polyfill',
  revision: 'polyfill'
}

// 全局注入
if (typeof globalThis.Bun === 'undefined') {
  (globalThis as Record<string, unknown>).Bun = Bun
}

export default Bun
export {
  hash,
  which,
  stringWidth,
  wrapAnsi,
  YAML,
  semver,
  spawn,
  gc,
  listen,
  embeddedFiles
}
