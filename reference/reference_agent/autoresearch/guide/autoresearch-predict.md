# /autoresearch:predict — Multi-Persona Swarm Prediction

> **v1.7.0** — The flagship deliberation layer for autoresearch. Simulate 3–8 expert personas who independently analyze, debate, and reach consensus before a single iteration runs.

---

## The Problem

Every other autoresearch command starts with a single perspective. Claude reads the code, forms one hypothesis, and begins testing it. If that first instinct is wrong — and for hard problems, it usually is — you spend the next 5–15 iterations chasing dead ends before stumbling onto the real cause.

This is not a Claude limitation. It is a fundamental problem with single-perspective serial analysis:

- **Cognitive anchoring** — the first plausible hypothesis crowds out better alternatives
- **Domain blindness** — a debugging lens misses security implications; a security lens misses performance degradation
- **No adversarial pressure** — no one challenges the lead hypothesis until the loop proves it wrong, expensively
- **Cascade blindness** — root causes that fan out into 20 downstream symptoms look like 20 independent problems

The first hypothesis is usually wrong. The cost of discovering that is paid in wasted iterations.

---

## The Solution

`/autoresearch:predict` simulates 3–8 expert personas who independently analyze your code, debate their findings, and reach a consensus — all before a single iteration runs.

Think of it as a 2-minute team standup with 5 specialists before anyone touches the code. The Architecture Reviewer flags coupling issues. The Security Analyst spots the auth gap. The Performance Engineer traces the N+1 query. The Reliability Engineer asks what happens when the network drops. The Devil's Advocate challenges all of them.

In 2 minutes of deliberation you get what normally takes 8–12 iterations of trial and error.

---

## Why It Exists

Karpathy's autoresearch is brilliant but single-minded. One agent, one perspective, serial exploration. For hard problems — intermittent bugs, security vulnerabilities, cascade failures — the first hypothesis is usually wrong.

Predict adds a **deliberation layer before the loop**. Instead of one agent guessing serially, multiple personas with different expertise debate the problem first. The results:

| Metric | Impact |
|--------|--------|
| Iterations to root cause | **3–5x fewer** |
| Precision finding real issues | **37% higher** |
| Wasted iterations on wrong leads | **60–80% fewer** |

The predict phase costs roughly 15–30% more tokens but saves 60–80% of wasted iterations downstream. The net efficiency gain grows with problem complexity — the harder the problem, the larger the payoff.

---

## How It Works

Predict runs an 8-phase workflow, producing a structured output folder with knowledge files, debate transcripts, ranked findings, and a machine-readable handoff for downstream chaining.

```
Phase 1: Setup          — Parse scope, goal, depth; validate config
Phase 2: Reconnaissance — Read code, build shared knowledge files
Phase 3: Persona Gen    — Create expert personas with role + bias
Phase 4: Independent    — Each persona analyzes alone, no cross-talk
Phase 5: Debate         — 1-3 rounds of structured cross-examination
Phase 6: Consensus      — Voting + anti-herd detection + scoring
Phase 7: Report         — Generate findings, hypothesis queue, overview
Phase 8: Handoff        — Write handoff.json, trigger --chain if set
```

### Phase 1: Setup

Parses flags and inline config. Resolves scope globs to actual file lists — if no files match, stops and asks. Maps `--depth` preset to persona count and round count. Validates `--chain` targets. If invoked without scope, goal, and depth all provided, triggers interactive setup questions via `AskUserQuestion` before proceeding.

### Phase 2: Reconnaissance

Claude reads all in-scope source files and writes three structured knowledge files. These files act as the shared context for all personas — preventing redundant re-reading and ensuring every persona analyzes from identical facts.

**Knowledge files built:**
- `codebase-analysis.md` — functions, classes, routes, models with file:line references
- `dependency-map.md` — import graph, call graph, and data flows with risk annotations
- `component-clusters.md` — logical module groupings with external dependencies and risk areas

Each file is stamped with the current `git rev-parse HEAD` hash. At report generation, if the HEAD has moved, a staleness warning is appended automatically.

**Incremental mode:** If knowledge files already exist from a prior run, predict diffs against the cached hash (`git diff --name-only`), re-analyzes only changed files, and updates affected rows. Subsequent runs on large codebases are dramatically faster.

### Phase 3: Persona Generation

Creates N persona prompts using a structured template that encodes each persona's role, expertise, and bias direction. Each persona receives:
- Their unique system prompt with explicit bias constraints
- All three knowledge files as shared context
- The full list of in-scope source files
- The user-provided goal

Personas do NOT see each other's outputs at this phase. Each operates as if it is the only analyst.

### Phase 4: Independent Analysis

