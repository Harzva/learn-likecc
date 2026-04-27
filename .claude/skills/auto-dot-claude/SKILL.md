---
name: auto-dot-claude
description: Use when a project needs a standard .claude workspace initialized or repaired incrementally. This skill audits the existing .claude folder, adds missing files and directories without overwriting existing rules/skills/settings, and can optionally evolve the structure over time for the current project.
---

# auto-dot-claude

`auto-dot-claude` incrementally initializes a project-local `.claude/` workspace.

It is not a destructive bootstrapper.
It should merge, scaffold, and fill gaps.
It should not overwrite project-specific files that already exist.

## When to use

Use this skill when the user wants any of these:

- initialize a new `.claude/` directory in a repo
- normalize a messy `.claude/` layout into a standard shape
- add missing `skills / plans / logs / rules / settings` structure
- backfill starter files such as `CLAUDE.md`, `settings.json`, or naming docs
- keep a repo's `.claude/` workspace evolving incrementally over time

## Non-destructive rule

Default behavior is always:

- create missing directories
- create missing files
- append or merge when safe
- preserve existing project content

Never:

- replace existing rules just because a template exists
- rewrite an existing skill folder wholesale
- wipe user/project local settings
- silently delete unknown custom files

If a file already exists, prefer:

1. keep as-is
2. add a sibling example/template file
3. append a clearly delimited missing section
4. stop and report a conflict when merging would be ambiguous

## Standard target shape

Use [references/standard-dot-claude-layout.md](./references/standard-dot-claude-layout.md) as the default target layout.

The high-level structure has two layers:

- official-first:
  - `CLAUDE.md`
  - optional `CLAUDE.local.md`
  - `.claude/settings.json`
  - `.claude/settings.local.json`
  - `.claude/commands/`
  - `.claude/agents/`
- project-recommended:
  - `.claude/rules/`
  - `.claude/skills/`
  - `.claude/plans/`
  - `.claude/logs/`
  - `.claude/memory/`

Not every project needs every directory on day one.
Initialize the smallest useful subset.

## Workflow

### 1. Audit first

Before creating anything, inspect:

- whether `.claude/` already exists
- which standard directories already exist
- which files are clearly project-specific and should be preserved
- whether the repo already has `CLAUDE.md` or similar guidance files

### 2. Compare against the standard shape

Compute:

- present directories
- missing directories
- present files
- missing files
- risky collisions

### 3. Apply incrementally

Create only what is missing.

Typical order:

1. top-level guidance file(s)
2. `.claude/settings.json` example or stub
3. `.claude/agents/` or `.claude/commands/`
4. project-recommended extensions such as `.claude/rules/`
5. `.claude/skills/`
6. `.claude/plans/`
7. `.claude/logs/`

### 4. Preserve custom work

When the repo already contains:

- custom rules
- custom skills
- custom settings
- local naming conventions

do not replace them.

Instead:

- keep them
- add missing complementary files
- optionally add a `NAMING.md` or layout note if the repo lacks one

### 5. Optional evolution mode

If the user wants ongoing improvement, this skill may also:

- add new recommended `.claude/` subdirectories later
- tighten naming conventions
- add starter templates for plans/logs
- record what was initialized and what remains manual

This should still be non-destructive.

### 6. Optional download mode

Download/external fetch behavior is optional, not default.

Only use it when the user explicitly wants:

- a starter template fetched from another repo
- a shared team standard synced in
- a reference file copied from an approved source

Even then:

- fetch into a temporary or clearly named destination
- review before merging
- never overwrite project files blindly

## Recommended outputs

When this skill runs, it should leave behind:

- the created directories/files
- a short summary of what already existed
- a short summary of what was added
- a short summary of what was intentionally not changed

If useful, also create:

- `.claude/NAMING.md`
- `.claude/plans/<skill>/...`
- `.claude/logs/<skill>/...`

## Good defaults

For this repo style, a good default is:

- keep reusable skill definitions in `.claude/skills/`
- keep project planning material in `.claude/plans/`
- keep raw logs in `.claude/logs/`

## Example invocation

```text
请使用 auto-dot-claude，为当前项目增量初始化标准 .claude 结构。
先审计现有内容，不要覆盖已有 rules/skills/settings；
只补齐缺失目录与模板，并总结哪些内容保留不动。
```
