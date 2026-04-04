# /autoresearch — The Autonomous Loop

## What It Does

`/autoresearch` is the core command. It runs an autonomous modify → verify → keep/discard loop indefinitely (or for N iterations when bounded). You give it a goal, a scope of files it can touch, a shell command that outputs a numeric metric, and an optional guard that must stay green. Claude then picks the highest-impact change it can make, commits it, measures the result, and either keeps the improvement or reverts the commit — repeating until the goal is met or iterations are exhausted. It learns from its own history: what worked in earlier iterations informs what it tries next. The result is compounding, documented progress with every change on a clean git branch you can inspect, cherry-pick, or roll back at any time.

---

## Full Syntax

```
/autoresearch
Goal:       <what you want to improve>
Scope:      <file globs Claude can modify>
Metric:     <what number to track> (<direction>)
Verify:     <shell command whose output contains the metric>
Guard:      <optional command that must always pass>
Iterations: <optional number — omit for unlimited>
```

All fields except `Goal` are optional when context is obvious, but providing all of them produces the most reliable runs.

### Config Reference

| Field | Required | Description |
|-------|----------|-------------|
| `Goal` | Yes | Plain-language description of the target. Include a concrete number when possible ("to 90%", "below 200KB"). |
| `Scope` | Recommended | Glob patterns for files Claude may read and modify. Multiple globs separated by commas. Omit to allow full repo access. |
| `Metric` | Recommended | The number being tracked. Append `(higher is better)` or `(lower is better)` to set direction. |
| `Verify` | Recommended | Shell command whose stdout contains the metric value. Claude parses the number from output automatically. |
| `Guard` | Optional | Shell command that must exit 0 after every kept change. Failures trigger rework before the change is accepted. |
| `Iterations` | Optional | Integer. Omit for unlimited. Add when you want a time-boxed sprint or CI-safe run. |

---

## What Happens During Each Iteration

1. Claude reads the codebase, git history, and log of past iteration results
2. Picks the highest-impact change based on what worked (and what failed) before
3. Makes ONE atomic change — explainable in one sentence
4. Commits it so rollback is clean
5. Runs your `Verify` command and extracts the metric value
6. Runs the `Guard` (if set)
7. Decision:
   - Metric improved + guard passed → **keep**
   - Metric worse → `git revert` automatically
   - Guard failed → rework the change (max 2 attempts), then discard if still failing
8. Logs the result (delta, keep/discard, notes) and moves to the next iteration

---

## Examples

### Software Engineering Examples

#### Increase test coverage — unbounded

```
/autoresearch
Goal: Increase test coverage from 72% to 90%
Scope: src/**/*.test.ts, src/**/*.ts
Metric: coverage % (higher is better)
Verify: npm test -- --coverage | grep "All files"
```

Claude adds tests one at a time. Each iteration: write test → run coverage → keep if % went up → discard if not → repeat until 90% or stopped.

---

#### Increase test coverage — bounded (20 iterations)

```
/autoresearch
Iterations: 20
Goal: Increase test coverage from 72% to 90%
Scope: src/**/*.test.ts, src/**/*.ts
Metric: coverage % (higher is better)
Verify: npm test -- --coverage | grep "All files"
```

Useful for a focused sprint or when you want a CI step that runs a fixed number of improvement cycles.

---

#### Reduce bundle size

```
/autoresearch
Iterations: 15
Goal: Reduce production bundle size below 200KB
Scope: src/**/*.tsx, src/**/*.ts
Metric: bundle size in KB (lower is better)
Verify: npm run build 2>&1 | grep "First Load JS"
Guard: npm test
```

Claude tries tree-shaking unused imports, lazy-loading routes, replacing heavy libraries, code-splitting — one change per iteration. Guard ensures tests stay green throughout.

---

#### Fix flaky tests

```
/autoresearch
Iterations: 10
Goal: Zero flaky tests — all tests pass 5 consecutive runs
Scope: src/**/*.test.ts
Metric: failure count across 5 runs (lower is better)
Verify: for i in {1..5}; do npm test 2>&1; done | grep -c "FAIL"
```

Runs the full suite 5 times per iteration, counts failures. Claude targets the test with the highest flake rate each iteration.

---

#### Performance optimization — API p95 latency

```
/autoresearch
Goal: API response time under 100ms (p95)
Scope: src/api/**/*.ts, src/services/**/*.ts
Metric: p95 response time in ms (lower is better)
Verify: npm run bench:api | grep "p95"
Guard: npm test
```

