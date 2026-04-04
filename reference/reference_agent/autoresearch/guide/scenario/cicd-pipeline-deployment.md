# Scenario: CI/CD Pipeline Deployment

> Explore failure modes in build, test, deploy, rollback, and secret management across automated delivery pipelines.

---

## The Command

```
/autoresearch:scenario --domain software --depth deep --focus recovery
Scenario: Developer pushes code that triggers CI/CD pipeline — build, test, deploy to staging, promote to production, with rollback capability
Iterations: 35
```

---

## What This Explores

CI/CD pipelines are state machines with catastrophic failure potential. A broken deploy can take down production; a leaked secret can compromise the entire infrastructure. The pipeline must handle partial failures, concurrent deploys, flaky tests, and secret rotation — all while maintaining an audit trail.

**Key dimensions weighted:**
- **Recovery** — rollback mid-deploy, partial rollback, blue-green switch failure
- **Error** — build timeout, test flakiness, deploy artifact corruption
- **State transition** — concurrent deploys to same environment, promotion during rollback
- **Permission** — secret exposure in logs, unauthorized production deploy, scope escalation
- **Concurrent** — two PRs merged simultaneously, parallel pipeline runs on same branch

---

## Example Situations Generated

### Situation #1 — Rollback during active database migration
**Dimension:** Recovery | **Severity:** Critical

**Preconditions:**
- Deploy v2.3.0 includes a database migration (add column, backfill data)
- Migration is running (50% complete) when health checks fail

**Situation:**
Automated rollback triggers to revert to v2.2.0. But v2.2.0's code doesn't know about the new column. The half-migrated database is incompatible with both versions.

**Expected Outcome:**
Pipeline detects in-progress migration and pauses rollback. Alerts on-call with: "Migration in progress — manual intervention required." Provides options: complete migration + retry, or run reverse migration first.

**Failure Signal:**
Automatic rollback succeeds (code reverted) but database is in an inconsistent state. Application throws column-not-found errors on some rows, nil-reference errors on others.

**Mitigations:**
- Separate deploy from migrate: deploy code first (backward-compatible), run migration, then deploy code that uses new schema
- Migration lock flag in deployment state that blocks automatic rollback
- All migrations must be reversible (down migration tested in CI)

---

### Situation #2 — Secret leaked in build log
**Dimension:** Permission | **Severity:** Critical

**Preconditions:**
- Pipeline uses environment variables for database credentials
- Debug mode is enabled for a failing build step

**Situation:**
A developer adds `echo $DATABASE_URL` to debug a connection issue. CI log captures the full connection string including password. Log is visible to all team members and cached in CI provider for 30 days.

**Expected Outcome:**
CI system detects credential patterns in log output and redacts them in real-time. Build step warns: "Potential secret detected in output — redacted."

**Failure Signal:**
Full database credentials visible in CI logs. Secret scanner doesn't catch connection strings, only API key patterns.

**Mitigations:**
- Log redaction for known secret patterns (connection strings, API keys, tokens)
- Pre-commit hook that blocks `echo $SECRET_*` patterns
- Separate secret management (Vault/AWS Secrets Manager) with short-lived tokens

---

### Situation #3 — Concurrent deploys race to same environment
**Dimension:** Concurrent | **Severity:** High

**Preconditions:**
- PR #101 and PR #102 are merged to `main` within 30 seconds
- Both trigger deploy pipelines to staging

**Situation:**
Pipeline for PR #101 starts deploying v1.8.1. Pipeline for PR #102 starts deploying v1.8.2 before #101 finishes. Both pipelines write to the same Kubernetes namespace or EC2 instances.

**Expected Outcome:**
Pipeline implements deploy locking — second deploy queues until first completes. Or: second deploy cancels first and takes over (last-write-wins with clean state).

**Failure Signal:**
Both deploys interleave — some pods run v1.8.1, others run v1.8.2. Health checks pass on some replicas and fail on others. Inconsistent state across the fleet.

