# loloop-skill-plan.md

## Goal

Create a local `.claude/skills/loloop` skill that packages the repo's loop-in-loop method around the official `/loop` workflow.

## Scope

- [x] Add a `loloop` skill under `.claude/skills/`
- [x] Encode the "plan vN -> execute -> evolution note -> plan vN+1 -> next /loop" method
- [x] Reuse `.claude/plans/` as the primary plan source
- [x] Create a dedicated `.claude/loloop/evolution/` directory for iteration notes
- [x] Add a default evolution note template
- [ ] Forward-test the skill inside Like Code / Claude Code and collect one real run transcript

## Notes

- This skill does not require changing Like Code source code.
- It is a workflow wrapper around the official `/loop`, not a replacement implementation.
