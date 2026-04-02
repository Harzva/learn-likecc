/**
 * Tool Progress Types - 重建的类型定义
 *
 * 这些类型定义基于源码 import 分析重建
 * 原文件缺失，此为学习用途的近似定义
 */

import type { UUID } from 'crypto'
import type { AgentId } from './ids.js'

// ============================================================================
// Base Tool Progress
// ============================================================================

export interface ToolProgressData {
  toolUseId: string
  toolName: string
  startTime: number
  endTime?: number
  status: 'pending' | 'running' | 'complete' | 'error'
  output?: unknown
  error?: string
}

// ============================================================================
// Bash Tool Progress
// ============================================================================

export interface BashProgress extends ToolProgressData {
  toolName: 'Bash'
  command: string
  cwd: string
  exitCode?: number
  stdout?: string
  stderr?: string
  pid?: number
  isBackground?: boolean
  timeout?: number
}

// ============================================================================
// Agent Tool Progress
// ============================================================================

export interface AgentToolProgress extends ToolProgressData {
  toolName: 'Agent'
  agentId: AgentId
  agentType: string
  agentName: string
  taskDescription: string
  subAgentStatus?: 'spawning' | 'running' | 'complete' | 'error'
  outputMessages?: unknown[]
  message?: unknown
  prompt?: string
}

// ============================================================================
// MCP Tool Progress
// ============================================================================

export interface MCPProgress extends ToolProgressData {
  toolName: string // MCP tool names are dynamic
  serverName: string
  toolInput: Record<string, unknown>
  isServerProgress?: boolean
  progressToken?: string | number
  progress?: number
  total?: number
}

// ============================================================================
// Skill Tool Progress
// ============================================================================

export interface SkillToolProgress extends ToolProgressData {
  toolName: 'Skill'
  skillName: string
  skillPath: string
  phase?: 'loading' | 'executing' | 'complete'
}

// ============================================================================
// REPL Tool Progress
// ============================================================================

export interface REPLToolProgress extends ToolProgressData {
  toolName: 'REPL'
  mode: 'read' | 'eval' | 'print' | 'loop'
  input?: string
  output?: string
}

// ============================================================================
// Task Output Progress
// ============================================================================

export interface TaskOutputProgress extends ToolProgressData {
  toolName: 'TaskOutput'
  taskId: UUID
  outputPath: string
  bytesReceived?: number
  totalBytes?: number
}

// ============================================================================
// Web Search Progress
// ============================================================================

export interface WebSearchProgress extends ToolProgressData {
  toolName: 'WebSearch'
  query: string
  resultsFound?: number
  currentPage?: number
  totalPages?: number
}

// ============================================================================
// Union Type
// ============================================================================

// ============================================================================
// Shell Progress (aliases for BashProgress)
// ============================================================================

export type ShellProgress = BashProgress
export type PowerShellProgress = BashProgress

// ============================================================================
// Union Type
// ============================================================================

export type ToolProgress =
  | ToolProgressData
  | BashProgress
  | AgentToolProgress
  | MCPProgress
  | SkillToolProgress
  | REPLToolProgress
  | TaskOutputProgress
  | WebSearchProgress
  | ShellProgress
  | PowerShellProgress
