export interface AssistantSession {
  id: string
  name: string
  path: string
}

export function discoverAssistantSessions(): AssistantSession[] { return [] }
