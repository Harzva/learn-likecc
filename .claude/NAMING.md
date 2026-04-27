# .claude Naming Guide

Core rule:

- path decides scope
- file name decides topic
- prefix decides status

## Scope

- `.claude/skills/`
  - reusable project-local skill definitions
- `.claude/plans/`
  - project planning material
- `.claude/plans/loloop/`
  - loloop-specific plans and evolution notes
- `.claude/logs/loloop/`
  - raw loloop run logs

## loloop file names

Recommended:

- `active-<domain>-loop-plan-v<N>.md`
- `draft-<domain>-loop-plan.md`
- `archive-<domain>-loop-wrapup-v<N>.md`
- `evolution-YYYY-MM-DD-<slug>.md`
- `YYYY-MM-DD-<slug>.log`

Avoid:

- `myplan.md`
- `local-loop.md`
- nesting runtime data inside `.claude/skills/loloop/`

