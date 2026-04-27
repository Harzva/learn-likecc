/**
 * Query source constants stub - not implemented
 */

export const QUERY_SOURCE = {
  CLI: 'cli',
  BRIDGE: 'bridge',
  PIPE: 'pipe',
  SDK: 'sdk',
}

export type QuerySource = keyof typeof QUERY_SOURCE