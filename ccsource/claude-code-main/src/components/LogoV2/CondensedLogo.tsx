import * as React from 'react'
import { useEffect } from 'react'
import { useMainLoopModel } from '../../hooks/useMainLoopModel.js'
import { useTerminalSize } from '../../hooks/useTerminalSize.js'
import { stringWidth } from '../../ink/stringWidth.js'
import { Box, Text } from '../../ink.js'
import { useAppState } from '../../state/AppState.js'
import { getEffortSuffix } from '../../utils/effort.js'
import { truncate } from '../../utils/format.js'
import { isFullscreenEnvEnabled } from '../../utils/fullscreen.js'
import {
  formatModelAndBilling,
  formatReleaseNoteForDisplay,
  getLayeredConfigSummaryItems,
  getLogoDisplayData,
  getRecentActivitySync,
  getRecentReleaseNotesSync,
  truncatePath,
  type LayeredConfigSummaryItem,
} from '../../utils/logoV2Utils.js'
import { getWorkspaceApiBaseUrl } from '../../utils/workspaceApiServer.js'
import { renderModelSetting } from '../../utils/model/model.js'
import { OffscreenFreeze } from '../OffscreenFreeze.js'
import { AnimatedClawd } from './AnimatedClawd.js'
import { Clawd } from './Clawd.js'
import {
  GuestPassesUpsell,
  incrementGuestPassesSeenCount,
  useShowGuestPassesUpsell,
} from './GuestPassesUpsell.js'
import {
  incrementOverageCreditUpsellSeenCount,
  OverageCreditUpsell,
  useShowOverageCreditUpsell,
} from './OverageCreditUpsell.js'

const LIKECODE_BLUE = 'rgb(88,166,255)'
const LIKECODE_HEART = 'rgb(255,120,170)'

function InfoDot() {
  return (
    <Text dimColor>
      {' · '}
    </Text>
  )
}

function Metric({
  label,
  value,
  color = 'greenBright',
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <Text>
      <Text dimColor>{label} </Text>
      <Text color={color} bold>
        {value}
      </Text>
    </Text>
  )
}

function ConfigLayerLine({ item }: { item: LayeredConfigSummaryItem }) {
  const labelColor =
    item.label === 'Global'
      ? 'cyanBright'
      : item.label === 'Project'
        ? 'blueBright'
        : 'magentaBright'

  return (
    <Text>
      <Text color={labelColor} bold>
        {item.label}
      </Text>
      <Text dimColor> {item.source}</Text>
      <InfoDot />
      {item.skills != null ? (
        <>
          <Metric label="skills" value={item.skills} />
          <InfoDot />
        </>
      ) : null}
      <Metric label="rules" value={item.rules} color="yellowBright" />
      <InfoDot />
      <Metric label="hooks" value={item.hooks} color="cyanBright" />
      {item.modelRoutes != null ? (
        <>
          <InfoDot />
          <Metric
            label="routes"
            value={item.modelRoutes}
            color="magentaBright"
          />
        </>
      ) : null}
    </Text>
  )
}

