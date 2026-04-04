# Scenario: Multi-Tenant SaaS Onboarding

> Explore failure modes in tenant provisioning, user invitations, role assignment, billing setup, and data isolation during SaaS onboarding flows.

---

## The Command

```
/autoresearch:scenario --domain software --depth standard
Scenario: New organization signs up for SaaS platform, invites team members, configures roles, and activates a billing plan
Iterations: 25
```

---

## What This Explores

SaaS onboarding is where permission, data isolation, and state machine bugs concentrate. A single tenant creation flow touches auth, billing, email delivery, role configuration, and database provisioning — each with its own failure modes that compound when they interact.

**Key dimensions weighted:**
- **Permission** — tenant isolation breach, role misconfiguration, cross-tenant data leakage
- **Data variation** — org names with special characters, international billing addresses, mixed-case emails
- **State transition** — incomplete onboarding resume, plan downgrade mid-trial, org deletion during setup
- **Integration** — payment provider timeout during plan activation, email service down during invitations
- **Edge case** — single-user org, invitation to existing user, self-invitation, invitation to the owner's own email

---

## Example Situations Generated

### Situation #1 — Cross-tenant data leakage via shared cache
**Dimension:** Permission | **Severity:** Critical

**Preconditions:**
- Tenant A and Tenant B are on the same infrastructure shard
- Application uses a shared Redis cache with tenant-prefixed keys

**Situation:**
A cache key collision occurs when Tenant A's org slug is `acme` and a cache key is constructed as `acme:users` — but a bug in key construction drops the tenant prefix under high load, returning Tenant B's user list to Tenant A's admin.

**Expected Outcome:**
Cache keys are always tenant-scoped. No cross-tenant data is ever returned regardless of load conditions.

**Failure Signal:**
Admin dashboard shows users from a different organization. API response includes records with foreign tenant IDs.

**Mitigations:**
- Mandatory tenant ID in every cache key (enforced at ORM/query layer, not application code)
- Row-level security in database as defense-in-depth
- Automated integration test that creates two tenants and asserts zero data overlap

---

### Situation #2 — Invitation accepted after org is deleted
**Dimension:** State transition | **Severity:** High

**Preconditions:**
- Org owner invites user@example.com
- Invitation email is delivered

**Situation:**
Before the invitee clicks the link, the org owner deletes the organization. The invitee clicks "Accept Invitation" 2 hours later.

**Expected Outcome:**
Invitation page shows a clear message: "This organization no longer exists." No account is created. No orphaned user record.

**Failure Signal:**
User is created but attached to a deleted org. 500 error on dashboard load. Orphaned billing record.

**Mitigations:**
- Validate org existence at invitation acceptance time (not just at send time)
- Cascade org deletion to pending invitations (mark as revoked)
- Soft-delete orgs with 30-day grace period and clear UI for the invitee

---

### Situation #3 — Plan activation during payment provider outage
**Dimension:** Integration | **Severity:** High

**Preconditions:**
- New org completes signup and selects the "Pro" plan
- Stripe/payment provider is experiencing degraded service

**Situation:**
Plan activation API call to Stripe times out after 30 seconds. User sees a spinner, refreshes, and retries — potentially creating duplicate subscriptions.

**Expected Outcome:**
Idempotent plan activation: first call creates the subscription with an idempotency key. Retry returns the same subscription. User sees a clear "processing" state, not an error.

**Failure Signal:**
Duplicate subscriptions created. User charged twice. Or org stuck in "pending" state with no way to retry.

**Mitigations:**
- Idempotency key on all payment API calls (org ID + plan ID + timestamp window)
- Async plan activation with webhook confirmation
- "Pending activation" UI state with manual retry button and support link

---

### Situation #4 — Org name with SQL-significant characters
**Dimension:** Data variation | **Severity:** Medium

**Preconditions:**
- User creates an organization during signup

**Situation:**
User enters org name: `O'Reilly & Associates — "The Best" <script>alert(1)</script>`. This name flows through: database insert, page title, email subject line, PDF invoice, and API JSON response.

**Expected Outcome:**
Name is stored verbatim in the database. Properly escaped in every output context (HTML-escaped in UI, JSON-escaped in API, sanitized in email subject).

**Failure Signal:**
XSS in dashboard, broken email subjects, malformed PDF, or SQL error on insert.

**Mitigations:**
- Input: allow all Unicode, reject only control characters
- Output: context-aware escaping (HTML, JSON, email, PDF)
- Never use org name in SQL construction — always parameterized queries

---

### Situation #5 — Self-invitation loop
**Dimension:** Edge case | **Severity:** Low

**Preconditions:**
- Org owner (owner@example.com) is on the "Invite Team" step of onboarding

**Situation:**
Owner enters their own email address in the invitation form and clicks "Send."

**Expected Outcome:**
System detects self-invitation and shows inline validation: "You're already a member of this organization." No email sent. No duplicate membership record.

**Failure Signal:**
Owner receives an invitation email to join their own org. Clicking it creates a duplicate membership or throws a 409 Conflict error page.

**Mitigations:**
- Client-side validation: compare invitation email against current user's email
- Server-side guard: reject invitation if email matches any existing member
- Deduplicate by email + org ID before insertion

---

### Situation #6 — Trial expiry during active onboarding
**Dimension:** Temporal | **Severity:** Medium

**Preconditions:**
- Org signed up 14 days ago on a 14-day free trial
- Owner is still configuring roles and hasn't invited anyone yet

**Situation:**
Trial expires at midnight UTC. Owner is actively on the "Invite Team" page at 11:59 PM UTC. At midnight, the trial expires — does the in-progress session get interrupted?

**Expected Outcome:**
Current session continues gracefully. Owner sees a non-blocking banner: "Your trial has ended. Upgrade to continue." Core onboarding actions are still available for 24 hours (grace period).

**Failure Signal:**
Owner is immediately locked out mid-session. Unsaved invitation drafts are lost. Or trial expiry silently blocks API calls with generic 403s.

**Mitigations:**
- Grace period (24-48h) after trial expiry for onboarding completion
- Non-blocking UI banner with upgrade CTA, not a hard lock
- Pre-expiry email sequence (3 days, 1 day, day-of)

---

## Chain It

### scenario → security
```bash
# Tenant isolation is a security-critical concern
/autoresearch:security
Scope: src/tenants/**, src/auth/**, src/billing/**
Focus: Cross-tenant data access, row-level security, invitation token security
Iterations: 15
```

### scenario → debug → fix
```bash
# Hunt for the bugs surfaced by scenario exploration
/autoresearch:debug
Scope: src/onboarding/**, src/tenants/**
Symptom: State transition bugs — incomplete onboarding, stale invitations, orphaned records
Iterations: 15

/autoresearch:fix --from-debug
Guard: npm test
Iterations: 20
```

### predict → scenario
```bash
/autoresearch:predict --chain scenario,security,fix
Scope: src/tenants/**, src/auth/**
Goal: Verify tenant isolation and onboarding resilience before launch
```

---

## Tips

**Always run with `--domain security` as a follow-up.** Multi-tenancy bugs are inherently security bugs — any data leakage is a P0 incident. Run the scenario first for breadth, then security audit for depth.

**Focus on permission + state transition dimensions.** The most dangerous SaaS onboarding bugs aren't crashes — they're silent data leaks from broken tenant boundaries, and state machines that allow impossible transitions (active user in deleted org).

**Test with adversarial org names.** Include `'; DROP TABLE orgs; --`, `<img src=x onerror=alert(1)>`, and Unicode RTL characters in your test fixtures. These surface escaping bugs across every output context.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
