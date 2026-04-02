/**
 * Remote skill loader stub - not implemented
 */

export interface RemoteSkill {
  id: string
  name: string
  description: string
  path: string
  url?: string
}

export interface RemoteSkillMeta {
  url: string
  [key: string]: unknown
}

export interface LoadRemoteSkillResult {
  cacheHit: boolean
  latencyMs: number
  skillPath: string
  content: string
  fileCount: number
  totalBytes: number
  fetchMethod: string
}

export async function loadRemoteSkill(_id: string, _url?: string): Promise<LoadRemoteSkillResult> {
  throw new Error('loadRemoteSkill not implemented in stub')
}

export async function listRemoteSkills(): Promise<RemoteSkill[]> {
  return []
}

export function getDiscoveredRemoteSkill(_slug: string): { url: string; [key: string]: unknown } | null {
  return null
}

export function logRemoteSkillLoaded(_info: Record<string, unknown>): void {}
