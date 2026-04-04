# Advanced Patterns — Guards, MCP, CI/CD, and More

Reference for power users: guard commands, custom verification, MCP integration, CI/CD pipelines, and the principles behind the loop.

---

## Guard Commands

Guards prevent regressions while you optimize a different metric. Set a Guard when your metric is NOT your test suite — otherwise you risk improving one dimension while silently breaking another.

**Use Guard when:** optimizing bundle size, Lighthouse score, query performance, or any metric that doesn't itself catch functional regressions.

### Guard recovery flow

1. Metric improves, but guard command fails
2. Claude reverts the change immediately
3. Reads guard output to understand what broke
4. Reworks the optimization to avoid the regression (max 2 attempts)
5. If 2 attempts fail — discard and move on

### Examples

```
# Optimize bundle size WITHOUT breaking tests
/autoresearch
Goal: Reduce bundle size below 200KB
Verify: npm run build 2>&1 | grep "gzipped"
Guard: npm test
```

```
# Optimize performance WITHOUT breaking types
/autoresearch
Goal: Reduce p95 response time to under 100ms
Verify: npm run bench:api | grep "p95"
Guard: tsc --noEmit && npm test
```

```
# Optimize Lighthouse WITHOUT breaking e2e tests
/autoresearch
Goal: Lighthouse performance score 95+
Verify: npx lighthouse http://localhost:3000 --output=json --quiet | jq '.categories.performance.score * 100'
Guard: npx playwright test
```

```
# Multiple guard commands — chained with &&
/autoresearch
Goal: Reduce LOC by 30% in services module
Verify: wc -l src/services/**/*.ts | tail -1
Guard: npm test && tsc --noEmit && npx eslint src/
```

```
# Python: coverage + mypy
/autoresearch
Goal: Increase pytest coverage to 90%
Verify: pytest --cov=app 2>&1 | grep "TOTAL" | awk '{print $4}'
Guard: mypy app/ --strict
```

---

## Custom Verification Scripts

For complex metrics that can't be expressed as a one-liner, write a dedicated script.

**Rules for verify scripts:**
- Must output a parseable number (Claude extracts it mechanically)
- Must be deterministic — same input produces same output every time
- Must be fast — under 30 seconds; faster = more experiments per session
- Must exit 0 on success, non-zero on failure

### Python example

```python
#!/usr/bin/env python3
# scripts/verify-coverage.py
import subprocess, re, sys

result = subprocess.run(
    ["npm", "test", "--", "--coverage"],
    capture_output=True, text=True
)

match = re.search(r'All files\s*\|\s*([\d.]+)', result.stdout)
if match:
    print(f"coverage: {match.group(1)}")
    sys.exit(0)
else:
    print("coverage: 0")
    sys.exit(1)
```

```
/autoresearch
Verify: python scripts/verify-coverage.py | grep "coverage"
```

### Node.js example

```javascript
// scripts/score-example.js — Template for custom scoring
const fs = require('fs');
const file = process.argv[2];
const content = fs.readFileSync(file, 'utf-8');

// Your scoring logic here
const score = content.split('\n').filter(l => l.startsWith('- ')).length;

// Output MUST be a single number on its own line
console.log(`SCORE: ${score}`);
process.exit(score > 0 ? 0 : 1);
```

### Shell script example

```bash
#!/bin/bash
# scripts/lint-count.sh
count=$(npx eslint src/ 2>&1 | grep -c "error" || echo "0")
echo "lint_errors: $count"
exit 0
```

### Composite metric example

Combine multiple signals into one weighted score:

```python
#!/usr/bin/env python3
# scripts/composite-score.py
import subprocess, re, sys

# Run tests, get coverage
cov_out = subprocess.run(["npm", "test", "--", "--coverage"],
    capture_output=True, text=True).stdout
cov = float(re.search(r'All files\s*\|\s*([\d.]+)', cov_out).group(1))

# Count lint errors
lint_out = subprocess.run(["npx", "eslint", "src/"],
    capture_output=True, text=True).stderr
lint_errors = lint_out.count("error")

# Count TypeScript any usages
ts_out = subprocess.run(["grep", "-r", "any", "src/", "--include=*.ts", "-l"],
    capture_output=True, text=True).stdout
any_count = len(ts_out.strip().split('\n')) if ts_out.strip() else 0

# Weighted formula: coverage matters most, penalize quality issues
score = (cov * 0.6) - (lint_errors * 0.5) - (any_count * 0.3)
print(f"composite: {score:.2f}")
sys.exit(0)
```