Unbounded — runs until p95 drops under 100ms. Add `Iterations: 10` for a 30-minute sprint.

---

#### Eliminate TypeScript `any` types

```
/autoresearch
Iterations: 25
Goal: Eliminate all TypeScript `any` types
Scope: src/**/*.ts
Metric: count of `any` occurrences (lower is better)
Verify: grep -r ":\s*any" src/ --include="*.ts" | wc -l
Guard: tsc --noEmit
```

Claude replaces one `any` per iteration with a proper type. Guard ensures no new type errors are introduced while fixing existing ones.

---

#### Reduce lines of code

```
/autoresearch
Iterations: 20
Goal: Reduce lines of code in src/services/ by 30% while keeping all tests green
Scope: src/services/**/*.ts
Metric: LOC count (lower is better)
Verify: npm test && find src/services -name "*.ts" | xargs wc -l | tail -1
```

The `Verify` command runs tests first — if tests fail, the output won't contain a clean LOC number, so Claude treats it as a guard failure. Elegant double-duty.

---

#### Improve Lighthouse score

```
/autoresearch
Goal: Improve Lighthouse performance score to 95+
Scope: src/components/**/*.tsx, src/pages/**/*.tsx
Metric: Lighthouse performance score (higher is better)
Verify: npx lighthouse http://localhost:3000 --output=json --quiet | jq '.categories.performance.score * 100'
Guard: npx playwright test
```

Claude iterates on image optimization, render-blocking resources, layout shifts, and font loading — keeping e2e tests passing via Guard.

---

### Python Examples

#### Increase pytest coverage

```
/autoresearch
Iterations: 30
Goal: Increase pytest coverage from 68% to 90%
Scope: tests/**/*.py, app/**/*.py
Metric: coverage % (higher is better)
Verify: pytest --cov=app --cov-report=term-missing 2>&1 | grep "TOTAL" | awk '{print $4}'
```

Each iteration adds one test function. Claude prioritizes uncovered branches visible in `--cov-report=term-missing` output.

---

#### Reduce Django N+1 queries

```
/autoresearch
Iterations: 15
Goal: Eliminate N+1 queries — reduce total DB queries per request
Scope: app/views/**/*.py, app/models/**/*.py
Metric: total query count per request (lower is better)
Verify: python manage.py test --settings=settings.test 2>&1 | grep "queries" | awk '{print $1}'
Guard: pytest
```

Claude adds `select_related`, `prefetch_related`, and query annotations — one queryset fix per iteration. Guard keeps all existing tests passing.

---

#### FastAPI response time

```
/autoresearch
Iterations: 20
Goal: Reduce p95 response time to under 50ms
Scope: app/routers/**/*.py, app/services/**/*.py
Metric: p95 response time in ms (lower is better)
Verify: python scripts/bench_api.py | grep "p95"
Guard: pytest
```

Targets slow endpoints with caching, async refactors, and DB query optimizations — one change per iteration, tests always protected.

---

### Go Examples

#### Increase Go test coverage

```
/autoresearch
Iterations: 25
Goal: Increase test coverage to 85%
Scope: **/*.go
Metric: coverage % (higher is better)
Verify: go test ./... -coverprofile=cover.out && go tool cover -func=cover.out | grep "total:" | awk '{print $3}'
```

Generates test cases for uncovered functions, one per iteration. The `coverprofile` approach gives Claude precise line-level data to target.

---

#### Reduce Go binary size

```
/autoresearch
Iterations: 10
Goal: Reduce compiled binary size
Scope: cmd/**/*.go, internal/**/*.go
Metric: binary size in MB (lower is better)
Verify: go build -o /tmp/bench ./cmd/server && ls -la /tmp/bench | awk '{print $5/1048576}'
Guard: go test ./...
```

Claude tries `-ldflags="-s -w"`, removing unused dependencies, dead code elimination — measuring each change against a fresh binary build.

---

#### Go benchmark optimization

```
/autoresearch
Iterations: 20
Goal: Improve hot-path benchmark by 2x
Scope: internal/parser/**/*.go
Metric: ns/op from benchmark (lower is better)
Verify: go test -bench=BenchmarkParse -benchmem ./internal/parser/ | grep "BenchmarkParse" | awk '{print $3}'
Guard: go test ./...
```

Targets allocation reduction, interface avoidance, and buffer reuse in the hot path — each iteration a single micro-optimization.

---

### Rust Examples

#### Increase Rust test coverage

