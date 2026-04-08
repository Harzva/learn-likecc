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
import {
  createWorkspacePane,
  getWorkspaceBridgeSnapshot,
  interruptWorkspaceRun,
  invokeWorkspaceDialogAction,
  submitWorkspacePrompt,
  switchWorkspacePane,
} from './workspaceBridge.js'

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

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)))
  }
  if (chunks.length === 0) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function renderWorkspaceHtmlShell(state: AppState): string {
  const activePaneId = state.sessionTabs.activeTabId
  const baseUrl = getWorkspaceApiBaseUrl()
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Like Code Agent Center</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0d1117;
        --bg-2: #101620;
        --panel: rgba(18, 25, 35, 0.9);
        --panel-2: rgba(23, 31, 44, 0.92);
        --panel-3: rgba(12, 18, 27, 0.92);
        --line: rgba(149, 179, 212, 0.14);
        --line-strong: rgba(149, 179, 212, 0.28);
        --text: #edf3fb;
        --muted: #96a8bf;
        --muted-2: #70839d;
        --accent: #ffbe55;
        --accent-2: #ffd898;
        --blue: #72b8ff;
        --green: #86ddb3;
        --orange: #ffb36b;
        --red: #ff8f90;
        --purple: #b9a3ff;
        --shadow: 0 26px 80px rgba(0, 0, 0, 0.42);
        --radius: 20px;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Avenir Next", "Segoe UI", ui-sans-serif, system-ui, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(114, 184, 255, 0.14), transparent 22%),
          radial-gradient(circle at bottom left, rgba(255, 190, 85, 0.12), transparent 24%),
          linear-gradient(180deg, #0a0f15 0%, #0f141d 100%);
      }
      button, textarea { font: inherit; }
      .app-shell {
        height: 100vh;
        display: grid;
        grid-template-columns: 72px 292px minmax(0, 1fr) 360px;
        gap: 0;
      }
      .activitybar,
      .sidebar,
      .main,
      .inspector {
        min-height: 0;
      }
      .activitybar {
        border-right: 1px solid var(--line);
        background: rgba(9, 13, 20, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
      }
      .activity-top,
      .activity-bottom {
        display: grid;
        gap: 12px;
      }
      .activity-logo,
      .activity-item {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: grid;
        place-items: center;
        border: 1px solid transparent;
        background: rgba(255,255,255,0.03);
        color: var(--muted);
        letter-spacing: 0.04em;
        font-weight: 700;
      }
      .activity-logo {
        background: linear-gradient(180deg, rgba(255,190,85,0.18), rgba(114,184,255,0.15));
        color: var(--text);
      }
      .activity-item.active {
        color: var(--text);
        border-color: var(--line-strong);
        background: rgba(114,184,255,0.12);
        box-shadow: inset 3px 0 0 var(--accent);
      }
      .sidebar {
        border-right: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(14,20,29,0.96), rgba(11,16,24,0.98));
        display: flex;
        flex-direction: column;
      }
      .sidebar-head {
        padding: 18px 18px 12px;
        border-bottom: 1px solid var(--line);
      }
      .eyebrow {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: var(--accent-2);
        font-weight: 700;
      }
      .sidebar-title {
        margin-top: 10px;
        font-size: 22px;
        line-height: 1.15;
        letter-spacing: -0.03em;
      }
      .sidebar-copy {
        margin-top: 10px;
        color: var(--muted);
        line-height: 1.6;
        font-size: 13px;
      }
      .sidebar-search {
        margin-top: 14px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255,255,255,0.03);
        color: var(--muted);
        padding: 11px 12px;
        font-size: 13px;
      }
      .sidebar-scroll {
        flex: 1;
        overflow: auto;
        padding: 14px;
        display: grid;
        gap: 14px;
      }
      .rail-card {
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(255,255,255,0.028);
        padding: 14px;
      }
      .rail-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 12px;
      }
      .rail-head strong {
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent-2);
      }
      .section-note {
        color: var(--muted);
        font-size: 12px;
      }
      .pane-list,
      .subagent-list,
      .event-list {
        display: grid;
        gap: 10px;
      }
      .workspace-tree {
        display: grid;
        gap: 8px;
      }
      details.tree-group {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255,255,255,0.02);
        overflow: hidden;
      }
      details.tree-group summary {
        list-style: none;
        cursor: pointer;
        padding: 11px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      details.tree-group summary::-webkit-details-marker { display: none; }
      .tree-group-body {
        padding: 0 10px 10px;
        display: grid;
        gap: 8px;
      }
      .tree-pill {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: rgba(255,255,255,0.03);
        padding: 10px 11px;
        display: grid;
        gap: 4px;
      }
      .tree-pill[data-pane-id] {
        cursor: pointer;
        transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
      }
      .tree-pill[data-pane-id]:hover {
        transform: translateY(-1px);
        border-color: rgba(255,255,255,0.18);
      }
      .tree-pill.active {
        border-color: rgba(114,184,255,0.36);
        background: rgba(114,184,255,0.09);
      }
      .tree-node {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255,255,255,0.025);
        padding: 11px 12px;
      }
      .tree-node strong {
        font-size: 13px;
      }
      .group-label {
        margin: 2px 0 6px;
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted-2);
      }
      .card,
      .subagent,
      .event,
      .cardflow,
      .stage,
      .turn-card,
      .dialog-card,
      .mini-message {
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255,255,255,0.03);
      }
      .card {
        padding: 14px;
        cursor: pointer;
        transition: background 120ms ease, transform 120ms ease, border-color 120ms ease;
      }
      .card:hover {
        transform: translateY(-1px);
        border-color: var(--line-strong);
        background: rgba(255,255,255,0.04);
      }
      .card.active {
        border-color: rgba(255,190,85,0.42);
        background: linear-gradient(180deg, rgba(255,190,85,0.12), rgba(114,184,255,0.05));
        box-shadow: inset 0 0 0 1px rgba(255,190,85,0.14);
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      .muted { color: var(--muted); }
      .small { font-size: 12px; line-height: 1.55; }
      .badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }
      .badge {
        padding: 5px 8px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.05);
        color: var(--muted);
        font-size: 11px;
      }
      .status {
        color: var(--green);
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 700;
      }
      .status.waiting { color: var(--orange); }
      .status.failed,
      .status.error,
      .status.killed { color: var(--red); }
      .main {
        background:
          linear-gradient(180deg, rgba(17,24,35,0.95), rgba(11,16,24,0.96));
        display: flex;
        flex-direction: column;
      }
      .main-topbar {
        padding: 16px 22px;
        border-bottom: 1px solid var(--line);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .main-title {
        display: grid;
        gap: 4px;
      }
      .main-title strong {
        font-size: 21px;
        letter-spacing: -0.03em;
      }
      .main-title span {
        color: var(--muted);
        font-size: 13px;
      }
      .main-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.04);
        color: var(--text);
        text-decoration: none;
        font-size: 12px;
      }
      .main-body {
        flex: 1;
        min-height: 0;
        padding: 18px 22px 20px;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        gap: 16px;
      }
      .stage-strip {
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(255,255,255,0.03);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
      }
      .stage-strip-main {
        display: grid;
        gap: 8px;
        min-width: 0;
      }
      .stage-strip-title {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .stage-strip-title strong {
        font-size: 18px;
        letter-spacing: -0.03em;
      }
      .stage-badges {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .stage-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.035);
        color: var(--muted);
        font-size: 12px;
      }
      .stage-strip-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .agent-tab {
        min-width: 180px;
        padding: 12px 14px;
        border-radius: 16px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.03);
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
      }
      .agent-tab:hover { transform: translateY(-1px); }
      .agent-tab.active {
        border-color: rgba(114,184,255,0.34);
        background: rgba(114,184,255,0.1);
      }
      .agent-tab-copy {
        margin-top: 8px;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.45;
      }
      .agent-center {
        min-height: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 14px;
      }
      .conversation-pane,
      .workflow-pane {
        min-height: 0;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: rgba(13,18,27,0.88);
      }
      .conversation-pane {
        min-height: 58vh;
      }
      .pane-shell {
        height: 100%;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
      }
      .pane-head {
        padding: 16px 18px 12px;
        border-bottom: 1px solid var(--line);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .pane-head strong {
        font-size: 14px;
        letter-spacing: -0.02em;
      }
      .sticky-turn-header {
        position: sticky;
        top: 0;
        z-index: 3;
        margin: -16px -16px 8px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(13,18,27,0.98), rgba(13,18,27,0.86));
        backdrop-filter: blur(10px);
      }
      .conversation-feed,
      .workflow-feed,
      .inspector-scroll {
        overflow: auto;
        padding: 16px;
        display: grid;
        gap: 12px;
      }
      .conversation-feed {
        align-content: start;
        padding-bottom: 22px;
      }
      .workflow-feed {
        align-content: start;
        max-height: 320px;
      }
      details.flow-shell {
        border: 1px solid var(--line);
        border-radius: 22px;
        background: rgba(13,18,27,0.76);
        overflow: hidden;
      }
      details.flow-shell summary {
        list-style: none;
        cursor: pointer;
      }
      details.flow-shell summary::-webkit-details-marker {
        display: none;
      }
      .turn-divider {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 4px 0 2px;
        color: var(--muted-2);
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .turn-divider::before,
      .turn-divider::after {
        content: "";
        height: 1px;
        flex: 1;
        background: var(--line);
      }
      .chat-message {
        border-radius: 18px;
        padding: 14px 16px;
        background: rgba(255,255,255,0.035);
        border: 1px solid var(--line);
        max-width: 88%;
        box-shadow: 0 10px 24px rgba(0,0,0,0.14);
      }
      .chat-message.user {
        justify-self: end;
        max-width: 76%;
        background: linear-gradient(180deg, rgba(255,190,85,0.12), rgba(255,190,85,0.05));
        border-color: rgba(255,190,85,0.2);
      }
      .chat-message.assistant {
        justify-self: start;
        background: linear-gradient(180deg, rgba(114,184,255,0.12), rgba(114,184,255,0.04));
        border-color: rgba(114,184,255,0.22);
      }
      .chat-message.system {
        justify-self: center;
        max-width: 82%;
        background: linear-gradient(180deg, rgba(185,163,255,0.08), rgba(185,163,255,0.03));
        border-color: rgba(185,163,255,0.18);
      }
      .chat-message .summary {
        margin-top: 8px;
        white-space: pre-wrap;
        line-height: 1.65;
      }
      .message-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .message-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        font-size: 11px;
        font-weight: 700;
        color: #081018;
      }
      .avatar.user { background: var(--accent); }
      .avatar.assistant { background: var(--blue); }
      .avatar.system { background: var(--purple); color: var(--text); }
      .meta-chips {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .meta-chip {
        padding: 4px 7px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.04);
        color: var(--muted);
        font-size: 11px;
      }
      .streaming-bubble {
        justify-self: start;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 999px;
        border: 1px solid rgba(114,184,255,0.24);
        background: rgba(114,184,255,0.08);
        color: var(--muted);
        width: fit-content;
      }
      .stream-dots {
        display: inline-flex;
        gap: 6px;
      }
      .stream-dots span {
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: var(--blue);
        opacity: 0.28;
        animation: pulse 1.05s infinite ease-in-out;
      }
      .stream-dots span:nth-child(2) { animation-delay: 0.16s; }
      .stream-dots span:nth-child(3) { animation-delay: 0.32s; }
      @keyframes pulse {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.28; }
        40% { transform: translateY(-3px); opacity: 1; }
      }
      .turn-card,
      .cardflow,
      .stage {
        padding: 13px 14px;
      }
      .turn-card.response,
      .stage.response { border-color: rgba(134,221,179,0.26); }
      .cardflow.tool_use,
      .stage.tool { border-color: rgba(114,184,255,0.25); }
      .cardflow.thinking,
      .stage.thinking { border-color: rgba(255,179,107,0.28); }
      .composer {
        border: 1px solid var(--line);
        border-radius: 22px;
        background: rgba(14,20,29,0.92);
        padding: 16px;
        display: grid;
        gap: 12px;
        position: sticky;
        bottom: 0;
        box-shadow: 0 -16px 40px rgba(0,0,0,0.18);
      }
      .input-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .toolbar-left,
      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .tool-chip {
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.04);
        color: var(--muted);
        border-radius: 999px;
        padding: 7px 10px;
        font-size: 12px;
        cursor: pointer;
      }
      .tool-chip:hover {
        border-color: var(--line-strong);
        color: var(--text);
      }
      textarea {
        width: 100%;
        min-height: 112px;
        resize: vertical;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(0,0,0,0.2);
        color: var(--text);
        padding: 14px 15px;
        outline: none;
        font: 14px/1.65 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
      textarea:focus {
        border-color: rgba(114,184,255,0.34);
        box-shadow: 0 0 0 1px rgba(114,184,255,0.18);
      }
      .action-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      button {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 10px 14px;
        color: var(--text);
        background: rgba(114,184,255,0.12);
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease, transform 120ms ease, opacity 120ms ease;
      }
      button:hover { transform: translateY(-1px); border-color: var(--line-strong); }
      button.secondary { background: rgba(255,255,255,0.04); }
      button.danger { background: rgba(255,143,144,0.14); border-color: rgba(255,143,144,0.26); }
      button:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
      .flash {
        min-height: 18px;
        color: var(--accent-2);
        font-size: 12px;
      }
      .inspector {
        border-left: 1px solid var(--line);
        background: linear-gradient(180deg, rgba(14,20,29,0.98), rgba(11,16,24,0.98));
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
      }
      .inspector-head {
        padding: 18px 18px 12px;
        border-bottom: 1px solid var(--line);
      }
      .inspector-title {
        margin-top: 10px;
        font-size: 20px;
        letter-spacing: -0.03em;
      }
      .dialog-card,
      .inspector-card {
        padding: 14px;
      }
      .dialog-card.warning { border-color: rgba(255,179,107,0.28); }
      .dialog-card.danger { border-color: rgba(255,143,144,0.3); }
      .inspector-stack {
        display: grid;
        gap: 14px;
      }
      .inspector-grid {
        display: grid;
        gap: 10px;
      }
      details.inspector-more {
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255,255,255,0.02);
        overflow: hidden;
      }
      details.inspector-more summary {
        list-style: none;
        cursor: pointer;
        padding: 12px 13px;
      }
      details.inspector-more summary::-webkit-details-marker {
        display: none;
      }
      .inspector-more-body {
        padding: 0 13px 13px;
        display: grid;
        gap: 10px;
      }
      .timeline-item {
        padding: 12px 13px;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255,255,255,0.03);
        cursor: pointer;
        transition: border-color 120ms ease, transform 120ms ease, background 120ms ease;
      }
      .timeline-item:hover {
        transform: translateY(-1px);
        border-color: var(--line-strong);
        background: rgba(255,255,255,0.045);
      }
      .timeline-item.active {
        border-color: rgba(114,184,255,0.34);
        background: rgba(114,184,255,0.08);
      }
      .kv {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--line);
        font-size: 12px;
      }
      .empty {
        padding: 16px;
        border: 1px dashed var(--line);
        border-radius: 16px;
        color: var(--muted);
        background: rgba(255,255,255,0.02);
      }
      .is-highlighted {
        border-color: rgba(255,190,85,0.5) !important;
        box-shadow: 0 0 0 1px rgba(255,190,85,0.2), 0 0 24px rgba(255,190,85,0.12);
      }
      @media (max-width: 1480px) {
        .app-shell {
          grid-template-columns: 72px 256px minmax(0, 1fr) 320px;
        }
      }
      @media (max-width: 1160px) {
        .app-shell {
          grid-template-columns: 72px 1fr;
        }
        .sidebar {
          display: none;
        }
        .main {
          border-right: 1px solid var(--line);
        }
        .inspector {
          position: fixed;
          right: 0;
          top: 0;
          width: min(360px, 86vw);
          height: 100vh;
          box-shadow: -20px 0 50px rgba(0,0,0,0.35);
        }
      }
      @media (max-width: 820px) {
        .app-shell {
          grid-template-columns: 1fr;
        }
        .activitybar,
        .inspector {
          display: none;
        }
        .main-topbar,
        .main-body {
          padding-left: 14px;
          padding-right: 14px;
        }
        .stage-strip {
          flex-direction: column;
          align-items: stretch;
        }
      }
    </style>
  </head>
  <body>
    <div class="app-shell">
      <aside class="activitybar">
        <div class="activity-top">
          <div class="activity-logo">LC</div>
          <div class="activity-item active">AI</div>
          <div class="activity-item">WF</div>
          <div class="activity-item">TM</div>
          <div class="activity-item">EV</div>
        </div>
        <div class="activity-bottom">
          <div class="activity-item">RC</div>
        </div>
      </aside>

      <aside class="sidebar">
        <div class="sidebar-head">
          <div class="eyebrow">Agent-Center Workspace</div>
          <div class="sidebar-title">Like Code Control Hub</div>
          <div class="sidebar-copy">
            左侧像编辑器的堆叠导航，中间是 agent 主舞台，右侧是 inspector。
            当前焦点 pane 会作为主 agent tab，其他资源退到侧边。
          </div>
          <div class="sidebar-search">Search agents, panes, tasks...</div>
        </div>
        <div class="sidebar-scroll">
          <div class="rail-card">
            <div class="rail-head">
              <strong>Workspace Tree</strong>
              <span class="section-note">project / session / panes</span>
            </div>
            <div id="workspace-tree" class="workspace-tree"></div>
          </div>
          <div class="rail-card">
            <div class="rail-head">
              <strong>Panes</strong>
              <span class="section-note" id="pane-summary-note">Task map</span>
            </div>
            <div class="badge-row" style="margin: 0 0 12px;">
              <button class="tool-chip" data-create-pane-kind="task" data-create-pane-title="Agent">+ Agent</button>
              <button class="tool-chip" data-create-pane-kind="task" data-create-pane-title="Planner" data-create-pane-prompt="plan the work for this thread and then execute step by step">+ Planner</button>
              <button class="tool-chip" data-create-pane-kind="review" data-create-pane-title="Reviewer" data-create-pane-prompt="review the latest work in this pane and call out the highest-risk issues first">+ Reviewer</button>
            </div>
            <div id="panes" class="pane-list"></div>
          </div>
          <div class="rail-card">
            <div class="rail-head">
              <strong>Subagents</strong>
              <span class="section-note" id="subagent-summary-note">Live workers</span>
            </div>
            <div id="subagents" class="subagent-list"></div>
          </div>
          <div class="rail-card">
            <div class="rail-head">
              <strong>Session Signals</strong>
              <span class="section-note">Recent events</span>
            </div>
            <div id="events" class="event-list"></div>
          </div>
        </div>
      </aside>

      <main class="main">
        <div class="main-topbar">
          <div class="main-title">
            <strong id="stage-title">Agent Center</strong>
            <span id="transcript-meta">pane ${activePaneId}</span>
          </div>
          <div class="main-actions">
            <a class="pill" href="${baseUrl}/api/sessions/current" target="_blank" rel="noreferrer">Session JSON</a>
            <a class="pill" href="${baseUrl}/api/workspace/control" target="_blank" rel="noreferrer">Control JSON</a>
            <span class="pill">Active Pane <strong id="active-pane">${activePaneId}</strong></span>
          </div>
        </div>

        <div class="main-body">
          <section class="stage-strip">
            <div class="stage-strip-main">
              <div class="stage-strip-title">
                <strong id="stage-strip-title">Current Agent</strong>
                <span class="status idle" id="stage-strip-status">idle</span>
              </div>
              <div class="stage-badges">
                <span class="stage-badge">pane <strong id="metric-active-pane">1</strong></span>
                <span class="stage-badge">visible <strong id="metric-pane-count">0</strong></span>
                <span class="stage-badge">events <strong id="metric-event-count">0</strong></span>
                <span class="stage-badge">subagents <strong id="metric-subagent-count">0</strong></span>
              </div>
            </div>
            <div class="stage-strip-actions">
              <span class="stage-badge">sync 2500ms</span>
              <span class="stage-badge">AppState + REPL bridge</span>
            </div>
          </section>

          <div class="agent-center">
            <section class="conversation-pane">
              <div class="pane-shell">
                <div class="pane-head">
                  <strong>Agent Conversation</strong>
                  <span class="section-note">center stage transcript</span>
                </div>
                <div id="transcript" class="conversation-feed"></div>
              </div>
            </section>
          </div>

          <section class="composer">
            <div class="row">
              <strong>Terminal Composer</strong>
              <span class="section-note" id="control-note">Bridge status</span>
            </div>
            <div class="input-toolbar">
              <div class="toolbar-left">
                <button class="tool-chip" data-template="/plan">/plan</button>
                <button class="tool-chip" data-template="/compact">/compact</button>
                <button class="tool-chip" data-template="review this pane">Review</button>
                <button class="tool-chip" data-template="summarize the current progress">Summarize</button>
              </div>
              <div class="toolbar-right">
                <span class="badge" id="composer-mode">mode prompt</span>
                <span class="badge" id="composer-queue">queue 0</span>
              </div>
            </div>
            <textarea id="terminal-input" placeholder="在这里输入 prompt、slash command 或 bash-like 文本，直接从网页推动当前 agent 会话"></textarea>
            <div class="action-row">
              <button id="submit-prompt">Send To Agent</button>
              <button id="interrupt-run" class="danger">Interrupt</button>
              <button id="clear-input" class="secondary">Clear</button>
            </div>
            <div id="control-flash" class="flash"></div>
          </section>

          <details class="flow-shell">
            <summary class="pane-head">
              <strong>Agent Flow</strong>
              <span class="section-note">folded by default · turns, stages, tool chains</span>
            </summary>
            <div class="workflow-feed">
              <div id="turns"></div>
              <div id="stages"></div>
              <div id="toolchains"></div>
              <div id="toolpairs"></div>
              <div id="cards"></div>
            </div>
          </details>
        </div>
      </main>

      <aside class="inspector">
        <div class="inspector-head">
          <div class="eyebrow">Inspector</div>
          <div class="inspector-title">Current Agent Detail</div>
          <div class="sidebar-copy">
            这里放网页侧 dialog 镜像、terminal feed 与最近事件，像 z.ai / Cursor 那种右侧 context inspector。
          </div>
        </div>
        <div class="inspector-scroll">
          <div class="inspector-stack">
            <div class="rail-card">
              <div class="rail-head">
                <strong>Active Dialog</strong>
                <span class="section-note">Mirrored from CLI</span>
              </div>
              <div id="active-dialog"></div>
            </div>
            <div class="rail-card">
              <div class="rail-head">
                <strong>Current Agent</strong>
                <span class="section-note">high-frequency context</span>
              </div>
              <div id="session-inspector" class="inspector-grid"></div>
            </div>
            <div class="rail-card">
              <div class="rail-head">
                <strong>Active Tools</strong>
                <span class="section-note">derived from transcript</span>
              </div>
              <div id="active-tools" class="event-list"></div>
            </div>
            <div class="rail-card">
              <div class="rail-head">
                <strong>Tool Timeline</strong>
                <span class="section-note">click to focus</span>
              </div>
              <div id="tool-timeline" class="event-list"></div>
            </div>
            <details class="inspector-more" open>
              <summary class="rail-head">
                <strong>More Details</strong>
                <span class="section-note">session / notes / links</span>
              </summary>
              <div class="inspector-more-body">
                <div id="session-inspector-more" class="inspector-grid"></div>
                <div class="dialog-card inspector-card">
                  <div class="small muted">Workspace Notes</div>
                  <div class="small" style="margin-top:8px;">
                    Focus pane: ${activePaneId}<br />
                    Sync loop: 2500ms refresh<br />
                    Source: AppState + REPL bridge
                  </div>
                </div>
                <div class="event-list">
                  <a class="pill" href="${baseUrl}/api/sessions/current/panes" target="_blank" rel="noreferrer">Pane JSON</a>
                  <a class="pill" href="${baseUrl}/api/sessions/current/events" target="_blank" rel="noreferrer">Events JSON</a>
                  <a class="pill" href="${baseUrl}/api/sessions/current/subagents" target="_blank" rel="noreferrer">Subagents JSON</a>
                </div>
              </div>
            </details>
            <div class="rail-card">
              <div class="rail-head">
                <strong>Live Terminal Feed</strong>
                <span class="section-note">Recent transcript excerpts</span>
              </div>
              <div id="terminal-feed" class="event-list"></div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <script>
      const state = {
        activePaneId: ${JSON.stringify(activePaneId)},
        control: null,
        dialog: null,
        activeToolPairId: null
      };

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

      function approxTokens(text) {
        const size = String(text || '').trim().length;
        return size > 0 ? Math.max(1, Math.round(size / 4)) : 0;
      }

      function deltaLabel(current, previous) {
        if (!current || !previous) return 'n/a';
        const a = new Date(current).getTime();
        const b = new Date(previous).getTime();
        if (!Number.isFinite(a) || !Number.isFinite(b)) return 'n/a';
        const delta = Math.max(0, Math.round((a - b) / 1000));
        return delta + 's';
      }

      function highlightTarget(pairId) {
        state.activeToolPairId = pairId;
        document.querySelectorAll('[data-pair-id]').forEach(node => {
          node.classList.toggle('is-highlighted', node.getAttribute('data-pair-id') === pairId);
        });
        if (!pairId) return;
        const node = document.querySelector('[data-pair-id="' + CSS.escape(pairId) + '"]');
        if (node && typeof node.scrollIntoView === 'function') {
          node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      async function fetchJson(path) {
        const res = await fetch(path);
        if (!res.ok) throw new Error(path + ' -> ' + res.status);
        return res.json();
      }

      async function postJson(path, body) {
        const res = await fetch(path, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body || {})
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || (path + ' -> ' + res.status));
        }
        return res.json();
      }

      async function activatePane(paneId) {
        if (!paneId) return;
        const result = await postJson('/api/workspace/panes/switch', { paneId });
        if (!result.accepted) {
          throw new Error('Pane switch was not accepted by CLI');
        }
        state.activePaneId = result.paneId || paneId;
        document.getElementById('active-pane').textContent = state.activePaneId;
      }

      async function createPane(payload) {
        const result = await postJson('/api/workspace/panes/create', payload || {});
        if (!result.accepted) {
          throw new Error('Pane creation was not accepted by CLI');
        }
        if (result.paneId) {
          state.activePaneId = result.paneId;
          document.getElementById('active-pane').textContent = state.activePaneId;
        }
        return result;
      }

      function setFlash(message, isError) {
        const root = document.getElementById('control-flash');
        root.textContent = message || '';
        root.style.color = isError ? 'var(--red)' : 'var(--accent-2)';
      }

      function renderSessionSummary(session, panes, transcript, subagents) {
        const activePane = (panes || []).find(pane => pane.id === state.activePaneId);
        document.getElementById('metric-active-pane').textContent = session.activePaneId ? '1' : '0';
        document.getElementById('metric-pane-count').textContent = String((panes || []).length);
        document.getElementById('metric-event-count').textContent = String((transcript?.workflow || []).length);
        document.getElementById('metric-subagent-count').textContent = String((subagents || []).length);
        document.getElementById('pane-summary-note').textContent = activePane ? 'selected · ' + activePane.title : session.model ? 'active model · ' + session.model : 'Task map';
        document.getElementById('subagent-summary-note').textContent = (subagents || []).length > 0 ? (subagents || []).length + ' running / recent' : 'No live workers';
        document.getElementById('stage-title').textContent = activePane ? activePane.title + ' · Agent Center' : session.title || 'Agent Center';
        document.getElementById('stage-strip-title').textContent = activePane ? activePane.title : 'Current Agent';
        const statusNode = document.getElementById('stage-strip-status');
        statusNode.className = 'status ' + statusClass(activePane?.status || (session.hasRunningSubagents ? 'running' : 'idle'));
        statusNode.textContent = escapeHtml(activePane?.status || (session.hasRunningSubagents ? 'running' : 'idle'));
      }

      function renderWorkspaceTree(session, panes, transcript) {
        const root = document.getElementById('workspace-tree');
        root.innerHTML = \`
          <details class="tree-group" open>
            <summary>
              <strong>workspace</strong>
              <span class="badge mono">\${escapeHtml(session.id || 'session')}</span>
            </summary>
            <div class="tree-group-body">
              <div class="tree-pill small muted">\${escapeHtml(session.cwd || 'cwd unavailable')}</div>
            </div>
          </details>
          <details class="tree-group" open>
            <summary>
              <strong>pinned agents</strong>
              <span class="badge">\${escapeHtml((panes || []).length || 0)} panes</span>
            </summary>
            <div class="tree-group-body">
              \${(panes || []).slice(0, 6).map(pane => '<div class="tree-pill small ' + (pane.id === state.activePaneId ? 'active' : '') + '" data-pane-id="' + escapeHtml(pane.id) + '"><strong>' + escapeHtml(pane.title) + '</strong><span class="small muted">' + escapeHtml(pane.model || pane.provider || 'agent pane') + '</span></div>').join('') || '<div class="tree-pill small muted">No panes yet</div>'}
            </div>
          </details>
          <details class="tree-group">
            <summary>
              <strong>recent chats</strong>
              <span class="badge">\${escapeHtml((transcript.turns || []).length || 0)} turns</span>
            </summary>
            <div class="tree-group-body">
              \${(transcript.turns || []).slice(-4).reverse().map(turn => '<div class="tree-pill small muted" data-pane-id="' + escapeHtml(turn.paneId || state.activePaneId || '') + '"><strong>' + escapeHtml(formatTime(turn.startedAt || '')) + '</strong><span class="small muted">' + escapeHtml(shorten(turn.promptSummary || turn.id || 'turn', 72)) + '</span></div>').join('') || '<div class="tree-pill small muted">No recent turns</div>'}
            </div>
          </details>
        \`;
        root.querySelectorAll('[data-pane-id]').forEach(node => {
          node.addEventListener('click', async () => {
            try {
              await activatePane(node.getAttribute('data-pane-id'));
              await refresh();
            } catch (error) {
              setFlash(error.message || 'Pane switch failed', true);
            }
          });
        });
      }

      function renderAgentTabs(panes) {
        const root = document.getElementById('agent-tabs');
        if (!root) return;
        root.innerHTML = panes.map(pane => \`
          <div class="agent-tab \${pane.id === state.activePaneId ? 'active' : ''}" data-pane-id="\${escapeHtml(pane.id)}">
            <div class="row">
              <strong>\${escapeHtml(pane.title)}</strong>
              <span class="status \${statusClass(pane.status)}">\${escapeHtml(pane.status)}</span>
            </div>
            <div class="small muted" style="margin-top:6px;">\${escapeHtml(pane.model || 'unknown model')} · \${escapeHtml(pane.provider || 'unknown provider')}</div>
            <div class="agent-tab-copy">\${escapeHtml(shorten(pane.taskSummary || pane.draftPreview || 'Ready for the next agent turn', 84))}</div>
          </div>
        \`).join('');
        root.querySelectorAll('[data-pane-id]').forEach(node => {
          node.addEventListener('click', async () => {
            try {
              await activatePane(node.getAttribute('data-pane-id'));
              await refresh();
            } catch (error) {
              setFlash(error.message || 'Pane switch failed', true);
            }
          });
        });
      }

      function renderPanes(panes) {
        const root = document.getElementById('panes');
        const pinned = panes.filter(pane => pane.id === state.activePaneId);
        const recents = panes.filter(pane => pane.id !== state.activePaneId);
        const renderPaneCard = pane => \`
          <div class="card \${pane.id === state.activePaneId ? 'active' : ''}" data-pane-id="\${escapeHtml(pane.id)}">
            <div class="row">
              <strong>\${escapeHtml(pane.title)}</strong>
              <span class="status \${statusClass(pane.status)}">\${escapeHtml(pane.status)}</span>
            </div>
            <div class="badge-row">
              <span class="badge mono">pane \${escapeHtml(pane.id)}</span>
              <span class="badge mono">\${escapeHtml(pane.transcriptId)}</span>
            </div>
            <div class="small" style="margin-top:10px;">\${escapeHtml(shorten(pane.taskSummary || pane.draftPreview || 'No task summary yet', 160))}</div>
          </div>
        \`;
        root.innerHTML =
          (pinned.length > 0 ? '<div class="group-label">Pinned</div>' + pinned.map(renderPaneCard).join('') : '') +
          (recents.length > 0 ? '<div class="group-label">Recents</div>' + recents.map(renderPaneCard).join('') : '');
        root.querySelectorAll('[data-pane-id]').forEach(node => {
          node.addEventListener('click', async () => {
            try {
              await activatePane(node.getAttribute('data-pane-id'));
              await refresh();
            } catch (error) {
              setFlash(error.message || 'Pane switch failed', true);
            }
          });
        });
      }

      function renderTranscript(payload) {
        document.getElementById('transcript-meta').textContent =
          'pane ' + payload.paneId + ' · transcript ' + payload.transcriptId + ' · ' + payload.messages.length + ' messages';

        const transcriptRoot = document.getElementById('transcript');
        transcriptRoot.innerHTML = payload.messages.length === 0
          ? '<div class="empty">This pane has no transcript snapshot yet.</div>'
          : '<div class="sticky-turn-header"><div class="row"><strong>Current Turn Focus</strong><span class="section-note">' + escapeHtml(payload.turns?.length || 0) + ' turns tracked</span></div></div>' + payload.messages.map((message, index) => {
              const previous = index > 0 ? payload.messages[index - 1] : null;
              const shouldInsertDivider = previous && previous.role === 'assistant' && message.role === 'user';
              const summary = message.summary || '[No summary extracted yet]';
              const role = statusClass(message.role || message.type || 'assistant');
              return \`
                \${shouldInsertDivider ? '<div class="turn-divider">Next Turn</div>' : ''}
                <div class="chat-message \${statusClass(message.role || message.type)}">
                  <div class="message-head">
                    <div class="message-left">
                      <div class="avatar \${role}">\${escapeHtml((message.role || message.type || 'a').slice(0,1).toUpperCase())}</div>
                      <div>
                        <strong>\${escapeHtml(message.role || message.type)}</strong>
                        <div class="small muted">\${escapeHtml(formatTime(message.createdAt || ''))}</div>
                      </div>
                    </div>
                    <div class="meta-chips">
                      <span class="meta-chip">~\${escapeHtml(approxTokens(summary))} tok</span>
                      <span class="meta-chip">latency \${escapeHtml(deltaLabel(message.createdAt, previous?.createdAt))}</span>
                    </div>
                  </div>
                  <div class="summary">\${escapeHtml(shorten(summary, 420))}</div>
                </div>
              \`;
            }).join('') + (state.control && state.control.isBusy ? \`
              <div class="streaming-bubble">
                <span>assistant streaming</span>
                <span class="stream-dots"><span></span><span></span><span></span></span>
              </div>
            \` : '');

        document.getElementById('turns').innerHTML = (payload.turns || []).length === 0
          ? '<div class="empty">No turn replay extracted yet.</div>'
          : '<div class="small muted" style="margin-bottom:10px;">Turn Replay</div>' + payload.turns.slice(-6).reverse().map(turn => \`
              <div class="turn-card response">
                <div class="row">
                  <strong>\${escapeHtml(turn.id)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(turn.startedAt || ''))}</span>
                </div>
                <div class="small muted">tools: \${escapeHtml(turn.toolCount || 0)} · events: \${escapeHtml(turn.eventCount || 0)}</div>
                <div class="small" style="margin-top:8px;">\${escapeHtml(shorten(turn.promptSummary || '[No prompt summary]', 180))}</div>
              </div>
            \`).join('');

        document.getElementById('stages').innerHTML = (payload.stages || []).length === 0
          ? ''
          : '<div class="small muted" style="margin:12px 0 10px;">Stages</div>' + payload.stages.slice(-8).reverse().map(stage => \`
              <div class="stage \${statusClass(stage.stage)}">
                <div class="row">
                  <strong>\${escapeHtml(stage.title || stage.stage)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(stage.createdAt || ''))}</span>
                </div>
                <div class="small muted">\${escapeHtml(stage.stage)}\${stage.toolName ? ' · ' + escapeHtml(stage.toolName) : ''}</div>
                <div class="small" style="margin-top:8px;">\${escapeHtml(shorten(stage.summary || '[No stage summary extracted yet]', 180))}</div>
              </div>
            \`).join('');

        document.getElementById('toolchains').innerHTML = (payload.toolChains || []).length === 0
          ? ''
          : '<div class="small muted" style="margin:12px 0 10px;">Tool Chains</div>' + payload.toolChains.slice(0, 6).map(chain => \`
              <div class="cardflow tool_result">
                <div class="row">
                  <strong>\${escapeHtml(chain.toolName)}</strong>
                  <span class="small muted">\${escapeHtml(chain.pairCount || 0)} pairs</span>
                </div>
                <div class="badge-row">
                  <span class="badge">turns: \${escapeHtml((chain.turnIds || []).length || 0)}</span>
                  <span class="badge mono">\${escapeHtml(chain.id)}</span>
                </div>
                <div class="small muted" style="margin-top:8px;">\${escapeHtml(shorten((chain.steps || []).slice(-4).map(step => step.summary || step.title || step.kind).join(' → '), 220))}</div>
              </div>
            \`).join('');

        document.getElementById('toolpairs').innerHTML = (payload.toolPairs || []).length === 0
          ? ''
          : '<div class="small muted" style="margin:12px 0 10px;">Tool Pairs</div>' + payload.toolPairs.slice(-6).reverse().map(pair => \`
              <div class="cardflow tool_use" data-pair-id="\${escapeHtml(pair.id || pair.toolUseId || '')}">
                <div class="row">
                  <strong>\${escapeHtml(pair.toolName || pair.toolUseId || 'tool')}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(pair.startedAt || ''))}</span>
                </div>
                <div class="small muted" style="margin-top:8px;">input: \${escapeHtml(shorten(pair.inputSummary || 'n/a', 160))}</div>
                <div class="small muted">output: \${escapeHtml(shorten(pair.outputSummary || 'n/a', 160))}</div>
              </div>
            \`).join('');

        document.getElementById('cards').innerHTML = (payload.cards || []).length === 0
          ? ''
          : '<div class="small muted" style="margin:12px 0 10px;">Thinking / Tools</div>' + payload.cards.slice(-6).reverse().map(card => \`
              <div class="cardflow \${statusClass(card.kind)}">
                <div class="row">
                  <strong>\${escapeHtml(card.title || card.kind)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(card.createdAt || ''))}</span>
                </div>
                <div class="small" style="margin-top:8px;">\${escapeHtml(shorten(card.summary || '[No summary extracted yet]', 180))}</div>
              </div>
            \`).join('');
      }

      function renderSubagents(items) {
        const root = document.getElementById('subagents');
        root.innerHTML = items.length === 0
          ? '<div class="empty">No live subagents detected in current AppState.</div>'
          : '<div class="group-label">Workers</div>' + items.map(item => \`
              <div class="subagent" style="padding:13px 14px;">
                <div class="row">
                  <strong>\${escapeHtml(item.title)}</strong>
                  <span class="status \${statusClass(item.status)}">\${escapeHtml(item.status)}</span>
                </div>
                <div class="badge-row">
                  <span class="badge">\${escapeHtml(item.kind)}</span>
                  <span class="badge mono">\${escapeHtml(item.model || 'n/a')}</span>
                </div>
                <div class="small" style="margin-top:8px;">\${escapeHtml(shorten(item.summary || 'No summary yet', 160))}</div>
              </div>
            \`).join('');
      }

      function renderEvents(events) {
        const root = document.getElementById('events');
        root.innerHTML = events.length === 0
          ? '<div class="empty">No events yet.</div>'
          : events.slice(0, 18).map(event => \`
              <div class="event" style="padding:12px 13px;">
                <div class="row">
                  <strong>\${escapeHtml(event.type)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(event.createdAt || ''))}</span>
                </div>
                <div class="small" style="margin-top:8px;">\${escapeHtml(shorten(event.title || event.summary || event.model || '', 150))}</div>
              </div>
            \`).join('');
      }

      function renderControlPanel(control, dialog) {
        state.control = control || null;
        state.dialog = dialog || null;
        document.getElementById('control-note').textContent = control
          ? [control.isReady ? 'ready' : 'offline', control.isBusy ? 'busy' : 'idle', 'queue ' + String(control.queuedCommands || 0), control.inputMode || 'prompt'].join(' · ')
          : 'Bridge unavailable';
        document.getElementById('composer-mode').textContent = 'mode ' + String(control?.inputMode || 'prompt');
        document.getElementById('composer-queue').textContent = 'queue ' + String(control?.queuedCommands || 0);

        document.getElementById('interrupt-run').disabled = !(control && control.canInterrupt);
        document.getElementById('submit-prompt').disabled = !(control && control.isReady);

        const dialogRoot = document.getElementById('active-dialog');
        if (!dialog) {
          dialogRoot.innerHTML = '<div class="empty">当前 CLI 没有活动中的阻塞对话框。</div>';
          return;
        }

        const actions = Array.isArray(dialog.actions) ? dialog.actions : [];
        dialogRoot.innerHTML = \`
          <div class="dialog-card \${escapeHtml(dialog.tone || 'info')}">
            <div class="row">
              <strong>\${escapeHtml(dialog.title || dialog.kind)}</strong>
              <span class="badge">\${escapeHtml(dialog.kind || 'dialog')}</span>
            </div>
            \${dialog.subtitle ? '<div class="small muted" style="margin-top:8px;">' + escapeHtml(dialog.subtitle) + '</div>' : ''}
            \${dialog.body ? '<div class="small" style="margin-top:10px; line-height:1.6;">' + escapeHtml(shorten(dialog.body, 300)) + '</div>' : ''}
            \${actions.length > 0 ? '<div class="event-list" style="margin-top:14px;">' + actions.map(action => '<div class="timeline-item" data-dialog-action="' + escapeHtml(action.id) + '"><div class="row"><strong>' + escapeHtml(action.label) + '</strong><span class="badge">' + escapeHtml(action.kind || 'secondary') + '</span></div>' + (action.description ? '<div class="small muted" style="margin-top:8px;">' + escapeHtml(action.description) + '</div>' : '') + '</div>').join('') + '</div>' : '<div class="small muted" style="margin-top:12px;">这个对话框当前仅镜像展示，暂未开放网页侧响应。</div>'}
          </div>
        \`;

        dialogRoot.querySelectorAll('[data-dialog-action]').forEach(node => {
          node.addEventListener('click', async () => {
            const actionId = node.getAttribute('data-dialog-action');
            try {
              const result = await postJson('/api/workspace/control/dialog', { actionId });
              setFlash(result.accepted ? 'Dialog action sent to CLI' : 'Dialog action was not accepted', !result.accepted);
              await refresh();
            } catch (error) {
              setFlash(error.message || 'Dialog action failed', true);
            }
          });
        });
      }

      function renderInspector(session, control, dialog, transcript) {
        const inspector = document.getElementById('session-inspector');
        const inspectorMore = document.getElementById('session-inspector-more');
        const toolPairs = Array.isArray(transcript?.toolPairs) ? transcript.toolPairs : [];
        const activeToolsRoot = document.getElementById('active-tools');
        const toolTimelineRoot = document.getElementById('tool-timeline');
        inspector.innerHTML = \`
          <div class="kv"><span>current model</span><strong>\${escapeHtml(session?.model || 'unknown')}</strong></div>
          <div class="kv"><span>mode</span><strong>\${escapeHtml(control?.inputMode || 'prompt')}</strong></div>
          <div class="kv"><span>state</span><strong>\${escapeHtml(control?.isBusy ? 'busy' : 'idle')}</strong></div>
        \`;
        inspectorMore.innerHTML = \`
          <div class="kv"><span>current pane</span><strong>\${escapeHtml(transcript?.paneId || state.activePaneId || 'unknown')}</strong></div>
          <div class="kv"><span>transcript</span><strong>\${escapeHtml(transcript?.transcriptId || 'unknown')}</strong></div>
          <div class="kv"><span>provider</span><strong>\${escapeHtml(session?.provider || 'unknown')}</strong></div>
          <div class="kv"><span>queue</span><strong>\${escapeHtml(control?.queuedCommands || 0)}</strong></div>
          <div class="kv"><span>dialog actions</span><strong>\${escapeHtml((dialog?.actions || []).length || 0)}</strong></div>
        \`;
        activeToolsRoot.innerHTML = toolPairs.length === 0
          ? '<div class="empty">No active tools derived from transcript.</div>'
          : toolPairs.slice(-6).reverse().map(pair => \`
              <div class="event" style="padding:12px 13px;">
                <div class="row">
                  <strong>\${escapeHtml(pair.toolName || 'tool')}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(pair.startedAt || ''))}</span>
                </div>
                <div class="badge-row">
                  <span class="badge mono">\${escapeHtml(pair.toolUseId || 'n/a')}</span>
                  <span class="badge">turn \${escapeHtml(pair.turnId || 'unbound')}</span>
                </div>
                <div class="small muted" style="margin-top:8px;">\${escapeHtml(shorten(pair.outputSummary || pair.inputSummary || 'No output yet', 150))}</div>
              </div>
            \`).join('');
        toolTimelineRoot.innerHTML = toolPairs.length === 0
          ? '<div class="empty">No tool timeline yet.</div>'
          : toolPairs.slice(-8).reverse().map(pair => \`
              <div class="timeline-item \${state.activeToolPairId === pair.id ? 'active' : ''}" data-timeline-pair-id="\${escapeHtml(pair.id)}">
                <div class="row">
                  <strong>\${escapeHtml(pair.toolName || 'tool')}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(pair.startedAt || ''))}</span>
                </div>
                <div class="badge-row">
                  <span class="badge">turn \${escapeHtml(pair.turnId || 'unbound')}</span>
                  <span class="badge mono">\${escapeHtml(pair.toolUseId || pair.id)}</span>
                </div>
                <div class="small muted" style="margin-top:8px;">\${escapeHtml(shorten(pair.inputSummary || pair.outputSummary || 'tool activity', 140))}</div>
              </div>
            \`).join('');
        toolTimelineRoot.querySelectorAll('[data-timeline-pair-id]').forEach(node => {
          node.addEventListener('click', () => {
            highlightTarget(node.getAttribute('data-timeline-pair-id'));
            toolTimelineRoot.querySelectorAll('[data-timeline-pair-id]').forEach(item => {
              item.classList.toggle('active', item.getAttribute('data-timeline-pair-id') === node.getAttribute('data-timeline-pair-id'));
            });
          });
        });
      }

      function renderTerminalFeed(payload) {
        const root = document.getElementById('terminal-feed');
        const messages = (payload?.messages || []).slice(-8).reverse();
        root.innerHTML = messages.length === 0
          ? '<div class="empty">还没有可展示的终端消息。</div>'
          : messages.map(message => \`
              <div class="mini-message" style="padding:12px 13px;">
                <div class="row">
                  <strong>\${escapeHtml(message.role || message.type)}</strong>
                  <span class="small muted">\${escapeHtml(formatTime(message.createdAt || ''))}</span>
                </div>
                <div class="small" style="margin-top:8px;">\${escapeHtml(shorten(message.summary || '[No summary]', 180))}</div>
              </div>
            \`).join('');
      }

      async function refresh() {
        const [sessionRes, panesRes, eventsRes, subagentsRes, controlRes] = await Promise.all([
          fetchJson('/api/sessions/current'),
          fetchJson('/api/sessions/current/panes'),
          fetchJson('/api/sessions/current/events'),
          fetchJson('/api/sessions/current/subagents'),
          fetchJson('/api/workspace/control')
        ]);
        const panes = panesRes.panes || [];
        if (sessionRes.session?.activePaneId) {
          state.activePaneId = sessionRes.session.activePaneId;
        }
        if (!panes.some(pane => pane.id === state.activePaneId) && panes[0]) {
          state.activePaneId = panes[0].id;
        }
        document.getElementById('active-pane').textContent = state.activePaneId;
        renderPanes(panes);
        renderAgentTabs(panes);
        renderSubagents(subagentsRes.subagents || []);
        const transcript = await fetchJson('/api/sessions/current/panes/' + encodeURIComponent(state.activePaneId) + '/transcript');
        renderWorkspaceTree(sessionRes.session || {}, panes, transcript);
        renderSessionSummary(sessionRes.session || {}, panes, transcript, subagentsRes.subagents || []);
        renderEvents([...(transcript.workflow || []).slice(-18).reverse(), ...(eventsRes.events || []).slice(0, 8)]);
        renderTranscript(transcript);
        renderTerminalFeed(transcript);
        renderControlPanel(controlRes.control || null, controlRes.dialog || null);
        renderInspector(sessionRes.session || {}, controlRes.control || null, controlRes.dialog || null, transcript);
      }

      document.querySelectorAll('[data-create-pane-kind]').forEach(node => {
        node.addEventListener('click', async () => {
          try {
            const result = await createPane({
              kind: node.getAttribute('data-create-pane-kind') || 'task',
              title: node.getAttribute('data-create-pane-title') || 'Agent',
              initialPrompt: node.getAttribute('data-create-pane-prompt') || undefined
            });
            setFlash(result.paneId ? 'New agent pane created' : 'Pane created', false);
            await refresh();
          } catch (error) {
            setFlash(error.message || 'Pane creation failed', true);
          }
        });
      });

      document.getElementById('submit-prompt').addEventListener('click', async () => {
        const input = document.getElementById('terminal-input');
        const prompt = input.value.trim();
        if (!prompt) {
          setFlash('请输入要发送给 CLI 的内容。', true);
          return;
        }
        try {
          const result = await postJson('/api/workspace/control/submit', { prompt });
          setFlash(result.accepted ? 'Prompt submitted to CLI' : 'Prompt was not accepted', !result.accepted);
          if (result.accepted) input.value = '';
          await refresh();
        } catch (error) {
          setFlash(error.message || 'Prompt submission failed', true);
        }
      });

      document.getElementById('interrupt-run').addEventListener('click', async () => {
        try {
          const result = await postJson('/api/workspace/control/interrupt', {});
          setFlash(result.accepted ? 'Interrupt signal sent' : 'No running task to interrupt', !result.accepted);
          await refresh();
        } catch (error) {
          setFlash(error.message || 'Interrupt failed', true);
        }
      });

      document.getElementById('clear-input').addEventListener('click', () => {
        document.getElementById('terminal-input').value = '';
        setFlash('', false);
      });

      document.querySelectorAll('[data-template]').forEach(node => {
        node.addEventListener('click', () => {
          const textarea = document.getElementById('terminal-input');
          const template = node.getAttribute('data-template') || '';
          textarea.value = textarea.value ? textarea.value + '\\n' + template : template;
          textarea.focus();
        });
      });

      refresh().catch(error => {
        document.body.insertAdjacentHTML('beforeend', '<pre style="color:#ff9d9d;padding:16px;">' + escapeHtml(error.message) + '</pre>');
      });
      setInterval(() => refresh().catch(() => {}), 2500);
    </script>
  </body>
</html>`
}

