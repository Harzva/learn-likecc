# Scenario: Social Media Content Moderation

> Explore failure modes in automated content detection, human review queues, appeal workflows, false positive handling, and cross-platform enforcement.

---

## The Command

```
/autoresearch:scenario --domain product --depth standard --focus edge-cases
Scenario: User posts content that triggers automated moderation — detection, action, notification, appeal, and resolution
Iterations: 25
```

---

## What This Explores

Content moderation is a decision system where every failure mode has public consequences — over-moderate and you censor legitimate speech; under-moderate and harmful content stays visible. The system must handle adversarial inputs, appeal workflows, and scaling across millions of posts while maintaining consistency.

**Key dimensions weighted:**
- **Edge case** — borderline content, satire vs. hate speech, context-dependent meaning
- **Abuse** — circumvention techniques, coordinated campaigns, adversarial text mutations
- **Scale** — viral content spreading faster than review queues can process
- **Permission** — moderator access scope, user appeal rights, escalation authority
- **State transition** — appeal during re-review, content restored then re-flagged, account suspension mid-appeal

---

## Example Situations Generated

### Situation #1 — Satire misclassified as hate speech
**Dimension:** Edge case | **Severity:** High

**Preconditions:**
- User posts a satirical article mocking a political position
- ML classifier detects hate speech keywords out of context

**Situation:**
Post is auto-removed within 30 seconds. User has 50K followers. Followers see "content removed for violating community guidelines." Screenshots of the removal go viral, creating a PR crisis about censorship.

**Expected Outcome:**
Borderline content is held for human review instead of auto-removed. If auto-removed, notification includes appeal link with 24h guaranteed response. Content is shadow-limited (reduced distribution) pending review, not fully removed.

**Failure Signal:**
Legitimate content removed permanently. User cannot appeal for 72+ hours. PR team becomes aware of the issue from external media before internal alerts.

**Mitigations:**
- Confidence threshold: auto-remove only above 95% confidence, hold for review between 70-95%
- Context window: classifier considers 3 surrounding posts for tone/intent signals
- Fast-track appeal queue for verified accounts or posts with high engagement

---

### Situation #2 — Unicode homoglyph bypass of word filter
**Dimension:** Abuse | **Severity:** High

**Preconditions:**
- Word filter blocks the term "scam" in promotional posts
- Platform processes text as raw Unicode

**Situation:**
Malicious user posts "ꜱᴄᴀᴍ" using small capital Unicode characters that visually appear identical to "SCAM" but are different codepoints. Filter doesn't match. Post reaches 100K users before manual report.

**Expected Outcome:**
Text normalization pipeline converts homoglyphs to ASCII equivalents before filter evaluation. "ꜱᴄᴀᴍ" normalizes to "scam" and triggers the filter.

**Failure Signal:**
Bypass technique spreads to other bad actors. Support team receives hundreds of reports for content the filter should have caught.

**Mitigations:**
- Unicode normalization (NFKD) + confusable character mapping before text classification
- Visual rendering comparison (screenshot text, OCR, compare to blocked terms)
- Behavioral signals: account age < 7 days + promotional language = elevated scrutiny

---

### Situation #3 — Viral harmful content outpacing review queue
**Dimension:** Scale | **Severity:** Critical

**Preconditions:**
- A post containing graphic violence is shared
- It gets 10,000 reshares in 5 minutes

**Situation:**
Human review queue processes 500 items/hour. By the time the original post is reviewed (45 minutes), it has 50,000 reshares. Each reshare is a separate queue item. The queue backs up to 8 hours.

**Expected Outcome:**
When original post is actioned, all reshares are automatically actioned (cascade removal). Viral velocity detection triggers priority escalation — posts with >1,000 reshares/hour jump to the front of the queue.

**Failure Signal:**
Original post removed but 50,000 reshares remain live. Users see "post removed" on the original but can still view reshared copies indefinitely.

**Mitigations:**
- Cascade action: removing a post propagates to all reshares and embeds
- Viral velocity detector: automatic escalation for content above spread threshold
- Content hash matching: identical/near-identical reshares auto-actioned without individual review

---

### Situation #4 — Appeal succeeds but content already screenshot and reported to media
**Dimension:** State transition | **Severity:** Medium

**Preconditions:**
- Post auto-removed for nudity (it was a medical education image)
- User files appeal
- Before appeal is resolved, a journalist screenshots the removal notice

**Situation:**
Appeal succeeds after 48 hours — content is restored. But the journalist has already published an article about censorship of medical content. The damage is done.

**Expected Outcome:**
Medical/educational content has a separate classification path with higher removal threshold. Appeal resolution time for high-visibility cases is <4 hours, not 48.

**Failure Signal:**
Reputational damage from a correct appeal decision that arrived too late. Standard SLA for appeals doesn't account for public visibility.

**Mitigations:**
- Priority lanes for appeals on content with high engagement or media attention
- Domain-specific classifiers: medical, educational, artistic contexts evaluated separately
- Proactive outreach to appealing users for high-visibility cases

---

### Situation #5 — Coordinated reporting to silence a user
**Dimension:** Abuse | **Severity:** High

**Preconditions:**
- User posts a controversial but policy-compliant opinion
- Organized group files 500 reports against the post within 1 hour

**Situation:**
Volume-based escalation triggers: 500 reports auto-escalate the post to "likely violation." Content is removed pending review. By the time review completes (content found compliant), the user's thread is dead — no engagement recovery.

**Expected Outcome:**
System detects coordinated reporting patterns (burst of reports from accounts with shared characteristics). Coordinated reports are flagged and downweighted. Content is not auto-actioned based on report volume alone.

**Failure Signal:**
Policy-compliant content regularly removed via coordinated report abuse. Users learn they can silence opponents by organizing mass reports.

**Mitigations:**
- Report clustering detection: reports from accounts created in same week, same IP range, or same social graph
- Reporter reputation score: reports from trusted reporters weighted higher
- Volume-based escalation requires diverse reporter sources (different graph clusters)

---

## Chain It

### scenario → debug
```bash
/autoresearch:debug
Scope: src/moderation/**, src/classifiers/**, src/appeals/**
Symptom: Edge cases from scenario — Unicode bypass, cascade failures, coordinated abuse detection
Iterations: 15
```

### scenario → security
```bash
# Audit for abuse vectors and privilege escalation in moderation tools
/autoresearch:security
Scope: src/moderation/**, src/admin/**
Focus: Moderator privilege escalation, coordinated abuse, classifier bypass techniques
Iterations: 15
```

### predict → scenario (adversarial)
```bash
/autoresearch:predict --adversarial --chain scenario,debug,fix
Scope: src/moderation/**
Goal: Harden content moderation against adversarial bypass and abuse
```

---

## Tips

**Use `--focus edge-cases` for moderation.** The highest-impact moderation failures are almost always edge cases — borderline content, context-dependent meaning, and cultural sensitivity. The obvious cases are easy; the edge cases define your platform's reputation.

**Run a separate `--domain security` scenario for abuse vectors.** Adversarial actors actively study your moderation system. A security-focused scenario run surfaces bypass techniques (homoglyphs, invisible characters, image steganography) that product-focused runs miss.

**Moderation is a product problem, not just a technical one.** Use `--domain product` to generate scenarios in user-story language. This produces output your trust & safety team can review directly — not just your engineers.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
