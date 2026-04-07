import figures from 'figures'
import * as React from 'react'
import { Box, Text } from '../ink.js'
import { useAppState } from '../state/AppState.js'
import { isInProcessTeammateTask } from '../tasks/InProcessTeammateTask/types.js'
import { isLocalAgentTask } from '../tasks/LocalAgentTask/LocalAgentTask.js'
import { normalizeSessionTabsState, getActiveSessionTab } from '../utils/sessionTabs.js'
import type { Task as TodoTask } from '../utils/tasks.js'

type Props = {
  tasksV2?: TodoTask[]
  width?: number
  stacked?: boolean
}

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

function statusColor(status: string): 'gray' | 'yellow' | 'green' | 'red' | 'cyan' {
  switch (status) {
    case 'running':
    case 'in_progress':
      return 'cyan'
    case 'waiting':
    case 'pending':
      return 'yellow'
    case 'completed':
    case 'idle':
      return 'green'
    case 'failed':
    case 'error':
    case 'killed':
      return 'red'
    default:
      return 'gray'
  }
}

function statusGlyph(status: string): string {
  switch (status) {
    case 'running':
    case 'in_progress':
      return figures.squareSmallFilled
    case 'waiting':
    case 'pending':
      return figures.ellipsis
    case 'completed':
    case 'idle':
      return figures.tick
    case 'failed':
    case 'error':
    case 'killed':
      return figures.cross
    default:
      return figures.bullet
  }
}

export function SessionWorkspacePanel({
  tasksV2,
  width = 42,
  stacked = false,
}: Props): React.ReactNode {
  const rawSessionTabs = useAppState(s => s.sessionTabs)
  const mainLoopModel = useAppState(s => s.mainLoopModel)
  const tasks = useAppState(s => s.tasks)
  const viewingAgentTaskId = useAppState(s => s.viewingAgentTaskId)
  const todos = useAppState(s => s.todos)
  const sessionTabs = normalizeSessionTabsState(rawSessionTabs, mainLoopModel)
  const activeTab = getActiveSessionTab(sessionTabs)

  const runningAgents = Object.values(tasks)
    .filter(task => task.status === 'running' || task.status === 'pending')
    .slice(0, 6)

  const todoEntries = Object.entries(
    activeTab?.legacyTodosSnapshot ?? todos,
  )
  const activeTodos = todoEntries.flatMap(([agentId, items]) =>
    items
      .filter(item => item.status !== 'completed')
      .slice(0, 2)
      .map(item => ({ agentId, item })),
  )

  const todoSummary =
    activeTab?.taskPreviewSummary ??
    (tasksV2
      ? (() => {
          const summary = tasksV2.reduce(
            (acc, task) => {
              acc.total += 1
              if (task.status === 'completed') acc.completed += 1
              if (task.status === 'in_progress') acc.inProgress += 1
              if (task.status === 'pending') acc.pending += 1
              return acc
            },
            { total: 0, completed: 0, inProgress: 0, pending: 0 },
          )
          return `${summary.total} total · ${summary.inProgress} active · ${summary.pending} pending · ${summary.completed} done`
        })()
      : null)

  return (
    <Box
      flexDirection="column"
      width={stacked ? undefined : width}
      marginLeft={stacked ? 0 : 1}
      marginTop={stacked ? 1 : 0}
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
    >
      <Text color="cyan" bold>
        Session workspace
      </Text>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Active tab</Text>
        <Text dimColor>
          {activeTab
            ? `${activeTab.title} · ${activeTab.kind}`
            : 'No active tab'}
        </Text>
        {activeTab && (
          <>
            <Text>
              Model: <Text color="blue">{activeTab.model ?? 'default'}</Text>
            </Text>
            <Text>
              Provider:{' '}
              <Text color="yellow">{activeTab.provider ?? 'default'}</Text>
            </Text>
            <Text>
              Transcript:{' '}
              <Text color="magenta">{activeTab.transcriptId || 'main'}</Text>
            </Text>
            <Text>
              Todo lane:{' '}
              <Text color="green">
                {activeTab.todoSnapshotId ?? 'session-default'}
              </Text>
            </Text>
          </>
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Subagent panel</Text>
        <Text dimColor>
          {viewingAgentTaskId
            ? `Focused transcript: ${viewingAgentTaskId}`
            : 'Focused transcript: leader/main'}
        </Text>
        {runningAgents.length === 0 ? (
          <Text dimColor>No running subagents</Text>
        ) : (
          runningAgents.map(task => {
            const agentLabel = isInProcessTeammateTask(task)
              ? `${task.identity.agentName}@${task.identity.teamName}`
              : isLocalAgentTask(task)
                ? task.agentType
                : task.type

            const modelLabel =
              (isInProcessTeammateTask(task) || isLocalAgentTask(task)) &&
              task.model
                ? task.model
                : undefined

            return (
              <Text key={task.id} color={statusColor(task.status)}>
                {statusGlyph(task.status)} {truncate(agentLabel, 18)}
                {modelLabel ? ` · ${truncate(modelLabel, 14)}` : ''}
              </Text>
            )
          })
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>Todo / task lane</Text>
        {todoSummary ? (
          <Text dimColor>{todoSummary}</Text>
        ) : (
          <Text dimColor>No task lane yet</Text>
        )}
        {activeTab?.taskPreviewLines && activeTab.taskPreviewLines.length > 0
          ? activeTab.taskPreviewLines.slice(0, 3).map((line, index) => (
              <Text
                key={`${activeTab.id}-task-preview-${index}`}
                color="gray"
              >
                {truncate(line, stacked ? 42 : 30)}
              </Text>
            ))
          : tasksV2?.slice(0, 3).map(task => (
              <Text key={task.id} color={statusColor(task.status)}>
                {statusGlyph(task.status)} {task.id}.{' '}
                {truncate(task.subject, stacked ? 38 : 28)}
              </Text>
            ))}
        {activeTodos.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Legacy todos</Text>
            {activeTodos.slice(0, 3).map(({ agentId, item }, index) => (
              <Text key={`${agentId}-${index}`} color={statusColor(item.status)}>
                {statusGlyph(item.status)} {truncate(agentId, 10)} ·{' '}
                {truncate(item.content, stacked ? 42 : 26)}
              </Text>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
