# Scenario: Healthcare Appointment Scheduling

> Explore failure modes in patient appointment booking, cancellation, insurance verification, provider availability, and HIPAA-compliant data handling.

---

## The Command

```
/autoresearch:scenario --domain business --depth deep
Scenario: Patient books a medical appointment through an online portal — selects provider, picks available slot, verifies insurance, receives confirmation, with cancellation and rescheduling
Iterations: 35
```

---

## What This Explores

Healthcare scheduling sits at the intersection of temporal constraints (provider availability, insurance windows), regulatory requirements (HIPAA, consent), and human-critical outcomes (missed appointments = delayed care). Bugs here aren't just UX annoyances — they can affect patient outcomes and trigger compliance violations.

**Key dimensions weighted:**
- **Temporal** — appointment conflicts, insurance pre-auth expiry, no-show windows, timezone mismatches
- **Permission** — HIPAA data access, patient consent workflows, provider access scope
- **Concurrent** — double-booking, simultaneous slot selection, waitlist race conditions
- **Integration** — insurance API timeout, EHR sync failure, telehealth platform down
- **State transition** — cancel after check-in, reschedule during insurance pre-auth, no-show reversal

---

## Example Situations Generated

### Situation #1 — Double-booking from simultaneous slot selection
**Dimension:** Concurrent | **Severity:** Critical

**Preconditions:**
- Dr. Smith has one remaining slot at 2:00 PM Tuesday
- Patient A and Patient B both view the slot as available on their screens

**Situation:**
Both patients click "Book Now" within 2 seconds. Both requests arrive at the server. Without proper locking, both appointments are created for the same slot.

**Expected Outcome:**
First request succeeds. Second receives: "This slot was just booked. Here are nearby available times." No double-booking persisted.

**Failure Signal:**
Both patients receive confirmation emails. Provider's calendar shows two patients at 2:00 PM. Front desk discovers conflict at check-in.

**Mitigations:**
- Optimistic locking on appointment slots (version column, CAS operation)
- Slot reservation with 5-minute TTL during checkout flow
- Post-booking validation job that detects and resolves conflicts within 60 seconds

---

### Situation #2 — Insurance pre-authorization expires before appointment
**Dimension:** Temporal | **Severity:** High

**Preconditions:**
- Specialist appointment requires insurance pre-authorization
- Pre-auth approved with 30-day validity window
- Appointment scheduled for day 28

**Situation:**
Provider reschedules to day 35 due to emergency. Pre-auth is now expired. Patient arrives for appointment — insurance claim will be denied.

**Expected Outcome:**
System detects pre-auth expiry risk when rescheduling. Alerts: "Warning: Insurance pre-authorization expires on [date]. Rescheduling past this date requires new pre-auth." Blocks scheduling or flags for manual review.

**Failure Signal:**
Appointment proceeds without valid pre-auth. Insurance denies claim. Patient receives unexpected bill for $3,000+.

**Mitigations:**
- Pre-auth expiry check at booking AND rescheduling time
- Automated pre-auth renewal trigger 7 days before expiry
- Patient notification: "Your insurance authorization expires on [date] — please contact us if rescheduling"

---

### Situation #3 — Patient data exposed in appointment confirmation email
**Dimension:** Permission | **Severity:** Critical

**Preconditions:**
- Patient books appointment with a psychiatrist
- Confirmation email template includes provider specialty and appointment type

**Situation:**
Email is sent to patient's shared family email account. Subject line reads: "Appointment Confirmed — Dr. Johnson, Psychiatry, Depression Follow-up." Family members see the email.

**Expected Outcome:**
Email contains minimal PHI: "Appointment Confirmed — [Date] [Time]." No provider specialty, no diagnosis, no appointment type. Patient can opt into detailed emails in privacy settings.

**Failure Signal:**
HIPAA violation via email disclosure. Patient's mental health treatment is exposed to unauthorized individuals.

**Mitigations:**
- Default to minimal-disclosure email templates (date + time only)
- Patient-controlled detail level in communication preferences
- HIPAA compliance review of ALL outbound communication templates
- Secure patient portal for full appointment details (not email)

---

### Situation #4 — Timezone mismatch for telehealth appointment
**Dimension:** Data variation | **Severity:** Medium

**Preconditions:**
- Patient is in EST (UTC-5), provider is in PST (UTC-8)
- Patient books a telehealth appointment at "3:00 PM"

