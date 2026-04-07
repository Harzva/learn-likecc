import type { Command, LocalCommandCall } from '../types/command.js'
import {
  addSessionTab,
  closeSessionTab,
  createSessionTaskTab,
  cycleSessionTab,
  getActiveSessionTab,
  normalizeSessionTabsState,
  renameSessionTab,
  type SessionTabsState,
  switchSessionTab,
  toggleSubagentPanel,
} from '../utils/sessionTabs.js'

function buildUsage(): string {
  return [
    'Usage:',
    '  /tab list',
    '  /tab new [title]',
    '  /tab next',
    '  /tab prev',
    '  /tab switch <id|index|title>',
    '  /tab rename <title>',
    '  /tab close [id|index|title]',
    '  /tab panel',
    '',
    'Purpose:',
    '  Manage session tabs for multi-task work in the same session.',
  ].join('\n')
}

function matchTabId(
  input: string,
  state: SessionTabsState,
): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (state.tabs[trimmed]) return trimmed

  const index = Number.parseInt(trimmed, 10)
  if (
    Number.isFinite(index) &&
    index >= 1 &&
    index <= state.tabOrder.length &&
    state.tabOrder[index - 1]
  ) {
    return state.tabOrder[index - 1] ?? null
  }

  const lower = trimmed.toLowerCase()
  const byTitle = state.tabOrder.find(tabId =>
    state.tabs[tabId]?.title.toLowerCase() === lower,
  )

  return byTitle ?? null
}

const call: LocalCommandCall = async (args, context) => {
  const trimmed = args.trim()
  const [action = 'list', ...rest] = trimmed.length > 0 ? trimmed.split(/\s+/) : []
  const appState = context.getAppState()
  const sessionTabs = normalizeSessionTabsState(
    appState.sessionTabs,
    appState.mainLoopModel,
  )
  const activeTab = getActiveSessionTab(sessionTabs)

  switch (action) {
    case 'list': {
      const lines = [
        'Session tabs',
        '',
        ...sessionTabs.tabOrder.map((tabId, index) => {
          const tab = sessionTabs.tabs[tabId]
          if (!tab) return `${index + 1}. ${tabId} (missing)`
          return `${tabId === sessionTabs.activeTabId ? '*' : ' '} ${index + 1}. ${
            tab.title
          } · ${tab.kind}${tab.model ? ` · ${tab.model}` : ''}${
            tab.provider ? ` · ${tab.provider}` : ''
          } · ${tab.status}`
        }),
      ]

      return {
        type: 'text',
        value: lines.join('\n'),
      }
    }

    case 'new': {
      const title = rest.join(' ').trim() || `Task ${sessionTabs.tabOrder.length}`
      const nextTab = createSessionTaskTab(title, {
        model: activeTab?.model ?? appState.mainLoopModel ?? undefined,
        provider: activeTab?.provider,
        repoLabel: activeTab?.repoLabel,
        worktreePath: activeTab?.worktreePath,
      })

      context.setAppState(prev => ({
        ...prev,
        sessionTabs: addSessionTab(
          normalizeSessionTabsState(prev.sessionTabs, prev.mainLoopModel),
          nextTab,
        ),
      }))

      return {
        type: 'text',
        value: `Created tab ${nextTab.title} (${nextTab.id})`,
      }
    }

    case 'next': {
      context.setAppState(prev => ({
        ...prev,
        sessionTabs: cycleSessionTab(
          normalizeSessionTabsState(prev.sessionTabs, prev.mainLoopModel),
          1,
        ),
      }))
      const nextState = normalizeSessionTabsState(
        context.getAppState().sessionTabs,
        context.getAppState().mainLoopModel,
      )
      return {
        type: 'text',
        value: `Switched to ${getActiveSessionTab(nextState)?.title ?? 'unknown tab'}`,
      }
    }

    case 'prev': {
      context.setAppState(prev => ({
        ...prev,
        sessionTabs: cycleSessionTab(
          normalizeSessionTabsState(prev.sessionTabs, prev.mainLoopModel),
          -1,
        ),
      }))
      const nextState = normalizeSessionTabsState(
        context.getAppState().sessionTabs,
        context.getAppState().mainLoopModel,
      )
      return {
        type: 'text',
        value: `Switched to ${getActiveSessionTab(nextState)?.title ?? 'unknown tab'}`,
      }
    }

    case 'switch': {
      const target = matchTabId(rest.join(' '), sessionTabs)
      if (!target) {
        return { type: 'text', value: `Tab not found.\n\n${buildUsage()}` }
      }

      context.setAppState(prev => ({
        ...prev,
        sessionTabs: switchSessionTab(
          normalizeSessionTabsState(prev.sessionTabs, prev.mainLoopModel),
          target,
        ),
      }))

      return {
        type: 'text',
        value: `Switched to ${sessionTabs.tabs[target]?.title ?? target}`,
      }
    }

    case 'rename': {
      const title = rest.join(' ').trim()
      if (!title || !activeTab) {
        return { type: 'text', value: `Rename needs a title.\n\n${buildUsage()}` }
      }

      context.setAppState(prev => ({
        ...prev,
        sessionTabs: renameSessionTab(
          normalizeSessionTabsState(prev.sessionTabs, prev.mainLoopModel),
          normalizeSessionTabsState(prev.sessionTabs, prev.mainLoopModel)
            .activeTabId,
          title,
        ),
      }))

      return {
        type: 'text',
        value: `Renamed active tab to ${title}`,
      }
    }

    case 'close': {
      const target = rest.length > 0 ? matchTabId(rest.join(' '), sessionTabs) : sessionTabs.activeTabId
      if (!target) {
        return { type: 'text', value: `Tab not found.\n\n${buildUsage()}` }
      }
      if (target === 'main') {
        return { type: 'text', value: 'Main tab cannot be closed.' }
      }
      const closingTitle = sessionTabs.tabs[target]?.title ?? target
      context.setAppState(prev => ({
        ...prev,
        sessionTabs: closeSessionTab(
          normalizeSessionTabsState(prev.sessionTabs, prev.mainLoopModel),
          target,
        ),
      }))
      return {
        type: 'text',
        value: `Closed tab ${closingTitle}`,
      }
    }

    case 'panel': {
      context.setAppState(prev => ({
        ...prev,
        sessionTabs: toggleSubagentPanel(
          normalizeSessionTabsState(prev.sessionTabs, prev.mainLoopModel),
        ),
      }))
      const nextState = normalizeSessionTabsState(
        context.getAppState().sessionTabs,
        context.getAppState().mainLoopModel,
      )
      return {
        type: 'text',
        value: `Subagent panel ${nextState.showSubagentPanel ? 'enabled' : 'disabled'}`,
      }
    }

    default:
      return { type: 'text', value: buildUsage() }
  }
}

const tab = {
  type: 'local',
  name: 'tab',
  description: 'Manage session tabs for multi-task work in one session',
  argumentHint: '<list|new|next|prev|switch|rename|close|panel>',
  supportsNonInteractive: true,
  load: () => Promise.resolve({ call }),
} satisfies Command

export default tab
