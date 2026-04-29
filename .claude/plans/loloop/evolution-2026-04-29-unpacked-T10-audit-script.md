# Evolution Note — 2026-04-29 — T10 Complete

## Task
T10. Template compliance audit script

## Deliverable
Created `.claude/plans/loloop/unpacked-audit.sh` — a standalone bash script that scores any unpacked HTML page against the 10-item benchmark defined in the plan.

## How it works
- Takes a single argument: path to an unpacked HTML file
- Performs 10 heuristic grep checks against lowercased HTML content
- Outputs a scored checklist with pass/fail per benchmark item
- Assigns a grade: A (80%+), B (60%+), C (40%+), D (<40%)

## Validation
Tested against 3 pages:
- `topic-cc-unpacked-zh.html` (benchmark): 10/10 A
- `topic-deepscientist-unpacked.html`: 9/10 A
- `topic-hermes-unpacked.html`: 8/10 A

Results align with known state — DeepScientist missing experimental section, Hermes missing knowledge graph + experimental section.

## Usage
```bash
./.claude/plans/loloop/unpacked-audit.sh site/topic-<name>-unpacked.html
```

## Next
All Task Pool items are now checked. Plan is complete. If the loop daemon needs direction, user should define a new plan or activate a different loop.
