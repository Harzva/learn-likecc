export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TerminalStep {
  command: string;
  output: string[];
  hint: string;
}

export interface ContentSection {
  type: 'text' | 'code' | 'terminal';
  content: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  content: ContentSection[];
  quiz: QuizQuestion[];
  terminalSteps: TerminalStep[];
}

export const modules: Module[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Installation, authentication, and your first commands',
    difficulty: 'Beginner',
    duration: '5 min',
    content: [
      { type: 'text', content: 'Claude Code is a CLI tool that brings Claude directly to your terminal. Let\'s get you set up.' },
      { type: 'code', content: 'npm install -g @anthropic-ai/claude-code' },
      { type: 'text', content: 'After installation, authenticate with your Anthropic account:' },
      { type: 'terminal', content: '/login' },
    ],
    quiz: [
      {
        question: 'What is the command to install Claude Code globally?',
        options: ['npm install claude-code', 'npm install -g @anthropic-ai/claude-code', 'npm install -g claude', 'yarn add claude-code'],
        correctIndex: 1,
        explanation: 'The correct command is npm install -g @anthropic-ai/claude-code, which installs the package globally from the Anthropic AI scope.',
      },
      {
        question: 'After installation, what command do you use to authenticate?',
        options: ['/auth', '/login', 'claude login', 'auth claude'],
        correctIndex: 1,
        explanation: 'You use the /login slash command to authenticate with your Anthropic account.',
      },
    ],
    terminalSteps: [
      {
        command: '/help',
        output: [
          'Available commands:',
          '  /help       Show this help message',
          '  /compact    Summarize conversation history',
          '  /clear      Clear the screen',
          '  /login      Authenticate with Anthropic',
          '  /status     Show system status',
          '',
          'Type any command to get started.',
        ],
        hint: 'Type /help to see available commands.',
      },
      {
        command: '/status',
        output: [
          'Claude Code v1.8.0',
          'Model: claude-sonnet-4-20250514',
          'Authenticated: Yes',
          'Context window: 12.5K / 200K tokens',
          'Working directory: /home/user/project',
        ],
        hint: 'Check your system status with /status.',
      },
    ],
  },
  {
    id: 'slash-commands',
    title: 'Slash Commands',
    description: 'Built-in commands for common operations',
    difficulty: 'Beginner',
    duration: '8 min',
    content: [
      { type: 'text', content: 'Slash commands are built-in utilities that help you manage your Claude Code session.' },
      { type: 'code', content: '/help' },
      { type: 'text', content: 'Use /compact to summarize conversation history and free up context window.' },
    ],
    quiz: [
      {
        question: 'What does the /compact command do?',
        options: ['Compresses files', 'Summarizes conversation history', 'Minifies code', 'Closes the session'],
        correctIndex: 1,
        explanation: '/compact summarizes your conversation history to free up space in the context window.',
      },
      {
        question: 'Which command clears the terminal screen?',
        options: ['/clean', '/cls', '/clear', '/reset'],
        correctIndex: 2,
        explanation: '/clear removes all previous output and shows the welcome message again.',
      },
    ],
    terminalSteps: [
      {
        command: '/compact',
        output: [
          'Compacting conversation...',
          '',
          'Previous conversation summarized.',
          'Freed ~8K tokens from context window.',
          'Context: 4.2K / 200K tokens',
        ],
        hint: 'Run /compact to summarize conversation history.',
      },
    ],
  },
  {
    id: 'memory-claude-md',
    title: 'Memory & CLAUDE.md',
    description: 'How Claude remembers project context',
    difficulty: 'Beginner',
    duration: '10 min',
    content: [
      { type: 'text', content: 'CLAUDE.md is a special file that tells Claude about your project. Place it in your project root.' },
      { type: 'code', content: '# CLAUDE.md\n\n## Project Overview\nThis is a React application...\n\n## Coding Standards\n- Use TypeScript\n- Follow Airbnb style guide' },
      { type: 'text', content: 'Claude reads this file automatically on every session start.' },
    ],
    quiz: [
      {
        question: 'Where should you place the CLAUDE.md file?',
        options: ['In /docs', 'In your home directory', 'In the project root', 'In .claude/'],
        correctIndex: 2,
        explanation: 'CLAUDE.md should be placed in your project root directory so Claude can find it automatically.',
      },
    ],
    terminalSteps: [
      {
        command: '/memory',
        output: [
          'Memory status:',
          '  CLAUDE.md: Found in project root',
          '  Project rules: 3 rules loaded',
          '  Context tokens: 2.1K',
          '',
          'Use /memory show to view full memory.',
        ],
        hint: 'Check memory status with /memory.',
      },
    ],
  },
  {
    id: 'project-setup',
    title: 'Project Setup',
    description: 'Configuring Claude for your codebase',
    difficulty: 'Beginner',
    duration: '7 min',
    content: [
      { type: 'text', content: 'Learn how to set up Claude Code for your specific project type and configure settings.' },
      { type: 'code', content: 'claude config set model claude-sonnet-4-20250514' },
    ],
    quiz: [
      {
        question: 'How do you check your current configuration?',
        options: ['/config', '/settings', 'claude config list', '/status'],
        correctIndex: 2,
        explanation: 'Use claude config list to view all current configuration settings.',
      },
    ],
    terminalSteps: [
      {
        command: '/init',
        output: [
          'Initializing Claude Code for this project...',
          '',
          'Detected: React + TypeScript project',
          'Created: .claude/settings.json',
          'Created: CLAUDE.md template',
          '',
          'Run /memory to see loaded configuration.',
        ],
        hint: 'Initialize project setup with /init.',
      },
    ],
  },
  {
    id: 'commands-deep-dive',
    title: 'Commands Deep Dive',
    description: 'Advanced command usage and patterns',
    difficulty: 'Intermediate',
    duration: '12 min',
    content: [
      { type: 'text', content: 'Explore advanced commands and how to chain them for powerful workflows.' },
      { type: 'code', content: '/context' },
      { type: 'text', content: 'The /context command shows detailed information about what Claude currently knows.' },
    ],
    quiz: [
      {
        question: 'What does /context show?',
        options: ['File tree only', 'Current working directory', 'What Claude knows about the session', 'Git history'],
        correctIndex: 2,
        explanation: '/context displays detailed information about the current session context, including files loaded and conversation summary.',
      },
    ],
    terminalSteps: [
      {
        command: '/context',
        output: [
          'Context window usage:',
          '  System: 1.2K tokens',
          '  Conversation: 8.5K tokens',
          '  Files: 3.1K tokens',
          '  Total: 12.8K / 200K (6%)',
          '',
          'Loaded files: 5',
          'CLAUDE.md: Yes',
        ],
        hint: 'View context usage with /context.',
      },
    ],
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'Teaching Claude custom abilities',
    difficulty: 'Intermediate',
    duration: '10 min',
    content: [
      { type: 'text', content: 'Skills let you teach Claude reusable patterns for your workflow.' },
      { type: 'code', content: '# Skill: Generate React Component\n\nWhen asked to create a component:\n1. Create a .tsx file with proper types\n2. Use functional components with hooks\n3. Include default export\n4. Add basic styling with Tailwind' },
    ],
    quiz: [
      {
        question: 'What are skills used for?',
        options: ['Playing games', 'Teaching Claude reusable patterns', 'Managing files', 'Debugging code'],
        correctIndex: 1,
        explanation: 'Skills teach Claude reusable patterns that can be applied across your project.',
      },
    ],
    terminalSteps: [
      {
        command: '/skills',
        output: [
          'Available skills:',
          '  react-component     Create React components',
          '  api-endpoint        Build API endpoints',
          '  test-generator      Write unit tests',
          '  docs-writer         Generate documentation',
          '',
          'Use /skills <name> to activate.',
        ],
        hint: 'List available skills with /skills.',
      },
    ],
  },
  {
    id: 'hooks',
    title: 'Hooks',
    description: 'Automating workflows with hooks',
    difficulty: 'Intermediate',
    duration: '8 min',
    content: [
      { type: 'text', content: 'Hooks let you run custom scripts before or after Claude actions.' },
      { type: 'code', content: '# pre-command hook\necho "Running: $CLAUDE_COMMAND"\n\n# post-file-edit hook\ngit diff --stat' },
    ],
    quiz: [
      {
        question: 'When do hooks run?',
        options: ['Only on startup', 'Before or after Claude actions', 'On a schedule', 'Manually only'],
        correctIndex: 1,
        explanation: 'Hooks run automatically before or after Claude actions based on their configuration.',
      },
    ],
    terminalSteps: [
      {
        command: '/hooks',
        output: [
          'Active hooks:',
          '  pre-command   .claude/hooks/pre-command.sh',
          '  post-edit     .claude/hooks/post-edit.sh',
          '',
          'Hooks modify Claude behavior automatically.',
        ],
        hint: 'View active hooks with /hooks.',
      },
    ],
  },
  {
    id: 'mcp-servers',
    title: 'MCP Servers',
    description: 'Extending Claude with Model Context Protocol',
    difficulty: 'Intermediate',
    duration: '15 min',
    content: [
      { type: 'text', content: 'MCP (Model Context Protocol) servers extend Claude with external tools and data sources.' },
      { type: 'code', content: '{' },
    ],
    quiz: [
      {
        question: 'What does MCP stand for?',
        options: ['Model Control Protocol', 'Model Context Protocol', 'Multi-Channel Processing', 'Machine Code Processor'],
        correctIndex: 1,
        explanation: 'MCP stands for Model Context Protocol, which allows Claude to connect to external tools and data sources.',
      },
    ],
    terminalSteps: [
      {
        command: '/doctor',
        output: [
          'Claude Code Diagnostics:',
          '  CLI: v1.8.0',
          '  Node: v20.11.0',
          '  OS: macOS 14.5',
          '',
          'MCP Servers:',
          '  filesystem: Connected',
          '  github: Connected',
          '  postgres: Not configured',
          '',
          'All checks passed.',
        ],
        hint: 'Run diagnostics with /doctor.',
      },
    ],
  },
  {
    id: 'subagents',
    title: 'Subagents',
    description: 'Delegating tasks to specialized agents',
    difficulty: 'Advanced',
    duration: '10 min',
    content: [
      { type: 'text', content: 'Subagents let you delegate specific tasks to specialized Claude instances.' },
      { type: 'code', content: '/agent reviewer "Review this PR for security issues"' },
    ],
    quiz: [
      {
        question: 'What are subagents used for?',
        options: ['Debugging only', 'Delegating tasks to specialized instances', 'File management', 'Authentication'],
        correctIndex: 1,
        explanation: 'Subagents delegate specific tasks to specialized Claude instances that focus on particular domains.',
      },
    ],
    terminalSteps: [
      {
        command: '/agent',
        output: [
          'Available subagents:',
          '  reviewer    Code review specialist',
          '  tester      Test generation expert',
          '  docs        Documentation writer',
          '  security    Security auditor',
          '',
          'Usage: /agent <name> <task>',
        ],
        hint: 'List subagents with /agent.',
      },
    ],
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Power-user capabilities and tips',
    difficulty: 'Advanced',
    duration: '12 min',
    content: [
      { type: 'text', content: 'Master advanced Claude Code features for maximum productivity.' },
      { type: 'code', content: '/diff' },
      { type: 'text', content: '/diff shows all changes made in the current session.' },
    ],
    quiz: [
      {
        question: 'What does /diff show?',
        options: ['Git diff', 'All changes in current session', 'File differences', 'Branch comparison'],
        correctIndex: 1,
        explanation: '/diff shows all changes made during the current Claude Code session.',
      },
    ],
    terminalSteps: [
      {
        command: '/diff',
        output: [
          'Session changes:',
          '  M src/components/Button.tsx',
          '  A src/components/Modal.tsx',
          '  D src/old/util.js',
          '',
          '3 files changed. Use /export to save.',
        ],
        hint: 'View session changes with /diff.',
      },
    ],
  },
  {
    id: 'workflows',
    title: 'Workflows',
    description: 'End-to-end development patterns',
    difficulty: 'Advanced',
    duration: '15 min',
    content: [
      { type: 'text', content: 'Learn common workflows that combine multiple Claude features.' },
      { type: 'code', content: '# Feature Development Workflow\n1. /init - Set up project\n2. /skills react-component - Load skill\n3. Create component\n4. /tester - Generate tests\n5. /reviewer - Code review' },
    ],
    quiz: [
      {
        question: 'What command starts a workflow?',
        options: ['/start', '/workflow', '/init', '/run'],
        correctIndex: 2,
        explanation: '/init initializes the project setup and can trigger workflow configurations.',
      },
    ],
    terminalSteps: [
      {
        command: '/export',
        output: [
          'Exporting session...',
          '',
          'Saved to: session-export-20250115.md',
          '  - 12 conversation turns',
          '  - 5 file edits',
          '  - 2 commands run',
          '',
          'Use /export --json for JSON format.',
        ],
        hint: 'Export your session with /export.',
      },
    ],
  },
  {
    id: 'plugins',
    title: 'Plugins',
    description: 'Building custom extensions',
    difficulty: 'Advanced',
    duration: '10 min',
    content: [
      { type: 'text', content: 'Plugins let you build custom extensions for Claude Code.' },
      { type: 'code', content: '# Plugin structure\nclaude-plugin/\n  package.json\n  src/\n    index.ts\n    commands.ts' },
    ],
    quiz: [
      {
        question: 'What file defines plugin metadata?',
        options: ['plugin.json', 'package.json', 'manifest.json', 'claude.json'],
        correctIndex: 1,
        explanation: 'package.json defines plugin metadata including name, version, and entry point.',
      },
    ],
    terminalSteps: [
      {
        command: '/plugins',
        output: [
          'Installed plugins:',
          '  eslint-enforcer    Auto-fix on save',
          '  prettier-format    Format files',
          '  type-checker       Run tsc automatically',
          '',
          'Use /plugins --market to discover more.',
        ],
        hint: 'List installed plugins with /plugins.',
      },
    ],
  },
  {
    id: 'tools-deep-dive',
    title: 'Tools Deep Dive',
    description: 'Master the 20+ tools in Claude Code — when and how to use each one',
    difficulty: 'Advanced',
    duration: '18 min',
    content: [
      { type: 'text', content: 'Claude Code provides over 20 specialized tools. Understanding when to use each is key to maximizing productivity.' },
      { type: 'text', content: '**File Operations (Read/Edit/Write):** These are your bread and butter. Read files first, then Edit for surgical changes, Write for new files.' },
      { type: 'code', content: '// Read before you edit!\nRead file first → Edit with old_string/new_string' },
      { type: 'text', content: '**Bash:** For running commands, scripts, or checking system state. Always use `run_in_background` for long tasks, and set `timeout` appropriately.' },
      { type: 'code', content: 'Bash({\n  command: "npm run build",\n  timeout: 120000,\n  run_in_background: true\n})' },
      { type: 'text', content: '**Agent:** Launch sub-agents for parallel exploration. Use Explore agents for code search, Plan agents for architecture design.' },
      { type: 'text', content: '**Task Management:** Create tasks with TaskCreate, update status with TaskUpdate, list with TaskList. Use blockedBy/addBlocks for dependency tracking.' },
    ],
    quiz: [
      {
        question: 'Before using the Edit tool, what must you do first?',
        options: ['Nothing', 'Read the file first', 'Write a test', 'Create a backup'],
        correctIndex: 1,
        explanation: 'The Edit tool requires you to Read the file at least once before editing.',
      },
      {
        question: 'Which Bash parameter runs a command in the background?',
        options: ['async', 'run_in_background', 'bg', 'detach'],
        correctIndex: 1,
        explanation: 'run_in_background: true lets the command run without blocking the session.',
      },
      {
        question: 'What is the purpose of the Explore agent type?',
        options: ['Write code', 'Fast read-only code search', 'Run tests', 'Deploy apps'],
        correctIndex: 1,
        explanation: 'Explore agents are fast read-only search agents for locating code.',
      },
    ],
    terminalSteps: [
      {
        command: '/tools',
        output: [
          'Available tools (20+):',
          '',
          '  File Operations: Read, Edit, Write',
          '  System: Bash',
          '  Planning: EnterPlanMode, ExitPlanMode',
          '  Agents: Agent (claude-code-guide, Explore, Plan, general-purpose)',
          '  Tasks: TaskCreate, TaskGet, TaskList, TaskUpdate',
          '  Scheduling: CronCreate, CronDelete, CronList',
          '  Monitor: Monitor',
          '  Network: WebFetch, WebSearch',
          '  IDE: NotebookEdit, mcp__ide__executeCode',
        ],
        hint: 'List all available tools with /tools.',
      },
      {
        command: '/agent --type Explore "Find all React hooks"',
        output: [
          'Launching Explore agent...',
          '',
          'Searching src/**/* for hook patterns...',
          'Found 8 hooks in 5 files:',
          '  src/hooks/useAuth.ts',
          '  src/hooks/useFetch.ts',
          '  src/hooks/useLocalStorage.ts',
          '  ...',
        ],
        hint: 'Launch an Explore agent to search for code patterns.',
      },
    ],
  },
  {
    id: 'subagents-planning',
    title: 'Subagents & Planning',
    description: 'Leverage specialized agents and Plan Mode for complex tasks',
    difficulty: 'Advanced',
    duration: '15 min',
    content: [
      { type: 'text', content: 'Claude Code supports 4 specialized agent types, each with different capabilities and tool access.' },
      { type: 'code', content: 'Agent types:\n- claude-code-guide: CLI features, hooks, MCP, settings\n- Explore: Fast read-only search (no Edit/Write)\n- general-purpose: Full tool access for research\n- Plan: Software architect for implementation strategy' },
      { type: 'text', content: '**Plan Mode** is essential for non-trivial tasks. EnterPlanMode transitions to a planning state where you design before implementing.' },
      { type: 'text', content: 'When to use Plan Mode: New features, multiple approaches, code modifications, architectural decisions, multi-file changes, unclear requirements.' },
      { type: 'code', content: 'Workflow:\n1. EnterPlanMode()\n2. Explore codebase\n3. Write plan.md\n4. ExitPlanMode() → User reviews\n5. Implement' },
    ],
    quiz: [
      {
        question: 'Which agent type has FULL tool access?',
        options: ['claude-code-guide', 'Explore', 'general-purpose', 'Plan'],
        correctIndex: 2,
        explanation: 'general-purpose agents have access to all tools (*).',
      },
      {
        question: 'What does the Explore agent NOT have access to?',
        options: ['Read', 'Edit and Write', 'Bash', 'WebSearch'],
        correctIndex: 1,
        explanation: 'Explore agents are read-only — they do not have Edit, Write, or NotebookEdit tools.',
      },
      {
        question: 'When should you use EnterPlanMode?',
        options: ['For simple one-line fixes', 'For non-trivial implementation tasks', 'For searching files', 'For running tests'],
        correctIndex: 1,
        explanation: 'EnterPlanMode is for non-trivial implementation tasks requiring user approval before coding.',
      },
    ],
    terminalSteps: [
      {
        command: '/plan',
        output: [
          'Plan Mode Workflow:',
          '',
          '  1. EnterPlanMode     → Transition to planning',
          '  2. Explore codebase  → Understand structure',
          '  3. Write plan.md     → Document approach',
          '  4. ExitPlanMode      → Submit for approval',
          '',
          'Use when: New features, multiple approaches, multi-file changes.',
        ],
        hint: 'View the Plan Mode workflow with /plan.',
      },
      {
        command: '/agent --type Plan "Design auth system"',
        output: [
          'Launching Plan agent...',
          '',
          'Architecture Plan:',
          '  1. User model with JWT tokens',
          '  2. Middleware for route protection',
          '  3. Refresh token rotation',
          '  4. Rate limiting per endpoint',
          '',
          'Implementation: 4 files, ~200 lines',
        ],
        hint: 'Use a Plan agent for architectural design.',
      },
    ],
  },
  {
    id: 'task-automation',
    title: 'Task & Automation',
    description: 'Master task tracking, cron scheduling, and background monitoring',
    difficulty: 'Intermediate',
    duration: '12 min',
    content: [
      { type: 'text', content: 'Claude Code provides a complete task management system for tracking complex multi-step work.' },
      { type: 'code', content: 'TaskCreate({\n  subject: "Implement login flow",\n  description: "Add JWT auth to API",\n  activeForm: "Implementing login flow"\n})' },
      { type: 'text', content: 'Tasks progress through: pending → in_progress → completed. Use addBlocks/addBlockedBy to manage dependencies.' },
      { type: 'text', content: '**Cron Scheduling** lets you automate recurring or one-shot tasks. Jobs can be session-only or durable (persist across restarts).' },
      { type: 'code', content: 'CronCreate({\n  cron: "0 9 * * 1-5",  // weekdays 9am\n  prompt: "Review open PRs",\n  recurring: true,\n  durable: true\n})' },
      { type: 'text', content: '**Monitor** streams events from long-running scripts. Each stdout line becomes a notification.' },
      { type: 'code', content: 'Monitor({\n  command: "tail -f /var/log/app.log | grep ERROR",\n  description: "Watch for errors"\n})' },
    ],
    quiz: [
      {
        question: 'What is the task status workflow?',
        options: ['todo → doing → done', 'pending → in_progress → completed', 'open → active → closed', 'new → started → finished'],
        correctIndex: 1,
        explanation: 'Tasks flow: pending → in_progress → completed.',
      },
      {
        question: 'What does durable: true mean for a cron job?',
        options: ['Runs forever', 'Persists across Claude restarts', 'Runs every day', 'Cannot be deleted'],
        correctIndex: 1,
        explanation: 'durable: true writes to .claude/scheduled_tasks.json and survives restarts.',
      },
      {
        question: 'How does the Monitor tool receive events?',
        options: ['HTTP polling', 'WebSocket', 'Each stdout line is an event', 'File watcher'],
        correctIndex: 2,
        explanation: 'Monitor treats each stdout line as a separate event notification.',
      },
    ],
    terminalSteps: [
      {
        command: '/tasks',
        output: [
          'Task List:',
          '',
          '  #1  Fix auth bug              [in_progress]',
          '  #2  Add validation            [pending]  ← blocked by #1',
          '  #3  Update docs               [pending]',
          '  #4  Refactor API              [completed]',
          '',
          'Use TaskUpdate to change status.',
        ],
        hint: 'View all tasks with /tasks.',
      },
      {
        command: '/cron',
        output: [
          'Scheduled Jobs:',
          '',
          '  ID: cron-001',
          '  Schedule: 0 9 * * 1-5  (weekdays 9am)',
          '  Prompt: "Review open PRs"',
          '  Status: recurring, durable',
          '',
          '  ID: cron-002',
          '  Schedule: 30 14 15 4 *',
          '  Prompt: "Deploy to production"',
          '  Status: one-shot, session-only',
        ],
        hint: 'View scheduled jobs with /cron.',
      },
    ],
  },
];

export function getModuleById(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function getModulesByDifficulty(difficulty: string): Module[] {
  return modules.filter((m) => m.difficulty === difficulty);
}
