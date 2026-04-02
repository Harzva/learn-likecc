import type { ReactNode } from 'react'

interface WorkflowDetailDialogProps {
  workflow: unknown
  onDone: (result?: string, options?: { display?: string }) => void
  onKill?: () => void
  onSkipAgent?: (agentId: string) => void
  onRetryAgent?: (agentId: string) => void
  onBack: () => void
}

export function WorkflowDetailDialog(_props: WorkflowDetailDialogProps): ReactNode { return null }
