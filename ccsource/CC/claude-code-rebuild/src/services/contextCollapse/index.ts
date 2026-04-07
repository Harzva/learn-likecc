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
