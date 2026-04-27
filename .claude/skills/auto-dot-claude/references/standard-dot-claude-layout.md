# Standard .claude Layout

This is the default target shape for `auto-dot-claude`.

It has two layers:

- official-first: directories/files explicitly supported by Claude Code docs
- project-recommended: directories/files that are not treated here as official Claude Code standards, but are strongly recommended for project collaboration

Not every repo needs every folder.

## Official-first

These are the safest defaults to initialize first.

```text
project-root/
  CLAUDE.md
  CLAUDE.local.md              # optional, legacy/private usage only
  .claude/
    settings.json
    settings.local.json
    commands/
    agents/
```

### Meaning

- `CLAUDE.md`
  - primary project guidance file
- `CLAUDE.local.md`
  - optional legacy/private supplement
- `settings.json`
  - shared project settings
- `settings.local.json`
  - local overrides
- `commands/`
  - project slash command files
- `agents/`
  - project-local subagent definitions

## Project-recommended

These are recommended project conventions for a more capable `.claude/` workspace.

```text
.claude/
  rules/
  skills/
  plans/
  logs/
  memory/
```

### Meaning

- `rules/`
  - project-specific constraints and conventions
- `skills/`
  - reusable project-local skills
- `plans/`
  - project planning docs and structured iteration files
- `logs/`
  - raw log files and execution traces
- `memory/`
  - long-lived project memory/context

## Full recommended structure

```text
project-root/
  CLAUDE.md
  CLAUDE.local.md              # optional, legacy/private usage only
  .claude/
    settings.json
    settings.local.json
    commands/
    agents/
    rules/
    skills/
    plans/
    logs/
    memory/
```

## Merge rules

When a project already contains a `.claude/` folder:

- keep existing files by default
- create only missing pieces
- avoid rewriting settings/rules/skills unless the user explicitly asks
