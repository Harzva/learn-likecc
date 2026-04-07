import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { getSessionId } from '../bootstrap/state.js'
import type { AppState } from '../state/AppStateStore.js'
import { registerCleanup } from './cleanupRegistry.js'
import { getCwd } from './cwd.js'
import { getDisplayPath } from './file.js'
import { getActiveSessionTab } from './sessionTabs.js'

const DEFAULT_WORKSPACE_API_PORT = 4310

let latestSnapshot: AppState | null = null
let serverStarted = false

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
  return {
    paneId,
    transcriptId: tab.transcriptId,
    messages: (tab.transcriptMessages ?? []).map(message => ({
      uuid: message.uuid,
      type: message.type,
      createdAt: 'createdAt' in message ? message.createdAt : undefined,
      role: 'role' in message ? message.role : undefined,
      summary:
        'message' in message && typeof message.message?.content === 'string'
          ? message.message.content
          : 'content' in message && typeof message.content === 'string'
            ? message.content
            : undefined,
    })),
  }
}

function buildEventsPayload(state: AppState) {
  const panes = buildPaneSummary(state)
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

  return {
    sessionId: String(getSessionId()),
    activePaneId: state.sessionTabs.activeTabId,
    events,
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
    writeJson(res, 200, {
      product: 'Like Code localhost workspace API',
      session: buildSessionSummary(state),
      endpoints: [
        '/api/sessions',
        '/api/sessions/current',
        '/api/sessions/current/panes',
        '/api/sessions/current/panes/:paneId/transcript',
        '/api/sessions/current/events',
      ],
    })
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