---

## Using with MCP Servers

Any MCP server configured in Claude Code is available during the loop. This enables real-time data-driven iteration — Claude can query live databases, analytics platforms, or external APIs as part of each verify step.

### Database-aware optimization

Use a PostgreSQL MCP server to iterate on real query performance:

```
/autoresearch
Goal: Reduce average query time for dashboard queries
Scope: src/queries/**/*.sql, src/api/dashboard/**/*.ts
Metric: avg query time in ms (lower is better)
Verify: psql -c "SELECT avg(duration_ms) FROM query_log WHERE created_at > now() - interval '5 min'" | grep -oP '\d+\.\d+'
Guard: npm test
```

Or via MCP directly:

```
/autoresearch
Goal: Optimize slow dashboard queries — reduce p95 query time
Scope: queries/dashboard/*.sql
Metric: avg query time in ms (lower is better)
Verify: Use MCP postgres tool to run EXPLAIN ANALYZE on each query, sum total costs
```

### Analytics-driven content optimization

```
/autoresearch
Goal: Improve blog post structure based on engagement metrics
Scope: content/blog/*.md
Metric: avg time on page for modified posts (higher is better)
Verify: Use MCP analytics tool to fetch page metrics, compare against baseline
```

### API endpoint verification

```
/autoresearch
Goal: All API endpoints return valid JSON with correct status codes in <200ms
Scope: src/api/**/*.ts
Metric: endpoints passing all checks (higher is better)
Verify: Use MCP HTTP tool to hit each endpoint, validate response schema + timing
```

### Recommended MCP servers

| MCP Server | Use Case | Metric Source |
|---|---|---|
| **PostgreSQL** | Query optimization, data validation | Query execution time, row counts |
| **GitHub** | Issue triage, PR quality, CI status | Issue counts, check pass rates |
| **Filesystem** | File organization, cleanup | File counts, directory depth |
| **Puppeteer/Playwright** | Visual regression, performance | Lighthouse scores, screenshot diffs |
| **Slack** | Notification quality, alert tuning | Message delivery, response times |
| **Stripe** | Payment flow optimization | Checkout completion rates |
| **Sentry** | Error reduction | Error count, crash-free rate |
| **Cloudflare** | Edge performance | Cache hit rate, TTFB |

---

## Combining with APIs

Beyond MCP, Claude calls APIs directly via scripts in the verify step.

### GitHub API integration (using gh CLI)

```bash
# scripts/gh-check-rate.sh — check CI pass rate for recent PRs
gh pr list --state merged --limit 20 --json statusCheckRollup \
  | jq '[.[] | .statusCheckRollup[] | select(.conclusion=="SUCCESS")] | length'
```

```
/autoresearch
Goal: Improve CI pass rate for new PRs
Verify: bash scripts/gh-check-rate.sh
Guard: npm test
```

### REST API verification

```javascript
// scripts/lighthouse-score.js
const { exec } = require('child_process');
exec('npx lighthouse http://localhost:3000 --output json --quiet', (err, stdout) => {
  const report = JSON.parse(stdout);
  const perf = report.categories.performance.score * 100;
  console.log(`SCORE: ${perf}`);
  process.exit(perf > 0 ? 0 : 1);
});
```

```
/autoresearch
Goal: Lighthouse performance score above 95
Scope: src/components/**/*.tsx, src/app/**/*.tsx
Metric: Lighthouse performance score (higher is better)
Verify: node scripts/lighthouse-score.js
```

### GraphQL query optimization

```javascript
// scripts/gql-response-time.js
const { execSync } = require('child_process');

const start = Date.now();
const result = execSync(`curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products(first:20) { id name price } }"}'`);
const duration = Date.now() - start;

const data = JSON.parse(result.toString());
const hasErrors = data.errors && data.errors.length > 0;

