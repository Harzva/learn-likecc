/**
 * Remote skill loader stub - not implemented
 */

export interface RemoteSkill {
  id: string
  name: string
  description: string
  path: string
}

export async function loadRemoteSkill(_id: string): Promise<RemoteSkill | null> {
  return null
}

export async function listRemoteSkills(): Promise<RemoteSkill[]> {
  return []
}
