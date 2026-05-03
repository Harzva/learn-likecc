export interface CheatSheetItem {
  name: string;
  description: string;
  example?: string;
}

export interface CheatSheetSection {
  id: string;
  title: string;
  items: CheatSheetItem[];
}

export interface WorkflowStep {
  step: number;
  command: string;
  description: string;
}

export interface Workflow {
  id: string;
  title: string;
  steps: WorkflowStep[];
}

export const sections: CheatSheetSection[] = [
  {
    id: 'slash-commands',
    title: 'Slash Commands',
    items: [
      {
        name: '/help',
        description: 'Display all available commands and their descriptions',
      },
      {
        name: '/compact',
        description: 'Optimize memory by compressing conversation history',
        example: '/compact',
      },
      {
        name: '/clear',
        description: 'Clear the terminal screen',
      },
      {
        name: '/context',
        description: 'Show current conversation context and tracked files',
        example: '/context',
      },
      {
        name: '/cost',
        description: 'Display session cost and token usage statistics',
      },
      {
        name: '/status',
        description: 'Show system status and connection info',
      },
      {
        name: '/model',
        description: 'Display or change the current AI model',
        example: '/model claude-sonnet-4-20250514',
      },
      {
        name: '/effort [level]',
        description: 'Set effort level: low, medium, or high',
        example: '/effort high',
      },
      {
        name: '/exit',
        description: 'Exit the Claude Code session',
      },
      {
        name: '/diff',
        description: 'Show all changes made during the current session',
      },
      {
        name: '/doctor',
        description: 'Run diagnostics to check system health',
      },
      {
        name: '/memory',
        description: 'Show memory status and loaded project rules',
      },
      {
        name: '/review',
        description: 'Request a code review of recent changes',
        example: '/review --detailed',
      },
      {
        name: '/init',
        description: 'Initialize Claude Code for the current project',
      },
      {
        name: '/rename',
        description: 'Rename the current conversation',
        example: '/rename "API Integration Refactor"',
      },
      {
        name: '/branch',
        description: 'Create a new git branch from the current session',
      },
      {
        name: '/export',
        description: 'Export the current conversation to a file',
        example: '/export --json',
      },
      {
        name: '/rewind',
        description: 'Undo recent changes and revert to a previous state',
      },
      {
        name: '/permissions',
        description: 'View and manage permission settings',
      },
      {
        name: '/config',
        description: 'View and edit configuration settings',
      },
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    items: [
      {
        name: 'Ctrl + C',
        description: 'Cancel the current operation',
      },
      {
        name: 'Ctrl + L',
        description: 'Clear the terminal screen',
      },
      {
        name: 'Up / Down',
        description: 'Navigate through command history',
      },
      {
        name: 'Tab',
        description: 'Autocomplete commands and file paths',
      },
      {
        name: 'Ctrl + D',
        description: 'Exit the Claude Code session',
      },
      {
        name: 'Ctrl + A',
        description: 'Move cursor to the beginning of the line',
      },
      {
        name: 'Ctrl + E',
        description: 'Move cursor to the end of the line',
      },
      {
        name: 'Ctrl + U',
        description: 'Clear the current line',
      },
      {
        name: 'Ctrl + K',
        description: 'Delete from cursor to end of line',
      },
      {
        name: 'Ctrl + W',
        description: 'Delete the word before the cursor',
      },
    ],
  },
  {
    id: 'cli-flags',
    title: 'CLI Flags',
    items: [
      {
        name: '--model [name]',
        description: 'Specify the AI model on startup',
        example: 'claude --model claude-sonnet-4-20250514',
      },
      {
        name: '--cwd [path]',
        description: 'Set the working directory',
        example: 'claude --cwd /home/user/project',
      },
      {
        name: '--config [path]',
        description: 'Use a custom configuration file',
        example: 'claude --config ~/.claude/custom.json',
      },
      {
        name: '--no-tools',
        description: 'Disable tool use for the session',
      },
      {
        name: '--verbose',
        description: 'Enable verbose output for debugging',
      },
      {
        name: '--debug',
        description: 'Run in debug mode with extra logging',
      },
      {
        name: '--version',
        description: 'Show the Claude Code version',
      },
      {
        name: '--help',
        description: 'Show help information about CLI options',
      },
    ],
  },
  {
    id: 'configuration-files',
    title: 'Configuration Files',
    items: [
      {
        name: 'CLAUDE.md',
        description: 'Project-specific context, conventions, and rules for Claude Code',
      },
      {
        name: '~/.claude/settings.json',
        description: 'Global user settings and preferences',
      },
      {
        name: '.claude/config.json',
        description: 'Project-level configuration overrides',
      },
      {
        name: '.claude/skills/',
        description: 'Directory containing skill definitions and custom abilities',
      },
      {
        name: '.claude/hooks/',
        description: 'Directory containing hook scripts for automation',
      },
      {
        name: '.claude/plugins/',
        description: 'Directory for plugin configurations',
      },
    ],
  },
  {
    id: 'mcp-setup',
    title: 'MCP Setup',
    items: [
      {
        name: '@mcp add [name]',
        description: 'Add and configure an MCP server',
        example: '@mcp add filesystem',
      },
      {
        name: '@mcp list',
        description: 'List all configured MCP servers',
      },
      {
        name: '@mcp remove [name]',
        description: 'Remove an MCP server from configuration',
      },
      {
        name: 'stdio transport',
        description: 'Standard input/output transport for local MCP servers',
      },
      {
        name: 'sse transport',
        description: 'Server-Sent Events transport for remote MCP servers',
      },
    ],
  },
  {
    id: 'hooks',
    title: 'Hooks',
    items: [
      {
        name: 'pre-command',
        description: 'Runs before each command is executed. Use for validation, logging, or setup tasks.',
      },
      {
        name: 'post-command',
        description: 'Runs after each command completes. Use for cleanup, notifications, or side effects.',
      },
      {
        name: 'pre-save',
        description: 'Runs before file modifications are saved. Use for linting, formatting, or validation.',
      },
      {
        name: 'post-save',
        description: 'Runs after file modifications are saved. Use for post-processing or triggering builds.',
      },
    ],
  },
  {
    id: 'permissions',
    title: 'Permissions',
    items: [
      {
        name: 'read',
        description: 'Read files and directories. Allows viewing project files and folder structures.',
      },
      {
        name: 'write',
        description: 'Create and modify files. Allows editing, creating new files, and deleting existing ones.',
      },
      {
        name: 'execute',
        description: 'Run shell commands. Allows executing scripts, installing packages, and running tests.',
      },
      {
        name: 'network',
        description: 'Make network requests. Allows API calls, fetching dependencies, and web access.',
      },
    ],
  },
  {
    id: 'subagents',
    title: 'Subagents',
    items: [
      {
        name: '@agent create [name]',
        description: 'Create a new subagent with a custom configuration',
        example: '@agent create frontend-expert',
      },
      {
        name: '@agent list',
        description: 'List all available subagents and their configurations',
      },
      {
        name: '@agent [name] [task]',
        description: 'Delegate a task to a specific subagent',
        example: '@agent frontend-expert "Review the Button component"',
      },
      {
        name: '@agent remove [name]',
        description: 'Remove a subagent from the configuration',
      },
    ],
  },
  {
    id: 'plugins',
    title: 'Plugins',
    items: [
      {
        name: '@plugin install [name]',
        description: 'Install a plugin from the registry',
        example: '@plugin install eslint-helper',
      },
      {
        name: '@plugin list',
        description: 'List all installed plugins and their versions',
      },
      {
        name: '@plugin uninstall [name]',
        description: 'Remove an installed plugin',
      },
      {
        name: '@plugin enable [name]',
        description: 'Enable a previously disabled plugin',
      },
      {
        name: '@plugin disable [name]',
        description: 'Disable a plugin without removing it',
      },
    ],
  },
  {
    id: 'tools-reference',
    title: 'Tools Reference',
    items: [
      {
        name: 'Read',
        description: 'Read files from local filesystem. Supports offset/limit for large files, PDF reading, image viewing, and Jupyter notebooks.',
        example: 'Read({ file_path: "/home/user/project/src/App.tsx", offset: 10, limit: 50 })',
      },
      {
        name: 'Edit',
        description: 'Exact string replacement in files. Must Read the file first. Use old_string/new_string pairs. Supports replace_all.',
        example: 'Edit({ file_path: "/src/App.tsx", old_string: "foo", new_string: "bar" })',
      },
      {
        name: 'Write',
        description: 'Write files to local filesystem. Overwrites existing files. Must Read existing file first before overwriting.',
        example: 'Write({ file_path: "/src/new.tsx", content: "export default..." })',
      },
      {
        name: 'Bash',
        description: 'Execute bash commands. Working directory persists, shell state does not. Supports timeout (up to 10 min) and run_in_background.',
        example: 'Bash({ command: "npm run build", timeout: 120000, run_in_background: true })',
      },
      {
        name: 'Agent',
        description: 'Launch specialized sub-agents. Types: claude-code-guide, Explore, general-purpose, Plan. Supports worktree isolation.',
        example: 'Agent({ subagent_type: "Explore", prompt: "Find all API endpoints" })',
      },
      {
        name: 'AskUserQuestion',
        description: 'Ask user questions during execution. Supports 1-4 questions, multiSelect, preview mockups, and annotations.',
        example: 'AskUserQuestion({ questions: [{ question: "Which approach?", options: [...] }] })',
      },
      {
        name: 'EnterPlanMode / ExitPlanMode',
        description: 'Plan Mode for non-trivial implementation tasks. Enter → design approach → Exit → user approval. Required for multi-file changes.',
        example: 'EnterPlanMode() → explore → write plan → ExitPlanMode()',
      },
      {
        name: 'TaskCreate / TaskUpdate / TaskList',
        description: 'Task management with status workflow (pending → in_progress → completed) and dependency tracking (blockedBy/addBlocks).',
        example: 'TaskCreate({ subject: "Fix bug", description: "...", activeForm: "Fixing bug" })',
      },
      {
        name: 'CronCreate / CronDelete / CronList',
        description: 'Schedule prompts with cron expressions. Supports recurring/one-shot and durable/session-only persistence. Avoid :00 and :30.',
        example: 'CronCreate({ cron: "57 8 * * *", prompt: "Morning standup", recurring: true })',
      },
      {
        name: 'Monitor',
        description: 'Background event streaming. Each stdout line is an event. Use Bash+run_in_background for one-shot, Monitor for indefinite.',
        example: 'Monitor({ command: "tail -f app.log | grep ERROR", persistent: true })',
      },
      {
        name: 'WebFetch',
        description: 'Fetch URL content and process with AI. Read-only, 15-min cache, auto-HTTPS. Fails for authenticated URLs.',
        example: 'WebFetch({ url: "https://example.com", prompt: "Extract API docs" })',
      },
      {
        name: 'WebSearch',
        description: 'Search the web automatically. Mandatory Sources section required. US-only, supports domain filtering.',
        example: 'WebSearch({ query: "React 19 new features 2026" })',
      },
      {
        name: 'NotebookEdit',
        description: 'Edit Jupyter notebook (.ipynb) cells. Supports replace/insert/delete modes. Cell number is 0-indexed.',
        example: 'NotebookEdit({ notebook_path: "/analysis.ipynb", cell_id: "cell-1", new_source: "..." })',
      },
      {
        name: 'PushNotification',
        description: 'Send desktop/mobile notifications. Keep under 200 chars, one line, no markdown. Use sparingly for important events.',
        example: 'PushNotification({ message: "Build failed: 2 auth tests", status: "proactive" })',
      },
      {
        name: 'EnterWorktree / ExitWorktree',
        description: 'Git worktree isolation. Creates isolated branch + directory. Exit with keep or remove. Clears CWD-dependent caches.',
        example: 'EnterWorktree({ name: "feature-x" }) → work → ExitWorktree({ action: "remove" })',
      },
      {
        name: 'RemoteTrigger',
        description: 'Call claude.ai remote-trigger API. OAuth auto-added in-process. Actions: list, get, create, update, run.',
        example: 'RemoteTrigger({ action: "list" })',
      },
      {
        name: 'ScheduleWakeup',
        description: 'Self-paced /loop iterations. Cache TTL is 5 min — pick 270s (in cache) or 1200s+ (amortize miss).',
        example: 'ScheduleWakeup({ delaySeconds: 270, reason: "Check build", prompt: "/loop check build" })',
      },
      {
        name: 'Skill',
        description: 'Execute registered skills. BLOCKING REQUIREMENT: must invoke before any response about the task. Never guess skill names.',
        example: 'Skill({ skill: "update-config", args: "allow npm install" })',
      },
    ],
  },
];

export const workflows: Workflow[] = [
  {
    id: 'new-project',
    title: 'Start a New Project',
    steps: [
      { step: 1, command: 'claude', description: 'Start Claude Code in your project directory' },
      { step: 2, command: '/init', description: 'Run the project initialization wizard' },
      { step: 3, command: '/memory', description: 'Verify loaded project rules and settings' },
      { step: 4, command: 'CLAUDE.md', description: 'Edit project context with your conventions' },
    ],
  },
  {
    id: 'debug-error',
    title: 'Debug an Error',
    steps: [
      { step: 1, command: 'Paste error', description: 'Paste the error message or stack trace' },
      { step: 2, command: 'Ask Claude', description: 'Ask Claude to analyze the root cause' },
      { step: 3, command: '/review', description: 'Request a code review of the fix' },
      { step: 4, command: 'Run tests', description: 'Verify the fix with your test suite' },
    ],
  },
  {
    id: 'refactor-code',
    title: 'Refactor Code',
    steps: [
      { step: 1, command: 'Select scope', description: 'Specify the file or directory to refactor' },
      { step: 2, command: 'Describe changes', description: 'Describe the desired refactoring outcome' },
      { step: 3, command: '/diff', description: 'Review all proposed changes before applying' },
      { step: 4, command: 'Run tests', description: 'Verify nothing is broken after refactoring' },
    ],
  },
  {
    id: 'setup-mcp',
    title: 'Set Up MCP Server',
    steps: [
      { step: 1, command: '@mcp add [name]', description: 'Add the MCP server you need' },
      { step: 2, command: '@mcp list', description: 'Verify the server is configured' },
      { step: 3, command: '/doctor', description: 'Check MCP server connectivity' },
      { step: 4, command: 'Test', description: 'Try using the MCP server in a conversation' },
    ],
  },
];

export const sectionAnchors = sections.map((s) => ({
  id: s.id,
  title: s.title,
}));