console.log(`response_ms: ${duration}`);
process.exit(hasErrors ? 1 : 0);
```

---

## Claude Code Patterns

### Using with other Claude Code skills

Autoresearch runs inside your Claude Code session — it has access to all skills, MCP tools, and file context. Common combinations:

- Run `/autoresearch:plan` first to validate your verify command before committing to a long loop
- Chain commands: `debug → fix → ship`, `plan → loop → security → ship`
- Use `/autoresearch:security --diff` after implementing new auth flows

### Pattern catalog

| Pattern | When to use | Config hint |
|---------|-------------|-------------|
| Run Overnight | Large goal, no time pressure | No `Iterations:` limit |
| Controlled Sprint | 30-min focused session | `Iterations: 10-15` |
| Compound Improvements | Many small wins compound | Start easiest first |
| Explore and Exploit | Stuck, need bold experiments | Prompt Claude to try radical approaches |
| Refactor Without Breaking | Safe LOC reduction | Pair metric with Guard |
| Progressive Hardening | Multi-phase quality gates | Chain goals in prompt |

### Workspace configuration

Autoresearch reads your Claude Code settings automatically. No additional configuration file is required.

**Global installation** (available in every project):

```bash
# Install once via Claude Code skill system
# See INSTALLATION.md in the autoresearch skill directory
```

**Project-level** — add `/autoresearch` to `.claude/` in your repo so the team shares consistent commands without individual installation.

---

## CI/CD Integration

### GitHub Actions: security gate

Blocks PRs if critical findings exist; runs a deeper weekly scheduled audit:

```yaml
# .github/workflows/autoresearch-security.yml
name: Security Gate
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 2am
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Security audit
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            claude -p "/autoresearch:security --diff --fail-on critical --iterations 5"
          else
            claude -p "/autoresearch:security --fail-on high --iterations 15"
          fi
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: security/
```

### GitHub Actions: auto-fix workflow

Manual trigger with configurable iteration count:

```yaml
# .github/workflows/autoresearch-fix.yml
name: Auto-Fix
on:
  workflow_dispatch:
    inputs:
      iterations:
        description: 'Number of fix iterations'
        default: '20'
jobs:
  fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Auto-fix
        run: |
          claude "/autoresearch:fix Iterations: ${{ inputs.iterations }}"
```

### GitHub Actions: scheduled overnight run

```yaml
# .github/workflows/autoresearch-nightly.yml
name: Nightly Optimization
on:
  schedule:
    - cron: '0 1 * * *'  # 1am daily
jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run overnight loop
        run: |
          claude -p "/autoresearch
          Goal: Reduce lint errors and improve coverage
          Iterations: 50
          Guard: npm test"
      - name: Commit improvements
        run: |
          git config user.name "autoresearch-bot"
          git config user.email "bot@example.com"
          git push origin main
```

### GitLab CI example

```yaml
# .gitlab-ci.yml
autoresearch-security:
  stage: test
  only:
    - merge_requests
  script:
    - claude -p "/autoresearch:security --diff --fail-on critical --iterations 5"
  artifacts:
    paths:
      - security/
```

### Pre-commit hook example

```bash
#!/bin/bash
# .git/hooks/pre-commit
# Quick security scan on staged files only
staged=$(git diff --cached --name-only | tr '\n' ' ')
if [ -n "$staged" ]; then
  claude -p "/autoresearch:security --diff --fail-on critical --iterations 3 --scope $staged"
fi
```

### CI/CD integration

Run autoresearch in automated pipelines for nightly optimization:

```yaml
# .github/workflows/autoresearch.yml
name: Nightly Autoresearch
on:
  schedule:
    - cron: '0 2 * * *'  # 2am UTC daily
  workflow_dispatch:
    inputs:
      iterations:
        description: 'Number of iterations'
        default: '10'

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci

      - name: Run autoresearch
        run: |
          claude --print "/autoresearch
          Goal: Improve test coverage
          Scope: src/**/*.ts
          Verify: npx jest --coverage 2>&1 | grep 'All files' | awk '{print \$4}'
          Iterations: ${{ github.event.inputs.iterations || '10' }}"

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: autoresearch-results
          path: autoresearch-results.tsv

      - name: Create PR with improvements
        if: success()
        run: |
          git diff --quiet || (
            git checkout -b autoresearch/nightly-$(date +%Y%m%d)
            git add -A && git commit -m "feat: autoresearch nightly improvements"
            gh pr create --title "Autoresearch nightly improvements" --body "Automated optimization run"
          )
```

**GitLab CI equivalent:**
```yaml
autoresearch:
  stage: optimize
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
  script:
    - claude --print "/autoresearch Iterations: 10 Goal: Improve coverage Verify: pytest --cov"
  artifacts:
    paths:
      - autoresearch-results.tsv
