<div align="center">

# /autoresearch:debug — The Bug Hunter

**By [Udit Goenka](https://udit.co)**

[![Version](https://img.shields.io/badge/version-1.8.1-blue.svg)](https://github.com/uditgoenka/autoresearch/releases)

</div>

---

Scientific method meets the autoresearch loop. `/autoresearch:debug` doesn't stop at one bug — it iteratively hunts ALL bugs, forming falsifiable hypotheses, running one experiment per iteration, logging confirmed and disproven results alike, then surfacing the next lead until nothing is left to investigate. Every finding ships with code evidence (file:line + reproduction steps). No theoretical fluff, no guesswork logged as confirmed.

---

## How It Works — 7-Phase Process Per Iteration

Each iteration of the debug loop follows the same rigorous scientific process:

```
┌─────────────────────────────────────────────────────────────┐
│                    SETUP (once)                             │
│                                                             │
│  Run tests / lint / typecheck — collect baseline failures  │
│  Map the error surface and trace call chains               │
│  Build initial hypothesis queue                             │
├─────────────────────────────────────────────────────────────┤
│                    LOOP (N times or forever)                │
│                                                             │
│  1. GATHER     Collect symptoms: tests, lint, typecheck     │
│  2. RECON      Map error surface, trace call chains         │
│  3. HYPOTHESIZE  Form one falsifiable, testable hypothesis  │
│  4. TEST       Run ONE experiment (see techniques below)    │
│  5. CLASSIFY   Confirmed / Disproven / Inconclusive / Lead  │
│  6. LOG        Record to debug-results.tsv with severity    │
│  7. REPEAT     Next hypothesis or follow the new lead       │
└─────────────────────────────────────────────────────────────┘
```

One hypothesis per iteration. One experiment per hypothesis. Every result — including disproven ones — is logged and feeds the next cycle.

---

## 7 Investigation Techniques

Each iteration selects the most appropriate technique for the hypothesis being tested:

| Technique | How It Works |
|-----------|-------------|
| **Binary Search** | Divide the suspect code in half, isolate which half contains the bug, recurse until pinpointed |
| **Differential Debugging** | Compare working vs. broken versions, branches, configs, or environments to isolate the delta |
| **Minimal Reproduction** | Strip the problem to the smallest possible case that still reproduces the failure |
| **Trace Execution** | Follow the actual code path end-to-end, tracking data transformations and state mutations |
| **Pattern Search** | Grep for known-bad patterns: missing awaits, unchecked nulls, string concatenation in queries |
| **Working Backwards** | Start at the failure point, walk up the call stack to find where invariants were violated |
| **Rubber Duck** | Narrate the code path aloud step-by-step — forces explicit reasoning, surfaces hidden assumptions |

---

## All Flags

| Flag | Purpose |
|------|---------|
| `--fix` | After hunting bugs, auto-switch to `/autoresearch:fix` to repair everything found |
| `--scope <glob>` | Limit investigation to specific files (e.g., `src/api/**/*.ts`) |
| `--symptom "<text>"` | Pre-fill the symptom description to skip the interactive prompt |
| `--severity <level>` | Minimum severity to report (`critical`, `high`, `medium`, `low`) |

Flags combine freely:

```
/autoresearch:debug --fix --scope src/api/**/*.ts --severity high
```

---

## Severity Levels

| Level | Definition |
|-------|-----------|
| **Critical** | Data loss, security vulnerability, auth bypass, production outage, corrupted state |
| **High** | Functional breakage with user impact: silent failures, wrong data returned, crashes on valid input |
| **Medium** | Incorrect behavior in edge cases, degraded performance, missing validation on non-critical paths |
| **Low** | Code smell, minor inconsistency, logged error with graceful recovery, style-level logic issue |

Use `--severity high` to surface only High/Critical findings. Default logs all levels.

---

## Examples

### 1. Interactive (no args) — Claude asks what's broken

```
/autoresearch:debug
```

Claude runs tests, lint, and typecheck, then asks for any additional context before building the hypothesis queue.

---

### 2. Scoped hunt with symptom pre-filled

```
/autoresearch:debug
Scope: src/api/**/*.ts
Symptom: API returns 500 on POST /users
Iterations: 20
```

Focuses 20 iterations on the API layer with a known entry point.

---

### 3. Debug then auto-fix

```
/autoresearch:debug --fix
```

Hunts bugs until iterations exhaust, then automatically hands the findings to `/autoresearch:fix` for repair.

---

### 4. API 500 errors

```
/autoresearch:debug
Scope: src/api/**/*.ts, src/middleware/**/*.ts
Symptom: POST /users returns 500 — stack trace shows TypeError in serializer
Iterations: 15
```

Traces the request lifecycle: routing → middleware → handler → serializer → response.

---

### 5. Intermittent login failures

```
/autoresearch:debug
Scope: src/auth/**/*.ts, src/middleware/**/*.ts
Symptom: Login succeeds sometimes, fails with 401 on the same credentials
Iterations: 20
```

Investigates session state, JWT generation variance, clock skew, and token storage race conditions.

---

### 6. Memory leak investigation

```
/autoresearch:debug
Scope: src/**/*.ts
Symptom: Node process memory grows 50MB/hour under normal load
Iterations: 25
```

Searches for unclosed streams, accumulating event listeners, cache without eviction, and retained closures.

---

### 7. Performance regression

```
/autoresearch:debug
Scope: src/models/**/*.ts, src/api/**/*.ts
Symptom: Dashboard page went from 200ms to 4s after last deploy
Iterations: 20
```

Checks for N+1 queries, missing indexes accessed in the last change, removed eager loading, and added synchronous I/O.

---

### 8. Scraper failures

```
/autoresearch:debug
Scope: src/scraper/**/*.ts
Symptom: Scraper returns empty results for 30% of URLs since yesterday
Iterations: 15
```

Investigates selector changes, rate limiting responses, redirect handling, and error swallowing in the fetch layer.

---

### 9. Database query issues

```
/autoresearch:debug
Scope: src/models/**/*.ts, src/db/**/*.ts
Symptom: Slow queries on dashboard page, db CPU spiking to 80%
Iterations: 20
```

Hunts missing awaits, N+1 patterns, full table scans, missing pagination, and transactions held open too long.

---

### 10. Production incident triage

```
/autoresearch:debug --fix --severity high
Scope: src/**/*.ts
Symptom: Payment confirmations silently failing — transactions recorded but emails never sent
Iterations: 30
```

Prioritizes Critical and High findings. After hunting, auto-switches to fix mode. Full scope sweep — payment, email, queue, worker.

---

### 11. Auth escalation bug

```
/autoresearch:debug
Scope: src/auth/**/*.ts, src/middleware/**/*.ts
Symptom: Regular users can access /admin endpoints
Iterations: 15
```

Checks middleware ordering, role validation logic, missing guards on route definitions, and authorization bypass via path manipulation.

---

### 12. Bounded severity-filtered sweep

```
/autoresearch:debug --severity critical
Scope: src/**/*.ts
Iterations: 40
```

Runs 40 iterations across the entire codebase but only logs Critical findings — ideal for pre-release emergency sweep.

---

## Example Session Output

```
> /autoresearch:debug
> Iterations: 10

[Phase 1] Gathering symptoms...
  Tests: 3 failures | Lint: 0 errors | Types: 2 errors

[Iteration 1] Hypothesis: "db.insert() missing await at db.ts:88"
  → CONFIRMED HIGH — silent write failure on error path

[Iteration 2] Hypothesis: "JWT alg not validated at auth.ts:42"
  → CONFIRMED CRITICAL — algorithm confusion vulnerability

[Iteration 3] Hypothesis: "Rate limiting missing on /api/auth/login"
  → CONFIRMED MEDIUM — brute force possible

[Iteration 4] Hypothesis: "SQL injection via string concat in search"
  → DISPROVEN — parameterized queries used correctly

[Iteration 5] Hypothesis: "Type error from null return in getUserById"
  → CONFIRMED HIGH — crashes when user not found

[Iteration 6] Hypothesis: "Race condition in session store write"
  → INCONCLUSIVE — needs load test to reproduce reliably

[Iteration 7] Hypothesis: "Error swallowed in catch block at api.ts:201"
  → CONFIRMED MEDIUM — returns 200 on third-party timeout

[Iteration 8] Hypothesis: "Missing CORS header on /api/webhooks"
  → DISPROVEN — CORS configured correctly

[Iteration 9] Hypothesis: "Pagination off-by-one in list endpoint"
  → CONFIRMED LOW — last item duplicated across pages

[Iteration 10] Hypothesis: "Env var missing in production config"
  → CONFIRMED HIGH — SMTP_HOST undefined silently disables email

=== Debug Complete (10/10 iterations) ===
Bugs found: 7 (1 Critical, 3 High, 2 Medium, 1 Low)
Hypotheses: 10 tested (7 confirmed, 2 disproven, 1 inconclusive)
Files investigated: 18 / 47 in scope
```

---

## Chain Patterns

### debug → fix

Hunt first, repair second:

```
# Step 1: Hunt bugs
/autoresearch:debug
Iterations: 20

# Step 2: Fix everything found
/autoresearch:fix --from-debug
Iterations: 40
```

Or as a single command with `--fix`:

```
/autoresearch:debug --fix
Iterations: 20
```

---

### predict → debug

Get expert opinion on likely failure points before investigating:

```
# Step 1: Multi-persona prediction on where bugs hide
/autoresearch:predict
Question: Where are the most likely bugs in this auth system?
Personas: security-engineer, backend-engineer, qa-engineer

# Step 2: Debug with that context
/autoresearch:debug
Scope: src/auth/**/*.ts
Symptom: [informed by predict output]
```

---

### scenario → debug

Explore edge cases first, then hunt bugs they reveal:

```
# Step 1: Generate edge case scenarios
/autoresearch:scenario
Domain: software
Focus: payment processing edge cases

# Step 2: Debug the failures those scenarios surface
/autoresearch:debug
Scope: src/payments/**/*.ts
Symptom: [from scenario output]
```

---

### debug → fix → ship

Full incident resolution pipeline:

```
# 1. Hunt bugs
/autoresearch:debug --severity high
Iterations: 20

# 2. Fix confirmed findings
/autoresearch:fix --from-debug
Iterations: 30

# 3. Ship when green
/autoresearch:ship --auto
```

---

## Output Structure

Every debug session creates a structured folder:

```
debug/260318-1204-post-users-500-error/
├── findings.md          Confirmed bugs with code evidence + severity
├── eliminated.md        Disproven hypotheses with reasoning
├── debug-results.tsv    Machine-readable log of all iterations
└── summary.md           Executive summary: totals, coverage, next steps
```

`findings.md` format per bug:

```markdown
### [HIGH] Missing await on db.insert()
- **Location:** src/db/users.ts:88
- **Symptom:** Silent write failure on error path — returns success, data never saved
- **Reproduction:** Call POST /users with valid payload while DB connection is slow
- **Code Evidence:**
  // Line 88 — missing await causes unhandled rejection
  db.insert(userData);  // should be: await db.insert(userData)
- **Fix:** Add await; wrap in try/catch to surface errors
```

---

## The Value of Disproven Hypotheses

`eliminated.md` is not a failure log — it is evidence. Each disproven hypothesis:

- **Narrows the search space** — ruled-out paths are never re-investigated
- **Documents correct behavior** — confirms what IS working correctly
- **Prevents future confusion** — teammates won't re-investigate the same dead ends
- **Feeds the next hypothesis** — what the disproven hypothesis reveals about adjacent code

A session with 6 disproven and 4 confirmed hypotheses is not inefficient. It is thorough.

---

## Tips and Common Patterns

**Start broad, go narrow.** Let the first few iterations cast a wide net. Narrow `--scope` once the error surface is clear.

**Symptom precision speeds convergence.** The more specific the symptom, the more targeted the first hypothesis. Vague symptoms mean more early iterations spent on recon.

**Use `--severity high` for production incidents.** Skip Medium/Low during active incidents — find and fix Critical/High first, sweep the rest after stabilization.

**Pair with predict for unfamiliar codebases.** Run `/autoresearch:predict` first to get expert hypotheses, then feed them as the starting symptom.

**Let `--fix` handle the repair.** Don't mix hunting and fixing in the same session manually. Use `--fix` flag to hand off cleanly after all bugs are found.

**Check `eliminated.md` before re-running.** If re-running debug after a fix, review what was already disproven to avoid redundant iterations.

**Inconclusive findings need reproduction steps.** If an iteration returns Inconclusive, note what environment conditions are needed. Schedule a targeted re-run with those conditions met (load test, specific timing, specific data).

---

<div align="center">

**Built by [Udit Goenka](https://udit.co)** | [GitHub](https://github.com/uditgoenka/autoresearch) | [Follow @iuditg](https://x.com/iuditg)

</div>
