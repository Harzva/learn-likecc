/**
 * Transport base class stub - not implemented
 */

export interface Transport {
  id: string
  type: 'sse' | 'websocket' | 'stdio'
  connected: boolean
  setOnData?(callback: (data: unknown) => void): void
  setOnClose?(callback: () => void): void
  connect?(): Promise<void>
  write?(data: unknown): Promise<void>
  close?(): Promise<void>
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