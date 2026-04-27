/**
 * Peer sessions bridge stub - not implemented
 */

export interface PeerSession {
  id: string
  status: 'connected' | 'disconnected'
}

export function getPeerSessions(): PeerSession[] {
  return []
}

export function connectPeerSession(_id: string): Promise<void> {
  throw new Error('Peer sessions not implemented in stub')
}
