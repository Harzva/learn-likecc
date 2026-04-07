import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { getSessionId } from '../bootstrap/state.js'
import type { AppState } from '../state/AppStateStore.js'
import { isLocalAgentTask } from '../tasks/LocalAgentTask/LocalAgentTask.js'
import { isInProcessTeammateTask } from '../tasks/InProcessTeammateTask/types.js'
import type { Message } from '../types/message.js'
import { registerCleanup } from './cleanupRegistry.js'
import { getCwd } from './cwd.js'
import { getDisplayPath } from './file.js'
import { getActiveSessionTab } from './sessionTabs.js'

const DEFAULT_WORKSPACE_API_PORT = 4310

let latestSnapshot: AppState | null = null
let serverStarted = false

type WorkspaceSubagentSummary = {
  id: string
  kind: 'local_agent' | 'in_process_teammate'
  paneId?: string
  title: string
  status: string
  model?: string
  summary?: string
  repoLabel?: string
  worktreePath?: string
  messageCount?: number
  lastActivity?: string
  updatedAt: string
}

type WorkspaceTranscriptCard = {
  id: string
  kind:
    | 'message'
    | 'text'
    | 'thinking'
    | 'tool_use'
    | 'tool_result'
    | 'attachment'
    | 'progress'
  title: string
  summary?: string
  role?: string
  toolName?: string
  toolUseId?: string
  inputSummary?: string
  outputSummary?: string
  createdAt: string
}

type WorkspaceWorkflowEvent = {
  id: string
  type: string
  paneId: string
  createdAt: string
  title: string
  summary?: string
  role?: string
  toolName?: string
  toolUseId?: string
  turnId?: string
  stage?: 'prompt' | 'thinking' | 'tool' | 'response' | 'system'
}

type WorkspaceWorkflowStage = {
  id: string
  paneId: string
  createdAt: string
  stage: 'prompt' | 'thinking' | 'tool' | 'response' | 'system'
  title: string
  summary?: string
  toolName?: string
  toolUseId?: string
}

type WorkspaceToolPair = {
  id: string
  paneId: string
  turnId?: string
  chainId?: string
  chainIndex?: number
  toolName?: string
  toolUseId?: string
  inputSummary?: string
  outputSummary?: string
  startedAt: string
  completedAt?: string
  previousPairId?: string
  nextPairId?: string
}

type WorkspaceTurnReplay = {
  id: string
  paneId: string
  startedAt: string
  promptSummary?: string
  responseSummary?: string
  toolCount: number
  eventCount: number
  toolUseIds: string[]
  previousTurnId?: string
  nextTurnId?: string
}

type WorkspaceToolChain = {
  id: string
  toolName: string
  pairIds: string[]
  turnIds: string[]
  turnSummaries: Array<{
    turnId: string
    promptSummary?: string
    responseSummary?: string
  }>
  steps: Array<{
    pairId: string
    turnId?: string
    startedAt: string
    completedAt?: string
    inputSummary?: string
    outputSummary?: string
    promptSummary?: string
    responseSummary?: string
  }>
  pairCount: number
  startedAt: string
  completedAt?: string
}

function getWorkspaceApiPort(): number {
  const raw = process.env.CLAUDE_CODE_WORKSPACE_API_PORT
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_WORKSPACE_API_PORT
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_WORKSPACE_API_PORT
}

export function getWorkspaceApiBaseUrl(): string {
  return `http://127.0.0.1:${getWorkspaceApiPort()}`
}

export function publishWorkspaceApiSnapshot(state: AppState): void {
  latestSnapshot = state
}

type WorkspacePaneSummary = {
  id: string
  title: string
  model?: string
  provider?: string
  status: string
  transcriptId: string
  todoLaneId?: string
  taskSummary?: string
  draftPreview?: string
  updatedAt: string
  isActive: boolean
}

function buildPaneSummary(state: AppState): WorkspacePaneSummary[] {
  const { sessionTabs } = state
  return sessionTabs.tabOrder
    .map(tabId => sessionTabs.tabs[tabId])
    .filter(Boolean)
    .map(tab => ({
      id: tab.id,
      title: tab.title,
      model: tab.model,
      provider: tab.provider,
      status: tab.status,
      transcriptId: tab.transcriptId,
      todoLaneId: tab.todoSnapshotId,
      taskSummary: tab.taskPreviewSummary,
      draftPreview: tab.draftInput?.trim() || undefined,
      updatedAt: tab.updatedAt,
      isActive: tab.id === sessionTabs.activeTabId,
    }))
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined
}

function summarizeContentItem(item: unknown): string | undefined {
  if (!item || typeof item !== 'object') return undefined
  const record = item as Record<string, unknown>
  const itemType = getStringValue(record.type)
  if (itemType === 'text') {
    return getStringValue(record.text)
  }
  if (itemType === 'thinking') {
    return getStringValue(record.thinking) ?? '[thinking]'
  }
  if (itemType === 'tool_use') {
    const toolName = getStringValue(record.name) ?? 'tool'
    return `[tool_use] ${toolName}`
  }
  if (itemType === 'tool_result') {
    return summarizeUnknown(record.content) ?? '[tool_result]'
  }
  return undefined
}

function summarizeUnknown(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return getStringValue(value)
  }
  if (Array.isArray(value)) {
    const parts = value
      .map(item => summarizeUnknown(item))
      .filter((item): item is string => Boolean(item))
    return parts.length > 0 ? parts.join(' | ') : undefined
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return (
      getStringValue(record.text) ??
      getStringValue(record.content) ??
      getStringValue(record.summary) ??
      getStringValue(record.thinking)
    )
  }
  return undefined
}

