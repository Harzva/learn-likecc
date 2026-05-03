export interface CommandResponse {
  lines: string[];
  clear?: boolean;
}

export const commandResponses: Record<string, CommandResponse> = {
  '/help': {
    lines: [
      '\x1b[1mAvailable commands:\x1b[0m',
      '',
      '  \x1b[93m/agent\x1b[0m      Show available agent types',
      '  \x1b[93m/branch\x1b[0m     Create git branch',
      '  \x1b[93m/clear\x1b[0m      Clear the screen',
      '  \x1b[93m/compact\x1b[0m    Summarize conversation history',
      '  \x1b[93m/config\x1b[0m     Show settings.json configuration',
      '  \x1b[93m/context\x1b[0m    Show context window usage',
      '  \x1b[93m/cost\x1b[0m       Show token usage and cost',
      '  \x1b[93m/cron\x1b[0m       List scheduled cron jobs',
      '  \x1b[93m/diff\x1b[0m       Show session changes',
      '  \x1b[93m/doctor\x1b[0m     Run diagnostics',
      '  \x1b[93m/effort\x1b[0m     Set reasoning effort',
      '  \x1b[93m/export\x1b[0m     Export conversation',
      '  \x1b[93m/help\x1b[0m       Show this help message',
      '  \x1b[93m/init\x1b[0m       Initialize project',
      '  \x1b[93m/login\x1b[0m      Authenticate',
      '  \x1b[93m/memory\x1b[0m     Show memory status',
      '  \x1b[93m/model\x1b[0m      Switch AI model',
      '  \x1b[93m/monitor\x1b[0m    Show Monitor tool usage',
      '  \x1b[93m/plan\x1b[0m       Show Plan Mode workflow',
      '  \x1b[93m/rename\x1b[0m     Rename conversation',
      '  \x1b[93m/review\x1b[0m     Request code review',
      '  \x1b[93m/skills\x1b[0m     List available skills',
      '  \x1b[93m/status\x1b[0m     Show system status',
      '  \x1b[93m/tasks\x1b[0m      List active tasks',
      '  \x1b[93m/tools\x1b[0m       List all tool categories',
      '  \x1b[93m/webfetch\x1b[0m   Show WebFetch tool usage',
      '  \x1b[93m/websearch\x1b[0m  Show WebSearch tool usage',
      '  \x1b[93m/worktree\x1b[0m  Show worktree commands',
      '',
      'Type any command to get started.',
    ],
  },
  '/compact': {
    lines: [
      '\x1b[36mCompacting conversation...\x1b[0m',
      '',
      '\x1b[32m\u2713\x1b[0m Previous conversation summarized.',
      '\x1b[32m\u2713\x1b[0m Freed ~8K tokens from context window.',
      '',
      'Context: 4.2K / 200K tokens',
    ],
  },
  '/clear': {
    lines: [],
    clear: true,
  },
  '/context': {
    lines: [
      '\x1b[1mContext window usage:\x1b[0m',
      '',
      '  System:        1.2K tokens',
      '  Conversation:  8.5K tokens',
      '  Files:         3.1K tokens',
      '  \x1b[1mTotal:         12.8K / 200K (6%)\x1b[0m',
      '',
      'Loaded files: 5',
      'CLAUDE.md: Yes',
    ],
  },
  '/cost': {
    lines: [
      '\x1b[1mToken Usage & Cost:\x1b[0m',
      '',
      '  Input tokens:   45,231',
      '  Output tokens:  12,892',
      '  Total:          58,123',
      '',
      '  Estimated cost: ~$0.18 USD',
      '',
      '  Efficiency:     94% (excellent)',
    ],
  },
  '/status': {
    lines: [
      '\x1b[1mClaude Code Status:\x1b[0m',
      '',
      '  Version:       v1.8.0',
      '  Model:         claude-sonnet-4-20250514',
      '  Authenticated: Yes',
      '  Working dir:   /home/user/project',
      '',
      '  Context:       12.5K / 200K tokens',
      '  Uptime:        42 minutes',
    ],
  },
  '/model': {
    lines: [
      '\x1b[1mAvailable models:\x1b[0m',
      '',
      '  \x1b[32m\u25cf\x1b[0m claude-sonnet-4-20250514  (current)',
      '  \x1b[90m\u25cb\x1b[0m claude-opus-4-20250514',
      '  \x1b[90m\u25cb\x1b[0m claude-haiku-4-20250514',
      '',
      'Use /model <name> to switch.',
    ],
  },
  '/effort': {
    lines: [
      '\x1b[1mReasoning effort levels:\x1b[0m',
      '',
      '  \x1b[32m\u25cf\x1b[0m normal   - Balanced reasoning (current)',
      '  \x1b[90m\u25cb\x1b[0m high     - More thorough analysis',
      '  \x1b[90m\u25cb\x1b[0m minimal  - Fastest responses',
      '',
      'Use /effort <level> to change.',
    ],
  },
  '/rename': {
    lines: [
      '\x1b[36mConversation renamed to:\x1b[0m',
      '',
      '  "React Component Refactoring"',
    ],
  },
  '/branch': {
    lines: [
      '\x1b[36mCreating git branch...\x1b[0m',
      '',
      '\x1b[32m\u2713\x1b[0m Switched to new branch: \x1b[93mfeature/claude-session-42\x1b[0m',
      '',
      'Based on: main',
    ],
  },
  '/export': {
    lines: [
      '\x1b[36mExporting session...\x1b[0m',
      '',
      '\x1b[32m\u2713\x1b[0m Saved to: \x1b[93msession-export-20250115.md\x1b[0m',
      '',
      '  - 12 conversation turns',
      '  - 5 file edits',
      '  - 2 commands run',
      '',
      'Use /export --json for JSON format.',
    ],
  },
  '/diff': {
    lines: [
      '\x1b[1mSession changes:\x1b[0m',
      '',
      '  \x1b[33mM\x1b[0m src/components/Button.tsx',
      '  \x1b[32mA\x1b[0m src/components/Modal.tsx',
      '  \x1b[31mD\x1b[0m src/old/util.js',
      '',
      '3 files changed. Use /export to save.',
    ],
  },
  '/doctor': {
    lines: [
      '\x1b[1mClaude Code Diagnostics:\x1b[0m',
      '',
      '  \x1b[32m\u2713\x1b[0m CLI:        v1.8.0',
      '  \x1b[32m\u2713\x1b[0m Node:       v20.11.0',
      '  \x1b[32m\u2713\x1b[0m OS:         macOS 14.5',
      '',
      '\x1b[1mMCP Servers:\x1b[0m',
      '  \x1b[32m\u2713\x1b[0m filesystem: Connected',
      '  \x1b[32m\u2713\x1b[0m github:     Connected',
      '  \x1b[90m\u25cb\x1b[0m postgres:   Not configured',
      '',
      '\x1b[32mAll checks passed.\x1b[0m',
    ],
  },
  '/login': {
    lines: [
      '\x1b[36mAuthenticating with Anthropic...\x1b[0m',
      '',
      '\x1b[32m\u2713\x1b[0m Authentication successful!',
      '',
      'Welcome back, developer.',
    ],
  },
  '/memory': {
    lines: [
      '\x1b[1mMemory status:\x1b[0m',
      '',
      '  CLAUDE.md:    Found in project root',
      '  Project rules: 3 rules loaded',
      '  Context tokens: 2.1K',
      '',
      'Use /memory show to view full memory.',
    ],
  },
  '/review': {
    lines: [
      '\x1b[36mRequesting code review...\x1b[0m',
      '',
      '\x1b[1mReview Summary:\x1b[0m',
      '  - 2 potential improvements found',
      '  - 1 security consideration',
      '  - Overall quality: Good',
      '',
      'Use /review --detailed for full report.',
    ],
  },
  '/init': {
    lines: [
      '\x1b[36mInitializing Claude Code for this project...\x1b[0m',
      '',
      '\x1b[32m\u2713\x1b[0m Detected: React + TypeScript project',
      '\x1b[32m\u2713\x1b[0m Created: .claude/settings.json',
      '\x1b[32m\u2713\x1b[0m Created: CLAUDE.md template',
      '',
      'Run /memory to see loaded configuration.',
    ],
  },
  '/tools': {
    lines: [
      '\x1b[1mAvailable tools (20+):\x1b[0m',
      '',
      '  \x1b[1mFile Operations:\x1b[0m',
      '    \x1b[93mRead\x1b[0m        Read files from local filesystem',
      '    \x1b[93mEdit\x1b[0m        Exact string replacements in files',
      '    \x1b[93mWrite\x1b[0m       Write files to local filesystem',
      '',
      '  \x1b[1mSystem Execution:\x1b[0m',
      '    \x1b[93mBash\x1b[0m        Execute bash commands with timeout/background support',
      '',
      '  \x1b[1mInteractive:\x1b[0m',
      '    \x1b[93mAskUserQuestion\x1b[0m  Ask user questions with multi-select & previews',
      '',
      '  \x1b[1mPlanning:\x1b[0m',
      '    \x1b[93mEnterPlanMode\x1b[0m    Transition to plan mode for implementation tasks',
      '    \x1b[93mExitPlanMode\x1b[0m     Signal plan completion for user approval',
      '',
      '  \x1b[1mSubagents:\x1b[0m',
      '    \x1b[93mAgent\x1b[0m       Launch specialized agents (Explore, Plan, general-purpose)',
      '',
      '  \x1b[1mTask Management:\x1b[0m',
      '    \x1b[93mTaskCreate\x1b[0m, \x1b[93mTaskGet\x1b[0m, \x1b[93mTaskList\x1b[0m, \x1b[93mTaskOutput\x1b[0m, \x1b[93mTaskStop\x1b[0m, \x1b[93mTaskUpdate\x1b[0m',
      '',
      '  \x1b[1mScheduling:\x1b[0m',
      '    \x1b[93mCronCreate\x1b[0m, \x1b[93mCronDelete\x1b[0m, \x1b[93mCronList\x1b[0m',
      '',
      '  \x1b[1mMonitoring:\x1b[0m',
      '    \x1b[93mMonitor\x1b[0m     Background event streaming from long-running scripts',
      '',
      '  \x1b[1mNetwork:\x1b[0m',
      '    \x1b[93mWebFetch\x1b[0m    Fetch and analyze web content',
      '    \x1b[93mWebSearch\x1b[0m   Search the web with mandatory sources',
      '',
      '  \x1b[1mIDE Integration:\x1b[0m',
      '    \x1b[93mNotebookEdit\x1b[0m   Edit Jupyter notebook cells',
      '    \x1b[93mmcp__ide__executeCode\x1b[0m   Execute Python in Jupyter kernel',
    ],
  },
  '/agent': {
    lines: [
      '\x1b[1mAvailable agent types:\x1b[0m',
      '',
      '  \x1b[93mclaude-code-guide\x1b[0m    Questions about Claude Code CLI features',
      '  \x1b[93mExplore\x1b[0m              Fast read-only search for locating code',
      '  \x1b[93mgeneral-purpose\x1b[0m      Multi-step research and code execution',
      '  \x1b[93mPlan\x1b[0m                 Software architect for implementation plans',
      '',
      'Use /agent --type <type> "<prompt>"',
    ],
  },
  '/skills': {
    lines: [
      '\x1b[1mAvailable skills:\x1b[0m',
      '',
      '  \x1b[93mupdate-config\x1b[0m            Configure settings.json and preferences',
      '  \x1b[93mkeybindings-help\x1b[0m         Customize keyboard shortcuts',
      '  \x1b[93msimplify\x1b[0m                 Review code for quality and efficiency',
      '  \x1b[93mfewer-permission-prompts\x1b[0m  Reduce permission prompts via allowlist',
      '  \x1b[93mloop\x1b[0m                     Run prompts on recurring intervals',
      '  \x1b[93mschedule\x1b[0m                 Create scheduled remote agents',
      '',
      'Invoke with /skill <name>',
    ],
  },
  '/plan': {
    lines: [
      '\x1b[1mPlan Mode Workflow:\x1b[0m',
      '',
      '  1. \x1b[93mEnterPlanMode\x1b[0m     \u2192 Transition to planning state',
      '  2. \x1b[93mExplore codebase\x1b[0m  \u2192 Understand current structure',
      '  3. \x1b[93mWrite plan.md\x1b[0m     \u2192 Document implementation approach',
      '  4. \x1b[93mExitPlanMode\x1b[0m      \u2192 Submit plan for user approval',
      '',
      'Use when: New features, multiple approaches, multi-file changes,',
      '          architectural decisions, unclear requirements.',
    ],
  },
  '/tasks': {
    lines: [
      '\x1b[1mTask List:\x1b[0m',
      '',
      '  \x1b[93m#1\x1b[0m  Fix authentication bug        \x1b[33m[in_progress]\x1b[0m',
      '  \x1b[93m#2\x1b[0m  Add form validation           \x1b[90m[pending]\x1b[0m     \u2190 blocked by #1',
      '  \x1b[93m#3\x1b[0m  Update documentation          \x1b[90m[pending]\x1b[0m',
      '  \x1b[93m#4\x1b[0m  Refactor API layer            \x1b[32m[completed]\x1b[0m',
      '',
      'Use TaskUpdate to change status: pending \u2192 in_progress \u2192 completed',
    ],
  },
  '/cron': {
    lines: [
      '\x1b[1mScheduled Jobs:\x1b[0m',
      '',
      '  ID: \x1b[93mcron-001\x1b[0m',
      '  Schedule: 0 9 * * 1-5  (weekdays at 9am)',
      '  Prompt: "Review open PRs"',
      '  Status: recurring, durable',
      '',
      '  ID: \x1b[93mcron-002\x1b[0m',
      '  Schedule: 30 14 15 4 *',
      '  Prompt: "Deploy to production"',
      '  Status: one-shot, session-only',
      '',
      'Use CronCreate to add, CronDelete to remove, CronList to view.',
    ],
  },
  '/monitor': {
    lines: [
      '\x1b[1mMonitor Tool:\x1b[0m',
      '',
      '  Start background monitors that stream events:',
      '  - Bash with run_in_background \u2192 single completion notification',
      '  - Monitor with tail -f \u2192 one per occurrence, indefinitely',
      '  - Polling scripts \u2192 per-occurrence with natural end',
      '',
      '  Example: \x1b[93mmonitor -c "tail -f /var/log/app.log | grep ERROR"\x1b[0m',
    ],
  },
  '/config': {
    lines: [
      '\x1b[1mConfiguration (settings.json):\x1b[0m',
      '',
      '  {',
      '    "permissions": {',
      '      "allow": ["Bash: npm install", "Bash: git status"],',
      '      "deny": []',
      '    },',
      '    "hooks": {',
      '      "pre-command": ".claude/hooks/pre-command.sh"',
      '    },',
      '    "model": "claude-sonnet-4-20250514",',
      '    "theme": "dark"',
      '  }',
      '',
      'Use /config --edit to modify settings.',
    ],
  },
  '/worktree': {
    lines: [
      '\x1b[1mWorktree Commands:\x1b[0m',
      '',
      '  \x1b[93mEnterWorktree\x1b[0m \u2192 Create isolated git worktree + new branch',
      '  \x1b[93mExitWorktree\x1b[0m  \u2192 Return to original working directory',
      '',
      '  Usage:',
      '    \x1b[93mEnterWorktree\x1b[0m(name: "feature-x")',
      '    # Work in isolated environment',
      '    \x1b[93mExitWorktree\x1b[0m(action: "keep" | "remove")',
      '',
      '  Isolation modes: worktree (git), worktreeCreate/Remove hooks (VCS)',
    ],
  },
  '/webfetch': {
    lines: [
      '\x1b[1mWebFetch Tool:\x1b[0m',
      '',
      '  Fetches URL content, converts HTML \u2192 markdown,',
      '  processes with AI model, returns analysis.',
      '',
      '  Usage: \x1b[93mwebfetch(url: "https://example.com",\x1b[0m',
      '                  \x1b[93mprompt: "Extract API endpoints")\x1b[0m',
      '',
      '  Features: 15-min cache, auto HTTPS upgrade, redirect handling',
    ],
  },
  '/websearch': {
    lines: [
      '\x1b[1mWebSearch Tool:\x1b[0m',
      '',
      '  Searches the web automatically within a single API call.',
      '  \x1b[1mMANDATORY:\x1b[0m Include "Sources:" section with markdown links.',
      '',
      '  Usage: \x1b[93mwebsearch(query: "React 19 features 2026")\x1b[0m',
      '',
      '  Note: US-only, domain filtering supported.',
    ],
  },
};

export const welcomeMessage: string[] = [
  '\x1b[1mWelcome to Claude Code!\x1b[0m',
  '',
  'Type \x1b[93m/help\x1b[0m to see available commands.',
  '',
];

export function getCommandResponse(command: string): CommandResponse {
  const trimmed = command.trim().toLowerCase();

  // Exact match
  if (commandResponses[trimmed]) {
    return commandResponses[trimmed];
  }

  // Prefix match for commands with arguments
  for (const [key] of Object.entries(commandResponses)) {
    if (trimmed.startsWith(key + ' ')) {
      return commandResponses[key];
    }
  }

  // Unknown command
  return {
    lines: [
      `\x1b[91mUnknown command: "${command}"\x1b[0m`,
      '',
      'Type \x1b[93m/help\x1b[0m for available commands.',
    ],
  };
}
