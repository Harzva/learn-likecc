// Tips types stub
export interface Tip {
  id: string
  title: string
  content: string
  category: string
}

export interface TipRegistry {
  tips: Tip[]
  lastUpdated: number
}