Each persona produces a structured XML findings block. Finding limit per persona: `ceil(total_budget / persona_count)` (default: 8 findings per persona). Every finding must include a `file:line` reference, a severity (CRITICAL/HIGH/MEDIUM/LOW), a confidence level (HIGH/MEDIUM/LOW), exact evidence from the code, and a concrete recommendation.

### Phase 5: Debate

All Phase 4 outputs are now shared across all personas. Each persona reviews its peers' findings, issues challenges with counter-evidence, and revises its own findings where new evidence compels it. The debate runs 1–3 rounds based on `--depth`.

The Devil's Advocate operates under strict constraints: must challenge ≥50% of majority positions, must propose at least one non-code hypothesis per round (infrastructure, config, operator error), and must question the finding with the highest consensus confidence score. The DA may "concede with conditions" if evidence is overwhelming — but never simply agrees.

### Phase 6: Consensus

A Synthesizer pass aggregates all post-debate findings. Each unique finding (deduplicated by location + title similarity) receives votes from all personas: `confirm`, `dispute`, or `abstain`. Consensus thresholds:

| Votes Confirming | Label |
|-----------------|-------|
| ≥3 of 5 personas | Confirmed |
| 2 of 5 personas | Probable |
| 1 of 5 personas | Minority |
| 0 of 5 personas | Discarded |

Each confirmed finding receives a composite priority score:

```
priority_score = severity_weight * 0.4
               + confidence_boost * 0.2
               + consensus_ratio  * 0.4

severity_weight  = CRITICAL:4, HIGH:3, MEDIUM:2, LOW:1
confidence_boost = HIGH:1.0, MEDIUM:0.6, LOW:0.3
consensus_ratio  = personas_confirmed / personas_total
```

Findings are sorted descending by `priority_score` in the final report.

### Phase 7: Report

Generates all output files in `predict/{YYMMDD}-{HHMM}-{slug}/`. See the Output Structure section for the full directory listing.

### Phase 8: Handoff

Writes `handoff.json` — a machine-readable schema consumed by downstream chain tools. If `--chain` is set, immediately invokes the next tool with findings pre-loaded. Zero context loss between stages.

---

## The 5 Default Personas

| # | Persona | Focus | Bias |
|---|---------|-------|------|
| 1 | Architecture Reviewer | Scalability, coupling, design patterns, tech debt, module boundaries | Conservative — prefers separation of concerns; skeptical of god objects |
| 2 | Security Analyst | OWASP Top 10, injection, auth failures, data exposure, crypto misuse | Paranoid — assumes hostile inputs; trusts nothing from outside the trust boundary |
| 3 | Performance Engineer | Algorithmic complexity, N+1 queries, memory allocation, blocking I/O | Practical — prefers measurable evidence; skeptical of premature optimization claims |
| 4 | Reliability Engineer | Error handling, retry logic, race conditions, edge cases, observability | Pessimistic — assumes failure; asks "what happens when X is nil or the network drops?" |
| 5 | Devil's Advocate | Challenges consensus, surfaces blind spots, proposes non-code hypotheses | Contrarian — MUST challenge ≥50% of majority positions; MUST question infrastructure and config |

**What each persona looks for in detail:**

**Architecture Reviewer** traces import graphs for circular dependencies, checks for god classes, flags missing abstraction layers, identifies tight coupling between unrelated modules, spots missing interfaces that prevent testability, and reviews module boundary violations. Looks at `component-clusters.md` first to understand logical groupings before diving into source.

**Security Analyst** walks OWASP Top 10 systematically: injection points (SQL, NoSQL, command), broken authentication (JWT handling, session management, password storage), sensitive data exposure (PII in logs, unencrypted fields), broken access control (IDOR, privilege escalation), and security misconfigurations (missing headers, permissive CORS). Prioritizes data flows from `dependency-map.md` showing unvalidated input paths.

**Performance Engineer** identifies algorithmic complexity (O(n²) nested loops, unbounded growth), N+1 query patterns from ORM usage, synchronous blocking in async contexts, memory leaks from uncleaned listeners or growing caches, and missing database indexes from schema analysis. Uses `codebase-analysis.md` call graph to trace hot paths.

**Reliability Engineer** looks for missing error handling in async calls, functions that don't handle null/undefined edge cases, missing retry logic for network calls, race conditions in shared state, observability gaps (errors swallowed without logging), and missing circuit breakers. Focuses on what happens at the boundaries of `component-clusters.md`.

**Devil's Advocate** does not analyze code directly in Phase 4. Instead, it generates 8 alternative hypotheses that do NOT require code changes to be true: infrastructure failures, environment variable misconfigurations, third-party service degradation, operator errors, clock skew, DNS issues, load balancer behavior, and deployment timing artifacts. This persona exists specifically to prevent the swarm from over-indexing on code-only explanations.

---

## File-Based Knowledge Representation

Predict's knowledge graph is built from plain `.md` files. No external databases, vector stores, or graph engines. Claude's native `Read`, `Grep`, and `Glob` tools are the query engine.

