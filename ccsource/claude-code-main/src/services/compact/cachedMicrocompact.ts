// Cached Microcompact stub

export interface CachedMCState {
  enabled: boolean
  modelSupported: boolean
  pinnedEdits: PinnedCacheEdits[]
  registeredTools: Set<string>
  toolOrder: string[]
  deletedRefs: Set<string>
}

export interface CacheEditsBlock {
  type: 'cache_edits'
  edits: unknown[]
}

export interface PinnedCacheEdits {
  userMessageIndex: number
  block: CacheEditsBlock
}

export interface CachedMCConfig {
  triggerThreshold: number
  keepRecent: number
}

export function isCachedMicrocompactEnabled(): boolean {
  return false
}

export function isModelSupportedForCacheEditing(_model: string): boolean {
  return false
}

export function getCachedMCConfig(): CachedMCConfig {
  return { triggerThreshold: 10, keepRecent: 5 }
}

export function createCachedMCState(): CachedMCState {
  return {
    enabled: false,
    modelSupported: false,
    pinnedEdits: [],
    registeredTools: new Set(),
    toolOrder: [],
    deletedRefs: new Set(),
  }
}

export function markToolsSentToAPI(_state: CachedMCState): void {}
export function resetCachedMCState(_state: CachedMCState): void {}
export function registerToolResult(_state: CachedMCState, _toolId: string): void {}
export function registerToolMessage(_state: CachedMCState, _toolIds: string[]): void {}
export function getToolResultsToDelete(_state: CachedMCState): string[] { return [] }
export function createCacheEditsBlock(_state: CachedMCState, _toolIds: string[]): CacheEditsBlock | null {
  return null
}
