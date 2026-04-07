import { delimiter, join } from 'path'
import { getDirectConnectServerUrl, getSessionId } from '../bootstrap/state.js'
import { stringWidth } from '../ink/stringWidth.js'
import type { LogOption } from '../types/logs.js'
import { getSubscriptionName, isClaudeAISubscriber } from './auth.js'
import { getCwd } from './cwd.js'
import { getDisplayPath } from './file.js'
import { getFsImplementation } from './fsOperations.js'
import {
  truncate,
  truncateToWidth,
  truncateToWidthNoEllipsis,
} from './format.js'
import { getStoredChangelogFromMemory, parseChangelog } from './releaseNotes.js'
import { gt } from './semver.js'
import { loadMessageLogs } from './sessionStorage.js'
import {
  getInitialSettings,
  getSettingsForSource,
} from './settings/settings.js'
import type { SettingsJson } from './settings/types.js'
import { getClaudeConfigHomeDir } from './envUtils.js'

// Layout constants
const MAX_LEFT_WIDTH = 50
const MAX_USERNAME_LENGTH = 20
const BORDER_PADDING = 4
const DIVIDER_WIDTH = 1
const CONTENT_PADDING = 2

export type LayoutMode = 'horizontal' | 'compact'

export type LayoutDimensions = {
  leftWidth: number
  rightWidth: number
  totalWidth: number
}

/**
 * Determines the layout mode based on terminal width
 */
export function getLayoutMode(columns: number): LayoutMode {
  if (columns >= 70) return 'horizontal'
  return 'compact'
}

/**
 * Calculates layout dimensions for the LogoV2 component
 */
export function calculateLayoutDimensions(
  columns: number,
  layoutMode: LayoutMode,
  optimalLeftWidth: number,
): LayoutDimensions {
  if (layoutMode === 'horizontal') {
    const leftWidth = optimalLeftWidth
    const usedSpace =
      BORDER_PADDING + CONTENT_PADDING + DIVIDER_WIDTH + leftWidth
    const availableForRight = columns - usedSpace

    let rightWidth = Math.max(30, availableForRight)
    const totalWidth = Math.min(
      leftWidth + rightWidth + DIVIDER_WIDTH + CONTENT_PADDING,
      columns - BORDER_PADDING,
    )

    // Recalculate right width if we had to cap the total
    if (totalWidth < leftWidth + rightWidth + DIVIDER_WIDTH + CONTENT_PADDING) {
      rightWidth = totalWidth - leftWidth - DIVIDER_WIDTH - CONTENT_PADDING
    }

    return { leftWidth, rightWidth, totalWidth }
  }

  // Vertical mode
  const totalWidth = Math.min(columns - BORDER_PADDING, MAX_LEFT_WIDTH + 20)
  return {
    leftWidth: totalWidth,
    rightWidth: totalWidth,
    totalWidth,
  }
}

/**
 * Calculates optimal left panel width based on content
 */
export function calculateOptimalLeftWidth(
  welcomeMessage: string,
  truncatedCwd: string,
  modelLine: string,
): number {
  const contentWidth = Math.max(
    stringWidth(welcomeMessage),
    stringWidth(truncatedCwd),
    stringWidth(modelLine),
    20, // Minimum for clawd art
  )
  return Math.min(contentWidth + 4, MAX_LEFT_WIDTH) // +4 for padding
}

/**
 * Formats the welcome message based on username
 */
export function formatWelcomeMessage(username: string | null): string {
  if (!username || username.length > MAX_USERNAME_LENGTH) {
    return 'Welcome back!'
  }
  return `Welcome back ${username}!`
}

/**
 * Truncates a path in the middle if it's too long.
 * Width-aware: uses stringWidth() for correct CJK/emoji measurement.
 */
