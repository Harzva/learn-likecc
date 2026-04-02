/**
 * MCP skills stub - not implemented
 */

export interface MCPSkill {
  id: string
  name: string
  serverName: string
  toolName: string
}

export interface MCPClient {
  name: string
  [key: string]: unknown
}

export async function loadMCPSkills(): Promise<MCPSkill[]> {
  return []
}

export function getMCPSkill(_id: string): MCPSkill | undefined {
  return undefined
}

export function fetchMcpSkillsForClient(_client: MCPClient): Promise<MCPSkill[]> {
  return Promise.resolve([])
}

// Add cache property for compatibility
fetchMcpSkillsForClient.cache = new Map<string, unknown>()