function summarizeMessage(message: Message): string | undefined {
  if (message.type === 'progress') {
    const progressData =
      message && typeof message === 'object' && 'data' in message
        ? (message as Record<string, unknown>).data
        : undefined
    return (
      summarizeUnknown(
        progressData && typeof progressData === 'object'
          ? (progressData as Record<string, unknown>).message
          : undefined,
      ) ??
      summarizeUnknown(
        progressData && typeof progressData === 'object'
          ? (progressData as Record<string, unknown>).output
          : undefined,
      ) ??
      summarizeUnknown(
        progressData && typeof progressData === 'object'
          ? (progressData as Record<string, unknown>).stdout
          : undefined,
      ) ??
      getStringValue(
        progressData && typeof progressData === 'object'
          ? (progressData as Record<string, unknown>).type
          : undefined,
      )
    )
  }

  const directContent = getStringValue(message.content)
  if (directContent) return directContent

  const nestedMessage = message.message
  if (!nestedMessage) return undefined
  if (typeof nestedMessage.content === 'string') {
    return getStringValue(nestedMessage.content)
  }
  if (Array.isArray(nestedMessage.content)) {
    const parts = nestedMessage.content
      .map(item => summarizeContentItem(item))
      .filter((item): item is string => Boolean(item))
    if (parts.length > 0) {
      return parts.join(' | ')
    }
  }
  return undefined
}

function getMessageRole(message: Message): string {
  if (typeof message.message?.role === 'string') {
    return message.message.role
  }
  return message.type
}

function getMessageCreatedAt(message: Message, index: number): string {
  const direct = getStringValue(message.timestamp) ?? getStringValue(message.createdAt)
  return direct ?? `m-${index}`
}

function isUserPromptMessage(message: Message): boolean {
  if (message.type !== 'user') return false
  const content = Array.isArray(message.message?.content)
    ? message.message?.content
    : undefined
  if (!content || content.length === 0) return true
  return content.some(item => {
    if (!item || typeof item !== 'object') return true
    const record = item as Record<string, unknown>
    return getStringValue(record.type) !== 'tool_result'
  })
}

function summarizeToolInput(input: unknown): string | undefined {
  const direct = summarizeUnknown(input)
  if (direct) {
    return direct.length > 220 ? `${direct.slice(0, 217)}...` : direct
  }
  try {
    const serialized = JSON.stringify(input)
    if (!serialized || serialized === '{}') return undefined
    return serialized.length > 220 ? `${serialized.slice(0, 217)}...` : serialized
  } catch {
    return undefined
  }
}

