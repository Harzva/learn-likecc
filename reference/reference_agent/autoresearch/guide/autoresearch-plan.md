# /autoresearch:plan — The Setup Wizard

Converts a plain-language goal into a validated, ready-to-execute autoresearch configuration.

---

## The Problem It Solves

Running `/autoresearch` directly requires three inputs: **Scope**, **Metric**, and **Verify**. Getting these wrong wastes entire runs:

- **Scope too wide** — fixes wrong files, slow iteration
- **Metric not mechanical** — Claude can't measure progress, loop stalls
- **Verify command broken** — every iteration fails, nothing lands
- **Direction wrong** — higher/lower confusion means the loop optimizes backward

The hardest part isn't the loop itself — it's defining Scope, Metric, and Verify correctly. The plan wizard eliminates this cold-start friction by scanning your codebase, suggesting sensible defaults, and dry-running the verify command before you commit to a long run.

---

## How It Works — 7-Step Wizard Process

```
Step 1  Capture goal       Plain-language input ("Make the API faster")
Step 2  Scan codebase      Detect tooling: test runners, build tools, linters
Step 3  Suggest scope      File globs → validate at least 1 file resolves
Step 4  Suggest metric     Mechanical metric → validate it outputs a number
Step 5  Determine direction Higher or lower is better?
Step 6  Dry-run verify     Run the verify command on your current codebase
Step 7  Present config     Ready-to-paste /autoresearch block
```

The wizard asks clarifying questions only when necessary. For well-known tooling (Jest, pytest, cargo, tsc), it proposes defaults without prompting.

---

## Critical Gates

The wizard will not proceed unless all three gates pass:

| Gate | Requirement | Why It Matters |
|------|-------------|----------------|
| **Metric** | Must output a parseable number | Loop needs a numeric baseline and delta each iteration |
| **Verify** | Must exit 0 on dry run | A broken verify command means every fix attempt looks like a failure |
| **Scope** | Must resolve to at least 1 file | Empty scope = nothing to change |

If any gate fails, the wizard explains why and suggests a corrected command.

---

## Usage

```
# Interactive — Claude asks for your goal
/autoresearch:plan

# Inline goal
/autoresearch:plan Increase test coverage to 95%

# Inline goal, longer
/autoresearch:plan Make the API respond faster

# Specific target
/autoresearch:plan Reduce bundle size below 200KB
```

---

## Examples

### 1. Basic goal — test coverage

```
> /autoresearch:plan Increase test coverage to 95%

[Context]  Detected: Jest, TypeScript, 84 source files
[Scope]    src/**/*.ts, src/**/*.test.ts (84 + 31 files)
[Metric]   Coverage % from Jest (higher is better)
[Verify]   npx jest --coverage --silent 2>&1 | grep "All files" | awk '{print $4}'
[Dry run]  ✓ Exit 0 — Baseline: 72.3%

Ready-to-use:

  /autoresearch
  Goal: Increase test coverage to 95%
  Scope: src/**/*.ts, src/**/*.test.ts
  Metric: coverage % (higher is better)
  Verify: npx jest --coverage --silent 2>&1 | grep "All files" | awk '{print $4}'

Launch now? → [Unlimited] [Bounded] [Copy only]
```

### 2. Performance goal — API latency

```
> /autoresearch:plan Make the API respond faster

[Context]  Detected: Node.js, Express, custom bench script
[Scope]    src/api/**/*.ts, src/services/**/*.ts (23 files)
[Metric]   p95 response time in ms (lower is better)
[Verify]   npm run bench:api | grep "p95"
[Dry run]  ✓ Exit 0 — Baseline: 187ms
```

### 3. Coverage goal — Python

```
> /autoresearch:plan Improve pytest coverage

[Context]  Detected: pytest, FastAPI, 56 source files
[Scope]    tests/**/*.py, app/**/*.py (56 + 22 files)
[Metric]   Coverage % from pytest (higher is better)
[Verify]   pytest --cov=app 2>&1 | grep "TOTAL" | awk '{print $4}'
[Dry run]  ✓ Exit 0 — Baseline: 68%
```

### 4. Bundle size goal

```
> /autoresearch:plan Reduce bundle size below 200KB

[Scope]    src/**/*.tsx, src/**/*.ts (127 files)
[Metric]   Bundle size in KB (lower is better)
[Verify]   npm run build 2>&1 | grep "First Load JS" | awk '{print $4}'
[Dry run]  ✓ Exit 0 — Baseline: 287KB

Ready-to-use:

  /autoresearch
  Goal: Reduce bundle size below 200KB
  Scope: src/**/*.tsx, src/**/*.ts
  Metric: bundle size in KB (lower is better)
  Verify: npm run build 2>&1 | grep "First Load JS" | awk '{print $4}'
```

### 5. Content quality goal — blog SEO

```
> /autoresearch:plan Improve blog SEO scores

[Context]  Detected: Markdown blog posts, custom scoring script
[Scope]    content/blog/*.md (12 files)
[Metric]   Average SEO score across posts (higher is better)
[Verify]   node scripts/seo-score.js content/blog/ | grep "average" | awk '{print $2}'
[Dry run]  ✓ Exit 0 — Baseline: 64
```

