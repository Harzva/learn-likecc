/**
 * Reactive compact service stub - not implemented
 */

export interface ReactiveCompactOptions {
  trigger: 'size' | 'tokens' | 'manual'
  threshold?: number
}

export interface ReactiveCompactResult {
  success: boolean
  messagesRemoved: number
  tokensSaved: number
  ok?: boolean
  reason?: string
  result?: {
    messagesRemoved: number
    tokensSaved: number
  }
}

export async function reactiveCompact(
  _options: ReactiveCompactOptions
): Promise<ReactiveCompactResult> {
  throw new Error('Reactive compact not implemented in stub')
}

/**
 * 检查是否启用 reactive compact
 */
export function isReactiveCompactEnabled(): boolean {
  return false
}

/**
 * 检查是否为 reactive only 模式
 */
export function isReactiveOnlyMode(): boolean {
  return false
}

/**
 * 检查 prompt 是否过长
 */
export function isWithheldPromptTooLong(_prompt: unknown): boolean {
  return false
}

/**
 * 当 prompt 过长时执行 reactive compact
 */
export async function reactiveCompactOnPromptTooLong(
  _messages: unknown[]
): Promise<ReactiveCompactResult | null> {
  return null
}