function buildTranscriptArtifacts(messages: Message[] | undefined, paneId: string) {
  const cards: WorkspaceTranscriptCard[] = []
  const workflow: WorkspaceWorkflowEvent[] = []
  const stages: WorkspaceWorkflowStage[] = []
  const toolPairs = new Map<string, WorkspaceToolPair>()
  const turns: WorkspaceTurnReplay[] = []
  let activeTurnId: string | undefined
  const normalizedMessages = (messages ?? []).map((message, index) => {
    const createdAt = getMessageCreatedAt(message, index)
    const role = getMessageRole(message)
    const summary = summarizeMessage(message)
    const parentToolUseId =
      typeof (message as Record<string, unknown>).parentToolUseID === 'string'
        ? ((message as Record<string, unknown>).parentToolUseID as string)
        : undefined
    const stage: WorkspaceWorkflowStage['stage'] =
      message.type === 'progress' && parentToolUseId
        ? 'tool'
        : role === 'user'
        ? 'prompt'
        : role === 'assistant'
          ? 'response'
          : role === 'system' || role === 'progress' || role === 'attachment'
            ? 'system'
            : 'response'
    if (isUserPromptMessage(message)) {
      activeTurnId = `turn-${message.uuid}`
      turns.push({
        id: activeTurnId,
        paneId,
        startedAt: createdAt,
        promptSummary: summary,
        responseSummary: undefined,
        toolCount: 0,
        eventCount: 0,
        toolUseIds: [],
      })
    }
    const currentTurn = activeTurnId
      ? turns.find(turn => turn.id === activeTurnId)
      : undefined
    if (currentTurn) {
      currentTurn.eventCount += 1
      if (role === 'assistant' && summary) {
        currentTurn.responseSummary = summary
      }
    }

    cards.push({
      id: `${message.uuid}-message`,
      kind:
        message.type === 'progress'
          ? 'progress'
          : message.type === 'attachment'
            ? 'attachment'
            : 'message',
      title: `${role} message`,
      summary,
      role,
      createdAt,
    })
    workflow.push({
      id: `${message.uuid}-turn`,
      type: 'message_turn',
      paneId,
      createdAt,
      title: `${role} turn`,
      summary,
      role,
      toolUseId: parentToolUseId,
      turnId: activeTurnId,
      stage,
    })
    stages.push({
      id: `${message.uuid}-stage`,
      paneId,
      createdAt,
      stage,
      title: `${role} turn`,
      summary,
      toolUseId: parentToolUseId,
    })
    if (message.type === 'progress' && parentToolUseId) {
      const existingPair = toolPairs.get(parentToolUseId)
      if (!existingPair) {
        toolPairs.set(parentToolUseId, {
          id: parentToolUseId,
          paneId,
          turnId: activeTurnId,
          toolUseId: parentToolUseId,
          toolName: undefined,
          inputSummary: undefined,
          outputSummary: summary,
          startedAt: createdAt,
          completedAt: undefined,
        })
      } else if (!existingPair.outputSummary && summary) {
        toolPairs.set(parentToolUseId, {
          ...existingPair,
          outputSummary: summary,
        })
      }

      cards.push({
        id: `${message.uuid}-progress-tool`,
        kind: 'progress',
        title: 'tool progress',
        summary,
        role,
        toolUseId: parentToolUseId,
        createdAt,
      })
    }

    const content = Array.isArray(message.message?.content)
      ? message.message?.content
      : undefined
    if (content) {
      content.forEach((item, itemIndex) => {
        if (!item || typeof item !== 'object') return
        const record = item as Record<string, unknown>
        const itemType = getStringValue(record.type)
        if (!itemType) return

        if (itemType === 'text') {
          const text = getStringValue(record.text)
          cards.push({
            id: `${message.uuid}-text-${itemIndex}`,
            kind: 'text',
            title: 'assistant text',
            summary: text,
            role,
            createdAt,
          })
          workflow.push({
            id: `${message.uuid}-text-${itemIndex}`,
            type: 'assistant_text',
            paneId,
            createdAt,
            title: 'assistant text',
            summary: text,
            role,
            turnId: activeTurnId,
          })
          return
        }

        if (itemType === 'thinking') {
          const thinking = getStringValue(record.thinking)
          cards.push({
            id: `${message.uuid}-thinking-${itemIndex}`,
            kind: 'thinking',
            title: 'thinking',
            summary: thinking,
            role,
            createdAt,
          })
          workflow.push({
            id: `${message.uuid}-thinking-${itemIndex}`,
            type: 'thinking',
            paneId,
            createdAt,
            title: 'thinking',
            summary: thinking,
            role,
            turnId: activeTurnId,
            stage: 'thinking',
          })
          stages.push({
            id: `${message.uuid}-thinking-stage-${itemIndex}`,
            paneId,
            createdAt,
            stage: 'thinking',
            title: 'thinking',
            summary: thinking,
          })
          return
        }

        if (itemType === 'tool_use') {
          const toolName = getStringValue(record.name) ?? 'tool'
          const toolUseId = getStringValue(record.id)
          const toolSummary = summarizeToolInput(record.input)
          if (toolUseId) {
            const existingPair = toolPairs.get(toolUseId)
            toolPairs.set(toolUseId, {
              id: toolUseId,
              paneId,
              turnId: activeTurnId,
              toolName,
              toolUseId,
              inputSummary: toolSummary,
              outputSummary: existingPair?.outputSummary,
              startedAt: existingPair?.startedAt ?? createdAt,
              completedAt: existingPair?.completedAt,
            })
            if (currentTurn && !currentTurn.toolUseIds.includes(toolUseId)) {
              currentTurn.toolUseIds.push(toolUseId)
              currentTurn.toolCount += 1
            }
          }
          cards.push({
            id: `${message.uuid}-tool-use-${itemIndex}`,
            kind: 'tool_use',
            title: toolName,
            summary: toolSummary,
            role,
            toolName,
            toolUseId,
            inputSummary: toolSummary,
            createdAt,
          })
          workflow.push({
            id: `${message.uuid}-tool-use-${itemIndex}`,
            type: 'tool_use',
            paneId,
            createdAt,
            title: toolName,
            summary: toolSummary,
            role,
            toolName,
            toolUseId,
            turnId: activeTurnId,
            stage: 'tool',
          })
          stages.push({
            id: `${message.uuid}-tool-use-stage-${itemIndex}`,
            paneId,
            createdAt,
            stage: 'tool',
            title: toolName,
            summary: toolSummary,
            toolName,
            toolUseId,
          })
          return
        }

        if (itemType === 'tool_result') {
          const toolUseId = getStringValue(record.tool_use_id)
          const resultSummary =
            summarizeUnknown(record.content) ??
            summarizeUnknown(record.result) ??
            summarizeUnknown(record.output)
          const existingPair = toolUseId ? toolPairs.get(toolUseId) : undefined
          if (toolUseId) {
            toolPairs.set(toolUseId, {
              id: toolUseId,
              paneId,
              turnId: existingPair?.turnId ?? activeTurnId,
              toolName: existingPair?.toolName,
              toolUseId,
              inputSummary: existingPair?.inputSummary,
              outputSummary: resultSummary,
              startedAt: existingPair?.startedAt ?? createdAt,
              completedAt: createdAt,
            })
          }
          cards.push({
            id: `${message.uuid}-tool-result-${itemIndex}`,
            kind: 'tool_result',
            title: 'tool result',
            summary: resultSummary,
            role,
            toolUseId,
            outputSummary: resultSummary,
            createdAt,
          })
          workflow.push({
            id: `${message.uuid}-tool-result-${itemIndex}`,
            type: 'tool_result',
            paneId,
            createdAt,
            title: 'tool result',
            summary: resultSummary,
            role,
            toolUseId,
            turnId: existingPair?.turnId ?? activeTurnId,
            stage: 'tool',
          })
          stages.push({
            id: `${message.uuid}-tool-result-stage-${itemIndex}`,
            paneId,
            createdAt,
            stage: 'tool',
            title: 'tool result',
            summary: resultSummary,
            toolUseId,
          })
        }
      })
    }

    return {
      uuid: message.uuid,
      type: message.type,
      createdAt,
      role,
      summary,
    }
  })

  const sortedTurns = turns.sort((a, b) =>
    String(a.startedAt).localeCompare(String(b.startedAt)),
  )
  const turnsById = new Map(sortedTurns.map(turn => [turn.id, turn]))
  for (let index = 0; index < sortedTurns.length; index += 1) {
    const current = sortedTurns[index]
    const previous = index > 0 ? sortedTurns[index - 1] : undefined
    const next = index < sortedTurns.length - 1 ? sortedTurns[index + 1] : undefined
    current.previousTurnId = previous?.id
    current.nextTurnId = next?.id
  }

  const sortedToolPairs = Array.from(toolPairs.values()).sort((a, b) =>
    String(a.startedAt).localeCompare(String(b.startedAt)),
  )
  const previousPairIdByToolName = new Map<string, string>()
  const toolChains = new Map<string, WorkspaceToolChain>()
  for (const pair of sortedToolPairs) {
    const toolName = pair.toolName ?? 'unknown-tool'
    const chainId = `chain-${toolName}`
    pair.chainId = chainId
    const previousPairId = previousPairIdByToolName.get(toolName)
    if (previousPairId) {
      pair.previousPairId = previousPairId
      const previousPair = sortedToolPairs.find(item => item.id === previousPairId)
      if (previousPair) {
        previousPair.nextPairId = pair.id
      }
    }
    previousPairIdByToolName.set(toolName, pair.id)

    const existingChain = toolChains.get(chainId)
    if (existingChain) {
      existingChain.pairIds.push(pair.id)
      if (pair.turnId && !existingChain.turnIds.includes(pair.turnId)) {
        existingChain.turnIds.push(pair.turnId)
        const turn = turnsById.get(pair.turnId)
        existingChain.turnSummaries.push({
          turnId: pair.turnId,
          promptSummary: turn?.promptSummary,
          responseSummary: turn?.responseSummary,
        })
      }
      existingChain.steps.push({
        pairId: pair.id,
        turnId: pair.turnId,
        startedAt: pair.startedAt,
        completedAt: pair.completedAt,
        inputSummary: pair.inputSummary,
        outputSummary: pair.outputSummary,
        promptSummary: pair.turnId
          ? turnsById.get(pair.turnId)?.promptSummary
          : undefined,
        responseSummary: pair.turnId
          ? turnsById.get(pair.turnId)?.responseSummary
          : undefined,
      })
      existingChain.pairCount += 1
      existingChain.completedAt = pair.completedAt ?? existingChain.completedAt
      pair.chainIndex = existingChain.pairCount
    } else {
      toolChains.set(chainId, {
        id: chainId,
        toolName,
        pairIds: [pair.id],
        turnIds: pair.turnId ? [pair.turnId] : [],
        turnSummaries: pair.turnId
          ? [
              {
                turnId: pair.turnId,
                promptSummary: turnsById.get(pair.turnId)?.promptSummary,
                responseSummary: turnsById.get(pair.turnId)?.responseSummary,
              },
            ]
          : [],
        steps: [
          {
            pairId: pair.id,
            turnId: pair.turnId,
            startedAt: pair.startedAt,
            completedAt: pair.completedAt,
            inputSummary: pair.inputSummary,
            outputSummary: pair.outputSummary,
            promptSummary: pair.turnId
              ? turnsById.get(pair.turnId)?.promptSummary
              : undefined,
            responseSummary: pair.turnId
              ? turnsById.get(pair.turnId)?.responseSummary
              : undefined,
          },
        ],
        pairCount: 1,
        startedAt: pair.startedAt,
        completedAt: pair.completedAt,
      })
      pair.chainIndex = 1
    }
  }

  return {
    messages: normalizedMessages,
    cards,
    workflow: workflow.sort((a, b) =>
      String(a.createdAt).localeCompare(String(b.createdAt)),
    ),
    stages: stages.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
    toolPairs: sortedToolPairs,
    turns: sortedTurns,
    toolChains: Array.from(toolChains.values()).sort((a, b) =>
      a.toolName.localeCompare(b.toolName),
    ),
  }
}

