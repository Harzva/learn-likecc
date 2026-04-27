/**
 * Transport base class stub - not implemented
 */

export interface Transport {
  id: string
  type: 'sse' | 'websocket' | 'stdio'
  connected: boolean
}

export interface TransportMessage {
  type: string
  data: unknown
}

export abstract class BaseTransport implements Transport {
  id: string
  type: 'sse' | 'websocket' | 'stdio'
  connected: boolean = false

  constructor(id: string, type: 'sse' | 'websocket' | 'stdio') {
    this.id = id
    this.type = type
  }

  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract send(message: TransportMessage): Promise<void>
  abstract receive(): Promise<TransportMessage>
}