**Situation:**
System stores the appointment in UTC but displays in the viewer's local timezone. Patient sees 3:00 PM EST. Provider sees 12:00 PM PST. Calendar invite is generated in UTC. Patient's phone auto-converts to EST, but the reminder email says "3:00 PM" without timezone — provider interprets as their local time and joins at 3:00 PM PST (6:00 PM EST).

**Expected Outcome:**
All communications include explicit timezone: "3:00 PM EST / 12:00 PM PST." Calendar invite (ICS) uses UTC with correct VTIMEZONE. Reminder shows both patient and provider timezones.

**Failure Signal:**
Patient waits in telehealth room for 3 hours. Provider marks as no-show. Patient is charged a no-show fee for a timezone bug.

**Mitigations:**
- Store all times in UTC, display with explicit timezone labels
- Calendar invites include VTIMEZONE for both parties
- Confirmation email: "Your appointment at 3:00 PM Eastern Time (12:00 PM Pacific for Dr. Smith)"

---

### Situation #5 — Cancellation after insurance already billed
**Dimension:** State transition | **Severity:** High

**Preconditions:**
- Patient completes telehealth appointment
- Provider submits insurance claim within 5 minutes of appointment end
- Insurance processes the claim

**Situation:**
Patient calls 30 minutes later saying the telehealth session froze and they couldn't hear the provider for the last 15 minutes. They request cancellation/rebooking. But the insurance claim is already submitted.

**Expected Outcome:**
System handles as a "partial completion" — allows rebooking without double-billing. Original claim is amended or voided. Patient is not charged twice.

**Failure Signal:**
Patient is billed for both the incomplete and the rescheduled appointment. Insurance denies second claim as "duplicate service."

**Mitigations:**
- "Dispute" workflow for completed appointments (distinct from cancellation)
- Claim amendment API integration with insurance clearinghouse
- Grace period (24h) before claims are finalized for submission

---

### Situation #6 — Waitlist notification after patient already booked elsewhere
**Dimension:** State transition | **Severity:** Low

**Preconditions:**
- Patient joins waitlist for Dr. Smith (no availability for 3 weeks)
- Patient books with Dr. Jones in the meantime

**Situation:**
A slot opens with Dr. Smith. System sends waitlist notification to the patient. Patient accepts without realizing they already have a conflicting appointment with Dr. Jones.

**Expected Outcome:**
Waitlist acceptance checks for conflicts: "You have an existing appointment with Dr. Jones at 2:00 PM on the same day. Would you like to cancel that appointment and book with Dr. Smith instead?"

**Failure Signal:**
Patient ends up with two appointments on the same day. Misses one and is charged a no-show fee.

**Mitigations:**
- Conflict detection at waitlist acceptance time
- Auto-remove from waitlist when patient books a similar appointment
- Waitlist notification includes patient's existing appointment schedule for that day

---

## Chain It

### scenario → security
```bash
# HIPAA compliance audit on the scheduling system
/autoresearch:security
Scope: src/appointments/**, src/patients/**, src/notifications/**
Focus: PHI exposure, access controls, audit logging, HIPAA compliance
Iterations: 20
```

### scenario → debug → fix
```bash
/autoresearch:debug
Scope: src/appointments/**, src/insurance/**
Symptom: Temporal and state transition bugs — pre-auth expiry, double-booking, timezone mismatches
Iterations: 15

/autoresearch:fix --from-debug
Guard: npm test
Iterations: 20
```

### predict → scenario (comprehensive)
```bash
/autoresearch:predict --chain scenario,security,fix,ship
Scope: src/appointments/**
Goal: Ensure appointment scheduling handles all edge cases and is HIPAA-compliant before launch
```

---

## Tips

**Run with `--domain business` not `--domain software`.** Healthcare scheduling bugs are process bugs, not just code bugs. Business domain produces scenarios in stakeholder language that maps directly to compliance requirements and process documentation.

**Always follow up with a security audit.** Any system handling PHI (Protected Health Information) needs `/autoresearch:security` focused on data access, audit logging, and communication templates. HIPAA violations carry fines of $100-$50,000 per violation.

**Timezone is a first-class concern.** Telehealth has made timezone bugs a top-5 scheduling issue. Run a dedicated shallow scenario just for timezones: `/autoresearch:scenario --depth shallow --focus edge-cases` with `Scenario: Telehealth appointment across timezones including DST transition`.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
