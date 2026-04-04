# Scenario: Mobile Push Notifications

> Explore failure modes in push notification delivery: targeting, scheduling, opt-out compliance, rate limiting, deep linking, and cross-platform consistency.

---

## The Command

```
/autoresearch:scenario --domain product --depth standard --focus scale
Scenario: App sends push notifications to users — targeting by segments, scheduling delivery windows, handling opt-outs, deep linking into specific screens, and managing cross-platform delivery (iOS/Android)
Iterations: 25
```

---

## What This Explores

Push notifications are the highest-stakes communication channel in mobile apps — each one interrupts the user's day. Send too many and users disable notifications entirely (or uninstall). Send poorly targeted ones and engagement drops. Fail to respect opt-outs and you're violating platform policies (and potentially regulations). And deep links that open to wrong screens destroy trust.

**Key dimensions weighted:**
- **Scale** — sending to 5 million devices, delivery rate throttling, provider rate limits (APNs/FCM)
- **Temporal** — timezone-aware delivery, quiet hours, scheduled vs. triggered notifications
- **Data variation** — notification content truncation, emoji rendering, RTL text, dynamic personalization
- **Permission** — opt-out granularity, GDPR consent, iOS provisional notifications, Android channel management
- **Error** — expired device tokens, invalid APNs certificates, FCM quota exceeded

---

## Example Situations Generated

### Situation #1 — Notification delivered at 3:00 AM user's local time
**Dimension:** Temporal | **Severity:** High

**Preconditions:**
- Marketing team schedules a promotional push for 10:00 AM EST
- App has users across 24 timezones
- Notification system uses server time, not user's local timezone

**Situation:**
Users in Tokyo (UTC+9) receive the notification at 12:00 AM midnight. Users in Honolulu (UTC-10) receive it at 5:00 AM. Neither is an appropriate delivery time.

**Expected Outcome:**
System delivers notifications within each user's "active hours" window (default 8 AM - 9 PM local). Users outside the window receive the notification at the start of their next active window.

**Failure Signal:**
Users woken up by promotional push at 3 AM. Spike in notification opt-outs. 1-star app reviews mentioning "spam at night."

**Mitigations:**
- Store user timezone (from device locale or IP geolocation)
- Quiet hours enforcement: queue notifications outside active window, deliver at window open
- Allow users to set custom quiet hours in app settings
- Marketing team sees "Delivery will be staggered across timezones over 24 hours" in scheduling UI

---

### Situation #2 — Expired APNs device token causes silent delivery failure
**Dimension:** Error | **Severity:** High

**Preconditions:**
- User reinstalled the app 2 weeks ago (new device token generated)
- Backend still holds the old device token
- No token refresh mechanism running

**Situation:**
Push sent to old token. APNs returns error 410 (device token no longer active). Backend doesn't process the error response. Subsequent pushes continue failing silently. User wonders why they never get notifications.

**Expected Outcome:**
Backend processes APNs feedback. Token marked as invalid. On user's next app open, new token is registered. Notification retry with new token succeeds.

**Failure Signal:**
User never receives notifications. Support ticket: "I enabled notifications but I don't get any." Investigation reveals 15% of token database is stale.

**Mitigations:**
- Process APNs feedback service responses: remove/update invalid tokens immediately
- Token refresh on every app launch (client sends current token to backend)
- Weekly stale token cleanup job: ping tokens, remove non-responsive ones
- Monitoring dashboard: track delivery rate per platform, alert on drops >5%

---

### Situation #3 — User opts out of marketing but still receives promotional push
**Dimension:** Permission | **Severity:** Critical

**Preconditions:**
- User disabled "Marketing notifications" in app settings
- User kept "Order updates" enabled
- Marketing team sends a campaign to "all users with notifications enabled"

**Situation:**
Targeting query doesn't filter by notification category preference — only by OS-level notification permission. User receives a promotional push despite explicitly opting out of marketing.

**Expected Outcome:**
Push targeting respects category-level opt-outs, not just OS-level permission. Campaign system enforces: "Marketing segment: exclude users where marketing_opt_out = true."

**Failure Signal:**
Users who explicitly opted out receive marketing pushes. GDPR complaint filed (in EU markets). App store review flagged. Trust eroded.

**Mitigations:**
- Category-level opt-out stored server-side (not just client-side)
- Campaign targeting system enforces category filters as mandatory pre-send check
- Audit log: every notification sent records which consent categories were checked
- Pre-send validation report: "Targeting 500K users. 50K excluded by marketing opt-out."

---

### Situation #4 — Deep link opens wrong screen after app update
**Dimension:** State transition | **Severity:** Medium

**Preconditions:**
- Notification contains deep link: `myapp://product/12345`
- App v2.0 reorganized navigation — product screen moved from `/product/:id` to `/shop/product/:id`
- User hasn't updated the app yet when they receive the notification