```

---

## Results Tracking Deep Dive

### Verification command templates by language

| Language | Verify Command | Metric | Direction |
|----------|---------------|--------|-----------|
| **Node.js** | `npx jest --coverage 2>&1 \| grep 'All files' \| awk '{print $4}'` | Coverage % | higher |
| **Python** | `pytest --cov=src --cov-report=term 2>&1 \| grep TOTAL \| awk '{print $4}'` | Coverage % | higher |
| **Rust** | `cargo test 2>&1 \| grep -oP '\d+ passed' \| grep -oP '\d+'` | Tests passed | higher |
| **Go** | `go test -count=1 ./... 2>&1 \| grep -c '^ok'` | Packages OK | higher |
| **Java** | `mvn test 2>&1 \| grep 'Tests run:' \| tail -1 \| grep -oP 'Failures: \d+' \| grep -oP '\d+'` | Failures | lower |
| **Ruby** | `bundle exec rspec 2>&1 \| tail -1 \| grep -oP '\d+ examples'` | Examples | higher |
| **Bundle size** | `npx esbuild src/index.ts --bundle --minify \| wc -c` | Bytes | lower |
| **Lighthouse** | `npx lighthouse http://localhost:3000 --output=json \| jq '.categories.performance.score * 100'` | Score | higher |
| **API latency** | `wrk -t2 -c10 -d10s http://localhost:3000/api 2>&1 \| grep 'Avg Lat' \| awk '{print $2}'` | ms | lower |

Each command outputs a single number. Claude parses this to make keep/discard decisions.

### TSV format specification

Every iteration is appended to the results log in tab-separated format:

```tsv
iteration  commit   metric  delta   guard  status    description
0          a1b2c3d  85.2    0.0     -      baseline  initial state
1          b2c3d4e  87.1    +1.9    pass   keep      add auth edge case tests
2          -        86.5    -0.6    -      discard   refactor helpers (broke 2 tests)
3          c3d4e5f  88.3    +1.2    pass   keep      add error handling tests
```

| Column | Values | Meaning |
|--------|--------|---------|
| `iteration` | integer | Loop counter starting at 0 (baseline) |
| `commit` | short SHA or `-` | Git commit if kept; `-` if discarded |
| `metric` | float | Raw metric value from verify command |
| `delta` | signed float | Change from previous kept iteration |
| `guard` | `pass`, `fail`, `-` | Guard result; `-` if no guard set |
| `status` | `baseline`, `keep`, `discard`, `rework` | Outcome of this iteration |
| `description` | string | One-line summary of what changed |

### How to read results logs

Claude reads the full log at the start of each iteration. It uses the history to avoid repeating failed approaches and to combine successful patterns.

### Progress summaries

Every 10 iterations, Claude prints an inline summary:

```
=== Progress (iteration 20) ===
Baseline: 72.0% → Current: 84.1% (+12.1%)
Keeps: 8 | Discards: 11 | Crashes: 1
Best so far: +3.2% (iteration 14 — add payment edge case tests)
```

### Bounded loop final summary

```
=== Autoresearch Complete (25/25 iterations) ===
Baseline: 72.0% → Final: 89.3% (+17.3%)
Keeps: 12 | Discards: 11 | Crashes: 2
Best iteration: #18 — add tests for payment processing edge cases
```

---

## Performance Tips

### Fast verify commands = more experiments

Every second saved in verification is an extra experiment per minute. Optimize the verify command before launching a long run.

| Slow | Fast |
|------|------|
| Full E2E suite (minutes) | Unit tests only (seconds) |
| Build entire project | Build only changed module |
| Run all coverage | `--testPathPattern` target dir |
| Lighthouse real browser | Lighthouse `--preset desktop` |

### Scope narrowing for focused runs

Narrow scope = faster context load = bolder experiments. Claude reads all in-scope files each iteration — keep scope tight.

```
# Too broad
Scope: src/**/*.ts

# Better for targeted work
Scope: src/api/payments/**/*.ts
```

### When to use bounded vs unbounded

| Scenario | Mode | Iterations |
|----------|------|-----------|
| Overnight deep optimization | Unbounded | unlimited |
| CI/CD gating | Bounded | 5-10 |
| Targeted bug fix | Bounded | 5 |
| Moderate improvement sprint | Bounded | 15-25 |
| Exploratory | Bounded | 15 |
| Deep ML training optimization | Bounded | 50+ |

### Optimal iteration counts by task type

