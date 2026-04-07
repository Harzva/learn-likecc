export type SessionLayoutMode = 'single' | 'tabs' | 'panes'

export type SessionTabKind = 'main' | 'task' | 'review' | 'search' | 'subagent'

export type SessionTabStatus = 'idle' | 'running' | 'waiting' | 'error'

export type SessionTabState = {
  id: string
  title: string
  kind: SessionTabKind
  transcriptId: string
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
    model?: string
    provider?: string
    repoLabel?: string
    worktreePath?: string
    status: SessionTabStatus
    subagentId?: string
  }>
}

export const DEFAULT_MAIN_TAB_ID = 'main'

export function createSessionTab(
  partial: Partial<SessionTabState> & Pick<SessionTabState, 'id' | 'title'>,
): SessionTabState {
  const now = new Date().toISOString()
  return {
    kind: 'main',
    transcriptId: partial.id,
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
