# /autoresearch:ship — The Shipping Workflow

Ship anything through 8 phases: **Identify → Inventory → Checklist → Prepare → Dry-run → Ship → Verify → Log**. Whether you're pushing code, deploying infrastructure, sending a marketing email, or publishing a research paper, `:ship` provides a structured, type-aware process that catches what you'd miss when shipping manually — and gives you a rollback path when something goes wrong.

---

## How It Works

When you run `/autoresearch:ship`, it moves through 8 structured phases:

| Phase | What Happens |
|-------|-------------|
| **1. Identify** | Detect what you're shipping (auto or via `--type`) |
| **2. Inventory** | Enumerate all artifacts, dependencies, and targets |
| **3. Checklist** | Generate a type-specific readiness checklist |
| **4. Prepare** | Run pre-ship tasks (build, lint, bump version, etc.) |
| **5. Dry-run** | Simulate the ship action without executing it |
| **6. Ship** | Execute the actual ship action |
| **7. Verify** | Confirm successful delivery |
| **8. Log** | Record ship event with timestamp and artifact details |

---

## Auto-Detection

When no `--type` is given, `:ship` inspects context to detect what you're shipping:

- **Git state** — uncommitted changes, branch name, open PRs
- **Target file** — `.md` → content, `.pdf`/`.pptx` → sales or design, Dockerfile → deployment
- **Directory structure** — `content/`, `campaigns/`, `decks/`, `papers/`
- **CI config** — presence of workflow files, `deploy` scripts
- **Conversation context** — what you said most recently

If it can't determine the type with confidence, it asks one clarifying question.

---

## 9 Supported Types

| Type | Ship Action |
|------|-------------|
| `code-pr` | Create PR with full description, reviewers, and labels |
| `code-release` | Git tag + GitHub release with changelog |
| `deployment` | CI/CD trigger, kubectl apply, or deploy branch push |
| `content` | Publish via CMS or merge content branch |
| `marketing-email` | Send via ESP (SendGrid, Mailchimp, etc.) |
| `marketing-campaign` | Activate ads, launch landing page, notify channels |
| `sales` | Send proposal email, share deck link with prospect |
| `research` | Upload preprint, submit paper, publish report |
| `design` | Export assets, upload to shared drive, notify stakeholders |

---

## All Flags

| Flag | Purpose |
|------|---------|
| `--dry-run` | Validate without executing the ship action |
| `--auto` | Auto-approve checklist if no blockers found |
| `--force` | Skip non-critical warnings (blockers are always enforced) |
| `--rollback` | Undo the last ship action |
| `--monitor N` | Post-ship monitoring for N minutes |
| `--type <type>` | Override auto-detection with explicit type |
| `--checklist-only` | Generate readiness checklist without shipping |

---

## Examples

### 1. Auto-detect and ship (interactive)

```
/autoresearch:ship
```

Claude inspects context, asks one clarifying question if needed, runs the full 8-phase pipeline.

---

### 2. Ship a code PR with auto-approve

```
/autoresearch:ship --auto
```

Generates PR description, runs checklist, auto-approves if no blockers, creates the PR. No confirmation prompts.

---

### 3. Ship a code release

```
/autoresearch:ship --type code-release
```

Validates version bump, generates changelog from commits since last tag, creates git tag, publishes GitHub release.

---

### 4. Dry-run a deployment

```
/autoresearch:ship --type deployment --dry-run
```

Walks all 8 phases but stops before Phase 6. Outputs what would happen — which CI workflow would trigger, which environment, which artifacts would deploy. Safe for rehearsing production deploys.

---

### 5. Ship with post-deploy monitoring

```
/autoresearch:ship --type deployment --monitor 10
```

Ships the deployment, then monitors for 10 minutes — watching error rates, response times, or deploy status. Reports anomalies. Use for production deploys where you want eyes-on confidence before walking away.

---

### 6. Checklist only

```
/autoresearch:ship --checklist-only
```

Generates a type-specific readiness checklist and scores your current state against it. Useful for a pre-ship sanity check without committing to shipping. Output includes: total items, blocked items, warnings, ready-to-ship verdict.

---

### 7. Ship a blog post (content type)

```
/autoresearch:ship --type content
Target: content/blog/2026-q1-retrospective.md
```

Checks front-matter, validates links, confirms publish date, verifies SEO metadata, then merges or publishes via CMS.

---

### 8. Ship a marketing email

```
/autoresearch:ship --type marketing-email
Target: campaigns/march-launch/email-final.html
```

Validates HTML rendering, checks unsubscribe link, confirms send list, previews subject line, then triggers send via configured ESP.

---

### 9. Ship a marketing campaign

```
/autoresearch:ship --type marketing-campaign
Target: campaigns/spring-sale/
```

Activates ad sets, checks landing page status, notifies relevant Slack channels, and logs campaign launch time and artifact URLs.

---

### 10. Ship a sales proposal or deck

```
/autoresearch:ship --type sales
Target: decks/q1-enterprise-proposal.pdf
```

Confirms prospect details are current, checks file format, generates a share link, drafts the outreach email, and logs the send.

---

### 11. Ship a research paper

