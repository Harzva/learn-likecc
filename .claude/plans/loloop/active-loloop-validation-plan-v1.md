# active-loloop-validation-plan-v1.md

## Goal

Run one real forward-test of the `loloop` skill against itself and judge whether it is already useful in practice.

## Success condition

- `loloop` uses the agreed final layout:
  - `.claude/skills/loloop/`
  - `.claude/plans/loloop/*.md`
  - `.claude/logs/loloop/*.log`
- a concrete example invocation is documented
- one evolution note is written in the new location
- one raw run log is written
- a publish-ready document exists that explains the design, background, and test result

## Tasks

- [x] Update `loloop` skill paths to the final agreed layout
- [x] Add `.claude/NAMING.md`
- [x] Move prior loloop planning/evolution material into `.claude/plans/loloop/`
- [x] Create one real example invocation
- [x] Write one test result note judging success vs remaining gaps
- [x] Prepare a standalone GitHub-facing loloop package/readme

## Handoff rule

When this plan is complete, the next loop should either:

- publish the standalone `loloop` package to GitHub
- or refine the skill if the test result says it is not yet stable