export function truncatePath(path: string, maxLength: number): string {
  if (stringWidth(path) <= maxLength) return path

  const separator = '/'
  const ellipsis = '…'
  const ellipsisWidth = 1 // '…' is always 1 column
  const separatorWidth = 1

  const parts = path.split(separator)
  const first = parts[0] || ''
  const last = parts[parts.length - 1] || ''
  const firstWidth = stringWidth(first)
  const lastWidth = stringWidth(last)

  // Only one part, so show as much of it as we can
  if (parts.length === 1) {
    return truncateToWidth(path, maxLength)
  }

  // We don't have enough space to show the last part, so truncate it
  // But since firstPart is empty (unix) we don't want the extra ellipsis
  if (first === '' && ellipsisWidth + separatorWidth + lastWidth >= maxLength) {
    return `${separator}${truncateToWidth(last, Math.max(1, maxLength - separatorWidth))}`
  }

  // We have a first part so let's show the ellipsis and truncate last part
  if (
    first !== '' &&
    ellipsisWidth * 2 + separatorWidth + lastWidth >= maxLength
  ) {
    return `${ellipsis}${separator}${truncateToWidth(last, Math.max(1, maxLength - ellipsisWidth - separatorWidth))}`
  }

  // Truncate first and leave last
  if (parts.length === 2) {
    const availableForFirst =
      maxLength - ellipsisWidth - separatorWidth - lastWidth
    return `${truncateToWidthNoEllipsis(first, availableForFirst)}${ellipsis}${separator}${last}`
  }

  // Now we start removing middle parts

  let available =
    maxLength - firstWidth - lastWidth - ellipsisWidth - 2 * separatorWidth

  // Just the first and last are too long, so truncate first
  if (available <= 0) {
    const availableForFirst = Math.max(
      0,
      maxLength - lastWidth - ellipsisWidth - 2 * separatorWidth,
    )
    const truncatedFirst = truncateToWidthNoEllipsis(first, availableForFirst)
    return `${truncatedFirst}${separator}${ellipsis}${separator}${last}`
  }

  // Try to keep as many middle parts as possible
  const middleParts = []
  for (let i = parts.length - 2; i > 0; i--) {
    const part = parts[i]
    if (part && stringWidth(part) + separatorWidth <= available) {
      middleParts.unshift(part)
      available -= stringWidth(part) + separatorWidth
    } else {
      break
    }
  }

  if (middleParts.length === 0) {
    return `${first}${separator}${ellipsis}${separator}${last}`
  }

  return `${first}${separator}${ellipsis}${separator}${middleParts.join(separator)}${separator}${last}`
}

// Simple cache for preloaded activity
let cachedActivity: LogOption[] = []
let cachePromise: Promise<LogOption[]> | null = null

/**
 * Preloads recent conversations for display in Logo v2
 */
export async function getRecentActivity(): Promise<LogOption[]> {
  // Return existing promise if already loading
  if (cachePromise) {
    return cachePromise
  }

  const currentSessionId = getSessionId()
  cachePromise = loadMessageLogs(10)
    .then(logs => {
      cachedActivity = logs
        .filter(log => {
          if (log.isSidechain) return false
          if (log.sessionId === currentSessionId) return false
          if (log.summary?.includes('I apologize')) return false

          // Filter out sessions where both summary and firstPrompt are "No prompt" or missing
          const hasSummary = log.summary && log.summary !== 'No prompt'
          const hasFirstPrompt =
            log.firstPrompt && log.firstPrompt !== 'No prompt'
          return hasSummary || hasFirstPrompt
        })
        .slice(0, 3)
      return cachedActivity
    })
    .catch(() => {
      cachedActivity = []
      return cachedActivity
    })

  return cachePromise
}

/**
 * Gets cached activity synchronously
 */
export function getRecentActivitySync(): LogOption[] {
  return cachedActivity
}

/**
 * Formats release notes for display, with smart truncation
 */
export function formatReleaseNoteForDisplay(
  note: string,
  maxWidth: number,
): string {
  // Simply truncate at the max width, same as Recent Activity descriptions
  return truncate(note, maxWidth)
}

/**
 * Gets the common logo display data used by both LogoV2 and CondensedLogo
 */
export function getLogoDisplayData(): {
  version: string
  cwd: string
  billingType: string
  agentName: string | undefined
  commandPath: string
} {
  const version = process.env.DEMO_VERSION ?? MACRO.VERSION
  const serverUrl = getDirectConnectServerUrl()
  const cwdPath = getCwd()
  const repoDisplayPath =
    cwdPath === '/home/clashuser/hzh/item_bo/learn-likecc/ccsource/claude-code-main' ||
    cwdPath === '/home/clashuser/hzh/item_bo/learn-likecc/ccsource/like-code-main'
      ? 'https://github.com/Harzva/learn-likecc'
      : getDisplayPath(cwdPath)
  const displayPath = process.env.DEMO_VERSION ? '/code/claude' : repoDisplayPath
  const cwd = serverUrl
    ? `${displayPath} in ${serverUrl.replace(/^https?:\/\//, '')}`
    : displayPath
  const billingType = isClaudeAISubscriber()
    ? getSubscriptionName()
    : 'API Usage Billing'
  const agentName = getInitialSettings().agent
  const commandPath = getClaudeCommandDisplayPath()

  return {
    version,
    cwd,
    billingType,
    agentName,
    commandPath,
  }
}

function getClaudeCommandDisplayPath(): string {
  const fs = getFsImplementation()
  const pathEnv = process.env.PATH ?? ''

  for (const dir of pathEnv.split(delimiter)) {
    if (!dir) continue

    const candidate = join(dir, 'claude')
    try {
      if (fs.existsSync(candidate)) {
        return candidate
      }
    } catch {
      // Ignore individual PATH entry failures and keep searching.
    }
  }

  return process.argv[1] || process.execPath || process.argv[0] || 'unknown'
}

