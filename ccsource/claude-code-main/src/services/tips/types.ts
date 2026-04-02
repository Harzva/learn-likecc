// Tips types stub
import type { FileStateCache } from '../../utils/fileStateCache.js'
import type { ThemeName } from '../../utils/theme.js'

export interface Tip {
  id: string
  title?: string
  content: string | ((ctx?: TipContext) => Promise<string>)
  category?: string
  cooldownSessions?: number
  isRelevant?: (context: TipContext) => boolean | Promise<boolean>
}

export interface TipRegistry {
  tips: Tip[]
  lastUpdated: number
}

export interface TipContext {
  platform?: string
  shell?: string
  isRemote?: boolean
  hasTerminalSetup?: boolean
  bashTools?: Set<string>
  readFileState?: FileStateCache
  theme?: ThemeName
}