This is a deliberate architectural choice:

- **Zero external dependencies** — works in any environment where Claude can read files
- **Human-readable** — engineers can inspect the knowledge files directly
- **Auditable** — every finding traces back to a specific file:line in a knowledge file
- **Incrementally updateable** — git diff tells predict exactly what changed

### codebase-analysis.md

Catalogs every function, class, route, and model in scope with structured columns:

| Column | Example |
|--------|---------|
| File | `src/api/users.ts` |
| Function | `getUser` |
| Signature | `(id: string) => Promise<User>` |
| Lines | `42-61` |
| Calls | `db.findById, logger.info` |
| Called By | `router.get` |

Routes table adds: HTTP method, path, handler name, whether auth is required, and input parameters. Models table adds: table name, fields, indexes, and relations.

### dependency-map.md

Three sub-tables tracking relationships:

**Import Graph** — which file imports what symbols from which other file. Lets the Architecture Reviewer spot circular imports and the Security Analyst trace where user input enters the system.

**Call Graph** — which function calls which other function, at what file:line, and what type of call (route handler, async call, event emitter). Essential for cascade analysis.

**Data Flows** — traces data from source (e.g., `req.params.id`) through transformations (e.g., "no sanitization") to sinks (e.g., `db.findById`) with explicit risk annotations (e.g., "injection, IDOR"). This is the Security Analyst's primary input.

### component-clusters.md

Groups files into logical clusters (Authentication, User API, Background Jobs) with columns for key entities, external dependencies, and identified risk areas. The Reliability Engineer uses this to understand system boundaries and failure domains.

---

## All Flags

| Flag | Purpose | Default | Example |
|------|---------|---------|---------|
| `--scope <glob>` | Files to include in analysis. Supports multiple globs comma-separated | Asks interactively | `--scope "src/api/**/*.ts,src/auth/**"` |
| `--goal <text>` | Focus area for all personas. Inline text also accepted | Asks interactively | `--goal "security vulnerabilities"` |
| `--depth <level>` | Preset controlling persona count and debate rounds | `standard` | `--depth deep` |
| `--personas <N>` | Override persona count (3–8). Overrides depth preset's default | Depth-dependent | `--personas 4` |
| `--rounds <N>` | Override debate rounds (0–3). 0 = independent analysis only, no debate | Depth-dependent | `--rounds 1` |
| `--adversarial` | Swap default persona set for red-team adversarial personas | Off | `--adversarial` |
| `--chain <tools>` | Chain to downstream tool(s) after report. Comma-separated for multi-chain | None | `--chain debug` or `--chain scenario,debug,fix` |
| `--budget <dollars>` | Max LLM cost for the session. Graceful degradation if exceeded | `$1.00` | `--budget 0.50` |
| `--fail-on <severity>` | Exit non-zero if confirmed findings at this severity exist. CI/CD gate | None | `--fail-on critical` |
| `--dry-run` | Show configuration and file count, then stop. Does not analyze | Off | `--dry-run` |
| `--incremental` | Reuse existing knowledge files; re-analyze only files changed since last run | Off | `--incremental` |

**Conflict resolution:** Explicit flag values (`--personas 8`) override depth preset defaults. If both `--depth deep` and `--personas 3` are set, `--personas 3` wins.

---

## Depth Presets

| Preset | Personas | Debate Rounds | Best For | Approx Time |
|--------|----------|---------------|----------|-------------|
| `shallow` | 3 | 1 | Quick sanity check, small PRs, single-module scans | ~1–2 min |
| `standard` | 5 | 2 | Most tasks — recommended default | ~3–5 min |
| `deep` | 8 | 3 | Major refactors, pre-deploy, cross-cutting concerns, security audits | ~8–12 min |

**Shallow** drops Performance Engineer and Reliability Engineer from the default set, keeping Architecture Reviewer, Security Analyst, and Devil's Advocate. Fast sweep for obvious issues. Good before PR reviews.

