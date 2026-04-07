import type { Message } from '../types/message.js'
import type { PromptInputMode, VimMode } from '../types/textInputTypes.js'
import type { PastedContent } from './config.js'
import type { TodoList } from './todo/types.js'

export type SessionLayoutMode = 'single' | 'tabs' | 'panes'

export type SessionTabKind = 'main' | 'task' | 'review' | 'search' | 'subagent'

export type SessionTabStatus = 'idle' | 'running' | 'waiting' | 'error'

export type SessionTabState = {
  id: string
  title: string
  kind: SessionTabKind
  transcriptId: string
  transcriptMessages?: Message[]
  transcriptPreview?: string[]
  legacyTodosSnapshot?: Record<string, TodoList>
  taskPreviewLines?: string[]
  taskPreviewSummary?: string
  draftInput?: string
  inputMode?: PromptInputMode
  pastedContents?: Record<number, PastedContent>
  stashedPrompt?: {
    text: string
    cursorOffset: number
    pastedContents: Record<number, PastedContent>
  }
  vimMode?: VimMode
  isSearchingHistory?: boolean
  showBashesDialog?: string | boolean
  isHelpOpen?: boolean
  isMessageSelectorVisible?: boolean
  messageSelectorPreselectUuid?: string
  submitCount?: number
  conversationId?: string
  todoSnapshotId?: string
  model?: string
  provider?: string
  worktreePath?: string
  repoLabel?: string
  status: SessionTabStatus
  subagentId?: string
  unreadCount?: number
  createdAt: string
  updatedAt: string
}

export type SessionTabsState = {
  activeTabId: string
  tabOrder: string[]
  tabs: Record<string, SessionTabState>
  layoutMode: SessionLayoutMode
  showSubagentPanel: boolean
}

export type SessionTabsMetadata = {
  active_tab_id: string
  tab_order: string[]
  layout_mode: SessionLayoutMode
  show_subagent_panel: boolean
  tabs: Array<{
    id: string
    title: string
    kind: SessionTabKind
    transcriptPreview?: string[]
    legacyTodosSnapshot?: Record<string, TodoList>
    taskPreviewLines?: string[]
    taskPreviewSummary?: string
    draftInput?: string
    inputMode?: PromptInputMode
    pastedContents?: Record<number, PastedContent>
    stashedPrompt?: {
      text: string
      cursorOffset: number
      pastedContents: Record<number, PastedContent>
    }
    vimMode?: VimMode
    isSearchingHistory?: boolean
    showBashesDialog?: string | boolean
    isHelpOpen?: boolean
    isMessageSelectorVisible?: boolean
    messageSelectorPreselectUuid?: string
    submitCount?: number
    conversationId?: string
    model?: string
    provider?: string
    repoLabel?: string
    worktreePath?: string
    status: SessionTabStatus
    subagentId?: string
  }>
}

export const DEFAULT_MAIN_TAB_ID = 'main'

export function getSessionTabTodoLaneId(tabId: string): string {
  return `lane-${tabId}`
}

