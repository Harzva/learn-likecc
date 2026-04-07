import * as React from 'react'
import { Box, Text } from '../ink.js'
import type { SessionTabState } from '../utils/sessionTabs.js'

type Props = {
  tab: SessionTabState
  isActive: boolean
  children?: React.ReactNode
  onActivate?: () => void
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

export function SessionPaneDock({
  tab,
  isActive,
  children,
  onActivate,
}: Props): React.ReactNode {
  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      marginRight={1}
      borderStyle="round"
      borderColor={isActive ? 'cyan' : 'gray'}
      paddingX={1}
      onClick={onActivate}
    >
      <Text color={isActive ? 'cyan' : 'gray'} bold>
        {tab.title} · {tab.model ?? 'default'}
        {tab.provider ? ` · ${tab.provider}` : ''}
        {isActive ? ' · active' : ' · inactive'}
      </Text>
      <Text dimColor>
        Transcript: {truncate(tab.transcriptId, 28)}
        {tab.todoSnapshotId ? ` · Todo: ${truncate(tab.todoSnapshotId, 18)}` : ''}
      </Text>
      <Box marginTop={1} flexDirection="column">
        {isActive ? (
          children
        ) : (
          <>
            <Text dimColor>{tab.draftInput?.trim() ? 'Draft preview' : 'No draft yet'}</Text>
            <Text color="gray">
              {tab.draftInput?.trim()
                ? `❯ ${truncate(tab.draftInput.replace(/\s+/g, ' '), 72)}`
                : 'Use /tab switch or Ctrl+g 1-9 to activate this pane.'}
            </Text>
          </>
        )}
      </Box>
    </Box>
  )
}
