import * as React from 'react'
import { Box, Text } from '../ink.js'
import type { SessionTabState } from '../utils/sessionTabs.js'
import type { TodoList } from '../utils/todo/types.js'

type Props = {
  tab: SessionTabState
  isActive: boolean
  children?: React.ReactNode
  onActivate?: () => void
  paneLabel?: string
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function summarizeTodos(
  todosSnapshot?: Record<string, TodoList>,
): {
  total: number
  pending: number
  inProgress: number
  completed: number
  topLane?: string
} {
  if (!todosSnapshot) {
    return { total: 0, pending: 0, inProgress: 0, completed: 0 }
  }

  let total = 0
  let pending = 0
  let inProgress = 0
  let completed = 0
  let topLane: string | undefined

  for (const [laneId, items] of Object.entries(todosSnapshot)) {
    if (!topLane && items.length > 0) {
      topLane = laneId
    }
    for (const item of items) {
      total += 1
      if (item.status === 'pending') pending += 1
      else if (item.status === 'in_progress') inProgress += 1
      else if (item.status === 'completed') completed += 1
    }
  }

  return { total, pending, inProgress, completed, topLane }
}

export function SessionPaneDock({
  tab,
  isActive,
  children,
  onActivate,
  paneLabel,
}: Props): React.ReactNode {
  const todoSummary = summarizeTodos(tab.legacyTodosSnapshot)
  const activateHint =
    paneLabel === 'left'
      ? 'Click pane, /tab focus left, or Ctrl+g h'
      : paneLabel === 'right'
        ? 'Click pane, /tab focus right, or Ctrl+g l'
        : 'Use /tab switch or Ctrl+g 1-9 to activate'

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
        {paneLabel ? `${paneLabel.toUpperCase()} · ` : ''}
        {tab.title} · {tab.model ?? 'default'}
        {tab.provider ? ` · ${tab.provider}` : ''}
        {isActive ? ' · active' : ' · inactive'}
      </Text>
      <Text dimColor>
        Transcript: {truncate(tab.transcriptId, 28)}
        {tab.todoSnapshotId ? ` · Todo: ${truncate(tab.todoSnapshotId, 18)}` : ''}
      </Text>
      <Text dimColor>
        Status: {tab.status}
        {tab.taskPreviewSummary ? ` · ${truncate(tab.taskPreviewSummary, 42)}` : ''}
      </Text>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Transcript</Text>
        {tab.transcriptPreview && tab.transcriptPreview.length > 0 ? (
          tab.transcriptPreview.slice(-4).map((line, index) => (
            <Text key={`${tab.id}-line-${index}`} color={isActive ? 'white' : 'gray'}>
              {truncate(line, 72)}
            </Text>
          ))
        ) : (
          <Text dimColor>No transcript captured yet</Text>
        )}
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Todo summary</Text>
        {todoSummary.total > 0 ? (
          <>
            <Text color={isActive ? 'white' : 'gray'}>
              {todoSummary.total} items · {todoSummary.inProgress} in progress ·{' '}
              {todoSummary.pending} pending · {todoSummary.completed} completed
            </Text>
            <Text dimColor>
              {todoSummary.topLane
                ? `Primary lane: ${truncate(todoSummary.topLane, 28)}`
                : 'Lane captured in snapshot'}
            </Text>
          </>
        ) : (
          <Text dimColor>No todo lane captured yet</Text>
        )}
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text dimColor>Task lane</Text>
        {tab.taskPreviewLines && tab.taskPreviewLines.length > 0 ? (
          tab.taskPreviewLines.slice(0, 3).map((line, index) => (
            <Text key={`${tab.id}-task-${index}`} color={isActive ? 'white' : 'gray'}>
              {truncate(line, 72)}
            </Text>
          ))
        ) : (
          <Text dimColor>No task activity captured yet</Text>
        )}
      </Box>
      <Box marginTop={1} flexDirection="column">
        {isActive ? (
          children
        ) : (
          <>
            <Text dimColor>
              {tab.draftInput?.trim()
                ? 'Draft preview'
                : 'Input dock ready once this pane is active'}
            </Text>
            <Text color="gray">
              {tab.draftInput?.trim()
                ? `❯ ${truncate(tab.draftInput.replace(/\s+/g, ' '), 72)}`
                : 'Type after focusing this pane. Draft memory is kept per pane.'}
            </Text>
            <Text color="cyan">{activateHint}</Text>
          </>
        )}
      </Box>
    </Box>
  )
}
