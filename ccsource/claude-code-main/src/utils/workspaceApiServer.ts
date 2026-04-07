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
    kind: 'tool_use' | 'progress' | 'tool_result'
    pairId: string
    toolUseId?: string
    turnId?: string
    startedAt: string
    completedAt?: string
    title?: string
    summary?: string
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

function summarizeProgressData(data: unknown): {
  toolName?: string
  progressType?: string
  summary?: string
} {
  if (!data || typeof data !== 'object') {
    return { summary: summarizeUnknown(data) }
  }

  const record = data as Record<string, unknown>
  return {
    toolName:
      getStringValue(record.toolName) ??
      getStringValue(record.tool_name) ??
      getStringValue(record.name),
    progressType:
      getStringValue(record.type) ?? getStringValue(record.subtype),
    summary:
      getStringValue(record.message) ??
      getStringValue(record.output) ??
      getStringValue(record.stdout) ??
      summarizeUnknown(record.fullOutput) ??
      getStringValue(record.status) ??
      getStringValue(record.hookEvent) ??
      summarizeUnknown(data),
  }
}

function buildTranscriptArtifacts(messages: Message[] | undefined, paneId: string) {
  const cards: WorkspaceTranscriptCard[] = []
  const workflow: WorkspaceWorkflowEvent[] = []
  const stages: WorkspaceWorkflowStage[] = []
  const toolPairs = new Map<string, WorkspaceToolPair>()
  const toolPairSteps = new Map<
    string,
    Array<WorkspaceToolChain['steps'][number]>
  >()
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
    const progressData =
      message.type === 'progress' && 'data' in message
        ? summarizeProgressData((message as Record<string, unknown>).data)
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
      const progressTitle = `${progressData?.toolName ?? 'tool'} progress`
      const existingPair = toolPairs.get(parentToolUseId)
      if (!existingPair) {
        toolPairs.set(parentToolUseId, {
          id: parentToolUseId,
          paneId,
          turnId: activeTurnId,
          toolUseId: parentToolUseId,
          toolName:
            progressData?.toolName ??
            progressData?.progressType ??
            undefined,
          inputSummary: undefined,
          outputSummary: summary,
          startedAt: createdAt,
          completedAt: undefined,
        })
      } else if (
        !existingPair.outputSummary ||
        !existingPair.toolName
      ) {
        toolPairs.set(parentToolUseId, {
          ...existingPair,
          toolName:
            existingPair.toolName ??
            progressData?.toolName ??
            progressData?.progressType,
          outputSummary: existingPair.outputSummary ?? summary,
        })
      }

      cards.push({
        id: `${message.uuid}-progress-tool`,
        kind: 'progress',
        title: progressTitle,
        summary: progressData?.summary ?? summary,
        role,
        toolName: progressData?.toolName,
        toolUseId: parentToolUseId,
        createdAt,
      })
      const existingSteps = toolPairSteps.get(parentToolUseId) ?? []
      toolPairSteps.set(parentToolUseId, [
        ...existingSteps,
        {
          kind: 'progress',
          pairId: parentToolUseId,
          toolUseId: parentToolUseId,
          turnId: existingPair?.turnId ?? activeTurnId,
          startedAt: createdAt,
          title: progressTitle,
          summary: progressData?.summary ?? summary,
          outputSummary: progressData?.summary ?? summary,
        },
      ])
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
            const existingSteps = toolPairSteps.get(toolUseId) ?? []
            toolPairSteps.set(toolUseId, [
              ...existingSteps,
              {
                kind: 'tool_use',
                pairId: toolUseId,
                toolUseId,
                turnId: activeTurnId,
                startedAt: createdAt,
                title: toolName,
                summary: toolSummary,
                inputSummary: toolSummary,
              },
            ])
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
            const existingSteps = toolPairSteps.get(toolUseId) ?? []
            toolPairSteps.set(toolUseId, [
              ...existingSteps,
              {
                kind: 'tool_result',
                pairId: toolUseId,
                toolUseId,
                turnId: existingPair?.turnId ?? activeTurnId,
                startedAt: existingPair?.startedAt ?? createdAt,
                completedAt: createdAt,
                title: existingPair?.toolName ?? 'tool result',
                summary: resultSummary,
                outputSummary: resultSummary,
              },
            ])
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
    const pairSteps = (toolPairSteps.get(pair.id) ?? []).map(step => ({
      ...step,
      promptSummary: step.turnId
        ? turnsById.get(step.turnId)?.promptSummary
        : undefined,
      responseSummary: step.turnId
        ? turnsById.get(step.turnId)?.responseSummary
        : undefined,
    }))
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
      existingChain.steps.push(
        ...(pairSteps.length > 0
          ? pairSteps
          : [
              {
                kind: 'tool_result' as const,
                pairId: pair.id,
                toolUseId: pair.toolUseId,
                turnId: pair.turnId,
                startedAt: pair.startedAt,
                completedAt: pair.completedAt,
                title: pair.toolName,
                inputSummary: pair.inputSummary,
                outputSummary: pair.outputSummary,
                promptSummary: pair.turnId
                  ? turnsById.get(pair.turnId)?.promptSummary
                  : undefined,
                responseSummary: pair.turnId
                  ? turnsById.get(pair.turnId)?.responseSummary
                  : undefined,
              },
            ]),
      )
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
          ...(pairSteps.length > 0
            ? pairSteps
            : [
                {
                  kind: 'tool_result' as const,
                  pairId: pair.id,
                  toolUseId: pair.toolUseId,
                  turnId: pair.turnId,
                  startedAt: pair.startedAt,
                  completedAt: pair.completedAt,
                  title: pair.toolName,
                  inputSummary: pair.inputSummary,
                  outputSummary: pair.outputSummary,
                  promptSummary: pair.turnId
                    ? turnsById.get(pair.turnId)?.promptSummary
                    : undefined,
                  responseSummary: pair.turnId
                    ? turnsById.get(pair.turnId)?.responseSummary
                    : undefined,
                },
              ]),
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
        --bg: #06101b;
        --bg-soft: #0a1625;
        --panel: rgba(12, 24, 39, 0.88);
        --panel-strong: rgba(14, 30, 49, 0.96);
        --panel-muted: rgba(8, 17, 29, 0.92);
        --line: rgba(109, 170, 228, 0.16);
        --line-strong: rgba(109, 170, 228, 0.34);
        --text: #ebf4ff;
        --muted: #8ba6c6;
        --muted-2: #6883a1;
        --blue: #59b2ff;
        --blue-2: #2f8cff;
        --cyan: #62e2ff;
        --green: #78efb4;
        --orange: #ffb16f;
        --red: #ff7c89;
        --shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
        --radius: 22px;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "SF Pro Display", "Segoe UI", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background:
          radial-gradient(circle at 8% 12%, rgba(89,178,255,0.22), transparent 28%),
          radial-gradient(circle at 88% 8%, rgba(98,226,255,0.16), transparent 24%),
          radial-gradient(circle at 50% 100%, rgba(120,239,180,0.08), transparent 28%),
          var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell {
        max-width: 1580px;
        margin: 0 auto;
        padding: 28px 24px 44px;
      }
      .hero, .grid > section {
        background: linear-gradient(180deg, var(--panel-strong), var(--panel-muted));
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        backdrop-filter: blur(12px);
      }
      .hero {
        padding: 26px 28px;
        margin-bottom: 20px;
      }
      .hero-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
        gap: 20px;
        align-items: start;
      }
      .eyebrow {
        color: var(--cyan);
        font-size: 11px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-weight: 700;
      }
      h1 {
        margin: 12px 0 10px;
        font-size: clamp(30px, 5vw, 54px);
        line-height: 0.98;
        letter-spacing: -0.04em;
      }
      .hero p, .meta {
        color: var(--muted);
        line-height: 1.65;
      }
      .meta strong { color: var(--text); }
      .hero-copy {
        max-width: 780px;
      }
      .hero-panel {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 16px 18px;
        background:
          linear-gradient(180deg, rgba(89,178,255,0.08), rgba(98,226,255,0.03)),
          rgba(255,255,255,0.02);
      }
      .hero-panel h3 {
        margin: 0 0 10px;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--cyan);
      }
      .hero-panel pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        color: var(--text);
        font-size: 13px;
        line-height: 1.55;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .hero-links {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 18px;
      }
      .pill {
        padding: 9px 13px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(89,178,255,0.1);
        color: var(--text);
        text-decoration: none;
        transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
      }
      .pill:hover { transform: translateY(-1px); border-color: var(--line-strong); background: rgba(89,178,255,0.14); }
      .hero-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-top: 18px;
      }
      .metric {
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 14px 15px;
        background: rgba(255,255,255,0.02);
      }
      .metric .k {
        color: var(--muted);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .metric .v {
        margin-top: 10px;
        font-size: 28px;
        line-height: 1;
        font-weight: 700;
        letter-spacing: -0.04em;
      }
      .metric .sub {
        margin-top: 8px;
        color: var(--muted);
        font-size: 12px;
      }
      .grid {
        display: grid;
        grid-template-columns: 300px minmax(0, 1.2fr) 360px;
        gap: 18px;
      }
      section { padding: 18px; min-height: 420px; }
      h2 {
        margin: 0 0 14px;
        font-size: 12px;
        color: var(--cyan);
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-weight: 700;
      }
      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 14px;
      }
      .section-note {
        color: var(--muted);
        font-size: 12px;
      }
      .list {
        display: grid;
        gap: 10px;
      }
      .card {
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255,255,255,0.025);
        padding: 14px;
        cursor: pointer;
        transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
      }
      .card:hover { transform: translateY(-1px); border-color: var(--line-strong); background: rgba(255,255,255,0.04); }
      .card.active {
        border-color: var(--blue);
        box-shadow: inset 0 0 0 1px rgba(89,178,255,0.25), 0 0 0 1px rgba(89,178,255,0.16);
        background: linear-gradient(180deg, rgba(89,178,255,0.1), rgba(255,255,255,0.03));
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
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .status.waiting { color: var(--orange); }
      .status.failed, .status.error, .status.killed { color: var(--red); }
      .split {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 14px;
      }
      .subsection {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 14px;
        background: rgba(255,255,255,0.018);
      }
      .subsection-title {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
      }
      .subsection-title strong {
        font-size: 15px;
        letter-spacing: -0.02em;
      }
      .transcript {
        display: grid;
        gap: 12px;
        max-height: 38vh;
        overflow: auto;
        padding-right: 4px;
      }
      .cards {
        display: grid;
        gap: 10px;
        max-height: 26vh;
        overflow: auto;
      }
      .turns {
        display: grid;
        gap: 10px;
        max-height: 26vh;
        overflow: auto;
      }
      .toolpairs {
        display: grid;
        gap: 10px;
        max-height: 26vh;
        overflow: auto;
      }
      .toolchains {
        display: grid;
        gap: 10px;
        max-height: 26vh;
        overflow: auto;
      }
      .message {
        border-left: 3px solid var(--line);
        padding: 12px 14px;
        background: rgba(255,255,255,0.028);
        border-radius: 14px;
      }
      .message.user { border-left-color: var(--blue); }
      .message.assistant { border-left-color: var(--green); }
      .message.system { border-left-color: var(--orange); }
      .message .summary {
        margin-top: 6px;
        white-space: pre-wrap;
        line-height: 1.6;
      }
      .event-list {
        display: grid;
        gap: 10px;
        max-height: 36vh;
        overflow: auto;
      }
      .event, .subagent, .cardflow, .stage {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 12px 13px;
        background: rgba(255,255,255,0.024);
      }
      .cardflow.thinking { border-color: rgba(255,154,98,0.5); }
      .cardflow.tool_use { border-color: rgba(86,224,255,0.5); }
      .cardflow.tool_result { border-color: rgba(110,231,168,0.5); }
      .stages {
        display: grid;
        gap: 10px;
        max-height: 26vh;
        overflow: auto;
      }
      .stage.prompt { border-color: rgba(88,178,255,0.5); }
      .stage.thinking { border-color: rgba(255,154,98,0.5); }
      .stage.tool { border-color: rgba(86,224,255,0.5); }
      .stage.response { border-color: rgba(110,231,168,0.5); }
      .muted { color: var(--muted); }
      .small { font-size: 12px; line-height: 1.55; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .badge-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 8px;
      }
      .badge {
        border-radius: 999px;
        padding: 5px 8px;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--line);
        color: var(--muted);
        font-size: 11px;
      }
      .empty {
        padding: 16px;
        border: 1px dashed var(--line);
        border-radius: 14px;
        color: var(--muted);
        background: rgba(255,255,255,0.015);
      }
      .rail {
        display: grid;
        gap: 14px;
      }
      .scroll {
        padding-right: 4px;
        overflow: auto;
      }
      @media (max-width: 1280px) {
        .hero-grid {
          grid-template-columns: 1fr;
        }
        .hero-stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 1100px) {
        .grid { grid-template-columns: 1fr; }
        section { min-height: auto; }
        .hero-stats {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="hero">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="eyebrow">Like Code localhost workspace</div>
            <h1>Session Workflow Console</h1>
            <p>把当前 session、pane、transcript、subagent 和 workflow 事件收成一个可长期观察的控制台，而不是把原始 JSON 直接堆在浏览器里。</p>
            <div class="meta">
              当前活跃 pane: <strong id="active-pane">${activePaneId}</strong>
              <span class="muted"> · 数据直接来自当前 CLI 内存态 AppState 与 pane transcript 快照</span>
            </div>
            <div class="hero-links">
              <a class="pill" href="${baseUrl}/api/sessions/current" target="_blank" rel="noreferrer">Session JSON</a>
              <a class="pill" href="${baseUrl}/api/sessions/current/panes" target="_blank" rel="noreferrer">Pane JSON</a>
              <a class="pill" href="${baseUrl}/api/sessions/current/events" target="_blank" rel="noreferrer">Events JSON</a>
              <a class="pill" href="${baseUrl}/api/sessions/current/subagents" target="_blank" rel="noreferrer">Subagents JSON</a>
            </div>
          </div>
          <div class="hero-panel">
            <h3>Workspace Notes</h3>
            <pre>Focus pane: ${activePaneId}
Sync loop: 2500ms refresh
Source: CLI memory snapshot
Mode: session / pane / transcript / workflow</pre>
          </div>
        </div>
        <div class="hero-stats">
          <div class="metric">
            <div class="k">Active Pane</div>
            <div class="v" id="metric-active-pane">1</div>
            <div class="sub">当前聚焦中的任务窗口</div>
          </div>
          <div class="metric">
            <div class="k">Visible Panes</div>
            <div class="v" id="metric-pane-count">0</div>
            <div class="sub">当前 session 内的 pane 数量</div>
          </div>
          <div class="metric">
            <div class="k">Workflow Events</div>
            <div class="v" id="metric-event-count">0</div>
            <div class="sub">当前 pane 已提取的 workflow 节点</div>
          </div>
          <div class="metric">
            <div class="k">Live Subagents</div>
            <div class="v" id="metric-subagent-count">0</div>
            <div class="sub">当前 AppState 里可见的子代理</div>
          </div>
        </div>
      </div>
      <div class="grid">
        <section>
          <div class="section-head">
            <h2>Panes</h2>
            <div class="section-note" id="pane-summary-note">Task map</div>
          </div>
          <div id="panes" class="list"></div>
        </section>
        <section>
          <div class="section-head">
            <h2>Workflow View</h2>
            <div id="transcript-meta" class="section-note mono"></div>
          </div>
          <div class="split">
            <div class="subsection">
              <div class="subsection-title">
                <strong>Turn Replay</strong>
                <span class="section-note">Prompt → Tool → Response</span>
              </div>
              <div id="turns" class="turns scroll"></div>
            </div>
            <div class="subsection">
              <div class="subsection-title">
                <strong>Tool Chains</strong>
                <span class="section-note">Cross-turn tool flow</span>
              </div>
              <div id="toolchains" class="toolchains scroll"></div>
            </div>
            <div class="subsection">
              <div class="subsection-title">
                <strong>Tool Pairs</strong>
                <span class="section-note">Use / result pairing</span>
              </div>
              <div id="toolpairs" class="toolpairs scroll"></div>
            </div>
            <div class="subsection">
              <div class="subsection-title">
                <strong>Stages</strong>
                <span class="section-note">Prompt / thinking / tool / response</span>
              </div>
              <div id="stages" class="stages scroll"></div>
            </div>
            <div class="subsection">
              <div class="subsection-title">
                <strong>Thinking / Tools</strong>
                <span class="section-note">Card flow</span>
              </div>
              <div id="cards" class="cards scroll"></div>
            </div>
            <div class="subsection">
              <div class="subsection-title">
                <strong>Transcript Messages</strong>
                <span class="section-note">Readable summary stream</span>
              </div>
              <div id="transcript" class="transcript scroll"></div>
            </div>
          </div>
        </section>
        <section>
          <div class="rail">
            <div>
              <div class="section-head">
                <h2>Subagents</h2>
                <div class="section-note" id="subagent-summary-note">Live workers</div>
              </div>
              <div id="subagents" class="list"></div>
            </div>
            <div>
              <div class="section-head">
                <h2>Events</h2>
                <div class="section-note">Recent session signals</div>
              </div>
              <div id="events" class="event-list scroll"></div>
            </div>
          </div>
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

      function formatTime(value) {
        if (!value) return 'n/a';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }

      function shorten(value, max = 160) {
        const text = String(value || '');
        return text.length > max ? text.slice(0, max - 3) + '...' : text;
      }

      async function fetchJson(path) {
        const res = await fetch(path);
        if (!res.ok) throw new Error(path + ' -> ' + res.status);
        return res.json();
      }

      function renderSessionSummary(session, panes, transcript, subagents) {
        document.getElementById('metric-active-pane').textContent = session.activePaneId ? '1' : '0';
        document.getElementById('metric-pane-count').textContent = String((panes || []).length);
        document.getElementById('metric-event-count').textContent = String((transcript?.workflow || []).length);
        document.getElementById('metric-subagent-count').textContent = String((subagents || []).length);
        document.getElementById('pane-summary-note').textContent =
          session.model
            ? 'active model · ' + session.model
            : 'Task map';
        document.getElementById('subagent-summary-note').textContent =
          (subagents || []).length > 0
            ? (subagents || []).length + ' running / recent'
            : 'No live workers';
      }

      function renderPanes(panes) {
        const root = document.getElementById('panes');
        root.innerHTML = panes.map(pane => \`
          <div class="card \${pane.id === state.activePaneId ? 'active' : ''}" data-pane-id="\${escapeHtml(pane.id)}">
            <div class="row">
              <strong>\${escapeHtml(pane.title)}</strong>
              <span class="status \${statusClass(pane.status)}">\${escapeHtml(pane.status)}</span>
            </div>
            <div class="badge-row">
              <span class="badge mono">pane \${escapeHtml(pane.id)}</span>
              <span class="badge mono">\${escapeHtml(pane.model || 'unknown model')}</span>
              <span class="badge mono">\${escapeHtml(pane.provider || 'unknown provider')}</span>
            </div>
            <div class="small muted" style="margin-top:8px;">transcript: \${escapeHtml(pane.transcriptId)} · todo lane: \${escapeHtml(pane.todoLaneId || 'not bound yet')}</div>
            <div class="small" style="margin-top:10px;">\${escapeHtml(shorten(pane.taskSummary || pane.draftPreview || 'No task summary yet', 180))}</div>
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
          ? '<div class="empty">No turn replay extracted yet.</div>'
          : payload.turns.slice(-8).reverse().map(turn => \`
              <div class="stage response">
                <div class="row">
                  <strong>\${escapeHtml(turn.id)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(turn.startedAt || ''))}</span>
                </div>
                <div class="small muted">tools: \${escapeHtml(turn.toolCount || 0)} · events: \${escapeHtml(turn.eventCount || 0)}</div>
                <div class="summary">\${escapeHtml(shorten(turn.promptSummary || '[No prompt summary]', 240))}</div>
                \${turn.responseSummary ? '<div class="small muted" style="margin-top:8px;">response: ' + escapeHtml(shorten(turn.responseSummary, 220)) + '</div>' : ''}
              </div>
            \`).join('');
        toolChainsRoot.innerHTML = (payload.toolChains || []).length === 0
          ? '<div class="empty">No tool chains extracted yet.</div>'
          : payload.toolChains.map(chain => \`
              <div class="cardflow tool_result">
                <div class="row">
                  <strong>\${escapeHtml(chain.toolName)}</strong>
                  <span class="small muted">\${escapeHtml(chain.pairCount || 0)} pairs</span>
                </div>
                <div class="badge-row">
                  <span class="badge">turns: \${escapeHtml((chain.turnIds || []).length || 0)}</span>
                  <span class="badge">pairs: \${escapeHtml((chain.pairIds || []).length || 0)}</span>
                  <span class="badge mono">\${escapeHtml(chain.id)}</span>
                </div>
                \${(chain.turnSummaries || []).length > 0 ? '<div class="small muted" style="margin-top:10px;">replay: ' + escapeHtml(shorten(chain.turnSummaries.map(turn => turn.turnId + ': ' + (turn.promptSummary || '[prompt]')).join(' → '), 260)) + '</div>' : ''}
                \${(chain.steps || []).length > 0 ? '<div class="small muted" style="margin-top:8px;">steps: ' + escapeHtml(shorten(chain.steps.slice(-6).map(step => '[' + (step.kind || 'step') + '] ' + (step.turnId || 'turn?') + ' ' + (step.summary || step.inputSummary || step.outputSummary || step.title || '[step]')).join(' → '), 300)) + '</div>' : ''}
              </div>
            \`).join('');
        toolPairsRoot.innerHTML = (payload.toolPairs || []).length === 0
          ? '<div class="empty">No tool pairs extracted yet.</div>'
          : payload.toolPairs.slice(-12).reverse().map(pair => \`
              <div class="cardflow tool_use">
                <div class="row">
                  <strong>\${escapeHtml(pair.toolName || pair.toolUseId || 'tool')}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(pair.startedAt || ''))}</span>
                </div>
                <div class="badge-row">
                  <span class="badge">turn: \${escapeHtml(pair.turnId || 'unbound')}</span>
                  <span class="badge mono">\${escapeHtml(pair.toolUseId || 'n/a')}</span>
                  \${pair.chainId ? '<span class="badge">chain ' + escapeHtml(pair.chainIndex || '?') + '</span>' : ''}
                </div>
                \${pair.inputSummary ? '<div class="small muted" style="margin-top:10px;">input: ' + escapeHtml(shorten(pair.inputSummary, 220)) + '</div>' : ''}
                \${pair.outputSummary ? '<div class="small muted" style="margin-top:8px;">output: ' + escapeHtml(shorten(pair.outputSummary, 220)) + '</div>' : ''}
                \${pair.completedAt ? '<div class="small muted" style="margin-top:8px;">completed: ' + escapeHtml(formatTime(pair.completedAt)) + '</div>' : ''}
              </div>
            \`).join('');
        stagesRoot.innerHTML = (payload.stages || []).length === 0
          ? '<div class="empty">No stage nodes extracted yet.</div>'
          : payload.stages.slice(-12).reverse().map(stage => \`
              <div class="stage \${statusClass(stage.stage)}">
                <div class="row">
                  <strong>\${escapeHtml(stage.title || stage.stage)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(stage.createdAt || ''))}</span>
                </div>
                <div class="small muted">\${escapeHtml(stage.stage)}\${stage.toolName ? ' · ' + escapeHtml(stage.toolName) : ''}</div>
                <div class="summary">\${escapeHtml(shorten(stage.summary || '[No stage summary extracted yet]', 220))}</div>
              </div>
            \`).join('');
        cardsRoot.innerHTML = (payload.cards || []).length === 0
          ? '<div class="empty">No thinking/tool cards extracted yet.</div>'
          : payload.cards.slice(-12).reverse().map(card => \`
              <div class="cardflow \${statusClass(card.kind)}">
                <div class="row">
                  <strong>\${escapeHtml(card.title || card.kind)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(card.createdAt || ''))}</span>
                </div>
                <div class="badge-row">
                  <span class="badge">\${escapeHtml(card.kind)}</span>
                  \${card.toolName ? '<span class="badge">' + escapeHtml(card.toolName) + '</span>' : ''}
                  \${card.toolUseId ? '<span class="badge mono">' + escapeHtml(card.toolUseId) + '</span>' : ''}
                </div>
                \${card.inputSummary ? '<div class="small muted" style="margin-top:10px;">input: ' + escapeHtml(shorten(card.inputSummary, 220)) + '</div>' : ''}
                \${card.outputSummary ? '<div class="small muted" style="margin-top:8px;">output: ' + escapeHtml(shorten(card.outputSummary, 220)) + '</div>' : ''}
                <div class="summary">\${escapeHtml(shorten(card.summary || '[No summary extracted yet]', 260))}</div>
              </div>
            \`).join('');
        root.innerHTML = payload.messages.length === 0
          ? '<div class="empty">This pane has no transcript snapshot yet.</div>'
          : payload.messages.map(message => \`
              <div class="message \${statusClass(message.role || message.type)}">
                <div class="row">
                  <strong>\${escapeHtml(message.role || message.type)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(message.createdAt || ''))}</span>
                </div>
                <div class="summary">\${escapeHtml(shorten(message.summary || '[No summary extracted yet]', 320))}</div>
              </div>
            \`).join('');
      }

      function renderSubagents(items) {
        const root = document.getElementById('subagents');
        root.innerHTML = items.length === 0
          ? '<div class="empty">No live subagents detected in current AppState.</div>'
          : items.map(item => \`
              <div class="subagent">
                <div class="row">
                  <strong>\${escapeHtml(item.title)}</strong>
                  <span class="status \${statusClass(item.status)}">\${escapeHtml(item.status)}</span>
                </div>
                <div class="badge-row">
                  <span class="badge">\${escapeHtml(item.kind)}</span>
                  <span class="badge">pane: \${escapeHtml(item.paneId || 'unbound')}</span>
                  <span class="badge mono">\${escapeHtml(item.model || 'n/a')}</span>
                </div>
                <div class="small" style="margin-top:10px;">\${escapeHtml(shorten(item.summary || 'No summary yet', 220))}</div>
                <div class="small muted" style="margin-top:8px;">messages: \${escapeHtml(item.messageCount || 0)} · last activity: \${escapeHtml(shorten(item.lastActivity || 'n/a', 96))}</div>
              </div>
            \`).join('');
      }

      function renderEvents(events) {
        const root = document.getElementById('events');
        root.innerHTML = events.length === 0
          ? '<div class="empty">No events yet.</div>'
          : events.slice(0, 30).map(event => \`
              <div class="event">
                <div class="row">
                  <strong>\${escapeHtml(event.type)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(event.createdAt || ''))}</span>
                </div>
                <div class="badge-row">
                  <span class="badge">pane: \${escapeHtml(event.paneId || 'session')}</span>
                  \${event.stage ? '<span class="badge">' + escapeHtml(event.stage) + '</span>' : ''}
                  \${event.toolName ? '<span class="badge">' + escapeHtml(event.toolName) + '</span>' : ''}
                </div>
                <div class="small" style="margin-top:10px;">\${escapeHtml(shorten(event.title || event.summary || event.model || '', 220))}</div>
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
        renderSessionSummary(sessionRes.session || {}, panes, transcript, subagentsRes.subagents || []);
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
