import { basename, join } from 'path'
import type { Command, LocalCommandCall } from '../types/command.js'
import { getDisplayPath } from '../utils/file.js'
import { readFileSync } from '../utils/fileRead.js'
import { getFsImplementation } from '../utils/fsOperations.js'
import { getSkillsPath } from '../skills/loadSkillsDir.js'
import type { SettingSource } from '../utils/settings/constants.js'
import {
  getSettingsFilePathForSource,
  getSettingsForSource,
  parseSettingsFile,
} from '../utils/settings/settings.js'
import type { SettingsJson } from '../utils/settings/types.js'
import { jsonStringify } from '../utils/slowOperations.js'

type ShowTarget = 'global' | 'user' | 'project'

const SECRET_KEY_PATTERN = /(token|api[-_]?key|auth[-_]?token|secret|password)/i

function redactSensitiveValue(value: string): string {
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}***${value.slice(-4)}`
}

function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(item => redactSecrets(item))
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, nestedValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (SECRET_KEY_PATTERN.test(key) && typeof nestedValue === 'string') {
        result[key] = redactSensitiveValue(nestedValue)
      } else {
        result[key] = redactSecrets(nestedValue)
      }
    }
    return result
  }

  return value
}

function redactRawJsonText(rawContent: string): string {
  try {
    const parsed = JSON.parse(rawContent)
    return jsonStringify(redactSecrets(parsed), null, 2)
  } catch {
    return rawContent.replace(
      /("(?:[^"]*(?:token|api[-_]?key|auth[-_]?token|secret|password)[^"]*)"\s*:\s*")([^"]+)(")/gi,
      (_match, prefix, secret, suffix) =>
        `${prefix}${redactSensitiveValue(secret)}${suffix}`,
    )
  }
}

function listSkillEntries(dirPath: string): string[] {
  const fs = getFsImplementation()

  try {
    return fs
      .readdirSync(dirPath, { withFileTypes: true })
      .flatMap(entry => {
        if (entry.name.startsWith('.')) return []

        if (entry.isDirectory()) {
          const skillPath = join(dirPath, entry.name, 'SKILL.md')
          return fs.existsSync(skillPath) ? [entry.name] : []
        }

        if (entry.isFile() && entry.name.endsWith('.md')) {
          return [basename(entry.name, '.md')]
        }

        return []
      })
      .sort((a, b) => a.localeCompare(b))
  } catch {
    return []
  }
}

function formatSimpleList(title: string, values: string[]): string[] {
  if (values.length === 0) {
    return [title, '  (none)', '']
  }

  return [title, ...values.map(value => `  - ${value}`), '']
}

function formatRuleList(label: string, rules: unknown[] | undefined): string[] {
  if (!rules || rules.length === 0) {
    return [`  ${label}: 0`]
  }

  return [
    `  ${label}: ${rules.length}`,
    ...rules.map(rule => `    - ${jsonStringify(rule)}`),
  ]
}

function formatHooks(settings: SettingsJson | null): string[] {
  if (!settings?.hooks || Object.keys(settings.hooks).length === 0) {
    return ['Hooks', '  (none)', '']
  }

  const lines = ['Hooks']
  for (const [hookName, matchers] of Object.entries(settings.hooks)) {
    lines.push(`  ${hookName}: ${matchers?.length ?? 0}`)
    for (const matcher of matchers ?? []) {
      lines.push(`    - ${jsonStringify(matcher)}`)
    }
  }
  lines.push('')
  return lines
}

function formatPermissions(settings: SettingsJson | null): string[] {
  if (!settings?.permissions) {
    return ['Permissions', '  (none)', '']
  }

  return [
    'Permissions',
    ...formatRuleList('allow', settings.permissions.allow),
    ...formatRuleList('deny', settings.permissions.deny),
    ...formatRuleList('ask', settings.permissions.ask),
    '',
  ]
}

function formatModelRoutes(settings: SettingsJson | null): string[] {
  if (!settings?.modelRoutes || Object.keys(settings.modelRoutes).length === 0) {
    return ['Model routes', '  (none)', '']
  }

  return [
    'Model routes',
    ...Object.entries(settings.modelRoutes).flatMap(([modelName, route]) => [
      `  ${modelName}`,
      `    ${jsonStringify(route, null, 2).replace(/\n/g, '\n    ')}`,
    ]),
    '',
  ]
}

function formatSettingsFileSection(
  title: string,
  source: SettingSource,
): string[] {
  const fs = getFsImplementation()
  const filePath = getSettingsFilePathForSource(source)

  if (!filePath) {
    return [title, '  Path: unavailable', '']
  }

  const displayPath = getDisplayPath(filePath)
  const exists = fs.existsSync(filePath)
  const rawContent = exists ? readFileSync(filePath) : ''
  const redactedRawContent = redactRawJsonText(rawContent)
  const parsed = parseSettingsFile(filePath)
  const effectiveSettings = getSettingsForSource(source)

  const lines = [
    title,
    `  Path: ${displayPath}`,
    `  Status: ${exists ? 'found' : 'missing'}`,
  ]

  if (parsed.errors.length > 0) {
    lines.push(`  Parse errors: ${parsed.errors.length}`)
    for (const error of parsed.errors) {
      lines.push(`    - ${error.message}`)
    }
  } else if (exists) {
    lines.push('  Parse errors: 0')
  }

  if (exists) {
    lines.push('  Raw file:')
    lines.push(
      ...redactedRawContent
        .split('\n')
        .map(line => `    ${line}`),
    )
  }

  if (effectiveSettings && Object.keys(effectiveSettings).length > 0) {
    lines.push('  Parsed snapshot:')
    lines.push(
      ...jsonStringify(redactSecrets(effectiveSettings), null, 2)
        .split('\n')
        .map(line => `    ${line}`),
    )
  } else {
    lines.push('  Parsed snapshot: (empty)')
  }

  lines.push('')
  return lines
}

function buildUserShowText(label: 'global' | 'user'): string {
  const title =
    label === 'global'
      ? 'Show global ~/.claude details'
      : 'Show user ~/.claude details'
  const skillDir = getSkillsPath('userSettings', 'skills')
  const commandDir = getSkillsPath('userSettings', 'commands')

  return [
    title,
    '',
    ...formatSettingsFileSection('User settings file', 'userSettings'),
    ...formatPermissions(getSettingsForSource('userSettings')),
    ...formatHooks(getSettingsForSource('userSettings')),
    ...formatModelRoutes(getSettingsForSource('userSettings')),
    ...formatSimpleList(
      `User skills (${getDisplayPath(skillDir)})`,
      listSkillEntries(skillDir),
    ),
    ...formatSimpleList(
      `User command-skills (${getDisplayPath(commandDir)})`,
      listSkillEntries(commandDir),
    ),
  ].join('\n')
}

function buildProjectShowText(): string {
  const projectSkillDir = getSkillsPath('projectSettings', 'skills')
  const projectCommandDir = getSkillsPath('projectSettings', 'commands')

  return [
    'Show project .claude details',
    '',
    ...formatSettingsFileSection(
      'Project shared settings file',
      'projectSettings',
    ),
    ...formatPermissions(getSettingsForSource('projectSettings')),
    ...formatHooks(getSettingsForSource('projectSettings')),
    ...formatModelRoutes(getSettingsForSource('projectSettings')),
    ...formatSettingsFileSection(
      'Project local settings file',
      'localSettings',
    ),
    ...formatPermissions(getSettingsForSource('localSettings')),
    ...formatHooks(getSettingsForSource('localSettings')),
    ...formatModelRoutes(getSettingsForSource('localSettings')),
    ...formatSimpleList(
      `Project skills (${getDisplayPath(projectSkillDir)})`,
      listSkillEntries(projectSkillDir),
    ),
    ...formatSimpleList(
      `Project command-skills (${getDisplayPath(projectCommandDir)})`,
      listSkillEntries(projectCommandDir),
    ),
  ].join('\n')
}

function parseShowTarget(args: string): ShowTarget | null {
  const normalized = args.trim().toLowerCase()

  if (normalized === 'global') return 'global'
  if (normalized === 'user') return 'user'
  if (normalized === 'project') return 'project'
  return null
}

function buildShowHelpText(): string {
  return [
    'Usage:',
    '  /show global',
    '  /show user',
    '  /show project',
    '  /show:global',
    '  /show:user',
    '  /show:project',
    '',
    'Purpose:',
    '  Show detailed .claude configuration, skills, hooks, rules, and model routes',
    '  directly in the terminal so users can inspect their active config without an editor.',
  ].join('\n')
}

function makeShowCall(target?: ShowTarget): LocalCommandCall {
  return async args => {
    const resolvedTarget = target ?? parseShowTarget(args)

    if (!resolvedTarget) {
      return {
        type: 'text',
        value: buildShowHelpText(),
      }
    }

    const value =
      resolvedTarget === 'project'
        ? buildProjectShowText()
        : buildUserShowText(resolvedTarget)

    return {
      type: 'text',
      value,
    }
  }
}

function makeCommand(name: string, description: string, target?: ShowTarget) {
  return {
    type: 'local',
    name,
    description,
    supportsNonInteractive: true,
    load: () => Promise.resolve({ call: makeShowCall(target) }),
  } satisfies Command
}

const show = makeCommand(
  'show',
  'Show detailed global or project .claude configuration in the terminal',
)

export const showGlobal = makeCommand(
  'show:global',
  'Show detailed global ~/.claude configuration, skills, hooks, and rules',
  'global',
)

export const showUser = makeCommand(
  'show:user',
  'Show detailed user ~/.claude configuration, skills, hooks, and rules',
  'user',
)

export const showProject = makeCommand(
  'show:project',
  'Show detailed project .claude configuration, local overrides, skills, hooks, and rules',
  'project',
)

export default show
