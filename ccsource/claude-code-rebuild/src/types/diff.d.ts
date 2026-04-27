/**
 * Type declarations for the 'diff' package
 */

declare module 'diff' {
  export interface Hunk {
    oldStart: number
    oldLines: number
    newStart: number
    newLines: number
    lines: string[]
  }

  export interface StructuredPatchHunk extends Hunk {
    content: string
  }

  export interface ParsedDiff {
    oldFileName: string
    newFileName: string
    hunks: Hunk[]
  }

  export function structuredPatch(
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string,
    options?: {
      context?: number
      ignoreWhitespace?: boolean
    }
  ): string

  export function parsePatch(diffStr: string): ParsedDiff[]

  export function createPatch(
    fileName: string,
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string,
    options?: { context?: number }
  ): string
}