```
/autoresearch:ship --type research
Target: papers/latency-analysis-2026.pdf
```

Validates citations, checks formatting against target venue requirements, uploads to arXiv or institutional repository, and logs submission ID.

---

### 12. Ship design assets

```
/autoresearch:ship --type design
Target: assets/brand-refresh-v2/
```

Exports in required formats (PNG, SVG, PDF), uploads to shared drive, notifies design stakeholders, and logs asset version.

---

### 13. Rollback a bad deployment

```
/autoresearch:ship --rollback
```

Reads the last ship log, identifies the rollback target, and executes the undo action — reverts git tag, re-deploys previous version, or unpublishes content.

---

## Checklist Examples by Type

### code-pr
- [ ] Branch is up to date with base branch
- [ ] All CI checks passing
- [ ] No merge conflicts
- [ ] PR description describes the change and why
- [ ] Tests added or updated for new behavior
- [ ] No secrets or credentials in diff

### code-release
- [ ] Version bumped in package.json / pyproject.toml
- [ ] CHANGELOG updated with release notes
- [ ] All tests passing on main
- [ ] No open blocking issues tagged for this milestone
- [ ] GitHub release draft created and reviewed

### deployment
- [ ] Build artifact exists and is current
- [ ] Environment variables confirmed for target env
- [ ] Database migrations ready (if needed)
- [ ] Rollback plan documented
- [ ] On-call engineer notified
- [ ] Monitoring dashboard open

### content
- [ ] Front-matter complete (title, date, tags, description)
- [ ] All internal links valid
- [ ] Images optimized and have alt text
- [ ] SEO title and meta description present
- [ ] Publish date correct

### marketing-email
- [ ] Unsubscribe link present
- [ ] "From" name and address configured
- [ ] Subject line A/B tested (if applicable)
- [ ] HTML renders in Outlook, Gmail, Apple Mail
- [ ] Send list verified — no test addresses in production list

### sales
- [ ] Prospect name and company spelled correctly
- [ ] Pricing current and approved
- [ ] Expiry date included
- [ ] Correct contact cc'd on email

---

## Chain Patterns

### loop → ship
Optimize a metric, then ship the improvements:

```bash
# Step 1: Improve
/autoresearch
Goal: Reduce p95 API latency below 100ms
Verify: npm run bench:api | grep "p95"
Guard: npm test
Iterations: 20

# Step 2: Ship
/autoresearch:ship --type code-pr --auto
```

---

### fix → ship
Fix all errors, then deploy:

```bash
# Step 1: Fix
/autoresearch:fix
Iterations: 25

# Step 2: Ship
/autoresearch:ship --type deployment --monitor 10
```

---

### security → fix → ship
Harden before shipping:

```bash
# Step 1: Audit
/autoresearch:security
Scope: src/**/*.ts
Iterations: 15

# Step 2: Fix confirmed findings
/autoresearch:fix --from-security
Iterations: 20

# Step 3: Deploy
/autoresearch:ship --type deployment --dry-run
/autoresearch:ship --type deployment --monitor 15
```

---

### predict → ... → ship
Multi-persona pre-deploy risk simulation:

```bash
/autoresearch:predict --chain ship
Scope: src/**
Goal: Pre-deployment risk assessment
```

Predict personas simulate stakeholder impact before the mechanical checklist runs. Catches soft risks like "this session migration will generate 200 support tickets."

---

### Full development lifecycle

```bash
/autoresearch:predict --chain scenario,debug,security,fix,ship
Scope: src/**
Goal: Complete quality pipeline for v2.0 release
```

Single command: predict → scenario → debug → security → fix → ship. Zero context loss between stages.

---

## Post-Ship Monitoring

When `--monitor N` is set, `:ship` enters a watch loop after shipping:

- Polls configurable health endpoints or deploy status URLs
- Watches for error rate spikes vs baseline
- Checks response time p95 against pre-ship baseline
- Reports at 1-minute intervals for N minutes
- Triggers rollback recommendation if anomaly threshold exceeded

**Recommended values:**
- Staging deploys: `--monitor 5`
- Production deploys: `--monitor 15`
- High-traffic production: `--monitor 30`

---

## Tips

**Use `--dry-run` when:**
- Shipping to production for the first time
- You changed the deploy config and want to verify before executing
- Rehearsing a high-stakes ship with stakeholders watching
- You're unsure which type will be auto-detected

**Use `--checklist-only` when:**
- You want a readiness score without committing to ship
- You're in a pre-ship review meeting and want a live checklist
- You've been blocked and want to know exactly what's still needed
- Auditing readiness across multiple artifacts in one pass

**Use `--force` sparingly.** It skips warnings but not blockers. If something is marked a blocker, fix it. `--force` is for known-safe warnings (e.g., a stale TODO comment that the team has accepted).

**Log entries** are written to `ship-log.md` in the working directory. Each entry includes: timestamp, type, artifacts shipped, git hash, verification status, and monitoring summary.

---

<div align="center">

**[Guide Index](README.md)** | **[Chains & Combinations](chains-and-combinations.md)** | **[/autoresearch:scenario](autoresearch-scenario.md)**

</div>
