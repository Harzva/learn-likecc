/**
 * MCP skills stub - not implemented
 */

export interface MCPSkill {
  id: string
  name: string
  serverName: string
  toolName: string
}

export async function loadMCPSkills(): Promise<MCPSkill[]> {
  return []
}

export function getMCPSkill(_id: string): MCPSkill | undefined {
  return undefined
}
