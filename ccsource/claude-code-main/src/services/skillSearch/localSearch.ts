/**
 * Local search stub - not implemented
 */

export interface LocalSearchOptions {
  query: string
  limit?: number
}

export interface LocalSearchResult {
  id: string
  title: string
  content: string
}

export async function localSearch(_options: LocalSearchOptions): Promise<LocalSearchResult[]> {
  return []
}

export function clearSkillIndexCache(): void {}