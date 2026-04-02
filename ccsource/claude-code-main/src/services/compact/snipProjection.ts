/**
 * Snip Projection - Stub 实现
 *
 * 用于投影/摘要对话内容
 * 参考: Claude Code 源码分析
 */

export interface SnipProjectionOptions {
  content: unknown
  targetTokens?: number
  preserveKeyInfo?: boolean
}

export interface SnipProjectionResult {
  projected: string
  originalTokens: number
  projectedTokens: number
  compressionRatio: number
}

/**
 * 投影对话内容
 *
 * 将对话内容压缩为更紧凑的形式
 */
export async function snipProjection(
  options: SnipProjectionOptions
): Promise<SnipProjectionResult> {
  // Stub 实现 - 实际功能需要完整实现
  throw new Error('snipProjection not implemented in stub')
}

/**
 * 提取关键信息
 */
export function extractKeyInformation(
  content: unknown
): { topics: string[]; entities: string[]; actions: string[] } {
  // Stub 实现
  return {
    topics: [],
    entities: [],
    actions: [],
  }
}

/**
 * 生成摘要
 */
export function generateSummary(
  content: unknown,
  maxLength: number
): string {
  // Stub 实现
  return '(summary not implemented)'
}

/**
 * 检查是否为 snip 边界消息
 */
export function isSnipBoundaryMessage(message: unknown): boolean {
  // Stub 实现
  return false
}

/**
 * 投影 snipped 视图
 */
export function projectSnippedView(
  _messages: unknown[],
  _options?: unknown
): { projected: unknown[]; snippedCount: number } {
  return {
    projected: [],
    snippedCount: 0,
  }
}