```
/autoresearch
Iterations: 20
Goal: Increase test coverage to 80%
Scope: src/**/*.rs
Metric: coverage % (higher is better)
Verify: cargo tarpaulin --out Stdout 2>&1 | grep "coverage" | awk '{print $2}'
```

Uses `cargo-tarpaulin` for line coverage. Claude adds `#[test]` functions targeting uncovered match arms and error paths first.

---

#### Reduce compile time

```
/autoresearch
Iterations: 15
Goal: Reduce incremental compile time
Scope: src/**/*.rs, Cargo.toml
Metric: compile time in seconds (lower is better)
Verify: cargo build --timings 2>&1 | grep "Finished" | awk '{print $2}'
Guard: cargo test
```

Claude targets large monolithic modules, unnecessary proc-macro dependencies, and feature flag bloat — splitting or removing one thing per iteration.

---

#### Criterion benchmark optimization

```
/autoresearch
Iterations: 25
Goal: Reduce p95 request handling time
Scope: src/handlers/**/*.rs
Metric: ns/iter from criterion (lower is better)
Verify: cargo bench -- --output-format bencher 2>&1 | grep "bench:" | awk '{print $5}'
Guard: cargo test
```

Criterion's statistical output gives Claude stable baselines to compare against. Each iteration targets one allocating path or clone call.

---

### Non-Code Examples

#### Sales email optimization

```
/autoresearch
Iterations: 15
Goal: Improve cold email reply rate prediction score
Scope: content/email-templates/*.md
Metric: readability score + personalization token count (higher is better)
Verify: node scripts/score-email-template.js
```

Claude iterates on subject lines, opening hooks, CTAs, and personalization variables — keeping changes that score higher on your custom scorer.

---

#### SEO content optimization

```
/autoresearch
Goal: Maximize SEO score for target keywords
Scope: content/blog/*.md
Metric: SEO score from audit tool (higher is better)
Verify: node scripts/seo-score.js --file content/blog/target-post.md
```

Claude tweaks headings, keyword density, meta descriptions, and internal links — one change per iteration. Run unlimited overnight or add `Iterations: 25` for a focused session.

---

#### Marketing landing page

```
/autoresearch
Iterations: 15
Goal: Maximize Flesch readability + keyword density for "AI automation"
Scope: content/landing-pages/ai-automation.md
Metric: readability_score * 0.7 + keyword_density_score * 0.3 (higher is better)
Verify: node scripts/content-score.js content/landing-pages/ai-automation.md
```

Composite metric lets you weight readability more than keyword density. Claude respects the weighting when deciding which changes to keep.

---

#### Job description clarity and inclusivity

```
/autoresearch
Iterations: 15
Goal: Improve job descriptions — bias-free language, clear requirements, inclusive tone
Scope: content/job-descriptions/*.md
Metric: inclusivity score from textio-style checker (higher is better)
Verify: node scripts/jd-inclusivity-score.js
```

Each iteration targets one problematic phrase, gendered word, or vague requirement. Works on entire directories of JD files at once.

---

## Guard Patterns

### How Guard Works

The Guard is a shell command that must exit 0 after every change Claude wants to keep. It runs separately from `Verify`. `Verify` measures the metric you are optimizing. Guard protects something else — typically your test suite, type checker, or linter.

**Recovery flow when guard fails:**

1. Metric improves, but guard fails
2. Claude reverts the change immediately (`git revert`)
3. Reads guard output to understand what broke
4. Reworks the optimization to avoid the regression (max 2 attempts)
5. If both rework attempts fail → discard entirely and move to the next iteration

This means you never end an iteration with a broken guard. The loop is always in a working state.

### Guard Example 1 — Bundle size without breaking tests

```
/autoresearch
Goal: Reduce bundle size below 200KB
Scope: src/**/*.tsx, src/**/*.ts
Metric: bundle size in KB (lower is better)
Verify: npm run build 2>&1 | grep "gzipped"
Guard: npm test
```

Claude can aggressively remove code to shrink the bundle — the guard catches any removals that break test assertions.

### Guard Example 2 — Performance without breaking types

```
/autoresearch
Goal: Reduce response time under 100ms
Scope: src/api/**/*.ts, src/services/**/*.ts
Metric: p95 response time in ms (lower is better)
Verify: npm run bench | grep "p95"
Guard: tsc --noEmit && npm test
```

Chained guard: types must compile AND tests must pass. Either failure triggers rework.

### Guard Example 3 — Lighthouse without breaking e2e