**Situation:**
User on app v1.9 taps the notification. Deep link works (old route). User updates to v2.0, receives another notification with the same deep link format. This time, the route doesn't match — app opens to the home screen with no context.

**Expected Outcome:**
Deep link handler includes route migration: old routes redirect to new routes. `/product/12345` automatically resolves to `/shop/product/12345` on v2.0+.

**Failure Signal:**
User taps notification and lands on home screen with no connection to the notification content. User taps the notification again — same result. Engagement with deep-linked notifications drops 40% after the update.

**Mitigations:**
- Deep link route registry with backward-compatible aliases
- Universal links / App Links that resolve via server-side redirect (can be updated without app release)
- Fallback: if deep link route not found, show the notification content in a webview or search for the referenced entity

---

### Situation #5 — 5 million device campaign exhausts FCM quota
**Dimension:** Scale | **Severity:** High

**Preconditions:**
- Campaign targets 5 million Android users
- FCM (Firebase Cloud Messaging) has rate limits per project
- Campaign triggers at 10:00 AM, all 5M messages queued simultaneously

**Situation:**
FCM returns HTTP 429 (quota exceeded) after 500K messages. Backend retries immediately, hitting the quota again. Retry loop consumes resources. 4.5 million users don't receive the notification within the expected window.

**Expected Outcome:**
Backend implements rate-limited sending: batches of 100K with 10-second intervals. FCM 429 responses trigger exponential backoff with jitter. Progress dashboard shows: "2.5M / 5M delivered (50%). Rate limited — estimated completion: 45 minutes."

**Failure Signal:**
Campaign sent to only 10% of target audience. Retry storms cause backend instability. Other push notifications (transactional, real-time alerts) are also delayed by the marketing campaign backlog.

**Mitigations:**
- Rate-limited send queue with configurable throughput (messages/second)
- Priority lanes: transactional notifications bypass marketing campaign queue
- FCM/APNs quota monitoring with pre-campaign capacity check
- Staggered delivery: spread 5M sends over 1-2 hours instead of burst

---

### Situation #6 — Notification content truncated differently on iOS vs Android
**Dimension:** Data variation | **Severity:** Low

**Preconditions:**
- Marketing writes notification: "Flash sale! 50% off all electronics, home appliances, and outdoor gear — today only, ends at midnight! Use code SAVE50 at checkout."
- iOS truncates at ~178 characters (expanded view shows full text)
- Android truncates at ~65 characters in collapsed state

**Situation:**
On Android, users see: "Flash sale! 50% off all electronics, home appliances, and ou..." — the promo code and urgency are cut off. On iOS, the collapsed view shows more but still loses the code. Tap-through rate is 3x higher on iOS because iOS users see enough context to act.

**Expected Outcome:**
Notification content is structured with platform-aware formatting. Critical information (promo code, CTA) appears in the first 60 characters. Platform-specific fields used: Android `bigText` for expanded view, iOS `subtitle` for secondary line.

**Failure Signal:**
Android engagement rate significantly lower than iOS for the same campaign. A/B testing shows the copy performs well on iOS — the issue is truncation, not content quality.

**Mitigations:**
- Platform-specific notification templates: short title + expanded body
- Lint rule: promo codes and CTAs must appear in first 60 characters
- Preview tool in campaign builder showing iOS and Android rendering side-by-side
- Use structured notification fields (`title`, `subtitle`, `body`, `bigText`) instead of single message string

---

## Chain It

### scenario → debug
```bash
/autoresearch:debug
Scope: src/notifications/**, src/push/**
Symptom: Delivery failures — stale tokens, timezone mismatches, deep link routing, quota exhaustion
Iterations: 15
```

### scenario → security
```bash
# Audit notification system for consent compliance and data privacy
/autoresearch:security
Scope: src/notifications/**, src/consent/**, src/targeting/**
Focus: GDPR consent enforcement, opt-out compliance, notification content injection, token security
Iterations: 10
```

### predict → scenario
```bash
/autoresearch:predict --chain scenario,debug,fix
Scope: src/notifications/**
Goal: Ensure push notification system handles scale, compliance, and cross-platform edge cases
```

---

## Tips

**Test with real device token lifecycle.** Token refresh, app reinstall, OS update, and device migration all affect delivery. Run a dedicated scenario: `/autoresearch:scenario --depth shallow --focus error` with `Scenario: Push notification device token lifecycle — registration, refresh, expiry, and cross-device migration`.

**Consent is not optional.** GDPR, CCPA, and platform policies (Apple ATT, Android notification channels) all impose consent requirements. Use `--domain security` for a follow-up run focused on consent compliance: any notification sent without proper consent is a regulatory risk.

**Monitor delivery rates, not just send rates.** A 100% send rate with a 60% delivery rate means 40% of your audience is invisible. Track: sent → delivered → opened → acted. Run `/autoresearch` with metric: "notification delivery rate %" to iteratively improve.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
