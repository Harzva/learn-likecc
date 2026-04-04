# /autoresearch:fix — The Error Crusher

Takes a broken state and iteratively repairs it. ONE fix per iteration. Atomic, committed, verified, and auto-reverted on failure. Stops automatically when error count hits zero — even in unbounded mode. Feed it a failing CI pipeline, a pile of type errors, or the findings from a debug session, and it works through the backlog methodically until the codebase is green.

---

## How It Works — 5-Step Process Per Iteration

```
Step 1  DETECT      Auto-detect failures across all categories
                    Priority order: build → tests → types → lint → warnings
Step 2  PRIORITIZE  Blockers first (build), then required (tests, types), then polish (lint)
Step 3  FIX ONE     Atomic change — one file, one root cause, one commit
Step 4  COMMIT → VERIFY → GUARD
                    Commit the change, run verify, run guard
                    If verify improves AND guard passes → KEEP
                    If verify regresses OR guard fails → REVERT
Step 5  KEEP / REVERT
                    Kept changes accumulate; reverted changes are logged to blocked.md
                    Loop continues until error count = 0 or iterations exhausted
```

Auto-stop: when all detectable errors reach zero, the loop exits cleanly — no wasted iterations.

---

## Priority Order

| Priority | Category | Examples |
|----------|----------|---------|
| 1 — Blocker | `build` | Compilation failure, missing import, syntax error |
| 2 — Required | `test` | Failing unit/integration tests |
| 2 — Required | `type` | TypeScript tsc errors, mypy violations, Rust type errors |
| 3 — Polish | `lint` | ESLint, pylint, clippy, go vet violations |
| 4 — Advisory | `warning` | Deprecation warnings, unused variables |

Fixing build errors first is deliberate — many type and test errors are cascade failures from a broken build. Resolving the root cause can eliminate dozens of downstream errors in a single iteration.

---

## All Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `--target <command>` | Explicit verify command (overrides auto-detect) | `--target "tsc --noEmit"` |
| `--guard <command>` | Safety command that must always pass | `--guard "npm test"` |
| `--category <type>` | Only fix specific category: `test`, `type`, `lint`, `build` | `--category type` |
| `--from-debug` | Read findings from latest `/autoresearch:debug` session | `--from-debug` |

Flags can be combined: `--category type --guard "npm test"` fixes only type errors while keeping tests green.

---

## Anti-Patterns It Avoids

The fixer will never take these shortcuts — they suppress errors rather than fix them:

- Never adds `@ts-ignore` or `eslint-disable` comments
- Never uses `any` type to bypass type errors
- Never deletes failing tests to make the suite pass
- Never suppresses lint warnings with inline disable comments
- Never uses empty `catch` blocks to swallow errors
- Never lowers strictness thresholds (e.g., loosening tsconfig, disabling lint rules)
- Never marks tests as `.skip` or `.todo` to avoid failure

If a fix cannot be made cleanly, the iteration is reverted and logged to `blocked.md` for manual review.

---

## Examples

### 1. Auto-detect and fix everything

```
/autoresearch:fix
```

Auto-detects what's broken (build, tests, types, lint), prioritizes by severity, and fixes ONE thing per iteration until zero errors remain.

### 2. Fix only test failures

```
/autoresearch:fix --category test
Iterations: 20
```

Ignores type errors and lint — focuses exclusively on making the test suite green.

### 3. Fix only type errors

```
/autoresearch:fix --category type
Iterations: 25
```

Targets TypeScript (`tsc --noEmit`) or language-appropriate type checker. Leaves lint and tests untouched.

### 4. Fix only lint errors

```
/autoresearch:fix --category lint
Iterations: 15
```

Works through ESLint, pylint, or equivalent — one violation per iteration, auto-reverted if a fix breaks tests.

### 5. Fix build failures

```
/autoresearch:fix --category build
Guard: npm test
Iterations: 10
```

Compilation errors only. Guard ensures tests stay green as each build fix lands.

### 6. Fix from debug findings

```
# Step 1: Hunt bugs
/autoresearch:debug
Scope: src/**/*.ts
Iterations: 15

# Step 2: Fix what was found
/autoresearch:fix --from-debug
Guard: npm test
Iterations: 30
```

Reads the findings from the latest debug session and works through them by severity (Critical first). Shortcut: `/autoresearch:debug --fix`.

### 7. Fix with guard to prevent regressions

```
/autoresearch:fix
Target: tsc --noEmit
Guard: npm test
```

Fixes type errors while ensuring the test suite never regresses. Every candidate fix must pass both verify and guard before it's kept.

### 8. Fix specific target — mypy (Python)

```
/autoresearch:fix --target "mypy app/ --strict"
Guard: pytest
Iterations: 25
```

Runs mypy in strict mode as the verify command. Each iteration fixes one mypy violation. Guard ensures pytest stays green.

### 9. Fix Python type errors

```
/autoresearch:fix --category type
Target: mypy app/ --strict
Guard: pytest
Iterations: 20
```

Combined: category filter narrows focus, explicit target points to mypy, guard keeps the test suite clean.

### 10. Fix Go staticcheck

