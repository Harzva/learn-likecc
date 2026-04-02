/**
 * Query source constants stub - not implemented
 */

export const QUERY_SOURCE = {
  CLI: 'CLI',
  BRIDGE: 'BRIDGE',
  PIPE: 'PIPE',
  SDK: 'SDK',
  sdk: 'sdk',
  hook_agent: 'hook_agent',
  verification_agent: 'verification_agent',
  repl_main_thread: 'repl_main_thread',
  compact: 'compact',
  insights: 'insights',
  feedback: 'feedback',
  auto_mode_critique: 'auto_mode_critique',
  rename_generate_name: 'rename_generate_name',
}

export type QuerySource = keyof typeof QUERY_SOURCE | typeof QUERY_SOURCE[keyof typeof QUERY_SOURCE]