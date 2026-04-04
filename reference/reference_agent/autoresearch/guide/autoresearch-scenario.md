# /autoresearch:scenario — The Scenario Explorer

Autonomous scenario exploration engine. Takes a seed scenario and systematically generates situations across 12 dimensions — discovering edge cases, failure modes, security threats, and user journey variations that manual analysis consistently misses. Whether you're building test suites, planning a feature, modeling threats, or mapping user journeys, `:scenario` transforms a single sentence into a comprehensive situational map, iterating until your specified depth is reached.

---

## How It Works

Each iteration follows a fixed pipeline:

```
Seed analysis → Decompose into 12 dimensions → Generate ONE situation per iteration
     → Classify (dimension + severity) → Expand with context → Log → Repeat
```

1. **Seed analysis** — Parse your scenario for actors, actions, systems, and constraints
2. **Dimension selection** — Pick the least-explored dimension for this iteration (balanced coverage)
3. **Situation generation** — Generate one concrete situation within that dimension
4. **Classification** — Tag with dimension, severity (low/medium/high/critical), and domain priority
5. **Expansion** — Add preconditions, expected outcome, failure signals, and mitigation notes
6. **Log** — Append to `scenario-results.md` with full metadata
7. **Repeat** — Continue until `Iterations` count is reached

This one-at-a-time approach ensures comprehensive coverage across all dimensions rather than clustering around the most obvious cases.

---

## The 12 Exploration Dimensions

| # | Dimension | What It Explores |
|---|-----------|-----------------|
| 1 | **Happy path** | Normal, successful flows with expected inputs and conditions |
| 2 | **Error** | Expected failure modes — network timeout, validation failure, 404 |
| 3 | **Edge case** | Boundary conditions: empty input, max values, zero quantities, exact limits |
| 4 | **Abuse** | Malicious or unintended usage — injection, spoofing, replay attacks, scraping |
| 5 | **Scale** | High volume and large data — 10k concurrent users, 5GB file uploads, DB at capacity |
| 6 | **Concurrent** | Race conditions, parallel access, optimistic locking failures, double-submit |
| 7 | **Temporal** | Timing and scheduling — token expiry mid-flow, DST transitions, retry after delay |
| 8 | **Data variation** | Different formats, encodings, locales, character sets, null values, type coercion |
| 9 | **Permission** | Access control and roles — unauthorized access, privilege escalation, scope mismatch |
| 10 | **Integration** | Third-party interactions — payment gateway timeout, OAuth provider down, webhook failure |
| 11 | **Recovery** | Crash recovery, retry logic, idempotency, partial failure rollback |
| 12 | **State transition** | State machine edge cases — invalid transitions, re-entry, concurrent state changes |

Dimensions are sampled in a balanced rotation. If you use `--focus`, that dimension family gets weighted sampling (60/40 split against remaining dimensions).

---

## 5 Supported Domains

Each domain adjusts the dimension priority weighting and output vocabulary:

| Domain | Tailored Priorities |
|--------|-------------------|
| `software` | Edge case, concurrent, integration, error, recovery — test-oriented language |
| `product` | Happy path, data variation, permission, temporal — user-story language |
| `business` | Happy path, error, scale, temporal, permission — process and stakeholder language |
| `security` | Abuse, permission, integration, temporal, state transition — threat-model language |
| `marketing` | Happy path, data variation, error, scale — audience segment and channel language |

If no domain is given, `:scenario` infers from context (code files → software, personas → product, process nouns → business).

---

## All Flags

| Flag | Purpose |
|------|---------|
| `--domain <type>` | software, product, business, security, marketing |
| `--depth <level>` | shallow (10 iterations), standard (25), deep (50+) |
| `--scope <glob>` | Limit scenario generation to specific files or features |
| `--format <type>` | use-cases, user-stories, test-scenarios, threat-scenarios |
| `--focus <area>` | edge-cases, failures, security, scale — weight sampling toward this family |

---

## Depth Presets

| Preset | Iterations | Dimensions Covered | Best For |
|--------|-----------|-------------------|----------|
| `shallow` | 10 | ~5-6 dimensions | Quick scan before a PR, time-boxed review |
| `standard` | 25 | All 12 dimensions | Most features and APIs (recommended default) |
| `deep` | 50+ | All 12 dimensions, multiple passes | Critical paths, security audits, launch prep |

For `deep`, set `Iterations: 50` or higher explicitly. Claude will continue until the count is reached.

---

## Output Formats

