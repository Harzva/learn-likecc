/**
 * Skill search feature check stub - not implemented
 */

export function isSkillSearchEnabled(): boolean {
  return false
}

export function checkSkillSearchFeature(): Promise<boolean> {
  return Promise.resolve(false)
}

export function trackSkillSearch(_query: string, _results: number): void {}

export function trackSkillLoad(_skillId: string, _success: boolean): void {}

export function stripCanonicalPrefix(_id: string): string {
  return _id
}

export function getDiscoveredRemoteSkill(_id: string): { url: string; [key: string]: unknown } | null {
  return null
}

export function logRemoteSkillLoaded(_info: Record<string, unknown>): void {}

export function setRemoteSkillState(_id: string, _state: Partial<unknown>): void {}