function countSkillFiles(skillsDir: string): number {
  try {
    const fs = getFsImplementation()
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
    let count = 0

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue

      if (entry.isDirectory()) {
        const skillFile = join(skillsDir, entry.name, 'SKILL.md')
        if (fs.existsSync(skillFile)) {
          count += 1
        }
        continue
      }

      if (entry.isFile() && entry.name.endsWith('.md')) {
        count += 1
      }
    }

    return count
  } catch {
    return 0
  }
}

function countPermissionRules(settings: SettingsJson | null): number {
  const permissions = settings?.permissions
  if (!permissions) return 0

  return (
    (permissions.allow?.length ?? 0) +
    (permissions.deny?.length ?? 0) +
    (permissions.ask?.length ?? 0)
  )
}

function countHooks(settings: SettingsJson | null): number {
  if (!settings?.hooks) return 0
  return Object.values(settings.hooks).reduce(
    (sum, matchers) => sum + (matchers?.length ?? 0),
    0,
  )
}

function formatLayerSummary(parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join(' · ')
}

export type LayeredConfigSummaryItem = {
  label: string
  source: string
  skills?: number
  rules: number
  hooks: number
  modelRoutes?: number
}

export function getLayeredConfigSummaryItems(): LayeredConfigSummaryItem[] {
  const globalSettings = getSettingsForSource('userSettings')
  const projectSettings = getSettingsForSource('projectSettings')
  const localSettings = getSettingsForSource('localSettings')

  const globalSkills = countSkillFiles(join(getClaudeConfigHomeDir(), 'skills'))
  const projectSkills = countSkillFiles(join(getCwd(), '.claude', 'skills'))

  return [
    {
      label: 'Global',
      source: '~/.claude',
      skills: globalSkills,
      rules: countPermissionRules(globalSettings),
      hooks: countHooks(globalSettings),
    },
    {
      label: 'Project',
      source: '.claude',
      skills: projectSkills,
      rules: countPermissionRules(projectSettings),
      hooks: countHooks(projectSettings),
    },
    {
      label: 'Local',
      source: 'settings.local',
      rules: countPermissionRules(localSettings),
      hooks: countHooks(localSettings),
      modelRoutes: localSettings?.modelRoutes
        ? Object.keys(localSettings.modelRoutes).length
        : undefined,
    },
  ]
}

export function getLayeredConfigSummary(): string[] {
  const lines = getLayeredConfigSummaryItems().map(item =>
    formatLayerSummary([
      `${item.label} ${item.source}`,
      item.skills != null ? `skills ${item.skills}` : null,
      `rules ${item.rules}`,
      `hooks ${item.hooks}`,
      item.modelRoutes != null ? `modelRoutes ${item.modelRoutes}` : null,
    ]),
  )

  return lines.filter(Boolean)
}

/**
 * Determines how to display model and billing information based on available width
 */
export function formatModelAndBilling(
  modelName: string,
  billingType: string,
  availableWidth: number,
): {
  shouldSplit: boolean
  truncatedModel: string
  truncatedBilling: string
} {
  const separator = ' · '
  const combinedWidth =
    stringWidth(modelName) + separator.length + stringWidth(billingType)
  const shouldSplit = combinedWidth > availableWidth

  if (shouldSplit) {
    return {
      shouldSplit: true,
      truncatedModel: truncate(modelName, availableWidth),
      truncatedBilling: truncate(billingType, availableWidth),
    }
  }

  return {
    shouldSplit: false,
    truncatedModel: truncate(
      modelName,
      Math.max(
        availableWidth - stringWidth(billingType) - separator.length,
        10,
      ),
    ),
    truncatedBilling: billingType,
  }
}

/**
 * Gets recent release notes for Logo v2 display
 * For ants, uses commits bundled at build time
 * For external users, uses public changelog
 */
export function getRecentReleaseNotesSync(maxItems: number): string[] {
  // For ants, use bundled changelog
  if (process.env.USER_TYPE === 'ant') {
    const changelog = MACRO.VERSION_CHANGELOG
    if (changelog) {
      const commits = changelog.trim().split('\n').filter(Boolean)
      return commits.slice(0, maxItems)
    }
    return []
  }

  const changelog = getStoredChangelogFromMemory()
  if (!changelog) {
    return []
  }

  let parsed
  try {
    parsed = parseChangelog(changelog)
  } catch {
    return []
  }

  // Get notes from recent versions
  const allNotes: string[] = []
  const versions = Object.keys(parsed)
    .sort((a, b) => (gt(a, b) ? -1 : 1))
    .slice(0, 3) // Look at top 3 recent versions

  for (const version of versions) {
    const notes = parsed[version]
    if (notes) {
      allNotes.push(...notes)
    }
  }

  // Return raw notes without filtering or premature truncation
  return allNotes.slice(0, maxItems)
}