**Mitigations:**
- Deploy mutex/lock per environment (Redis lock or CI provider's concurrency control)
- Pipeline cancellation: newer commit cancels in-progress deploy of older commit
- Kubernetes: rolling update with `maxSurge` and `maxUnavailable` ensures atomic version transitions

---

### Situation #4 — Flaky test causes deploy-blocking false positive
**Dimension:** Error | **Severity:** Medium

**Preconditions:**
- Test suite includes a browser-based E2E test that depends on a 2-second animation timeout
- CI environment is under load, running slower than developer machines

**Situation:**
E2E test fails with "element not found" because the animation took 3 seconds on the overloaded CI runner. Pipeline blocks the deploy. Developer re-runs — test passes. Third run — fails again. Deploy is blocked for 2 hours while team debates if it's "really broken."

**Expected Outcome:**
Pipeline retries failed tests once automatically. If the test passes on retry, it's flagged as "flaky" in the test report. Deploy proceeds but flaky test is logged for investigation.

**Failure Signal:**
Deploy blocked indefinitely by a non-deterministic test. Team adds `skip` annotation and forgets about it. Flaky test accumulates to 15 skipped tests within a month.

**Mitigations:**
- Auto-retry for failed tests (1 retry, mark as flaky if it passes on retry)
- Flaky test quarantine: tracked separately, don't block deploy, alert on accumulation
- Split E2E tests into "deploy-blocking" (critical paths) and "informational" (nice-to-have)

---

### Situation #5 — Promote to production during incident freeze
**Dimension:** State transition | **Severity:** High

**Preconditions:**
- Production incident declared 30 minutes ago — deploy freeze is active
- A developer's pre-freeze PR auto-promotes from staging to production

**Situation:**
Automated promotion pipeline doesn't check the incident freeze flag. Deploy reaches production, introducing new code during an active incident investigation.

**Expected Outcome:**
Pipeline checks deploy freeze status before any production promotion. Returns: "Deploy blocked — active incident freeze since 14:30 UTC. Contact #incident-channel to override."

**Failure Signal:**
New code deploys to production during incident. Incident investigation is complicated by "did this new deploy cause the issue?" Root cause analysis adds 2 hours.

**Mitigations:**
- Deploy freeze flag in pipeline configuration (checked at promotion gates)
- Integration with incident management tool (PagerDuty, OpsGenie) for automatic freeze
- Emergency override requires 2-person approval + audit log entry

---

### Situation #6 — Artifact checksum mismatch between build and deploy
**Dimension:** Error | **Severity:** Critical

**Preconditions:**
- Build step produces a Docker image, pushes to registry
- Deploy step pulls the image by tag

**Situation:**
Between build and deploy, the image tag is overwritten by a concurrent pipeline (tag `:latest` is mutable). Deploy pulls a different image than what was built and tested.

**Expected Outcome:**
Pipeline references images by immutable digest (SHA256), not mutable tags. Deploy pulls exactly the image that passed CI.

**Failure Signal:**
Deployed code doesn't match tested code. "Works in CI, broken in prod" with no code difference in git — because the artifact was swapped.

**Mitigations:**
- Reference Docker images by digest (`sha256:abc123`), never by mutable tag
- Pin build artifact to pipeline ID, verify checksum at deploy time
- Image signing (cosign/Notary) with verification at deploy gate

---

## Chain It

### scenario → debug
```bash
# Hunt for the bugs surfaced by scenario exploration
/autoresearch:debug
Scope: .github/workflows/**, scripts/deploy/**, Dockerfile, docker-compose*.yml
Symptom: Pipeline state issues — race conditions, missing rollback, secret exposure
Iterations: 15
```

### scenario → security → fix
```bash
# Audit pipeline for secret leakage and permission escalation
/autoresearch:security --fix --fail-on critical
Scope: .github/workflows/**, .gitlab-ci.yml, Jenkinsfile, scripts/**
Iterations: 15
```

### predict → scenario
```bash
/autoresearch:predict --adversarial --chain scenario,security
Scope: .github/workflows/**, scripts/deploy/**
Goal: Ensure CI/CD pipeline is resilient to failure modes and supply chain attacks
```

---

## Tips

**Always audit secrets separately.** Run `/autoresearch:security --focus secrets` on your pipeline config files. Secret leakage in CI logs is one of the most common real-world security incidents — and the hardest to detect retroactively.

**Test your rollback before you need it.** Chain `:scenario` with `:debug` specifically targeting the rollback path. Many teams discover their rollback is broken during an incident — the worst possible time.

**Treat pipeline config as production code.** YAML files in `.github/workflows/` have the same blast radius as application code — they can deploy, delete, and expose infrastructure. Review them with the same rigor.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
