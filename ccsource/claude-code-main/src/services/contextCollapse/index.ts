/**
 * Context collapse service stub - not implemented
 */

export interface ContextCollapseOptions {
  maxTokens: number
  preserveRecent: number
}

export interface ContextCollapseResult {
  success: boolean
  collapsedSections: string[]
}

export async function contextCollapse(
  _options: ContextCollapseOptions
): Promise<ContextCollapseResult> {
  throw new Error('Context collapse not implemented in stub')
}

/**
 * 检查是否启用 context collapse
 */
export function isContextCollapseEnabled(): boolean {
  return false
}

/**
 * 应用 collapses（如需要）
 */
export async function applyCollapsesIfNeeded(
  _messages: unknown[]
): Promise<unknown[] | null> {
  return null
}

/**
 * 检查 prompt 是否过长
 */
export function isWithheldPromptTooLong(_prompt: unknown): boolean {
  return false
}

/**
 * 从溢出中恢复
 */
export async function recoverFromOverflow(_messages: unknown[]): Promise<unknown[]> {
  return []
}
