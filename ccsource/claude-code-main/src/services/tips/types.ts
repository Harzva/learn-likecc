// Tips types stub
export interface Tip {
  id: string
  title?: string
  content: string | (() => Promise<string>)
  category?: string
  cooldownSessions?: number
  isRelevant?: (context: TipContext) => boolean | Promise<boolean>
}

export interface TipRegistry {
  tips: Tip[]
  lastUpdated: number
}

export interface FileStateCache {
  has(key: string): boolean
  get(key: string): unknown
  size: number
}

export interface TipContext {
  platform?: string
  shell?: string
  isRemote?: boolean
  hasTerminalSetup?: boolean
  bashTools?: unknown[]
  readFileState?: FileStateCache
}
