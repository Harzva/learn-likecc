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
}

export async function reactiveCompact(
  _options: ReactiveCompactOptions
): Promise<ReactiveCompactResult> {
  throw new Error('Reactive compact not implemented in stub')
}
