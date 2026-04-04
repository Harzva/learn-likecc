<div align="center">

# /autoresearch:security — The Security Auditor

**By [Udit Goenka](https://udit.co)**

[![Version](https://img.shields.io/badge/version-1.8.1-blue.svg)](https://github.com/uditgoenka/autoresearch/releases)

</div>

---

Comprehensive security audit using STRIDE threat modeling, OWASP Top 10, and red-team adversarial analysis with 4 hostile personas. `/autoresearch:security` doesn't scan for known CVEs and stop — it builds a full threat model of your specific codebase, maps every trust boundary, then iteratively probes each attack vector with code evidence required for every confirmed finding. No theoretical vulnerabilities. Every finding ships with file:line reference, attack scenario, and mitigation.

---

## How It Works — 7-Phase Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SETUP PHASE (once)                       │
│                                                             │
│  1. Codebase Recon      Tech stack, deps, configs, routes  │
│  2. Asset Identification  Data stores, auth, APIs, inputs  │
│  3. Trust Boundary Map  Browser↔Server, Public↔Auth,       │
│                         User↔Admin, Internal↔External       │
│  4. STRIDE Threat Model  6 threat categories × every asset │
│  5. Attack Surface Map  Entry points, data flows, abuse    │
│  6. Baseline            Run npm/pip/go audit + lint        │
├─────────────────────────────────────────────────────────────┤
│                    AUTONOMOUS LOOP                          │
│                                                             │
│  LOOP (FOREVER or N times):                                 │
│    1. Select untested attack vector from threat model       │
│    2. Deep-dive into target code                            │
│    3. Validate with code evidence (file:line + scenario)    │
│    4. Classify: severity + OWASP category + STRIDE tag      │
│    5. Log to security-audit-results.tsv                     │
│    6. Print STRIDE/OWASP coverage every 5 iterations        │
│    7. Repeat                                                │
├─────────────────────────────────────────────────────────────┤
│                    FINAL REPORT                             │
│                                                             │
│  Severity-ranked findings with code evidence + mitigations  │
│  STRIDE coverage matrix + OWASP coverage matrix            │
│  Prioritized remediation roadmap                            │
└─────────────────────────────────────────────────────────────┘
```

---

## STRIDE Threat Model

STRIDE is the framework for exhaustive threat categorization. Each asset in your codebase is evaluated against all six threat categories:

| Threat | Question | Example Findings |
|--------|----------|------------------|
| **S**poofing | Can an attacker impersonate a user or service? | Weak auth, missing CSRF tokens, forged JWTs, unsigned webhooks |
| **T**ampering | Can data be modified in transit or at rest? | Missing input validation, SQL injection, mass assignment, missing HMAC |
| **R**epudiation | Can actions be denied without evidence? | Missing audit logs, unsigned transactions, no request tracing |
| **I**nfo Disclosure | Can sensitive data leak to unauthorized parties? | PII in logs, verbose error messages, debug endpoints in production |
| **D**enial of Service | Can the service be disrupted or degraded? | Missing rate limits, ReDoS via regex, unbounded file uploads, no timeouts |
| **E**levation of Privilege | Can a user gain access beyond their role? | IDOR, broken access control, path traversal, privilege escalation via API |

Every confirmed finding is tagged with its STRIDE category and logged against the threat model. Coverage is reported every 5 iterations.

---

## 4 Red-Team Personas

Each iteration rotates through adversarial lenses to ensure no attack surface is approached from only one angle:

| Persona | Mindset | What They Look For |
|---------|---------|-------------------|
| **Security Adversary** | "I'm a hacker breaching this system from the outside" | Auth bypass, injection attacks, data exposure, session hijacking, XSS |
| **Supply Chain Attacker** | "I'm compromising dependencies or the CI/CD pipeline" | Known CVEs in deps, typosquatting, unsigned artifacts, compromised build steps |
| **Insider Threat** | "I'm a malicious employee with legitimate access" | Privilege escalation, horizontal access to other users' data, data exfiltration paths |
| **Infrastructure Attacker** | "I'm attacking the deployment, not the code" | Container escape, exposed services, hardcoded env vars, network segmentation gaps |

---

## All Flags

| Flag | Purpose |
|------|---------|
| `--diff` | Only audit files changed since last audit (delta mode — fast PR checks) |
| `--fix` | Auto-fix confirmed Critical/High findings after the audit completes |
| `--fail-on <severity>` | Exit non-zero for CI/CD gating (`critical`, `high`, `medium`) |

Flags combine freely:

```
/autoresearch:security --diff --fix --fail-on critical
```

Execution order: `--diff` narrows scope → audit runs → `--fix` remediates → `--fail-on` gates remaining findings.

---

## Code Evidence Required

Every finding must include code evidence. No theoretical vulnerabilities are logged. The required format:

```markdown
### [CRITICAL] JWT Algorithm Confusion
- **OWASP:** A07 — Authentication Failures
- **STRIDE:** Spoofing
- **Location:** src/middleware/auth.ts:18
- **Confidence:** Confirmed
- **Attack Scenario:**
  1. Attacker crafts JWT with "alg": "none"
  2. Server accepts token without signature verification
  3. Attacker gains access as any user including admins
- **Code Evidence:**
  // Line 18 — no algorithm restriction
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
- **Mitigation:**
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256']
  });
```

---

## Examples

### 1. Full audit — unlimited iterations

```
/autoresearch:security
```

Runs until interrupted. Builds threat model, then iteratively probes every vector. Best for overnight comprehensive sweeps.

---

### 2. Bounded audit

```
/autoresearch:security
Iterations: 10
```

Exactly 10 security sweep iterations. Prioritizes highest-risk vectors first.

---

### 3. Focused on auth flows

```
/autoresearch:security
Scope: src/api/**/*.ts, src/middleware/**/*.ts
Focus: authentication and authorization flows
Iterations: 15
```

Narrows to auth-adjacent code. Useful after changes to login, JWT, session, or permission logic.

---

### 4. Delta mode — only files changed since last audit

```
/autoresearch:security --diff
```

Compares against last audit baseline. Only inspects files changed since then. Ideal for PR reviews — fast, targeted, not redundant.

---

### 5. Auto-fix Critical and High findings

```
/autoresearch:security --fix
Iterations: 15
```

Runs the full audit, then hands confirmed Critical/High findings to `/autoresearch:fix` for automated remediation.

---

### 6. CI/CD gate — fail on Critical

```
/autoresearch:security --fail-on critical
Iterations: 10
```

Exits with non-zero code if any Critical findings remain after the audit. Blocks merges/deploys automatically.

---

### 7. Python / Flask audit

```
/autoresearch:security
Scope: app/**/*.py, tests/**/*.py
Focus: Flask routes, SQLAlchemy models, auth decorators
Iterations: 15
```

Checks for SQL injection via ORM misuse, missing `@login_required`, CSRF gaps in forms, insecure deserialization, and dependency CVEs via `pip audit`.

---

### 8. Go security audit

```
/autoresearch:security
Scope: internal/**/*.go, cmd/**/*.go
Focus: HTTP handlers, authentication middleware, database layer
Iterations: 15
```

Checks for SQL injection via `fmt.Sprintf` in queries, goroutine leaks, unchecked error returns on security-critical paths, missing input validation, and `gosec` findings.

---

### 9. Infrastructure and DevOps audit

```
/autoresearch:security
Scope: Dockerfile, docker-compose.yml, .github/workflows/**/*.yml, k8s/**/*.yaml
Focus: container configuration, CI/CD pipeline security, secrets management
Iterations: 12
```

Checks for privileged containers, hardcoded secrets in env vars, exposed ports, missing network policies, unsigned base images, CI/CD secret injection risks, and overly permissive IAM roles.

---

### 10. Combined audit + fix + gate

```
/autoresearch:security --diff --fix --fail-on critical
Iterations: 15
```

Delta audit on changed files → auto-fix Critical/High → gate on any remaining Criticals. Full PR security pipeline in one command.

---

### 11. Compliance preparation

```
/autoresearch:security
Iterations: 20
Focus: OWASP Top 10 coverage, audit logging, data protection
```

Maximizes OWASP coverage matrix for compliance documentation. 20 iterations ensures all 10 categories are investigated.

---

### 12. Quick pre-release sanity check

```
/autoresearch:security
Iterations: 5
```

5 high-priority iterations targeting the most critical vectors. Not exhaustive — catches obvious issues before shipping.

---

## Example Session Output

```
> /autoresearch:security
> Iterations: 10

[Setup] Scanning codebase...
  Tech stack: Next.js 16, TypeScript, MongoDB, JWT auth
  Assets: 3 data stores, 14 API routes, 2 external services
  Trust boundaries: 4 identified
  STRIDE threats: 18 modeled
  Attack vectors: 22 mapped

[Iteration 1] Testing: IDOR on /api/users/:id
  → CONFIRMED HIGH (A01/EoP) — src/api/users.ts:42

[Iteration 2] Testing: JWT algorithm validation
  → CONFIRMED CRITICAL (A07/Spoofing) — src/middleware/auth.ts:18

[Iteration 3] Testing: Rate limiting on /api/auth/login
  → CONFIRMED MEDIUM (A04/DoS) — src/api/auth.ts:15

[Iteration 4] Testing: SQL injection in search endpoint
  → DISPROVEN — parameterized queries used correctly

[Iteration 5] Testing: PII exposure in error responses
  → CONFIRMED HIGH (A09/Info Disclosure) — src/api/errors.ts:31

[Iteration 6] Testing: CSRF protection on state-changing routes
  → CONFIRMED MEDIUM (A01/Tampering) — middleware missing on 3 routes

[Iteration 7] Testing: Dependency CVEs via npm audit
  → CONFIRMED HIGH (A06) — lodash@4.17.20 vulnerable to prototype pollution

[Iteration 8] Testing: Debug endpoints in production
  → CONFIRMED MEDIUM (A05/Info Disclosure) — /api/_debug enabled by env flag

[Iteration 9] Testing: Webhook signature validation
  → CONFIRMED HIGH (A08/Tampering) — signature not verified before processing

[Iteration 10] Testing: Path traversal on file download endpoint
  → DISPROVEN — path.resolve + allowlist used correctly

=== Security Audit Complete (10/10 iterations) ===
STRIDE Coverage: S[✓] T[✓] R[✗] I[✓] D[✓] E[✓] — 5/6
OWASP Coverage: A01[✓] A02[✗] A03[✓] A04[✓] A05[✓] A06[✓] A07[✓] A08[✓] A09[✓] A10[✗] — 8/10
Findings: 1 Critical, 4 High, 3 Medium, 0 Low
```

---

## Chain Patterns

### security → fix → security (re-audit)

Fix confirmed findings, then re-audit to verify remediation:

```
# Step 1: Full audit
/autoresearch:security
Iterations: 15

# Step 2: Fix Critical/High findings
/autoresearch:fix --from-security
Iterations: 30

# Step 3: Re-audit to confirm fixes
/autoresearch:security --diff
Iterations: 10
```

---

### predict → security

Get adversarial threat intelligence before the audit:

```
# Step 1: Expert prediction on attack surface
/autoresearch:predict
Question: What are the most likely attack vectors for a Next.js app with JWT auth and MongoDB?
Personas: security-engineer, red-team-hacker, compliance-officer

# Step 2: Security audit informed by those predictions
/autoresearch:security
Focus: [vectors identified by predict]
Iterations: 15
```

---

### security → fix → ship

Full pre-release security pipeline:

```
# 1. Audit
/autoresearch:security --fail-on high
Iterations: 15

# 2. Fix all Critical/High
/autoresearch:fix --from-security
Iterations: 30

# 3. Ship clean
/autoresearch:ship --auto
```

---

## CI/CD Integration

### GitHub Actions — PR gate + weekly sweep

```yaml
# .github/workflows/security-audit.yml
name: Security Audit
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 2am

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # needed for --diff

      - name: Run Security Audit
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            claude -p "/autoresearch:security --diff --fail-on critical --iterations 5"
          else
            claude -p "/autoresearch:security --fail-on high --iterations 15"
          fi

      - name: Upload Security Report
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: security/
          retention-days: 90
```

### GitHub Actions — post-merge audit with auto-fix

```yaml
# .github/workflows/security-remediate.yml
name: Security Remediation
on:
  push:
    branches: [main]

jobs:
  audit-and-fix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Audit and auto-fix Critical/High
        run: |
          claude -p "/autoresearch:security --diff --fix --fail-on critical --iterations 10"
      - name: Commit fixes if any
        run: |
          git diff --quiet || (git add -A && git commit -m "fix: auto-remediate security findings")
```

### When to run

| Scenario | Recommendation |
|----------|---------------|
| Before a major release | `/autoresearch:security` with `Iterations: 15` |
| Quick sanity check | `/autoresearch:security` with `Iterations: 5` |
| Comprehensive overnight | `/autoresearch:security` (unlimited) |
| CI/CD gate | `/autoresearch:security --fail-on critical --iterations 10` |
| PR review (changed files) | `/autoresearch:security --diff --iterations 5` |
| After auth/API changes | `/autoresearch:security --diff --fix` |
| Compliance preparation | `/autoresearch:security` with `Iterations: 20` |

---

## Output Structure

Every security session creates a structured folder:

```
security/260318-1204-stride-owasp-full-audit/
├── overview.md                 Executive summary + links to all reports
├── threat-model.md             STRIDE analysis per asset + trust boundaries
├── attack-surface-map.md       Entry points, data flows, abuse paths
├── findings.md                 All findings ranked by severity with code evidence
├── owasp-coverage.md           OWASP Top 10 coverage matrix per category
├── dependency-audit.md         npm/pip/go audit results + CVE details
├── recommendations.md          Prioritized fix roadmap with code examples
└── security-audit-results.tsv  Machine-readable iteration log
```

`findings.md` is the primary deliverable. All other reports provide context, coverage, and roadmap. The TSV enables programmatic processing and trend tracking across audits.

---

## OWASP Top 10 Coverage

Each iteration targets uncovered OWASP categories — the audit tracks coverage and prioritizes gaps:

| ID | Category | Checks |
|----|----------|--------|
| A01 | Broken Access Control | IDOR, missing auth middleware, privilege escalation, path traversal |
| A02 | Cryptographic Failures | Plaintext secrets, weak hashing algorithms, missing encryption at rest |
| A03 | Injection | SQL, NoSQL, command, XSS, template, LDAP injection |
| A04 | Insecure Design | Missing rate limits, race conditions, CSRF gaps, business logic flaws |
| A05 | Security Misconfiguration | Debug mode on, default credentials, missing security headers |
| A06 | Vulnerable Components | Known CVEs in npm/pip/go dependencies, outdated packages |
| A07 | Auth Failures | JWT flaws, session fixation, weak password policies, broken MFA |
| A08 | Data Integrity Failures | Unsigned webhooks, insecure deserialization, unsigned CI/CD artifacts |
| A09 | Logging Failures | Missing audit logs, sensitive data in logs, no alerting on anomalies |
| A10 | SSRF | Unvalidated URLs in server-side requests, DNS rebinding, open redirects |

Coverage percentage is calculated and reported: `(owasp_tested/10)*50 + (stride_tested/6)*30 + min(findings, 20)`. Higher = more thorough. Max theoretical: 100.

---

## Tips

**Run unlimited for the first audit on a codebase.** The threat model setup is amortized — more iterations means better OWASP/STRIDE coverage without proportional extra setup cost.

**Use `--diff` for all PR checks.** Full audits on every PR are expensive and redundant. Delta mode catches new vulnerabilities introduced in the change without re-auditing already-reviewed code.

**`--fail-on critical` is the minimum CI gate.** Never ship with unreviewed Critical findings. Consider `--fail-on high` for security-sensitive services (auth, payments, healthcare).

**Re-audit after `--fix`.** Auto-fix remediates findings but should always be followed by a targeted re-audit (`--diff`) to verify the fix didn't introduce new vectors.

**Check `dependency-audit.md` separately.** CVEs in dependencies are tracked there. If a CVE can't be immediately patched (no fix available), document the compensating control in `recommendations.md`.

**Pair with predict for unfamiliar threat landscapes.** Run `/autoresearch:predict` with security-engineer and red-team-hacker personas before the first audit on a new stack.

**Tag findings with severity accurately.** Critical is reserved for exploitable vulnerabilities with direct impact (auth bypass, RCE, data exfiltration). Don't downgrade to avoid fixing — the `--fail-on` gate relies on accurate severity.

---

<div align="center">

**Built by [Udit Goenka](https://udit.co)** | [GitHub](https://github.com/uditgoenka/autoresearch) | [Follow @iuditg](https://x.com/iuditg)

</div>