### 6. Security posture goal

```
> /autoresearch:plan Eliminate all any types (TypeScript security hygiene)

[Context]  Detected: TypeScript 5.x, 147 source files
[Scope]    src/**/*.ts, src/**/*.tsx (147 files)
[Metric]   Count of `any` type annotations (lower is better)
[Verify]   grep -r ":\s*any" src/ --include="*.ts" --include="*.tsx" | wc -l | tr -d ' '
[Dry run]  ✓ Exit 0 — Baseline: 34
```

### 7. Multi-language project

```
> /autoresearch:plan Reduce Docker image size

[Context]  Detected: Dockerfile, .dockerignore, Node.js app
[Scope]    Dockerfile, .dockerignore (2 files)
[Metric]   Image size in MB (lower is better)
[Verify]   docker build -t bench . -q 2>&1 && docker images bench --format "{{.Size}}" | sed 's/MB//'
[Dry run]  ✓ Exit 0 — Baseline: 487
```

### 8. Complex metric — Lighthouse performance

```
> /autoresearch:plan Improve page load speed

[Context]  Detected: Next.js, React, Tailwind, 23 components
[Scope]    src/app/**/*.tsx, src/components/**/*.tsx (41 files)
[Metric]   Lighthouse performance score 0-100 (higher is better)
[Verify]   npx lighthouse http://localhost:3000 --output json --quiet | jq '.categories.performance.score * 100'
[Dry run]  ✓ Exit 0 — Baseline: 68
```

---

## What the Wizard Output Looks Like

After all gates pass, the wizard presents a ready-to-paste config block:

```
=== Autoresearch Config ===

  /autoresearch
  Goal: Reduce bundle size below 200KB
  Scope: src/**/*.tsx, src/**/*.ts
  Metric: bundle size in KB (lower is better)
  Verify: npm run build 2>&1 | grep "First Load JS" | awk '{print $4}'
  Guard: npm test

Baseline: 287KB
Direction: lower is better
Dry run: ✓ passed

Launch now? → [Unlimited] [Bounded: 20 iterations] [Copy only]
```

Selecting **Unlimited** starts the loop immediately. **Bounded** prompts for iteration count. **Copy only** puts the block in your clipboard.

---

## Chain Patterns

### plan → loop

```bash
# Step 1: Figure out the right config
/autoresearch:plan
Goal: Reduce API response times

# Step 2: Run the loop with the wizard's output
/autoresearch
Iterations: 50
Goal: Reduce p95 API response time to under 100ms
Scope: src/api/**/*.ts
Metric: p95 latency in ms (lower is better)
Verify: npm run bench:api | grep "p95"
Guard: npm test
```

### plan → loop → ship

```bash
# Step 1: Validate config
/autoresearch:plan
Goal: Reduce bundle size below 200KB

# Step 2: Run until target is hit
/autoresearch
Iterations: 30
Goal: Reduce bundle size below 200KB
Scope: src/**/*.tsx, src/**/*.ts
Metric: bundle size in KB (lower is better)
Verify: npm run build 2>&1 | grep "First Load JS" | awk '{print $4}'

# Step 3: Ship the result
/autoresearch:ship --type code-pr --auto
```

---

## Tips

### When the plan wizard is overkill

| Situation | Recommendation |
|-----------|----------------|
| Know exactly what metric/verify to use | `/autoresearch` directly — skip wizard |
| Familiar with autoresearch format | Copy a past config, adjust |
| Simple one-file scope, obvious metric | Direct invocation is faster |

### When the plan wizard is essential

| Situation | Recommendation |
|-----------|----------------|
| First time using autoresearch | Use wizard — learn the format |
| Unsure what metric to use | Wizard suggests options for your stack |
| Want to validate before an overnight run | Wizard dry-runs before you commit |
| New codebase, unknown tooling | Wizard scans and proposes toolchain-aware defaults |
| Running unbounded — high confidence needed | Wizard eliminates config mistakes before 50+ iterations |

---

## FAQ

**Q: What if my verify command outputs more than just a number?**
The wizard will help you pipe through `grep`, `awk`, or `jq` to extract the number. The output must be a single parseable float or integer.

**Q: What if the dry run fails?**
The wizard explains the failure and suggests a corrected command. Common causes: command not installed, server not running, output format changed.

**Q: Can I add a Guard after the wizard completes?**
Yes. The wizard proposes a Guard based on detected tests. You can accept, change, or omit it.

**Q: What if my scope resolves to 0 files?**
The wizard rejects it and asks you to broaden the glob or check the path. A zero-file scope means no changes can land.

**Q: Can I re-run the wizard to adjust a config?**
Yes. Run `/autoresearch:plan` again at any time. Each run is independent.

**Q: Does the wizard commit anything?**
No. The wizard is read-only — it scans and validates. Nothing is changed until you launch the loop.