```
/autoresearch:fix --target "go vet ./... && staticcheck ./..."
Guard: go test ./...
Iterations: 15
```

Runs both `go vet` and `staticcheck` as a single verify command. Fixes one violation per iteration while keeping tests passing.

### 11. Fix Rust clippy warnings

```
/autoresearch:fix --target "cargo clippy -- -D warnings"
Guard: cargo test
Iterations: 20
```

Treats every clippy warning as an error (`-D warnings`). Auto-reverts any fix that introduces new warnings or breaks tests.

### 12. Fix CI/CD pipeline

```
/autoresearch:fix
Target: gh run view --log-failed
Scope: .github/workflows/*.yml
```

Reads CI failure logs from GitHub Actions and fixes workflow configuration errors. Useful after dependency upgrades or runner changes.

---

## Example Session Output

```
> /autoresearch:fix

[Phase 1] Detected: 47 test failures, 12 type errors, 3 lint errors
[Phase 2] Priority: types first (may cascade-fix test failures)

[Iteration 1] Fix: auth.ts:42 — add return type annotation
  delta: -2 errors | guard: pass | STATUS: KEEP

[Iteration 2] Fix: db.ts:15 — handle nullable column
  delta: -1 error | guard: pass | STATUS: KEEP

[Iteration 3] Fix: api.test.ts — fix expected status 200→201
  delta: -3 errors | guard: pass | STATUS: KEEP

[Iteration 4] Fix: auth.test.ts — wrong approach
  delta: 0 errors | guard: - | STATUS: DISCARD (reverted)

...

=== Fix Complete (23 iterations) ===
Baseline: 62 errors → Final: 3 errors (-95.2%)
Keeps: 19 | Discards: 3 | Reworks: 1
Blocked: 1 (circular dependency — escalated to /autoresearch:debug)
```

---

## Chain Patterns

### debug → fix (find and repair)

```bash
# Step 1: Find all bugs
/autoresearch:debug
Scope: src/**/*.ts
Iterations: 15

# Step 2: Fix what was found
/autoresearch:fix --from-debug
Guard: npm test
Iterations: 30

# Or use the shortcut:
/autoresearch:debug --fix
Iterations: 30
```

### security → fix (pre-release hardening)

```bash
# Step 1: Find vulnerabilities
/autoresearch:security
Scope: src/**/*.ts
Iterations: 15

# Step 2: Fix Critical/High findings
/autoresearch:fix --from-debug
Guard: npm test
Iterations: 20

# Step 3: Re-audit to confirm fixes landed
/autoresearch:security --diff
Iterations: 10

# Step 4: Ship when clean
/autoresearch:ship --type code-release
```

### predict → fix (proactive hardening)

```bash
# Step 1: Find edge cases before they hit production
/autoresearch:scenario --domain software --focus edge-cases
Scope: src/upload/**/*.ts

# Step 2: Hunt bugs in discovered edge cases
/autoresearch:debug
Symptom: Edge cases from scenario — concurrent uploads, large files, network drops

# Step 3: Fix everything found
/autoresearch:fix --from-debug
Guard: npm test
```

### fix → ship (green to deployed)

```bash
# Step 1: Fix everything
/autoresearch:fix
Guard: npm test
Iterations: 30

# Step 2: Ship once green
/autoresearch:ship --type code-pr --auto
```

---

## Output Structure

Every fix session creates a structured folder:

```
fix/
└── 260318-1045-fix-type-errors-auth-module/
    ├── fix-results.tsv     Iteration log: fix attempted, delta, status (KEEP/DISCARD)
    ├── summary.md          Final error counts, baseline vs final, kept/discarded stats
    └── blocked.md          Fixes that couldn't be made cleanly — manual review needed
```

### fix-results.tsv columns

| Column | Description |
|--------|-------------|
| iteration | Iteration number |
| file | File changed |
| description | What was fixed |
| error_delta | Change in error count (negative = improvement) |
| guard_status | pass / fail / skip |
| status | KEEP / DISCARD / REWORK |

### blocked.md

Entries in `blocked.md` are fixes the loop attempted but could not resolve cleanly — typically circular dependencies, missing type definitions requiring a dependency install, or errors requiring architectural decisions. These are escalated for manual review or a follow-up `/autoresearch:debug` session.

---

## Tips

**Start unbounded for unknown codebases.** Let the fixer run without an iteration limit — it stops automatically at zero errors. Add `--guard` to prevent regressions.

**Use `--category` when you have a deadline.** If you need tests green before a PR, `--category test` ignores type noise and targets the failing suite only.

**Chain after debug sessions.** `--from-debug` is more focused than auto-detect — it works the prioritized bug list rather than scanning fresh each iteration.

**Guard is your safety net.** Always set `Guard: npm test` (or equivalent) when fixing types or lint — cascade fixes sometimes break behavior.

**Check blocked.md after each run.** Items there usually point to deeper architectural issues. Route them to `/autoresearch:debug` for investigation before the next fix sprint.

**Fix build errors in isolation.** If the build is broken, run `--category build` first. Many test and type errors will disappear once compilation succeeds.