- **Syntax/type errors** — 5-10; usually resolved quickly
- **Test coverage** — 15-25; incremental additions compound
- **Performance/Lighthouse** — 20-50; requires exploration
- **Refactoring** — 15-30; conservative changes add up
- **Content quality** — 10-20; diminishing returns after goal

---

## Core Principles

7 principles extracted from [Karpathy's autoresearch](https://github.com/karpathy/autoresearch), generalized to any domain.

### 1. Constraint = Enabler

Autonomy succeeds through intentional constraint, not despite it. A narrow scope that fits agent context, a fixed iteration budget, and a single mechanical success criterion are what make unsupervised improvement possible.

| Autoresearch | Generalized |
|---|---|
| 630-line training codebase | Bounded scope that fits agent context |
| 5-minute time budget per iteration | Fixed iteration cost |
| One metric (val_bpb) | Single mechanical success criterion |

### 2. Strategy != Tactics

Humans set direction (what to improve). Agents execute iterations (how to improve it). Mixing the two — asking Claude to also choose the goal — produces unfocused loops.

| Strategic (Human) | Tactical (Agent) |
|---|---|
| "Improve page load speed" | "Lazy-load images, code-split routes" |
| "Increase test coverage" | "Add tests for uncovered edge cases" |
| "Reduce API errors" | "Add retry logic, improve validation" |

### 3. Mechanical Metrics Only

The loop breaks if the metric requires judgment. Claude cannot act on "looks cleaner" — it needs a number.

Good: `npm test -- --coverage | grep "All files"` outputs `87.3%`

Bad: "Looks better", "probably improved" — kills the feedback loop.

### 4. Fast Verification

Verification speed determines experiment throughput. A 30-second verify command gives 2 experiments per minute. A 5-second command gives 12.

| Fast (enables iteration) | Slow (kills iteration) |
|---|---|
| Unit tests (seconds) | Full E2E suite (minutes) |
| Type check (seconds) | Manual QA (hours) |
| Lint check (instant) | Code review (async) |

### 5. Iteration Cost Shapes Behavior

Cheap iteration encourages bold exploration and many experiments. Expensive iteration forces Claude to be conservative. Optimize verify speed to unlock better results.

### 6. Git as Memory

Every successful change is committed before verification. Failures are reverted. The git log becomes Claude's research journal — enabling causality tracking, stacking wins, and pattern learning across iterations.

### 7. Honest Limitations

If the agent hits a wall — missing permissions, an external dependency, or a decision requiring human judgment — it says so clearly instead of guessing or silently degrading. Trust the discard mechanism.

---

### Working with noisy metrics

Some metrics fluctuate between runs (benchmark times, Lighthouse scores, ML loss). Configure noise handling:

```
/autoresearch
Goal: Reduce API response time below 100ms
Verify: wrk -t2 -c10 -d10s http://localhost:3000/api 2>&1 | grep 'Avg Lat' | awk '{print $2}'
Noise: high          # run verify 3 times, use median
Min-Delta: 5.0       # only keep if improvement > 5ms
Noise-Runs: 5        # use 5 runs instead of default 3
```

| Metric Type | Noise Level | Recommended Config |
|-------------|-------------|-------------------|
| Test coverage | None | No config needed |
| Bundle size | None | No config needed |
| Benchmark time | Medium | `Noise: high` |
| Lighthouse score | Medium | `Noise: high` + `Noise-Runs: 5` |
| ML training loss | High | `Noise: high` + `Min-Delta: 0.01` + environment pinning |
| API latency | High | `Noise: high` + `Min-Delta: 5.0` + warm-up |

For detailed noise handling strategies (multi-run, confirmation runs, environment pinning), see the [autonomous loop protocol](../skills/autoresearch/references/autonomous-loop-protocol.md#phase-51-noise-handling).

---

## FAQ

**Q: I don't know what metric to use.**
A: Run `/autoresearch:plan` — it analyzes your codebase, suggests metrics, and dry-runs the verify command before you launch.

**Q: Does this work with any project?**
A: Yes. Any language, framework, or domain. If you can measure it with a command, autoresearch can optimize it.

**Q: How do I stop the loop?**
A: `Ctrl+C` or add `Iterations: N` for bounded runs. Claude commits before verifying, so your last successful state is always in git.

**Q: Can I use this for non-code tasks?**
A: Absolutely. Sales emails, marketing copy, HR policies, research papers — anything with a measurable metric works.

**Q: Does /autoresearch:security modify my code?**
A: No. It's read-only by default. Use `--fix` to opt into auto-remediation of confirmed Critical/High findings.

**Q: Can I chain commands?**
A: Yes. Run `debug → fix → ship`, or `plan → loop → ship`, or `scenario → debug → fix`. Each command's output feeds the next.

**Q: What's the difference between Metric and Guard?**
A: Metric = "did we improve?" (the goal). Guard = "did we break anything?" (safety net). If metric improves but guard fails, Claude reworks the change.

**Q: Can I use MCP servers during the loop?**
A: Yes. Any MCP server configured in Claude Code is available — databases, analytics, APIs, etc.

**Q: How many iterations should I run?**
A: 5-10 for targeted fixes. 15-25 for moderate improvements. 50+ for deep optimization. Unlimited for overnight runs.

**Q: Does it work in CI/CD?**
A: Yes. Use `--fail-on` (security command) or bounded iterations with `Iterations: N`. See [CI/CD Integration](#cicd-integration).

**Q: What if Claude makes things worse?**
A: Every change is committed before verification. If worse, it's instantly `git revert`ed. Your codebase is always in a known-good state.

**Q: Can I run it overnight?**
A: Yes — that's the intended use for unbounded mode. Run `/autoresearch` without `Iterations:`, walk away, review results in the morning.

**Q: What languages are supported?**
A: All of them. The loop is language-agnostic. The verify command adapts to your tooling (npm, pytest, cargo, go test, etc.).

**Q: How do I roll back if I don't like the results?**
A: Every kept iteration is a git commit. Use `git log` to review, `git revert` or `git reset` to undo specific iterations. The TSV log tells you which commit corresponds to which result.

**Q: Can I predict token/cost usage before a long run?**
A: Use `/autoresearch:predict --budget 1.00` to get an estimate of findings and cost before committing to a full loop.

**Q: What is adversarial mode?**
A: `/autoresearch:security` uses red-team personas (security adversary, supply chain attacker, insider threat) to stress-test your codebase from an attacker's perspective rather than a reviewer's.

**Q: What's a good budget for a first run?**
A: Start with `Iterations: 10` to calibrate. Review the TSV log. If results look promising, remove the limit or increase to 25-50.

### Can I use `learn` with monorepos?

Yes. The scouting phase detects workspace configs (`package.json` workspaces, `lerna.json`, `pnpm-workspace.yaml`, `Cargo.toml [workspace]`) and notes the structure in the generation context. Use `--scope packages/api/**` to focus on a specific package.

### What's the validation-fix loop?

After generating docs, Claude runs `validate-docs.cjs` (if it exists) to check code references, internal links, and config keys. If any fail, it re-spawns the docs-manager with specific issues to fix — up to 3 retries. This prevents hallucinated code references that plague one-shot doc generators.

---

## Crash Recovery

| Failure Type | Automatic Response |
|---|---|
| Syntax error | Fix immediately — does not count as an iteration |
| Runtime error | Attempt fix (max 3 tries), then move on |
| Resource exhaustion | Revert, try a smaller variant of the same idea |
| Infinite loop / hang | Kill after timeout, revert, log as discard |
| External dependency failure | Skip, log reason, try a different approach |

---

## Troubleshooting

### Common issues

| Problem | Cause | Fix |
|---------|-------|-----|
| "Verify command failed" | Command doesn't work on current codebase | Run it manually first; use `/autoresearch:plan` to validate |
| Metric doesn't improve | Scope too narrow or already near optimal | Expand scope, lower the goal, or try a different approach |
| Guard keeps failing | Changes break existing behavior | Narrow scope further, or add the broken tests to scope |
| Loop seems slow | Verify command takes too long | Optimize verify: use `--quick-eval`, reduce test scope, split suite |
| Wrong metric extracted | Verify output format changed | Check output manually, adjust grep/jq pattern |
| Crashes on first iteration | Missing dependency or bad path | Run verify command in terminal first to confirm it works |

### When stuck — 5+ consecutive discards

If Claude accumulates 5 or more consecutive discards, it automatically escalates strategy:

1. Re-reads ALL in-scope files from scratch
2. Re-reads the original goal statement
3. Reviews the entire results log for patterns across all iterations
4. Tries combining 2-3 successful changes from earlier iterations
5. Tries the OPPOSITE approach of what hasn't worked
6. Tries a radical architectural change (different algorithm, data structure, or abstraction)

If still stuck after escalation, expand scope or adjust the goal — you may have reached a local optimum that requires structural changes outside the current scope boundary.
