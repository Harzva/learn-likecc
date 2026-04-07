import * as React from 'react'
import { Box, Text } from '../ink.js'
import { useAppState } from '../state/AppState.js'
import { getActiveSessionTab, normalizeSessionTabsState } from '../utils/sessionTabs.js'

function truncateLabel(label: string, max = 18): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

function buildTabBadge(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' · ')
}

export function SessionTabsBar({ prefixActive = false }: { prefixActive?: boolean }) {
  const rawSessionTabs = useAppState(s => s.sessionTabs)
  const mainLoopModel = useAppState(s => s.mainLoopModel)
  const sessionTabs = normalizeSessionTabsState(rawSessionTabs, mainLoopModel)
  const activeTab = getActiveSessionTab(sessionTabs)

  if (!sessionTabs || sessionTabs.tabOrder.length === 0) {
    return null
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box flexWrap="wrap">
        {sessionTabs.tabOrder.map((tabId, index) => {
          const tab = sessionTabs.tabs[tabId]
          if (!tab) return null
          const isActive = tabId === sessionTabs.activeTabId
          const badge = buildTabBadge([
            tab.model,
            tab.provider,
            tab.status !== 'idle' ? tab.status : undefined,
          ])

          return (
            <Box key={tabId} marginRight={1}>
              <Text color={isActive ? 'cyan' : 'gray'}>
                {isActive ? '[' : '('}
                {index + 1}:{truncateLabel(tab.title)}
                {badge ? ` ${badge}` : ''}
                {isActive ? ']' : ')'}
              </Text>
            </Box>
          )
        })}
        <Text color="green">[+ /tab new]</Text>
      </Box>

      <Box>
        <Text dimColor>
          {activeTab
            ? `Active tab: ${activeTab.title} · ${
                activeTab.kind
              } · ${buildTabBadge([
                activeTab.model,
                activeTab.provider,
                activeTab.repoLabel,
                activeTab.status,
              ])}`
            : 'Active tab: none'}
          {sessionTabs.showSubagentPanel
            ? ' · subagent panel on'
            : ' · subagent panel off'}
          {` · layout ${sessionTabs.layoutMode}`}
          {prefixActive ? ' · tab prefix active' : ''}
        </Text>
      </Box>
    </Box>
  )
}
