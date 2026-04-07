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
  getLayeredConfigSummaryItems,
  getLogoDisplayData,
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

  return (
    <OffscreenFreeze>
      <Box flexDirection="row" gap={2} alignItems="center">
        <Box flexDirection="column" alignItems="center">
          <Text color="blueBright" bold>
            Like
          </Text>
          {isFullscreenEnvEnabled() ? <AnimatedClawd /> : <Clawd />}
        </Box>

        <Box flexDirection="column">
          <Text>
            <Text color="whiteBright" bold>
              code
            </Text>
            <Text dimColor> · Harzva restored · v2.1.88</Text>
          </Text>

          {shouldSplit ? (
            <>
              <Text>
                <Text color="blueBright" bold>
                  {truncatedModel}
                </Text>
              </Text>
              <Text>
                <Text color="yellowBright">{truncatedBilling}</Text>
                <Text dimColor> · </Text>
                <Text color="greenBright">Harzva restored</Text>
              </Text>
            </>
          ) : (
            <Text>
              <Text color="blueBright" bold>
                {truncatedModel}
              </Text>
              <Text dimColor> · </Text>
              <Text color="yellowBright">{truncatedBilling}</Text>
              <Text dimColor> · </Text>
              <Text color="greenBright">Harzva restored</Text>
            </Text>
          )}

          <Text>
            <Text color="cyan">Workspace</Text>
            <Text dimColor> · </Text>
            <Text color="white">{workspaceLine}</Text>
          </Text>

          <Text>
            <Text color="cyan">Command</Text>
            <Text dimColor> · </Text>
            <Text color="whiteBright">{truncatedCommandPath}</Text>
          </Text>

          <Text>
            <Text color="cyan">Web</Text>
            <Text dimColor> · </Text>
            <Text color="blueBright">{webWorkspaceUrl}</Text>
          </Text>

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
    </OffscreenFreeze>
  )
}
