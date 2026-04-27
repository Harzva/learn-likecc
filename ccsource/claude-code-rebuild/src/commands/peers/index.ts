/**
 * Peers commands stub - not implemented
 */

export interface PeerCommandOptions {
  action: 'list' | 'connect' | 'disconnect'
  peerId?: string
}

export async function handlePeerCommand(_options: PeerCommandOptions): Promise<void> {
  throw new Error('Peers not implemented in stub')
}