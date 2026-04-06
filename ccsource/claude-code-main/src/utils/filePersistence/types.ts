/**
 * Shared types/constants for file persistence.
 *
 * These values are intentionally small and self-contained so the file
 * persistence modules can compile independently of the rest of the remote
 * session machinery.
 */

export const OUTPUTS_SUBDIR = 'outputs'
export const FILE_COUNT_LIMIT = 1000
export const DEFAULT_UPLOAD_CONCURRENCY = 8

export type TurnStartTime = number

export interface PersistedFile {
  filename: string
  file_id: string
}

export interface FailedPersistence {
  filename: string
  error: string
}

export interface FilesPersistedEventData {
  files: PersistedFile[]
  failed: FailedPersistence[]
}
