export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  defaultContent: string;
  language: string;
}

export const configTemplates: ConfigTemplate[] = [
  {
    id: 'claude-md',
    name: 'CLAUDE.md',
    description: 'Project context file that Claude reads on every session',
    language: 'markdown',
    defaultContent: `# CLAUDE.md

## Project Overview

This is a [brief description of your project].

## Tech Stack

- Framework: [e.g., React, Vue, etc.]
- Language: [e.g., TypeScript]
- Styling: [e.g., Tailwind CSS]
- Testing: [e.g., Vitest]

## Coding Standards

- Use TypeScript for all new files
- Follow the existing project structure
- Write tests for all utility functions
- Use functional components with hooks

## Important Files

- \`src/main.tsx\` - Application entry point
- \`src/App.tsx\` - Root component
- \`src/components/\` - Reusable components
- \`src/hooks/\` - Custom React hooks

## Commands

- \`npm run dev\` - Start development server
- \`npm run build\` - Production build
- \`npm run test\` - Run test suite
`,
  },
  {
    id: 'skill',
    name: 'Skill',
    description: 'Reusable skill definition for Claude',
    language: 'markdown',
    defaultContent: `# Skill: Generate React Component

## When to use

When the user asks to create a new React component.

## Steps

1. Create a \`.tsx\` file with proper TypeScript types
2. Use functional component with hooks (not classes)
3. Export the component as default
4. Include JSDoc comment describing the component
5. Use Tailwind CSS for styling
6. Add prop interface with documented types

## Example

\`\`\`tsx
export interface ButtonProps {
  /** Text displayed on the button */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary';
}

/** A reusable button component */
export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'}
    >
      {label}
    </button>
  );
}
\`\`\`
`,
  },
  {
    id: 'agent',
    name: 'Agent',
    description: 'Subagent configuration for specialized tasks',
    language: 'json',
    defaultContent: `{
  "name": "code-reviewer",
  "description": "Specialized agent for code review tasks",
  "systemPrompt": "You are an expert code reviewer. Focus on:\n- Code correctness and edge cases\n- Performance implications\n- Security vulnerabilities\n- TypeScript type safety\n- Test coverage\n\nProvide actionable feedback with specific line references.",
  "tools": ["read_file", "git_diff", "run_tests"],
  "model": "claude-sonnet-4-20250514"
}
`,
  },
  {
    id: 'hook',
    name: 'Hook',
    description: 'Lifecycle hook for automating workflows',
    language: 'bash',
    defaultContent: `#!/bin/bash
# Claude Code Hook: pre-file-edit
# Runs before Claude modifies any file

set -e

echo "Running pre-edit hook for: $CLAUDE_FILE"

# Auto-format before editing
if [[ "$CLAUDE_FILE" == *.ts ]] || [[ "$CLAUDE_FILE" == *.tsx ]]; then
  npx prettier --write "$CLAUDE_FILE" 2>/dev/null || true
fi

# Stage the original for diff
git diff --quiet "$CLAUDE_FILE" || git stash push -m "pre-claude-edit" "$CLAUDE_FILE" 2>/dev/null || true

echo "Pre-edit hook complete"
`,
  },
  {
    id: 'mcp',
    name: 'MCP Server',
    description: 'Model Context Protocol server configuration',
    language: 'json',
    defaultContent: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/project"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token-here"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    }
  }
}
`,
  },
  {
    id: 'plugin',
    name: 'Plugin',
    description: 'Custom Claude Code plugin',
    language: 'typescript',
    defaultContent: `import type { ClaudePlugin, PluginContext } from '@anthropic-ai/claude-code';

const myPlugin: ClaudePlugin = {
  name: 'eslint-enforcer',
  version: '1.0.0',
  description: 'Automatically runs ESLint on file changes',

  async onFileEdit(ctx: PluginContext, filePath: string, content: string) {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      ctx.terminal.info('Running ESLint...');
      const result = await ctx.exec('npx', ['eslint', filePath, '--fix']);
      if (result.exitCode === 0) {
        ctx.terminal.success('ESLint passed!');
      } else {
        ctx.terminal.warn('ESLint issues found. Check output.');
      }
    }
  },

  commands: [
    {
      name: '/lint-all',
      description: 'Run ESLint on entire project',
      async execute(ctx: PluginContext) {
        await ctx.exec('npx', ['eslint', 'src/', '--ext', '.ts,.tsx']);
      },
    },
  ],
};

export default myPlugin;
`,
  },
  {
    id: 'settings-json',
    name: 'Settings',
    description: 'Global user settings and permission configuration',
    language: 'json',
    defaultContent: `{
  "permissions": {
    "allow": [
      "Bash: npm install",
      "Bash: npm run build",
      "Bash: git status",
      "Bash: git diff",
      "Bash: ls",
      "Read: src/**/*",
      "Edit: src/**/*"
    ],
    "deny": [
      "Bash: rm -rf /",
      "Bash: sudo *",
      "Write: .env"
    ]
  },
  "hooks": {
    "pre-command": ".claude/hooks/pre-command.sh",
    "post-edit": ".claude/hooks/post-edit.sh"
  },
  "model": "claude-sonnet-4-20250514",
  "theme": "system",
  "editor": {
    "defaultEditor": "vscode",
    "openFilesInEditor": true
  },
  "notifications": {
    "enabled": true,
    "sound": false
  },
  "behavior": {
    "autoCompactThreshold": 180000,
    "confirmDestructive": true,
    "showThinking": false
  }
}`,
  },
  {
    id: 'hooks-json',
    name: 'Hooks',
    description: 'Lifecycle hooks configuration for automating workflows',
    language: 'json',
    defaultContent: `{
  "hooks": {
    "pre-command": {
      "enabled": true,
      "script": ".claude/hooks/pre-command.sh",
      "timeout": 30000
    },
    "post-command": {
      "enabled": true,
      "script": ".claude/hooks/post-command.sh",
      "timeout": 30000
    },
    "pre-edit": {
      "enabled": true,
      "script": ".claude/hooks/pre-edit.sh",
      "actions": ["format", "lint"]
    },
    "post-edit": {
      "enabled": true,
      "script": ".claude/hooks/post-edit.sh",
      "actions": ["git-diff", "test-changed"]
    },
    "pre-save": {
      "enabled": false,
      "script": ".claude/hooks/pre-save.sh"
    },
    "post-save": {
      "enabled": false,
      "script": ".claude/hooks/post-save.sh",
      "actions": ["notify"]
    }
  },
  "environment": {
    "CLAUDE_PROJECT_ROOT": "/home/user/project",
    "CLAUDE_LOG_LEVEL": "info"
  }
}`,
  },
];
