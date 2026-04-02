// Cached Microcompact stub

export interface CachedMCState {
  enabled: boolean
  modelSupported: boolean
}

export interface CacheEditsBlock {
  type: 'cache_edits'
  edits: unknown[]
}

export interface PinnedCacheEdits {
  pinned: CacheEditsBlock[]
}

export function isCachedMicrocompactEnabled(): boolean {
  return false
}

export function isModelSupportedForCacheEditing(_model: string): boolean {
  return false
}

export function getCachedMCConfig(): null {
  return null
}

export function createCachedMCState(): CachedMCState {
  return { enabled: false, modelSupported: false }
}

export function markToolsSentToAPI(): void {}
export function resetCachedMCState(): void {}
export function registerToolResult(): void {}
export function registerToolMessage(): void {}
export function getToolResultsToDelete(): [] { return [] }
export function createCacheEditsBlock(): CacheEditsBlock | null {
  return null
}