```
/autoresearch
Goal: Improve Lighthouse performance to 95+
Scope: src/**/*.tsx
Metric: Lighthouse score (higher is better)
Verify: npx lighthouse http://localhost:3000 --output=json --quiet | jq '.categories.performance.score * 100'
Guard: npx playwright test
```

Playwright e2e tests catch visual regressions and interaction breaks that unit tests would miss — essential when touching layout and rendering code.

---

## Bounded vs Unbounded

| | Bounded (`Iterations: N`) | Unbounded (no `Iterations`) |
|---|---|---|
| **Stops when** | N iterations complete | Goal is met (or you interrupt) |
| **Best for** | Time-boxed sprints, CI jobs, fixed budgets | Overnight runs, maximize improvement |
| **Predictability** | Exact runtime estimate | Open-ended |
| **CI usage** | Yes — safe to put in pipeline | Only with external timeout |
| **Typical N values** | 10 (quick), 20 (standard), 50 (deep) | n/a |
| **Risk** | May not reach goal | May run indefinitely |

**Guideline:** Use bounded when you need to ship today or are running in CI. Use unbounded when you want maximum improvement and are comfortable running overnight.

---

## When to Use /autoresearch vs Other Commands

| Situation | Command |
|-----------|---------|
| You have a measurable metric to improve | `/autoresearch` |
| You don't know what metric to use | `/autoresearch:plan` |
| Tests are failing, types are broken, lint is red | `/autoresearch:fix` |
| You suspect bugs but don't know where | `/autoresearch:debug` |
| Pre-release security review | `/autoresearch:security` |
| Ready to ship a PR or deployment | `/autoresearch:ship` |
| Want to explore edge cases before building | `/autoresearch:scenario` |
| Want expert opinions before starting | `/autoresearch:predict` |
| Optimize without breaking existing tests | `/autoresearch` with `Guard: npm test` |

---

## Tips and Anti-Patterns

### Tips

**Write a tight Verify command.** The command should output exactly one number (or a line containing one number). Noisy output is fine — Claude parses it — but ambiguous output with multiple numbers causes misreadings. Use `grep`, `awk`, or `jq` to isolate the value.

**Start with a baseline.** Run your `Verify` command manually before starting the loop. Know your starting number. It gives Claude a reference and lets you sanity-check the first iteration result.

**Use Guard liberally.** If you are optimizing anything other than test pass/fail rate, add `Guard: npm test`. The cost is one extra test run per iteration. The benefit is a loop that never regresses.

**Bounded first, unbounded after.** Run `Iterations: 10` to see how the loop behaves on your codebase — what changes Claude picks, how large the deltas are. If it looks good, remove the limit.

**Scope tightly.** A narrow scope (e.g., `src/api/**/*.ts`) gives Claude clearer constraints than `src/**`. Broader scopes are fine for unbounded overnight runs but can lead to surprising changes in bounded sprints.

**Commit history is the output.** Every kept change is a commit. After a run, `git log` shows exactly what changed and why. `git revert <hash>` undoes any single change cleanly.

### Anti-Patterns

**Don't set a Verify that can't parse to a number.** If `npm run build` exits non-zero on errors and you pipe it with `grep`, a build failure produces no output — Claude stalls. Add `2>&1` and test the command standalone first.

**Don't use a Guard that takes 10+ minutes.** If your full e2e suite takes 15 minutes, use a fast smoke test as Guard and run the full suite separately. A slow guard makes each iteration prohibitively expensive.

**Don't omit Metric direction.** Without `(higher is better)` or `(lower is better)`, Claude guesses. Always be explicit.

**Don't set conflicting Goal and Metric.** If Goal says "increase coverage" but Metric says "lower is better", Claude will optimize in the wrong direction. Keep them consistent.

**Don't run unbounded in CI without a timeout.** Wrap with a CI timeout or use `Iterations: N`. Unbounded loops in CI pipelines can run until the job limit is hit.

**Don't use a Verify that modifies state.** If your benchmark script writes to a database or sends HTTP requests to production, each iteration has side effects. Use isolated bench environments or mocked data.

---

## Related Guides

- [/autoresearch:plan](autoresearch-plan.md) — when you need help choosing Goal, Scope, and Metric
- [/autoresearch:fix](autoresearch-fix.md) — when errors need fixing before you can optimize
- [Chains & Combinations](chains-and-combinations.md) — combining `/autoresearch` with debug, security, ship
- [Advanced Patterns](advanced-patterns.md) — custom verification scripts, MCP integration, CI/CD
- [Examples by Domain](examples-by-domain.md) — full examples across software, marketing, DevOps, ML, HR
