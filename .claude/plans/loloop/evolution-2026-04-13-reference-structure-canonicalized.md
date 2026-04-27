# evolution-2026-04-13-reference-structure-canonicalized.md

Date: 2026-04-13  
Task: Task 8 · reference mining  
Plan: `.claude/plans/loloop/active-reference-mining-topics-plan-v1.md`

## What changed

- introduced `reference/REFERENCE-STRUCTURE.md` as the canonical structural mirror for the local `reference/` tree
- updated Task 8 so each bounded pass should now compare the live `reference/` tree against that structure file before choosing the next mining direction
- recorded `reference/reference_meta(Manage)agent/gstack/` as a newly added repo that still lacks a clear site-facing landing point
- marked the broader `reference_meta(Manage)agent/` lane as the highest-signal current gap because `cabinet` and `multica` are already on-site while `gstack` and `open-multi-agent` are still unplaced

## Why this matters

- Task 8 had grown good at turning strong references into site output, but it still lacked a stable “inventory before insight” step
- without a canonical structure file, newly added repos could silently sit in `reference/` without being surfaced back into the site roadmap
- this change turns Task 8 into a more explicit audit loop:
  - first refresh the inventory
  - then detect gaps
  - then choose the next site-facing bounded pass

## Current signal

- `gstack` is now the clearest newly added repo that deserves a first classification pass
- `open-multi-agent` should likely be checked in the same wave so the managed-agent lane is compared as a cluster rather than as one isolated repo

## Next handoff

Use codex-loop to continue the active plan at `.claude/plans/loloop/active-reference-mining-topics-plan-v1.md`. Read `reference/REFERENCE-STRUCTURE.md` and this evolution note first. Stay on Task 8. Pick exactly one bounded move that starts from the newly surfaced managed-agent gap: either classify `gstack` against the current `Meta-Agent` / `Agent Comparison` taxonomy, or compare `gstack` and `open-multi-agent` to decide the best first site-facing landing point. Update the plan, refresh `reference/REFERENCE-STRUCTURE.md` if needed, and record the next evolution note.