| Format | Output Structure | Best For |
|--------|----------------|---------|
| `use-cases` | Actor + action + outcome + variations | Feature design, product planning |
| `user-stories` | "As a [user], I want... so that..." + acceptance criteria | Agile backlogs, sprint planning |
| `test-scenarios` | Preconditions + steps + expected result + pass/fail signal | QA, automated test writing |
| `threat-scenarios` | Threat actor + attack vector + impact + mitigations | Security audits, threat modeling |

Default format is `use-cases` when unspecified.

---

## Examples

### 1. Interactive (no args)

```
/autoresearch:scenario
```

Claude asks 4-8 adaptive questions — scenario description, domain, depth, focus area, output format. Minimum input needed: just run the command and answer the prompts.

---

### 2. Full checkout scenario (software domain)

```
/autoresearch:scenario
Scenario: User completes checkout with multiple payment methods
Domain: software
Depth: standard
Iterations: 25
```

Generates 25 situations across all 12 dimensions. Covers: successful split-payment, card decline mid-flow, race condition on inventory decrement, concurrent checkout with same cart, payment gateway timeout, idempotency on retry, and more.

---

### 3. Quick edge case scan

```
/autoresearch:scenario --depth shallow --focus edge-cases
Scenario: File upload feature
```

10 iterations, weighted toward edge cases: zero-byte files, filenames with unicode, files exactly at size limit, duplicate uploads, interrupted uploads, unsupported MIME types disguised as allowed types.

---

### 4. Security-focused OAuth scenario

```
/autoresearch:scenario --domain security
Scenario: OAuth2 login flow with third-party providers
Iterations: 30
```

Weights abuse, permission, and temporal dimensions. Surfaces: CSRF on callback, state parameter tampering, token replay after logout, provider down during redirect, expired authorization code reuse, scope elevation via provider misconfiguration.

---

### 5. Generate test scenarios for an API

```
/autoresearch:scenario --format test-scenarios --domain software
Scenario: REST API pagination with filtering and sorting
Iterations: 20
```

Each iteration outputs: preconditions, request parameters, expected response shape, expected status code, and a pass/fail signal. Ready to paste into a test file or hand to an engineer.

---

### 6. API pagination edge cases

```
/autoresearch:scenario --depth shallow --focus edge-cases --format test-scenarios
Scenario: Paginated list endpoint with cursor-based navigation
```

Focuses on boundary conditions: cursor pointing to deleted record, page size of 0, page size exceeding max, filtering that returns empty page mid-cursor chain, sort order flip between pages.

---

### 7. File upload edge cases

```
/autoresearch:scenario --depth deep --focus edge-cases
Scenario: User uploads profile picture via drag-and-drop
Iterations: 40
```

Deep scan surfaces: SVG with embedded `<script>`, EXIF metadata with PII, file that passes MIME check but fails content inspection, upload interrupted at 99%, browser tab closed mid-upload, duplicate upload with same hash, concurrent uploads from two sessions.

---

### 8. Payment processing scenarios

```
/autoresearch:scenario --domain software --depth deep --format test-scenarios
Scenario: User processes a refund for a partially-shipped order
Iterations: 35
```

Covers: full refund, partial refund, refund after chargeback, refund to expired card, concurrent refund requests for the same order, refund when original payment was split across methods, idempotency on duplicate refund API call.

---

### 9. Enterprise procurement (business domain)

```
/autoresearch:scenario --domain business --depth deep
Scenario: Employee submits expense report for multi-currency travel
Iterations: 30
```

Business-language output covering: approver on leave, currency conversion on submission vs reimbursement date, expense exceeding policy limit by $0.01, duplicate submission from mobile and desktop, partial approval, rejection after partial payment processed.

---

### 10. Content marketing scenarios

```
/autoresearch:scenario --domain marketing --format use-cases
Scenario: Newsletter signup with lead magnet delivery
Iterations: 20
```

Covers: double opt-in flow, existing subscriber re-subscribing, disposable email address, invalid email format passing client validation, email delivery failure, lead magnet link expired before open, subscriber from sanctioned country.

---

### 11. Hiring process scenarios

```
/autoresearch:scenario --domain business --depth standard
Scenario: Candidate moves through multi-stage interview pipeline
Iterations: 25
```

Covers: candidate applying to two roles simultaneously, interviewer conflict of interest, offer letter sent before background check completes, candidate rejecting offer after verbal acceptance, duplicate candidate profiles merged mid-process.

---

### 12. Web scraper edge cases

```
/autoresearch:scenario --depth deep --focus edge-cases --domain software
Scenario: Scraper collects product listings from e-commerce site
Iterations: 40
```

Covers: JavaScript-rendered content, infinite scroll pagination, session cookie expiry mid-crawl, rate limiting with exponential backoff, HTML structure change between pages, product listing with missing price field, redirect chain exceeding max depth, duplicate URL with different query strings.