function buildSubagentSummaries(state: AppState): WorkspaceSubagentSummary[] {
  const paneBySubagentId = new Map<string, string>()
  for (const pane of Object.values(state.sessionTabs.tabs)) {
    if (pane.subagentId) {
      paneBySubagentId.set(pane.subagentId, pane.id)
    }
  }

  return Object.values(state.tasks)
    .flatMap(task => {
      if (isInProcessTeammateTask(task)) {
        return [
          {
            id: task.id,
            kind: 'in_process_teammate' as const,
            paneId: paneBySubagentId.get(task.id),
            title: `${task.identity.agentName}@${task.identity.teamName}`,
            status: task.status,
            model: task.model,
            summary: task.progress?.summary ?? task.description,
            repoLabel: undefined,
            worktreePath: undefined,
            messageCount: task.messages?.length ?? 0,
            lastActivity: task.progress?.lastActivity?.activityDescription,
            updatedAt: new Date(task.endTime ?? task.startTime).toISOString(),
          },
        ]
      }

      if (isLocalAgentTask(task)) {
        return [
          {
            id: task.id,
            kind: 'local_agent' as const,
            paneId: paneBySubagentId.get(task.id),
            title: task.selectedAgent?.name ?? task.description,
            status: task.status,
            model: task.model,
            summary: task.progress?.summary ?? task.description,
            repoLabel: undefined,
            worktreePath: undefined,
            messageCount: task.messages?.length ?? 0,
            lastActivity: task.progress?.lastActivity?.activityDescription,
            updatedAt: new Date(task.endTime ?? task.startTime).toISOString(),
          },
        ]
      }

      return []
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

function buildSessionSummary(state: AppState) {
  const activeTab = getActiveSessionTab(state.sessionTabs)
  const panes = buildPaneSummary(state)
  return {
    id: String(getSessionId()),
    title: 'Like Code workspace',
    cwd: getDisplayPath(getCwd()),
    activePaneId: state.sessionTabs.activeTabId,
    layoutMode: state.sessionTabs.layoutMode,
    model: activeTab?.model ?? state.mainLoopModel ?? undefined,
    provider: activeTab?.provider,
    hasRunningSubagents: panes.some(
      pane => pane.status === 'running' || pane.status === 'waiting',
    ),
    updatedAt: panes.reduce(
      (latest, pane) => (pane.updatedAt > latest ? pane.updatedAt : latest),
      activeTab?.updatedAt ?? new Date().toISOString(),
    ),
  }
}

function buildTranscriptPayload(state: AppState, paneId: string) {
  const tab = state.sessionTabs.tabs[paneId]
  if (!tab) return null
  const artifacts = buildTranscriptArtifacts(tab.transcriptMessages ?? [], paneId)
  return {
    paneId,
    transcriptId: tab.transcriptId,
    messages: artifacts.messages,
    cards: artifacts.cards,
    workflow: artifacts.workflow,
    stages: artifacts.stages,
    toolPairs: artifacts.toolPairs,
    turns: artifacts.turns,
    toolChains: artifacts.toolChains,
  }
}

function buildEventsPayload(state: AppState) {
  const panes = buildPaneSummary(state)
  const subagents = buildSubagentSummaries(state)
  const events = panes.flatMap((pane, index) => [
    {
      id: `pane-${pane.id}`,
      type: 'pane_snapshot',
      paneId: pane.id,
      createdAt: pane.updatedAt,
      title: pane.title,
      status: pane.status,
      taskSummary: pane.taskSummary,
      order: index,
    },
    ...(pane.model || pane.provider
      ? [
          {
            id: `model-${pane.id}`,
            type: 'model_binding',
            paneId: pane.id,
            createdAt: pane.updatedAt,
            model: pane.model,
            provider: pane.provider,
          },
        ]
      : []),
    ...(pane.todoLaneId
      ? [
          {
            id: `todo-${pane.id}`,
            type: 'todo_lane',
            paneId: pane.id,
            createdAt: pane.updatedAt,
            todoLaneId: pane.todoLaneId,
          },
        ]
      : []),
  ])
  const subagentEvents = subagents.map(subagent => ({
    id: `subagent-${subagent.id}`,
    type: 'subagent_status',
    paneId: subagent.paneId,
    createdAt: subagent.updatedAt,
    subagentId: subagent.id,
    title: subagent.title,
    status: subagent.status,
    summary: subagent.summary,
    model: subagent.model,
    kind: subagent.kind,
  }))

  return {
    sessionId: String(getSessionId()),
    activePaneId: state.sessionTabs.activeTabId,
    events: [...events, ...subagentEvents].sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt)),
    ),
  }
}

