/**
 * Remote skill state stub - not implemented
 */

export type RemoteSkillStatus = 'loading' | 'loaded' | 'error' | 'unavailable'

export interface RemoteSkillState {
  id: string
  status: RemoteSkillStatus
  error?: string
}

export function getRemoteSkillState(_id: string): RemoteSkillState {
  return { id: _id, status: 'unavailable' }
}

export function setRemoteSkillState(_id: string, _state: Partial<RemoteSkillState>): void {
  // Stub - no-op
}