---

## Adaptive Setup

When you run `:scenario` without full context, Claude generates 4-8 questions tailored to what you provided:

**If you give nothing:**
1. What is the scenario you want to explore?
2. What domain best fits? (software / product / business / security / marketing)
3. What depth? (shallow = quick scan, standard = thorough, deep = exhaustive)
4. What output format? (use-cases / user-stories / test-scenarios / threat-scenarios)

**If you give a scenario but no domain:**
Claude infers from keywords, then asks to confirm and requests depth + format.

**If you give domain + scenario:**
Claude asks depth, format, and whether to focus on a specific dimension family.

**If you give everything:**
Claude starts immediately — no questions asked.

The question set is generated fresh each time, not from a fixed template. Questions adapt based on what's ambiguous in your context.

---

## Chain Patterns

### scenario → debug
Discover what could go wrong, then hunt the bugs:

```bash
# Step 1: Generate edge case map
/autoresearch:scenario --domain software --focus edge-cases
Scenario: User resets password with expired token
Iterations: 15

# Step 2: Hunt bugs in discovered risk areas
/autoresearch:debug --scope src/auth/**
Symptom: edge cases from scenario exploration
```

---

### scenario → debug → fix
Full discovery-to-repair pipeline:

```bash
# Step 1: Discover scenarios
/autoresearch:scenario --domain software
Scenario: User uploads files through drag-and-drop interface
Iterations: 25

# Step 2: Hunt bugs in risk areas
/autoresearch:debug --scope src/uploads/**
Iterations: 15

# Step 3: Fix what was found
/autoresearch:fix --from-debug
Guard: npm test
Iterations: 20
```

---

### scenario → security
From user scenarios to threat model:

```bash
# Step 1: Map user scenarios
/autoresearch:scenario --domain software --format use-cases
Scenario: Admin user manages team permissions
Iterations: 20

# Step 2: Security audit on the same scope
/autoresearch:security --diff
Scope: src/admin/**, src/permissions/**
```

---

### predict → scenario
Multi-persona prediction feeds scenario exploration:

```bash
/autoresearch:predict --chain scenario,debug,fix
Scope: src/checkout/**
Goal: Ensure checkout handles all edge cases before launch
```

Predict identifies high-risk areas → scenario generates 25 situations per risk area → debug hunts bugs → fix repairs with cascade awareness.

---

### scenario → ship
Generate test scenarios, verify coverage, then ship:

```bash
/autoresearch:scenario --format test-scenarios --domain software --iterations 20
/autoresearch:ship --auto
```

---

## Output Structure

Each iteration appends a block to `scenario-results.md`:

```markdown
## Scenario #12 — Concurrent checkout race condition
**Dimension:** Concurrent
**Severity:** High
**Domain:** software

**Preconditions:**
- Two sessions share the same cart ID
- Inventory count is exactly 1 for the item

**Situation:**
Both sessions click "Place Order" within 50ms of each other.

**Expected Outcome:**
One order succeeds; the other receives a 409 Conflict with a clear message.

**Failure Signal:**
Two orders created for the same inventory unit; oversell occurs.

**Mitigations:**
- Optimistic locking on inventory row
- Idempotency key on order creation endpoint
- Front-end disable of submit button post-click
```

A summary table at the top of `scenario-results.md` is updated each iteration with dimension coverage counts.

---

## Tips

**Start shallow, go deep on what matters.** Run `--depth shallow` first to get a coverage map, then re-run `--depth deep --focus` on the dimensions with the highest severity findings.

**Combine `--format test-scenarios` with `--scope`.** Scoping to specific files produces scenarios directly relevant to that code's contracts and constraints, making the output immediately actionable for test writing.

**Use `--domain security` for anything with auth, money, or PII.** The abuse and permission dimensions are weighted higher, and the output language maps directly to threat-model vocabulary your security team recognizes.

**For business process scenarios**, give Claude one representative happy-path walkthrough in the scenario description. The richer the seed, the more specific the edge cases generated.

**Scenario output feeds naturally into debug.** After a `:scenario` run, copy the highest-severity situations into the `Symptom:` field of `/autoresearch:debug` to prioritize bug-hunting exactly where the risk is.

**`--scope` is not filtering — it's focusing.** When you set `--scope src/payments/**`, Claude reads those files to ground scenario generation in the actual implementation constraints, producing situations that could realistically occur in your specific codebase rather than generic ones.

---

<div align="center">

**[Guide Index](README.md)** | **[Chains & Combinations](chains-and-combinations.md)** | **[/autoresearch:ship](autoresearch-ship.md)**

</div>