function writeJson(
  res: ServerResponse,
  statusCode: number,
  body: unknown,
): void {
  res.statusCode = statusCode
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body, null, 2))
}

function writeHtml(res: ServerResponse, statusCode: number, body: string): void {
  res.statusCode = statusCode
  res.setHeader('content-type', 'text/html; charset=utf-8')
  res.end(body)
}

function renderWorkspaceHtmlShell(state: AppState): string {
  const activePaneId = state.sessionTabs.activeTabId
  const baseUrl = getWorkspaceApiBaseUrl()
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Like Code Workspace</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #08111f;
        --panel: #0f1b2e;
        --panel-2: #12243b;
        --line: #25415e;
        --text: #e9f2ff;
        --muted: #95a9c5;
        --blue: #58b2ff;
        --cyan: #56e0ff;
        --green: #6ee7a8;
        --orange: #ff9a62;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        background:
          radial-gradient(circle at top left, rgba(88,178,255,0.18), transparent 30%),
          radial-gradient(circle at top right, rgba(86,224,255,0.14), transparent 25%),
          var(--bg);
        color: var(--text);
      }
      .shell {
        max-width: 1440px;
        margin: 0 auto;
        padding: 24px;
      }
      .hero, .grid > section {
        background: linear-gradient(180deg, rgba(18,36,59,0.96), rgba(9,20,33,0.96));
        border: 1px solid var(--line);
        border-radius: 18px;
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.28);
      }
      .hero {
        padding: 22px 24px;
        margin-bottom: 18px;
      }
      .eyebrow {
        color: var(--cyan);
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h1 {
        margin: 10px 0 8px;
        font-size: clamp(28px, 4vw, 48px);
        line-height: 1.05;
      }
      .hero p, .meta {
        color: var(--muted);
      }
      .meta strong { color: var(--text); }
      .hero-links {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 14px;
      }
      .pill {
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(88,178,255,0.1);
        color: var(--text);
        text-decoration: none;
      }
      .grid {
        display: grid;
        grid-template-columns: 320px minmax(0, 1fr) 360px;
        gap: 18px;
      }
      section { padding: 16px; min-height: 420px; }
      h2 {
        margin: 0 0 14px;
        font-size: 15px;
        color: var(--cyan);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .list {
        display: grid;
        gap: 10px;
      }
      .card {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255,255,255,0.02);
        padding: 12px;
        cursor: pointer;
      }
      .card.active {
        border-color: var(--blue);
        box-shadow: inset 0 0 0 1px rgba(88,178,255,0.25);
      }
      .row {
        display: flex;
        gap: 10px;
        justify-content: space-between;
        align-items: center;
      }
      .label { color: var(--muted); font-size: 12px; }
      .value { color: var(--text); }
      .status {
        color: var(--green);
        font-size: 12px;
        text-transform: uppercase;
      }
      .status.waiting { color: var(--orange); }
      .status.failed, .status.error, .status.killed { color: #ff7b7b; }
      .transcript {
        display: grid;
        gap: 12px;
        max-height: 44vh;
        overflow: auto;
        padding-right: 4px;
      }
      .cards {
        display: grid;
        gap: 10px;
        max-height: 24vh;
        overflow: auto;
        margin-bottom: 14px;
      }
      .turns {
        display: grid;
        gap: 10px;
        max-height: 18vh;
        overflow: auto;
        margin-bottom: 14px;
      }
      .toolpairs {
        display: grid;
        gap: 10px;
        max-height: 18vh;
        overflow: auto;
        margin-bottom: 14px;
      }
      .toolchains {
        display: grid;
        gap: 10px;
        max-height: 18vh;
        overflow: auto;
        margin-bottom: 14px;
      }
      .message {
        border-left: 3px solid var(--line);
        padding: 10px 12px;
        background: rgba(255,255,255,0.02);
        border-radius: 10px;
      }
      .message.user { border-left-color: var(--blue); }
      .message.assistant { border-left-color: var(--green); }
      .message.system { border-left-color: var(--orange); }
      .message .summary {
        margin-top: 6px;
        white-space: pre-wrap;
        line-height: 1.5;
      }
      .event-list {
        display: grid;
        gap: 10px;
        max-height: 34vh;
        overflow: auto;
      }
      .event, .subagent, .cardflow, .stage {
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 10px 12px;
        background: rgba(255,255,255,0.02);
      }
      .cardflow.thinking { border-color: rgba(255,154,98,0.5); }
      .cardflow.tool_use { border-color: rgba(86,224,255,0.5); }
      .cardflow.tool_result { border-color: rgba(110,231,168,0.5); }
      .stages {
        display: grid;
        gap: 10px;
        max-height: 18vh;
        overflow: auto;
        margin-bottom: 14px;
      }
      .stage.prompt { border-color: rgba(88,178,255,0.5); }
      .stage.thinking { border-color: rgba(255,154,98,0.5); }
      .stage.tool { border-color: rgba(86,224,255,0.5); }
      .stage.response { border-color: rgba(110,231,168,0.5); }
      .muted { color: var(--muted); }
      .small { font-size: 12px; }
      @media (max-width: 1100px) {
        .grid { grid-template-columns: 1fr; }
        section { min-height: auto; }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="hero">
        <div class="eyebrow">Like Code localhost workspace</div>
        <h1>Session / Pane / Transcript / Events 工作台</h1>
        <p>这里不再只是 API 索引，而是直接把当前 session、pane、transcript、subagent 和 workflow 事件结构化地展示出来。</p>
        <div class="meta">
          当前活跃 pane: <strong id="active-pane">${activePaneId}</strong>
          <span class="muted"> · 数据来自当前 CLI 内存态 AppState 与 session pane 快照</span>
        </div>
        <div class="hero-links">
          <a class="pill" href="${baseUrl}/api/sessions/current" target="_blank" rel="noreferrer">Session JSON</a>
          <a class="pill" href="${baseUrl}/api/sessions/current/panes" target="_blank" rel="noreferrer">Pane JSON</a>
          <a class="pill" href="${baseUrl}/api/sessions/current/events" target="_blank" rel="noreferrer">Events JSON</a>
          <a class="pill" href="${baseUrl}/api/sessions/current/subagents" target="_blank" rel="noreferrer">Subagents JSON</a>
        </div>
      </div>
      <div class="grid">
        <section>
          <h2>Panes</h2>
          <div id="panes" class="list"></div>
        </section>
        <section>
          <h2>Transcript</h2>
          <div id="transcript-meta" class="small muted"></div>
          <h2 style="margin-top:16px;">Turn Replay</h2>
          <div id="turns" class="turns"></div>
          <h2 style="margin-top:16px;">Tool Chains</h2>
          <div id="toolchains" class="toolchains"></div>
          <h2 style="margin-top:16px;">Tool Pairs</h2>
          <div id="toolpairs" class="toolpairs"></div>
          <h2 style="margin-top:16px;">Stages</h2>
          <div id="stages" class="stages"></div>
          <h2 style="margin-top:16px;">Thinking / Tools</h2>
          <div id="cards" class="cards"></div>
          <div id="transcript" class="transcript"></div>
        </section>
        <section>
          <h2>Subagents</h2>
          <div id="subagents" class="list"></div>
          <h2 style="margin-top:16px;">Events</h2>
          <div id="events" class="event-list"></div>
        </section>
      </div>
    </div>
    <script>
      const state = { activePaneId: ${JSON.stringify(activePaneId)} };

      function escapeHtml(value) {
        return String(value ?? '')
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      }

      function statusClass(status) {
        return String(status || '').toLowerCase();
      }

      async function fetchJson(path) {
        const res = await fetch(path);
        if (!res.ok) throw new Error(path + ' -> ' + res.status);
        return res.json();
      }

      function renderPanes(panes) {
        const root = document.getElementById('panes');
        root.innerHTML = panes.map(pane => \`
          <div class="card \${pane.id === state.activePaneId ? 'active' : ''}" data-pane-id="\${escapeHtml(pane.id)}">
            <div class="row">
              <strong>\${escapeHtml(pane.title)}</strong>
              <span class="status \${statusClass(pane.status)}">\${escapeHtml(pane.status)}</span>
            </div>
            <div class="small muted">pane: \${escapeHtml(pane.id)} · transcript: \${escapeHtml(pane.transcriptId)}</div>
            <div class="small" style="margin-top:6px;">\${escapeHtml(pane.model || 'unknown model')} · \${escapeHtml(pane.provider || 'unknown provider')}</div>
            <div class="small muted" style="margin-top:6px;">todo lane: \${escapeHtml(pane.todoLaneId || 'not bound yet')}</div>
            <div class="small" style="margin-top:8px;">\${escapeHtml(pane.taskSummary || pane.draftPreview || 'No task summary yet')}</div>
          </div>
        \`).join('');
        root.querySelectorAll('[data-pane-id]').forEach(node => {
          node.addEventListener('click', () => {
            state.activePaneId = node.getAttribute('data-pane-id');
            document.getElementById('active-pane').textContent = state.activePaneId;
            refresh();
          });
        });
      }

      function renderTranscript(payload) {
        const meta = document.getElementById('transcript-meta');
        const turnsRoot = document.getElementById('turns');
        const toolChainsRoot = document.getElementById('toolchains');
        const toolPairsRoot = document.getElementById('toolpairs');
        const stagesRoot = document.getElementById('stages');
        const cardsRoot = document.getElementById('cards');
        const root = document.getElementById('transcript');
        meta.textContent = 'pane ' + payload.paneId + ' · transcript ' + payload.transcriptId + ' · ' + payload.messages.length + ' messages · ' + (payload.workflow || []).length + ' workflow events';
        turnsRoot.innerHTML = (payload.turns || []).length === 0
          ? '<div class="muted">No turn replay extracted yet.</div>'
          : payload.turns.slice(-8).reverse().map(turn => \`
              <div class="stage response">
                <div class="row">
                  <strong>\${escapeHtml(turn.id)}</strong>
                  <span class="small muted">\${escapeHtml(turn.startedAt || '')}</span>
                </div>
                <div class="small muted">tools: \${escapeHtml(turn.toolCount || 0)} · events: \${escapeHtml(turn.eventCount || 0)}</div>
                <div class="summary">\${escapeHtml(turn.promptSummary || '[No prompt summary]')}</div>
                \${turn.responseSummary ? '<div class="small muted" style="margin-top:6px;">response: ' + escapeHtml(turn.responseSummary) + '</div>' : ''}
              </div>
            \`).join('');
        toolChainsRoot.innerHTML = (payload.toolChains || []).length === 0
          ? '<div class="muted">No tool chains extracted yet.</div>'
          : payload.toolChains.map(chain => \`
              <div class="cardflow tool_result">
                <div class="row">
                  <strong>\${escapeHtml(chain.toolName)}</strong>
                  <span class="small muted">\${escapeHtml(chain.pairCount || 0)} pairs</span>
                </div>
                <div class="small muted">turns: \${escapeHtml((chain.turnIds || []).join(', ') || 'n/a')}</div>
                <div class="small muted" style="margin-top:6px;">pairs: \${escapeHtml((chain.pairIds || []).join(', '))}</div>
                \${(chain.turnSummaries || []).length > 0 ? '<div class="small muted" style="margin-top:6px;">replay: ' + escapeHtml(chain.turnSummaries.map(turn => turn.turnId + ': ' + (turn.promptSummary || '[prompt]')).join(' → ')) + '</div>' : ''}
                \${(chain.steps || []).length > 0 ? '<div class="small muted" style="margin-top:6px;">steps: ' + escapeHtml(chain.steps.slice(-4).map(step => (step.turnId || 'turn?') + ' [' + step.pairId + '] ' + (step.inputSummary || '[input]') + (step.outputSummary ? ' => ' + step.outputSummary : '')).join(' → ')) + '</div>' : ''}
              </div>
            \`).join('');
        toolPairsRoot.innerHTML = (payload.toolPairs || []).length === 0
          ? '<div class="muted">No tool pairs extracted yet.</div>'
          : payload.toolPairs.slice(-12).reverse().map(pair => \`
              <div class="cardflow tool_use">
                <div class="row">
                  <strong>\${escapeHtml(pair.toolName || pair.toolUseId || 'tool')}</strong>
                  <span class="small muted">\${escapeHtml(pair.startedAt || '')}</span>
                </div>
                <div class="small muted">turn: \${escapeHtml(pair.turnId || 'unbound')} · toolUseId: \${escapeHtml(pair.toolUseId || 'n/a')}</div>
                \${pair.chainId ? '<div class="small muted" style="margin-top:6px;">chain: ' + escapeHtml(pair.chainId) + (pair.chainIndex ? ' · step ' + escapeHtml(pair.chainIndex) : '') + '</div>' : ''}
                \${pair.previousPairId ? '<div class="small muted" style="margin-top:6px;">previous: ' + escapeHtml(pair.previousPairId) + '</div>' : ''}
                \${pair.nextPairId ? '<div class="small muted" style="margin-top:6px;">next: ' + escapeHtml(pair.nextPairId) + '</div>' : ''}
                \${pair.inputSummary ? '<div class="small muted" style="margin-top:6px;">input: ' + escapeHtml(pair.inputSummary) + '</div>' : ''}
                \${pair.outputSummary ? '<div class="small muted" style="margin-top:6px;">output: ' + escapeHtml(pair.outputSummary) + '</div>' : ''}
                \${pair.completedAt ? '<div class="small muted" style="margin-top:6px;">completed: ' + escapeHtml(pair.completedAt) + '</div>' : ''}
              </div>
            \`).join('');
        stagesRoot.innerHTML = (payload.stages || []).length === 0
          ? '<div class="muted">No stage nodes extracted yet.</div>'
          : payload.stages.slice(-12).reverse().map(stage => \`
              <div class="stage \${statusClass(stage.stage)}">
                <div class="row">
                  <strong>\${escapeHtml(stage.title || stage.stage)}</strong>
                  <span class="small muted">\${escapeHtml(stage.createdAt || '')}</span>
                </div>
                <div class="small muted">\${escapeHtml(stage.stage)}\${stage.toolName ? ' · ' + escapeHtml(stage.toolName) : ''}</div>
                <div class="summary">\${escapeHtml(stage.summary || '[No stage summary extracted yet]')}</div>
              </div>
            \`).join('');
        cardsRoot.innerHTML = (payload.cards || []).length === 0
          ? '<div class="muted">No thinking/tool cards extracted yet.</div>'
          : payload.cards.slice(-12).reverse().map(card => \`
              <div class="cardflow \${statusClass(card.kind)}">
                <div class="row">
                  <strong>\${escapeHtml(card.title || card.kind)}</strong>
                  <span class="small muted">\${escapeHtml(card.createdAt || '')}</span>
                </div>
                <div class="small muted">\${escapeHtml(card.kind)}\${card.toolName ? ' · ' + escapeHtml(card.toolName) : ''}\${card.toolUseId ? ' · ' + escapeHtml(card.toolUseId) : ''}</div>
                \${card.inputSummary ? '<div class="small muted" style="margin-top:6px;">input: ' + escapeHtml(card.inputSummary) + '</div>' : ''}
                \${card.outputSummary ? '<div class="small muted" style="margin-top:6px;">output: ' + escapeHtml(card.outputSummary) + '</div>' : ''}
                <div class="summary">\${escapeHtml(card.summary || '[No summary extracted yet]')}</div>
              </div>
            \`).join('');
        root.innerHTML = payload.messages.length === 0
          ? '<div class="muted">This pane has no transcript snapshot yet.</div>'
          : payload.messages.map(message => \`
              <div class="message \${statusClass(message.role || message.type)}">
                <div class="row">
                  <strong>\${escapeHtml(message.role || message.type)}</strong>
                  <span class="small muted">\${escapeHtml(message.createdAt || '')}</span>
                </div>
                <div class="summary">\${escapeHtml(message.summary || '[No summary extracted yet]')}</div>
              </div>
            \`).join('');
      }

      function renderSubagents(items) {
        const root = document.getElementById('subagents');
        root.innerHTML = items.length === 0
          ? '<div class="muted">No live subagents detected in current AppState.</div>'
          : items.map(item => \`
              <div class="subagent">
                <div class="row">
                  <strong>\${escapeHtml(item.title)}</strong>
                  <span class="status \${statusClass(item.status)}">\${escapeHtml(item.status)}</span>
                </div>
                <div class="small muted">kind: \${escapeHtml(item.kind)} · pane: \${escapeHtml(item.paneId || 'unbound')}</div>
                <div class="small" style="margin-top:6px;">\${escapeHtml(item.summary || 'No summary yet')}</div>
                <div class="small muted" style="margin-top:6px;">messages: \${escapeHtml(item.messageCount || 0)} · model: \${escapeHtml(item.model || 'n/a')}</div>
                <div class="small muted" style="margin-top:6px;">last activity: \${escapeHtml(item.lastActivity || 'n/a')}</div>
              </div>
            \`).join('');
      }

      function renderEvents(events) {
        const root = document.getElementById('events');
        root.innerHTML = events.length === 0
          ? '<div class="muted">No events yet.</div>'
          : events.slice(0, 30).map(event => \`
              <div class="event">
                <div class="row">
                  <strong>\${escapeHtml(event.type)}</strong>
                  <span class="small muted">\${escapeHtml(event.createdAt || '')}</span>
                </div>
                <div class="small muted">pane: \${escapeHtml(event.paneId || 'session')}</div>
                <div class="small" style="margin-top:6px;">\${escapeHtml(event.title || event.summary || event.model || '')}</div>
              </div>
            \`).join('');
      }

      async function refresh() {
        const [sessionRes, panesRes, eventsRes, subagentsRes] = await Promise.all([
          fetchJson('/api/sessions/current'),
          fetchJson('/api/sessions/current/panes'),
          fetchJson('/api/sessions/current/events'),
          fetchJson('/api/sessions/current/subagents')
        ]);
        const panes = panesRes.panes || [];
        if (!panes.some(pane => pane.id === state.activePaneId) && panes[0]) {
          state.activePaneId = panes[0].id;
        }
        renderPanes(panes);
        renderSubagents(subagentsRes.subagents || []);
        const transcript = await fetchJson('/api/sessions/current/panes/' + encodeURIComponent(state.activePaneId) + '/transcript');
        renderEvents([...(transcript.workflow || []).slice(-24).reverse(), ...(eventsRes.events || []).slice(0, 12)]);
        renderTranscript(transcript);
      }

      refresh().catch(error => {
        document.body.insertAdjacentHTML('beforeend', '<pre style="color:#ff9d9d;padding:16px;">' + escapeHtml(error.message) + '</pre>');
      });
      setInterval(() => refresh().catch(() => {}), 2500);
    </script>
  </body>
</html>`
}

function handleWorkspaceRequest(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  const method = req.method ?? 'GET'
  if (method !== 'GET') {
    writeJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  const state = latestSnapshot
  if (!state) {
    writeJson(res, 503, { error: 'workspace_snapshot_unavailable' })
    return
  }

  const url = new URL(req.url ?? '/', getWorkspaceApiBaseUrl())
  const pathname = url.pathname

  if (pathname === '/') {
    writeHtml(res, 200, renderWorkspaceHtmlShell(state))
    return
  }

  if (pathname === '/api/sessions') {
    writeJson(res, 200, { sessions: [buildSessionSummary(state)] })
    return
  }

  if (pathname === '/api/sessions/current') {
    writeJson(res, 200, {
      session: {
        ...buildSessionSummary(state),
        panes: buildPaneSummary(state),
      },
    })
    return
  }

  if (pathname === '/api/sessions/current/panes') {
    writeJson(res, 200, { panes: buildPaneSummary(state) })
    return
  }

  if (pathname === '/api/sessions/current/events') {
    writeJson(res, 200, buildEventsPayload(state))
    return
  }

  if (pathname === '/api/sessions/current/subagents') {
    writeJson(res, 200, {
      transport:
        'Current Web UI subagent data is derived from live AppState.tasks plus pane bindings in sessionTabs.',
      subagents: buildSubagentSummaries(state),
    })
    return
  }

  const transcriptMatch = pathname.match(
    /^\/api\/sessions\/current\/panes\/([^/]+)\/transcript$/,
  )
  if (transcriptMatch) {
    const paneId = decodeURIComponent(transcriptMatch[1] ?? '')
    const transcript = buildTranscriptPayload(state, paneId)
    if (!transcript) {
      writeJson(res, 404, { error: 'pane_not_found', paneId })
      return
    }
    writeJson(res, 200, transcript)
    return
  }

  writeJson(res, 404, { error: 'not_found', path: pathname })
}

export function startWorkspaceApiServer(): void {
  if (serverStarted) return
  serverStarted = true

  const server = createServer(handleWorkspaceRequest)
  server.listen(getWorkspaceApiPort(), '127.0.0.1')
  server.on('error', () => {
    // Keep startup resilient. If the port is occupied, CLI should still work.
  })

  registerCleanup(async () => {
    await new Promise<void>(resolve => {
      server.close(() => resolve())
    })
  })
}