**Standard** uses all 5 default personas with 2 debate rounds. The second round catches position changes from round 1 — often where the most interesting reversals occur (especially from the Devil's Advocate who may concede after new evidence, or double-down).

**Deep** adds 3 additional custom personas auto-generated from the codebase context — e.g., if the code is a payment system, it might generate "Payment Compliance Auditor". All 8 run 3 full debate rounds, producing the most thorough analysis possible. Token cost is significantly higher. Use for genuinely hard problems.

---

## Anti-Herd Detection

Groupthink is the failure mode where all personas converge on the same wrong answer because the first plausible hypothesis overwhelmed independent thinking. Predict monitors for this with three signals:

| Signal | Formula | Threshold | Meaning |
|--------|---------|-----------|---------|
| `flip_rate` | Findings where persona changed position / total findings | > 0.80 | >80% of personas changed their mind — suspicious |
| `entropy` | Shannon entropy of final position distribution | < 0.30 | Opinion diversity collapsed — suspicious |
| `convergence_speed` | Rounds needed to reach ≥80% agreement | 1 round | Converged immediately — suspicious |

**GROUPTHINK WARNING** is triggered when `flip_rate > 0.8` AND `entropy < 0.3` simultaneously.

When groupthink is detected:

1. All minority findings are preserved in the report — none are discarded
2. `overview.md` is flagged: `⚠️ Anti-herd detection: high convergence detected. Minority findings may be underweighted.`
3. Predict suggests re-running with `--adversarial` for more diverse perspectives

**Concrete example of why this matters:**

Suppose 4 of 5 personas independently conclude the bug is in the database query. The Devil's Advocate initially disagrees (infrastructure), but during round 1, the Security Analyst finds a convincing stack trace and the DA switches to agree with the database theory. After round 1: 5/5 personas agree, flip_rate = 0.80 (the DA changed), entropy collapses.

Groupthink warning fires. The DA's original infrastructure hypothesis is preserved in minority findings. Two hours later, the debug loop proves the database query is fine — it was a misconfigured connection pool timeout at the infrastructure layer. The minority finding saved the investigation.

**Devil's Advocate effectiveness monitoring:** If the DA agrees with the majority >80% of the time across findings, predict flags it as "not doing its job" and warns the user. The DA's value comes from disagreement — a DA that always agrees is just a sixth Architecture Reviewer.

---

## Adversarial Mode

For security-focused analysis, `--adversarial` replaces the default 5-persona set with a red-team configuration:

| # | Persona | Focus |
|---|---------|-------|
| 1 | Red Team Attacker | Active exploitation paths, attack chains, privilege escalation, authentication bypass |
| 2 | Blue Team Defender | Detection gaps, missing monitoring, SIEM visibility, incident response readiness |
| 3 | Insider Threat | Data exfiltration paths, audit trail gaps, privilege abuse by legitimate users |
| 4 | Supply Chain Analyst | Dependency risks, compromised packages, build pipeline weaknesses, unsigned artifacts |
| 5 | Judge | Evaluates all adversarial claims, assigns realistic exploitability scores, rejects unsupported claims |

**When to use adversarial mode:**

- Pre-deployment security review for any authentication or authorization code
- Before a scheduled penetration test (warm up the pen testers with known issues)
- Compliance audits (SOC 2, ISO 27001, HIPAA) — get findings in your terminology before auditors do
- After a dependency upgrade where any security-relevant package changed
- Whenever the word "auth", "payment", "PII", or "admin" appears in your scope

**Adversarial mode with chain:**

```
/autoresearch:predict --adversarial --chain security
Scope: src/auth/**, src/api/**, src/middleware/**
Goal: Pre-deployment security review
```

The red-team swarm identifies attack vectors ranked by exploitability. The security chain then validates each vector with empirical code evidence. The combination is significantly stronger than either tool alone — the swarm finds attack chains that linear OWASP checklists miss, and the security loop validates them with actual evidence rather than theoretical risk.

---

## Chain: The Power Feature

Chaining is where predict's value compounds. Without `--chain`, predict produces a ranked report and stops. With `--chain`, it immediately invokes the next tool with all findings pre-loaded, producing zero context loss between stages.

### Single Chain

**`--chain debug`** — converts hypothesis-queue.md into a pre-ranked debug hypothesis list. The debug loop tests them in priority order instead of guessing. Goes from 10+ iterations to 2–3.

**`--chain security`** — filters security-type findings, maps to STRIDE categories, and invokes the security audit with targeted vectors already identified. Single agent OWASP walks miss multi-step attack chains; swarm consensus finds them.

**`--chain fix`** — sorts findings by `severity * consensus_ratio`, adds cascade hints from dependency-map.md, and invokes the fix loop with root-cause-first ordering. Goes from fixing 47 symptoms to fixing 3 root causes that cascade-resolve 30 others.

**`--chain ship`** — classifies confirmed findings as BLOCKER / WARNING / INFO and invokes the ship checklist with a pre-populated gate status. Adds stakeholder impact simulation (e.g., "session migration will generate 200+ support tickets") that a mechanical checklist misses.

**`--chain scenario`** — converts each confirmed finding into a scenario seed, exploring edge cases that emerge specifically from the predicted risk areas rather than generic boundary cases.

### Multi-Chain

Multi-chain executes sequentially. Each stage's `handoff.json` feeds directly into the next stage's input. Zero context reconstruction between stages.

**`--chain scenario,debug,fix`** — Quality pipeline for new features:
1. Predict finds risk areas
2. Scenario explores edge cases in those specific risk areas
3. Debug hunts bugs that scenario discovered
4. Fix repairs everything with cascade awareness

**`--chain scenario,debug,fix,ship`** — Full lifecycle:
1. Predict maps the problem space
2. Scenario stress-tests edge cases
3. Debug finds the real bugs
4. Fix repairs them root-cause-first
5. Ship validates with full confidence

**`--chain scenario,debug,security,fix,ship`** — Maximum coverage for high-stakes releases:
1. Predict with multi-domain personas
2. Scenario generates edge cases
3. Debug hunts functional bugs
4. Security audits for vulnerabilities in parallel findings
5. Fix repairs everything
6. Ship with all gates verified

How each stage feeds the next:
- Predict → Scenario: confirmed findings become scenario seeds with context
- Scenario → Debug: discovered edge cases become debug targets
- Debug → Fix: empirically confirmed bugs with stack traces become fix inputs
- Security → Fix: validated vulnerabilities join the fix queue
- Fix → Ship: fixed items are removed from blockers, unfixed items remain

**The empirical override rule:** When chained, loop results always override swarm consensus. If the debug loop disproves a swarm hypothesis, the hypothesis is marked `DISPROVEN` in the predict report and is not retried. Predictions are starting points, not conclusions.

---

## Examples

### Basic Usage

**Interactive — no arguments**

```
/autoresearch:predict
```

Triggers interactive setup: asks which files to analyze, what the swarm should focus on, how deep to analyze, and whether to chain to another tool after. All 4 questions batched into a single prompt. Best when you are exploring an unfamiliar codebase.

**Quick security scan — shallow depth**

```
/autoresearch:predict --depth shallow
Scope: src/api/**
Goal: Security vulnerabilities
```

3 personas, 1 debate round. Architecture Reviewer, Security Analyst, Devil's Advocate. Takes ~1 minute. Good before merging any PR that touches API endpoints.

**Standard analysis with debug chain**

```
/autoresearch:predict --chain debug
Scope: src/auth/**
Goal: Investigate intermittent 500 errors on POST /login
```

5 personas analyze auth code independently. Architecture Reviewer traces middleware ordering, Security Analyst checks JWT handling, Performance Engineer profiles token validation, Reliability Engineer examines error handling and timeouts, Devil's Advocate asks if it is a load balancer timeout rather than application code. Consensus produces ranked hypothesis queue. Debug loop tests in priority order — finds root cause in 2–4 iterations.

**Deep architecture review**

```
/autoresearch:predict --depth deep
Scope: src/**
Goal: Architecture review — evaluate splitting into microservices
```

8 personas, 3 debate rounds. This is the most thorough analysis possible. Minority opinions on microservices tradeoffs are preserved even if 7/8 personas agree. Architecture decisions made with preserved minority opinions are significantly more defensible.

### Chain Examples

**Predict → Debug: intermittent 500 errors**

```
/autoresearch:predict --chain debug
Scope: src/api/**/*.ts
Goal: Investigate intermittent 500 errors on POST /users
```

Without predict: Claude guesses → tests → wrong → guesses again → 10 iterations.
With predict: 5 experts debate → ranked hypotheses → debug tests in order → 2–3 iterations.

The Debug loop receives a pre-ranked hypothesis queue and tests them in order. If H-01 (connection pool exhaustion at high concurrency) is disproven empirically, it moves to H-02 (missing error handling in async middleware), and so on. Each iteration is purposeful — no wasted guesses.

**Predict → Security: pre-deploy audit**

```
/autoresearch:predict --adversarial --chain security
Scope: src/auth/**, src/api/**, src/middleware/**
Goal: Security audit before production deploy
```

Red Team Attacker finds exploit paths. Blue Team Defender validates defenses. Insider Threat identifies data exfiltration routes. Supply Chain Analyst flags risky dependencies. Judge scores exploitability. Security loop validates each vector with empirical code evidence. Produces attack vectors ranked by confirmed exploitability — not theoretical CVSS scores.

**Predict → Fix: cascade failures after upgrade**

```
/autoresearch:predict --chain fix
Scope: src/**
Goal: Fix all type errors after TypeScript 5.5 upgrade
```

Without predict: fix errors one by one → 47 iterations.
With predict: personas identify 3 root type errors that cascade to 30+ test failures. Fix targets roots first. Cascade-aware ordering means each fix resolves multiple downstream failures. Total iterations: 13.

**Predict → Scenario: edge case discovery**

```
/autoresearch:predict --chain scenario
Scope: src/checkout/**/*.ts
Goal: What edge cases exist in the new checkout flow?
```

Predict maps risk areas (payment idempotency, inventory race conditions, session expiry during checkout). Scenario explores edge cases seeded by those specific risk areas — not generic boundary tests. Produces realistic edge cases grounded in actual code analysis.

**Full pipeline: predict → scenario → debug → fix → ship**

```
/autoresearch:predict --chain scenario,debug,fix,ship
Scope: src/**
Goal: Complete quality pipeline for v2.0 release
```

Single command. Zero context loss across 5 stages. Predict maps the problem space → scenario stress-tests edge cases → debug hunts bugs → fix repairs everything cascade-aware → ship validates with full confidence. Use this for major releases where you cannot afford surprises.

### Adversarial Examples

**Pre-deployment security review**

```
/autoresearch:predict --adversarial --chain security
Scope: src/auth/**, src/payments/**, src/api/**
Goal: Pre-deployment security review for payment processing feature
```

Five red-team personas focus specifically on the payment-auth integration surface. The Insider Threat persona identifies a privilege escalation path through the admin refund endpoint that standard OWASP scanning would not catch. The Judge assigns it exploitability score 8/10. Security loop confirms it with a specific proof-of-concept flow.

**Compliance audit preparation**

```
/autoresearch:predict --adversarial --depth deep
Scope: src/**
Goal: Identify HIPAA compliance gaps before external audit
```

8 adversarial personas with 3 debate rounds. Insider Threat looks for PHI accessible without audit logging. Supply Chain Analyst checks if any dependency phones home with health data. Judge evaluates each finding for compliance severity. Output structured as audit evidence with file:line citations for every finding.

**Penetration test preparation**

```
/autoresearch:predict --adversarial --chain security
Scope: src/api/**, src/auth/**, config/**
Goal: Find what a pen tester will find before they do
```

Red Team Attacker builds attack chains (not just individual vulnerabilities). Example: IDOR on user profile → combined with missing rate limiting → combined with predictable session tokens = automated account takeover. Multi-step chains are what adversarial mode finds that standard security scanning misses.

### Domain-Specific

**API security analysis**

```
/autoresearch:predict --adversarial
Scope: src/api/**/*.ts, src/middleware/**
Goal: API security — injection, auth bypass, rate limiting, data exposure
```

Security Analyst walks all request paths from `dependency-map.md` data flows. Every path from HTTP request to database call is traced for injection points. Auth middleware ordering is verified against OWASP broken auth patterns.

**Microservices architecture review**

```
/autoresearch:predict --depth deep
Scope: services/**
Goal: Review inter-service coupling before domain decomposition
```

Architecture Reviewer maps all cross-service imports (should be zero if services are truly independent). Reliability Engineer identifies missing circuit breakers at service boundaries. Performance Engineer finds synchronous blocking calls that should be async message queues. 8 personas, 3 rounds produce an architecture review as thorough as a week-long manual exercise.

**Database performance investigation**

```
/autoresearch:predict --personas 4
Scope: src/db/**, src/models/**, src/api/**
Goal: Identify query performance issues causing slow response times
```

Override to 4 personas: Architecture Reviewer (schema design), Performance Engineer (query patterns), Reliability Engineer (connection pooling, timeouts), Devil's Advocate (is it the database or the application server?). Persona specialization for a focused domain produces tighter, more actionable findings.

**Frontend performance audit**

```
/autoresearch:predict --depth shallow
Scope: src/components/**, src/hooks/**, src/store/**
Goal: React performance — re-renders, bundle size, memory leaks
```

Shallow mode for fast sweep. Performance Engineer traces unnecessary re-render chains through component tree. Architecture Reviewer flags prop drilling that should be context. Reliability Engineer finds event listeners not cleaned up in useEffect. 3 personas, 1 round — takes 90 seconds on a typical React codebase.

---

## When to Use Predict vs. Going Direct

| Situation | Use Predict? | Why |
|-----------|-------------|-----|
| Stack trace points to exact line | No | Answer is obvious — go direct |
| 3 independent lint errors | No | No cascade, no ambiguity |
| Intermittent failures (any type) | Yes | Multiple plausible causes — needs deliberation |
| Post-upgrade 20+ cascading errors | Yes | Cascade detection critical — fix roots not symptoms |
| Complex API with auth and payments | Yes | Multi-domain expertise needed simultaneously |
| Breaking change deployment | Yes | Stakeholder impact simulation catches soft risks |
| New feature edge case discovery | Yes | Persona diversity generates more realistic scenarios |
| Production incident (unknown cause) | Yes | End-to-end with shared context across all stages |
| Security audit before pen test | Yes | Multi-step attack chains vs individual vulnerabilities |
| Architecture decision (microservices?) | Yes | Minority opinions preserved — better decision quality |
| Single failing unit test | No | Scope is narrow, cause is usually obvious |
| Upgrading a major dependency | Yes | Impact surface unknown — needs multi-perspective scan |
| Quick PR sanity check | Yes (`--depth shallow`) | 90 seconds for 3-persona sweep before merge |
| Profiling an already-identified bottleneck | No | Tool selection known — go direct to performance loop |

**Rule of thumb:** If you would naturally call two or more specialists about the same problem, use predict. If you would call one specialist — or no specialist at all — go direct.

---

## The Key Insight

Predict never makes things worse. If all 5 personas produce wrong predictions, the autoresearch loop self-corrects within 1–2 iterations — the empirical loop always overrides swarm consensus. So the downside is wasted setup time (2–5 minutes). The upside is saving 40+ minutes of wrong-direction iteration.

It is a free option with asymmetric upside:

- **Cost of predict being wrong:** 2–5 minutes of setup + ~15–30% extra tokens
- **Benefit of predict being right:** 60–80% fewer wasted iterations, 3–5x faster root cause discovery

For any problem where you are not immediately certain of the cause — where you would naturally want to think before coding — predict is the right starting point. The 2-minute investment pays for itself with the very first correct hypothesis it surfaces.

---

## Output Structure

Every predict run creates a timestamped folder:

```
predict/260318-1143-auth-security-analysis/
├── overview.md           — Executive summary: date, scope, personas, rounds,
│                           severity breakdown, composite score, anti-herd status
├── findings.md           — All findings ranked by priority score with full evidence,
│                           persona votes, and debate log references
├── hypothesis-queue.md   — Ranked testable hypotheses — consumed by --chain tools
├── persona-debates.md    — Full debate transcript: per-persona, per-round,
│                           challenges issued, positions revised
├── predict-results.tsv   — Iteration log: persona, round, finding_count,
│                           flip_count, status
├── handoff.json          — Machine-readable schema for downstream chain tools
├── codebase-analysis.md  — Knowledge file: functions, types, routes, models
├── dependency-map.md     — Knowledge file: import graph, call graph, data flows
└── component-clusters.md — Knowledge file: logical clusters with risk areas
```

**overview.md** leads with a git hash stamp, severity breakdown (Critical/High/Medium/Low counts), top 3 findings linked to findings.md, and the composite predict_score. Anti-herd status prominently displayed — PASSED or ⚠️ GROUPTHINK WARNING.

**findings.md** is the primary working document. Each finding includes the full evidence excerpt, all persona votes with notes, and a link to the specific debate exchange that shaped the finding. Engineers can read the debate log to understand why a finding was elevated or downgraded.

**hypothesis-queue.md** is optimized for machine consumption by downstream chain tools. Ranked by priority score, formatted as testable hypotheses with confidence levels and exact file:line locations.

**handoff.json** is the structured bridge to `--chain` tools. Contains the full findings array, hypothesis list, scope metadata, and summary statistics. Every chain tool reads this file to initialize — never reconstructing context from scratch.

### The Composite Predict Score

```
predict_score = findings_confirmed * 15
              + findings_probable * 8
              + minority_opinions_preserved * 3
              + (personas_active / personas_total) * 20
              + (debate_rounds_completed / planned_rounds) * 10
              + anti_herd_passed * 5
```

Higher scores indicate more thorough and more diverse analysis. The formula explicitly incentivizes: breadth (cover all personas), depth (complete planned debate rounds), and intellectual diversity (preserve minorities, pass anti-herd check). A score inflated by mass agreement without diversity is penalized by the `anti_herd_passed` term.

---

## Budget Control

The `--budget <dollars>` flag enforces a per-session cost cap. Default is $1.00.

**Pre-execution token estimation** runs before Phase 3:

```
estimated_tokens = files_in_scope * avg_tokens_per_file
                 + personas * (knowledge_files_tokens + source_tokens)
                   * (1 + debate_rounds * 0.6)
```

| Budget Tier | Token Threshold | Action |
|-------------|----------------|--------|
| Standard | < 200,000 tokens | Proceed normally |
| Warning | 200,000–400,000 tokens | Warn user, suggest reducing scope or shallower depth |
| Hard limit | > 600,000 tokens | Halt and ask user to narrow scope, reduce personas, or reduce rounds |

If halted mid-analysis, predict writes partial results to `predict/{slug}/partial-findings.md` with `status: incomplete` in overview.md. Partial results are better than no results — they indicate which personas completed analysis before budget was exhausted.

**Cost guidance by depth:**
- `--depth shallow` on a 50-file scope: typically $0.10–0.20
- `--depth standard` on a 200-file scope: typically $0.40–0.70
- `--depth deep` on a 500-file scope: typically $0.90–1.50

Use `--budget 0.50` for CI pipelines to enforce predictable costs. Use `--dry-run` to see file count and get a cost estimate before committing.

---

## CI/CD Integration

Predict integrates cleanly into CI pipelines via `--fail-on` and `--budget` flags.

### Example: GitHub Actions Security Gate

```yaml
name: Swarm Security Gate

on:
  pull_request:
    paths:
      - 'src/auth/**'
      - 'src/api/**'
      - 'src/middleware/**'

jobs:
  predict-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run predict security gate
        run: |
          /autoresearch:predict \
            --scope "src/auth/**,src/api/**,src/middleware/**" \
            --goal "Security vulnerabilities" \
            --depth shallow \
            --budget 0.50 \
            --fail-on critical
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Upload predict report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: predict-report
          path: predict/
          retention-days: 30
```

This pattern:
- Triggers only when auth/API files change (cost control)
- Uses `--depth shallow` for speed (~90 seconds)
- Caps budget at $0.50 per run
- Fails the PR if any CRITICAL finding is confirmed by ≥3 personas
- Uploads the full predict folder as an artifact for review

### Example: Full Pipeline Gate

```yaml
name: Release Quality Pipeline

on:
  push:
    branches: [main]

jobs:
  predict-pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run full quality pipeline
        run: |
          /autoresearch:predict \
            --scope "src/**" \
            --goal "Pre-release quality check" \
            --depth standard \
            --chain debug,security,fix \
            --budget 2.00 \
            --fail-on high
```

Use `--fail-on high` for release gates (blocks on HIGH or CRITICAL). Use `--fail-on critical` for PR gates (only blocks on CRITICAL). Never use `--fail-on medium` in automated pipelines — too many false positives from contested findings.

---

## Tips and Best Practices

### When Predict Is Overkill

Do not use predict for:
- A bug with a clear stack trace pointing to a specific line
- Three independent lint errors with no relationships between them
- Updating a dependency with no security advisories
- Any problem where you already know the answer and just need code written

Predict adds deliberation overhead. Use it when deliberation is the missing ingredient — when the problem is hard enough that the first guess is likely wrong.

### Optimal Persona Count by Problem Type

| Problem Type | Recommended Personas | Reasoning |
|---|---|---|
| Security audit | 5 (adversarial) | Red/blue dynamics require contrast |
| Performance investigation | 3–4 | Performance + Reliability + DA + optional domain expert |
| Architecture review | 5–8 | More perspectives = better decision quality |
| Bug hunt (intermittent) | 5 (standard) | Full spread for unknown cause |
| Type error cascade | 3 (Architecture + Performance + DA) | Domain-focused — security not relevant |
| New feature review | 5 (standard) | Full spread for unknown risks |

### Reading Debate Transcripts Effectively

`persona-debates.md` is where the analytical value is most concentrated. Read it in this order:

1. **Devil's Advocate rounds** first — where did the DA challenge? Where did it concede? The concessions are the strongest evidence. The challenges that were NOT overturned by other personas are the most interesting minority opinions.
2. **Severity downgrades** — when a persona downgrades a finding during debate, the counter-evidence given is usually precise and worth reading.
3. **Cross-persona confirmations** — when two personas from different domains independently confirm the same finding with different evidence, that is the highest-confidence signal in the entire report.

### Iterating on Predict Output

If the first predict run produces too many findings (information overload), narrow the scope and re-run:

```
/autoresearch:predict --incremental
Scope: src/auth/**          # narrower than src/**
Goal: Security only
```

`--incremental` reuses the knowledge files from the prior run and only re-analyzes changed files. Fast subsequent runs.

If the predict output seems too uniform (all personas agree on everything), the swarm may have anchored on an obvious finding. Re-run with `--adversarial` or add `--rounds 3` to force more debate cycles.

### Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails |
|---|---|
| Skipping Devil's Advocate | Removes the diversity that makes swarm valuable — remaining personas share training bias |
| Trusting swarm over empirical evidence | Loop experiments always win. Predictions are priors, not conclusions. |
| Using >8 personas | Diminishing returns — token waste with no diversity gain |
| Setting `--rounds 0` | Produces independent opinions, not swarm intelligence — no challenge, no revision |
| Ignoring minority findings | Minorities are frequently right on non-obvious issues that majorities anchor away from |
| Running `--adversarial` on unscoped analysis | Adversarial personas need a narrow target — broad scope dilutes red-team effectiveness |
| Chaining without reviewing findings first | Garbage in, garbage out. Review hypothesis-queue.md before accepting chain handoff |
| Using predict for every small change | Overhead is real — reserve for genuinely ambiguous problems |

---

## Related Commands

- [`/autoresearch:debug`](./autoresearch-debug.md) — primary chain target for hypothesis-driven debugging
- [`/autoresearch:security`](./autoresearch-security.md) — empirical security validation after adversarial predict
- [`/autoresearch:fix`](./autoresearch-fix.md) — cascade-aware repair using predict's priority queue
- [`/autoresearch:ship`](./autoresearch-ship.md) — pre-deploy gate with predict's blocker classification
- [`/autoresearch:scenario`](./autoresearch-scenario.md) — edge case exploration seeded by predict findings
- [`/autoresearch:plan`](./autoresearch-plan.md) — setup wizard for the base autoresearch loop