export function createSessionTab(
  partial: Partial<SessionTabState> & Pick<SessionTabState, 'id' | 'title'>,
): SessionTabState {
  const now = new Date().toISOString()
  const transcriptId = partial.transcriptId ?? partial.id
  return {
    kind: 'main',
    transcriptId,
    todoSnapshotId: partial.todoSnapshotId ?? getSessionTabTodoLaneId(partial.id),
    conversationId: partial.conversationId ?? transcriptId,
    submitCount: partial.submitCount ?? 0,
    status: 'idle',
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export function createDefaultSessionTabsState(
  model?: string | null,
): SessionTabsState {
  const mainTab = createSessionTab({
    id: DEFAULT_MAIN_TAB_ID,
    title: 'Main',
    kind: 'main',
    transcriptId: DEFAULT_MAIN_TAB_ID,
    model: model ?? undefined,
    conversationId: DEFAULT_MAIN_TAB_ID,
    submitCount: 0,
  })

  return {
    activeTabId: DEFAULT_MAIN_TAB_ID,
    tabOrder: [DEFAULT_MAIN_TAB_ID],
    tabs: {
      [DEFAULT_MAIN_TAB_ID]: mainTab,
    },
    layoutMode: 'single',
    showSubagentPanel: false,
  }
}

export function normalizeSessionTabsState(
  state: SessionTabsState | undefined,
  model?: string | null,
): SessionTabsState {
  return state ?? createDefaultSessionTabsState(model)
}

export function toSessionTabsMetadata(
  state: SessionTabsState,
): SessionTabsMetadata {
  return {
    active_tab_id: state.activeTabId,
    tab_order: [...state.tabOrder],
    layout_mode: state.layoutMode,
    show_subagent_panel: state.showSubagentPanel,
    tabs: state.tabOrder
      .map(tabId => state.tabs[tabId])
      .filter((tab): tab is SessionTabState => Boolean(tab))
      .map(tab => ({
        id: tab.id,
        title: tab.title,
        kind: tab.kind,
        transcriptPreview: tab.transcriptPreview,
        legacyTodosSnapshot: tab.legacyTodosSnapshot,
        taskPreviewLines: tab.taskPreviewLines,
        taskPreviewSummary: tab.taskPreviewSummary,
        draftInput: tab.draftInput,
        inputMode: tab.inputMode,
        pastedContents: tab.pastedContents,
        stashedPrompt: tab.stashedPrompt,
        vimMode: tab.vimMode,
        isSearchingHistory: tab.isSearchingHistory,
        showBashesDialog: tab.showBashesDialog,
        isHelpOpen: tab.isHelpOpen,
        isMessageSelectorVisible: tab.isMessageSelectorVisible,
        messageSelectorPreselectUuid: tab.messageSelectorPreselectUuid,
        submitCount: tab.submitCount,
        conversationId: tab.conversationId,
        model: tab.model,
        provider: tab.provider,
        repoLabel: tab.repoLabel,
        worktreePath: tab.worktreePath,
        status: tab.status,
        subagentId: tab.subagentId,
      })),
  }
}

export function fromSessionTabsMetadata(
  metadata: SessionTabsMetadata,
): SessionTabsState {
  const now = new Date().toISOString()
  const tabs = Object.fromEntries(
    metadata.tabs.map(tab => [
      tab.id,
      {
        id: tab.id,
        title: tab.title,
        kind: tab.kind,
        transcriptId: tab.id,
        transcriptPreview: tab.transcriptPreview,
        legacyTodosSnapshot: tab.legacyTodosSnapshot,
        taskPreviewLines: tab.taskPreviewLines,
        taskPreviewSummary: tab.taskPreviewSummary,
        draftInput: tab.draftInput,
        inputMode: tab.inputMode,
        pastedContents: tab.pastedContents,
        stashedPrompt: tab.stashedPrompt,
        vimMode: tab.vimMode,
        isSearchingHistory: tab.isSearchingHistory,
        showBashesDialog: tab.showBashesDialog,
        isHelpOpen: tab.isHelpOpen,
        isMessageSelectorVisible: tab.isMessageSelectorVisible,
        messageSelectorPreselectUuid: tab.messageSelectorPreselectUuid,
        submitCount: tab.submitCount,
        conversationId: tab.conversationId,
        model: tab.model,
        provider: tab.provider,
        repoLabel: tab.repoLabel,
        worktreePath: tab.worktreePath,
        status: tab.status,
        subagentId: tab.subagentId,
        createdAt: now,
        updatedAt: now,
      } satisfies SessionTabState,
    ]),
  )

  return {
    activeTabId: metadata.active_tab_id,
    tabOrder: [...metadata.tab_order],
    layoutMode: metadata.layout_mode,
    showSubagentPanel: metadata.show_subagent_panel,
    tabs,
  }
}

export function getSessionTab(
  state: SessionTabsState,
  tabId: string,
): SessionTabState | undefined {
  return state.tabs[tabId]
}

export function getActiveSessionTab(
  state: SessionTabsState,
): SessionTabState | undefined {
  return getSessionTab(state, state.activeTabId)
}

export function createSessionTaskTab(
  title: string,
  partial?: Partial<SessionTabState>,
): SessionTabState {
  const id = `tab-${Date.now().toString(36)}`
  return createSessionTab({
    id,
    title,
    kind: 'task',
    transcriptId: id,
    ...partial,
  })
}

export function inferSessionTabProvider(
  model?: string,
  baseURL?: string,
): string | undefined {
  if (model?.includes('/')) {
    const [provider] = model.split('/', 1)
    return provider || undefined
  }

  if (baseURL) {
    try {
      return new URL(baseURL).host
    } catch {
      // Ignore invalid URLs and fall through to model heuristics.
    }
  }

  if (!model) {
    return undefined
  }

  if (model.toLowerCase().startsWith('claude')) {
    return 'anthropic'
  }

  return 'custom'
}

export function addSessionTab(
  state: SessionTabsState,
  tab: SessionTabState,
): SessionTabsState {
  return {
    ...state,
    activeTabId: tab.id,
    tabOrder: [...state.tabOrder, tab.id],
    layoutMode: 'tabs',
    tabs: {
      ...state.tabs,
      [tab.id]: tab,
    },
  }
}

export function updateSessionTab(
  state: SessionTabsState,
  tabId: string,
  updates: Partial<SessionTabState>,
): SessionTabsState {
  const existing = state.tabs[tabId]
  if (!existing) return state

  const nextTab: SessionTabState = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  const sameTab =
    nextTab.title === existing.title &&
    nextTab.kind === existing.kind &&
    nextTab.transcriptId === existing.transcriptId &&
    nextTab.transcriptMessages === existing.transcriptMessages &&
    JSON.stringify(nextTab.transcriptPreview) ===
      JSON.stringify(existing.transcriptPreview) &&
    JSON.stringify(nextTab.legacyTodosSnapshot) ===
      JSON.stringify(existing.legacyTodosSnapshot) &&
    JSON.stringify(nextTab.taskPreviewLines) ===
      JSON.stringify(existing.taskPreviewLines) &&
    nextTab.taskPreviewSummary === existing.taskPreviewSummary &&
    nextTab.draftInput === existing.draftInput &&
    nextTab.inputMode === existing.inputMode &&
    JSON.stringify(nextTab.pastedContents) ===
      JSON.stringify(existing.pastedContents) &&
    JSON.stringify(nextTab.stashedPrompt) ===
      JSON.stringify(existing.stashedPrompt) &&
    nextTab.vimMode === existing.vimMode &&
    nextTab.isSearchingHistory === existing.isSearchingHistory &&
    nextTab.showBashesDialog === existing.showBashesDialog &&
    nextTab.isHelpOpen === existing.isHelpOpen &&
    nextTab.isMessageSelectorVisible === existing.isMessageSelectorVisible &&
    nextTab.messageSelectorPreselectUuid ===
      existing.messageSelectorPreselectUuid &&
    nextTab.submitCount === existing.submitCount &&
    nextTab.conversationId === existing.conversationId &&
    nextTab.todoSnapshotId === existing.todoSnapshotId &&
    nextTab.model === existing.model &&
    nextTab.provider === existing.provider &&
    nextTab.worktreePath === existing.worktreePath &&
    nextTab.repoLabel === existing.repoLabel &&
    nextTab.status === existing.status &&
    nextTab.subagentId === existing.subagentId &&
    nextTab.unreadCount === existing.unreadCount

  if (sameTab) {
    return state
  }

  return {
    ...state,
    tabs: {
      ...state.tabs,
      [tabId]: nextTab,
    },
  }
}

export function switchSessionTab(
  state: SessionTabsState,
  tabId: string,
): SessionTabsState {
  if (!state.tabs[tabId]) return state
  return {
    ...state,
    activeTabId: tabId,
  }
}

export function renameSessionTab(
  state: SessionTabsState,
  tabId: string,
  title: string,
): SessionTabsState {
  const existing = state.tabs[tabId]
  if (!existing) return state
  return {
    ...state,
    tabs: {
      ...state.tabs,
      [tabId]: {
        ...existing,
        title,
        updatedAt: new Date().toISOString(),
      },
    },
  }
}

export function closeSessionTab(
  state: SessionTabsState,
  tabId: string,
): SessionTabsState {
  if (tabId === DEFAULT_MAIN_TAB_ID) return state
  if (!state.tabs[tabId]) return state

  const nextOrder = state.tabOrder.filter(id => id !== tabId)
  if (nextOrder.length === 0) {
    return createDefaultSessionTabsState()
  }

  const nextTabs = { ...state.tabs }
  delete nextTabs[tabId]

  const nextActiveTabId =
    state.activeTabId === tabId ? (nextOrder[nextOrder.length - 1] ?? DEFAULT_MAIN_TAB_ID) : state.activeTabId

  return {
    ...state,
    activeTabId: nextActiveTabId,
    tabOrder: nextOrder,
    tabs: nextTabs,
    layoutMode: nextOrder.length > 1 ? 'tabs' : 'single',
  }
}

export function cycleSessionTab(
  state: SessionTabsState,
  direction: 1 | -1,
): SessionTabsState {
  const currentIndex = state.tabOrder.indexOf(state.activeTabId)
  if (currentIndex === -1 || state.tabOrder.length <= 1) return state
  const nextIndex =
    (currentIndex + direction + state.tabOrder.length) % state.tabOrder.length
  const nextTabId = state.tabOrder[nextIndex]
  return nextTabId ? switchSessionTab(state, nextTabId) : state
}

export function toggleSubagentPanel(
  state: SessionTabsState,
): SessionTabsState {
  const showSubagentPanel = !state.showSubagentPanel
  return {
    ...state,
    layoutMode: showSubagentPanel
      ? 'panes'
      : state.tabOrder.length > 1
        ? 'tabs'
        : 'single',
    showSubagentPanel,
  }
}
