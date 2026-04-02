// Auto-generated stub
export type Terminal = 'bash' | 'zsh' | 'fish' | 'sh' | { reason: string } | { reason: string; error: unknown; turnCount?: number }
export type Continue = 'auto' | 'manual' | 'skip' | {
  reason: string
  committed?: number
  attempt?: number
  turnCount?: number
}
