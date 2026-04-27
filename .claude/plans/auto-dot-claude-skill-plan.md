# auto-dot-claude-skill-plan.md

## Goal

Create a local `auto-dot-claude` skill for incrementally initializing a standard `.claude/` workspace without overwriting existing project-specific files.

## Scope

- [x] Add `.claude/skills/auto-dot-claude/`
- [x] Define a non-destructive initialization workflow
- [x] Define a standard target `.claude/` layout reference
- [x] Add a starter naming guide example
- [ ] Forward-test the skill on a repo that is missing most of its `.claude/` structure

## Notes

- This skill is project-local, not a global installed skill.
- Download/sync behavior is optional and must remain non-destructive.
