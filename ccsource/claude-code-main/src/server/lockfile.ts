export interface ServerLockInfo {
  pid: number
  port: number
  host: string
  httpUrl: string
  startedAt: number
}

export async function writeServerLock(_info: ServerLockInfo): Promise<void> {}
export async function removeServerLock(): Promise<void> {}
export function probeRunningServer(): ServerLockInfo | null { return null }