async function handleWorkspaceRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const method = req.method ?? 'GET'
  const url = new URL(req.url ?? '/', getWorkspaceApiBaseUrl())
  const pathname = url.pathname

  if (method === 'POST' && pathname === '/api/workspace/control/submit') {
    try {
      const body = (await readJsonBody(req)) as { prompt?: unknown }
      const prompt =
        typeof body.prompt === 'string' ? body.prompt.trim() : undefined
      if (!prompt) {
        writeJson(res, 400, { error: 'prompt_required' })
        return
      }
      writeJson(res, 200, await submitWorkspacePrompt(prompt))
      return
    } catch (error) {
      writeJson(res, 400, { error: 'invalid_request', detail: String(error) })
      return
    }
  }

  if (method === 'POST' && pathname === '/api/workspace/control/interrupt') {
    writeJson(res, 200, await interruptWorkspaceRun())
    return
  }

  if (method === 'POST' && pathname === '/api/workspace/panes/create') {
    try {
      const body = (await readJsonBody(req)) as {
        title?: unknown
        kind?: unknown
        initialPrompt?: unknown
      }
      writeJson(
        res,
        200,
        await createWorkspacePane({
          title: typeof body.title === 'string' ? body.title : undefined,
          kind: typeof body.kind === 'string' ? body.kind : undefined,
          initialPrompt:
            typeof body.initialPrompt === 'string'
              ? body.initialPrompt
              : undefined,
        }),
      )
      return
    } catch (error) {
      writeJson(res, 400, { error: 'invalid_request', detail: String(error) })
      return
    }
  }

  if (method === 'POST' && pathname === '/api/workspace/panes/switch') {
    try {
      const body = (await readJsonBody(req)) as { paneId?: unknown }
      const paneId =
        typeof body.paneId === 'string' ? body.paneId.trim() : undefined
      if (!paneId) {
        writeJson(res, 400, { error: 'pane_id_required' })
        return
      }
      writeJson(res, 200, await switchWorkspacePane(paneId))
      return
    } catch (error) {
      writeJson(res, 400, { error: 'invalid_request', detail: String(error) })
      return
    }
  }

  if (method === 'POST' && pathname === '/api/workspace/control/dialog') {
    try {
      const body = (await readJsonBody(req)) as { actionId?: unknown }
      const actionId =
        typeof body.actionId === 'string' ? body.actionId.trim() : undefined
      if (!actionId) {
        writeJson(res, 400, { error: 'action_id_required' })
        return
      }
      writeJson(res, 200, await invokeWorkspaceDialogAction(actionId))
      return
    } catch (error) {
      writeJson(res, 400, { error: 'invalid_request', detail: String(error) })
      return
    }
  }

  if (method !== 'GET') {
    writeJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  if (pathname === '/api/workspace/control') {
    writeJson(res, 200, getWorkspaceBridgeSnapshot())
    return
  }

  const state = latestSnapshot
  if (!state) {
    writeJson(res, 503, { error: 'workspace_snapshot_unavailable' })
    return
  }

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