export function CondensedLogo() {
  const { columns } = useTerminalSize()
  const agent = useAppState(state => state.agent)
  const effortValue = useAppState(state => state.effortValue)
  const model = useMainLoopModel()
  const modelDisplayName = renderModelSetting(model)
  const {
    cwd,
    billingType,
    agentName: agentNameFromSettings,
    commandPath,
  } =
    getLogoDisplayData()
  const configSummaryItems = getLayeredConfigSummaryItems()
  const agentName = agent ?? agentNameFromSettings
  const showGuestPassesUpsell = useShowGuestPassesUpsell()
  const showOverageCreditUpsell = useShowOverageCreditUpsell()

  useEffect(() => {
    if (showGuestPassesUpsell) {
      incrementGuestPassesSeenCount()
    }
  }, [showGuestPassesUpsell])

  useEffect(() => {
    if (showOverageCreditUpsell && !showGuestPassesUpsell) {
      incrementOverageCreditUpsellSeenCount()
    }
  }, [showOverageCreditUpsell, showGuestPassesUpsell])

  const textWidth = Math.max(columns - 15, 20)
  const effortSuffix = getEffortSuffix(model, effortValue)
  const { shouldSplit, truncatedModel, truncatedBilling } = formatModelAndBilling(
    modelDisplayName + effortSuffix,
    billingType,
    textWidth,
  )
  const restoredBilling = `${truncatedBilling} · Harzva restored`
  const cwdAvailableWidth = agentName
    ? textWidth - 1 - stringWidth(agentName) - 3
    : textWidth
  const truncatedCwd = truncatePath(cwd, Math.max(cwdAvailableWidth, 10))
  const workspaceLine = agentName
    ? `Harzva restored · @${agentName} · ${truncatedCwd}`
    : `Harzva restored · ${truncatedCwd}`
  const truncatedCommandPath = truncate(commandPath, Math.max(textWidth, 20))
  const webWorkspaceUrl = getWorkspaceApiBaseUrl()
  const likeWordmark = ['L I K E ♥', 'L I K E ♥', 'L I K E ♥']
  const recentActivity = getRecentActivitySync().slice(0, 3)
  const recentNotes = getRecentReleaseNotesSync(3)
  const rightWidth = Math.max(Math.floor(columns * 0.48), 34)
  const leftWidth = Math.max(columns - rightWidth - 9, 32)
  const leftPanelWidth = Math.max(leftWidth - 2, 30)
  const rightPanelWidth = Math.max(rightWidth - 2, 30)
  const dividerHeight = 12
  const isTwoColumn = columns >= 92
  const title = ` Like Code v2.1.88 `

  return (
    <OffscreenFreeze>
      <Box flexDirection="column">
        <Box
          borderStyle="round"
          borderColor={LIKECODE_BLUE}
          borderText={title}
          paddingX={1}
          paddingY={0}
          flexDirection="column"
        >
          <Box
            flexDirection={isTwoColumn ? 'row' : 'column'}
            gap={isTwoColumn ? 1 : 0}
          >
            <Box
              width={isTwoColumn ? leftPanelWidth : undefined}
              flexDirection="column"
              alignItems="center"
              paddingRight={isTwoColumn ? 1 : 0}
            >
              <Text bold>Welcome back!</Text>
              <Box marginTop={1} marginBottom={1} flexDirection="column" alignItems="center">
                {likeWordmark.map((line, index) => (
                  <Text key={`${line}-${index}`} color={LIKECODE_BLUE} bold>
                    {line.slice(0, -1)}
                    <Text color={LIKECODE_HEART} bold>
                      ♥
                    </Text>
                  </Text>
                ))}
                {isFullscreenEnvEnabled() ? <AnimatedClawd /> : <Clawd />}
              </Box>

              {shouldSplit ? (
                <>
                  <Text color={LIKECODE_BLUE} bold>
                    {truncate(truncatedModel, leftPanelWidth - 2)}
                  </Text>
                  <Text>
                    <Text color="yellowBright">
                      {truncate(truncatedBilling, leftPanelWidth - 2)}
                    </Text>
                    <Text dimColor> · </Text>
                    <Text color="greenBright">Harzva restored</Text>
                  </Text>
                </>
              ) : (
                <Text>
                  <Text color={LIKECODE_BLUE} bold>
                    {truncate(truncatedModel, leftPanelWidth - 24)}
                  </Text>
                  <Text dimColor> · </Text>
                  <Text color="yellowBright">{truncatedBilling}</Text>
                </Text>
              )}

              <Text dimColor>{truncate(workspaceLine, leftPanelWidth)}</Text>
              <Text dimColor>{truncate(truncatedCommandPath, leftPanelWidth)}</Text>
            </Box>

            {isTwoColumn ? (
              <Box
                height={dividerHeight}
                borderStyle="single"
                borderColor={LIKECODE_BLUE}
                borderTop={false}
                borderBottom={false}
                borderRight={false}
                width={1}
              />
            ) : null}

            <Box
              flexGrow={1}
              width={isTwoColumn ? rightPanelWidth : undefined}
              flexDirection="column"
              paddingLeft={isTwoColumn ? 1 : 0}
              marginTop={isTwoColumn ? 0 : 1}
            >
              <Text color={LIKECODE_BLUE} bold>
                Tips for getting started
              </Text>
              <Text>
                Run <Text color={LIKECODE_BLUE}>/show:slash</Text> to inspect built-in commands
              </Text>
              <Text>
                Web <Text color={LIKECODE_BLUE}>{truncate(webWorkspaceUrl, rightPanelWidth - 6)}</Text>
              </Text>

              <Box
                marginTop={1}
                borderTop
                borderColor={LIKECODE_BLUE}
                paddingTop={0}
                flexDirection="column"
              >
                <Text color={LIKECODE_BLUE} bold>
                  Recent activity
                </Text>
                {recentActivity.length > 0 ? (
                  recentActivity.map(log => {
                    const description =
                      log.summary && log.summary !== 'No prompt'
                        ? log.summary
                        : log.firstPrompt || 'No prompt'

                    return (
                      <Text key={log.sessionId ?? description}>
                        {truncate(description, rightPanelWidth)}
                      </Text>
                    )
                  })
                ) : (
                  <Text dimColor>No recent activity</Text>
                )}
              </Box>

              <Box
                marginTop={1}
                borderTop
                borderColor={LIKECODE_BLUE}
                paddingTop={0}
                flexDirection="column"
              >
                <Text color={LIKECODE_BLUE} bold>
                  What's new
                </Text>
                {recentNotes.length > 0 ? (
                  recentNotes.map(note => (
                    <Text key={note}>
                      {formatReleaseNoteForDisplay(note, rightPanelWidth)}
                    </Text>
                  ))
                ) : (
                  <Text dimColor>Check the changelog for updates</Text>
                )}
              </Box>
            </Box>
          </Box>

          <Box marginTop={1} flexDirection="column">
            {configSummaryItems.map(item => (
              <ConfigLayerLine
                key={`${item.label}-${item.source}`}
                item={item}
              />
            ))}
            {showGuestPassesUpsell ? <GuestPassesUpsell /> : null}
            {!showGuestPassesUpsell && showOverageCreditUpsell ? (
              <OverageCreditUpsell maxWidth={textWidth} twoLine />
            ) : null}
          </Box>
        </Box>
      </Box>
    </OffscreenFreeze>
  )
}
