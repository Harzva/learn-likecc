# Scenario: Cross-Border Wire Transfers

> Explore failure modes in international wire transfers: compliance screening, currency conversion, correspondent banking, fraud detection, reconciliation, and sanctions enforcement.

---

## The Command

```
/autoresearch:scenario --domain security --depth deep
Scenario: Customer initiates a cross-border wire transfer — compliance screening, currency conversion, routing through correspondent banks, and reconciliation with recipient confirmation
Iterations: 35
```

---

## What This Explores

Cross-border transfers are one of the most regulated, multi-party processes in software. A single transaction touches compliance (AML/KYC/sanctions), currency markets (FX rates that change by the second), correspondent banking networks (SWIFT/intermediary banks), and fraud detection — all with regulatory deadlines and financial penalties for failures.

**Key dimensions weighted:**
- **Abuse** — sanctions evasion, structuring (smurfing), money laundering patterns
- **Permission** — transaction limits, dual approval thresholds, beneficiary verification
- **Integration** — SWIFT network timeout, correspondent bank rejection, FX rate expiry
- **Temporal** — cut-off times, value date mismatch, holiday calendar differences
- **Error** — IBAN validation failure, intermediary bank fee deduction, partial credit

---

## Example Situations Generated

### Situation #1 — Sanctions list updated mid-transaction
**Dimension:** Abuse | **Severity:** Critical

**Preconditions:**
- Customer initiates $50,000 wire to a business in Country X
- Compliance screening passes at 10:00 AM
- At 10:15 AM, OFAC updates the SDN list, adding the recipient entity

**Situation:**
Transaction is queued for SWIFT transmission at 10:30 AM. The compliance check passed 30 minutes ago but the sanctions list has since changed. If transmitted, the bank is in violation of sanctions law.

**Expected Outcome:**
Re-screening against updated sanctions lists occurs at every state transition (initiation, approval, transmission, settlement). Transaction is caught at the pre-transmission gate: "Hold — recipient added to SDN list at 10:15 AM. Transaction blocked pending compliance review."

**Failure Signal:**
Transaction is transmitted to SWIFT without re-screening. Bank discovers the violation during post-transaction monitoring, 24 hours later. Regulatory reporting obligation triggered. Potential fine: $1M+.

**Mitigations:**
- Re-screen at every state transition, not just at initiation
- Real-time sanctions list subscription with webhook push notifications
- Automatic hold on all pending transactions when sanctions list updates, released after re-screening

---

### Situation #2 — FX rate expires between quote and execution
**Dimension:** Temporal | **Severity:** High

**Preconditions:**
- Customer requests USD → EUR conversion for a €100,000 transfer
- FX desk quotes rate 1.0850 with 30-second validity window

**Situation:**
Customer reviews the quote, enters approval code, and clicks confirm at second 32 — two seconds after the rate expired. Market has moved to 1.0870 (unfavorable for the bank).

**Expected Outcome:**
System detects expired rate. Shows: "Rate has expired. New rate: 1.0870 (€100,000 = $108,700). Previous quote was $108,500. Accept new rate?" Customer can accept or request a new quote.

**Failure Signal:**
System executes at the expired rate (1.0850), and the bank absorbs the $200 loss. Or system executes at current market rate without informing the customer, causing a complaint.

**Mitigations:**
- Rate validity enforced server-side with cryptographic timestamp (not client-side timer)
- Automatic re-quote with clear comparison to original quote
- Rate lock-in option: customer pays a small premium for a 5-minute guaranteed rate

---

### Situation #3 — Correspondent bank deducts unexpected fee
**Dimension:** Integration | **Severity:** Medium

**Preconditions:**
- Transfer of $10,000 from Bank A (US) to Bank C (Thailand) via intermediary Bank B (Singapore)
- Customer selected "OUR" (sender pays all fees)

**Situation:**
Bank B deducts a $25 intermediary fee from the transfer amount. Recipient bank C receives $9,975 instead of $10,000. Recipient expected exactly $10,000 and flags it as a short payment.

**Expected Outcome:**
System pre-calculates expected fees for the routing path and warns: "Intermediary fees of approximately $25-50 may apply. Recipient may receive $9,950-$9,975." Or: system adds buffer to outgoing amount to cover intermediary fees.

**Failure Signal:**
Recipient receives less than expected. Customer complaint filed. Reconciliation team spends 2 hours investigating the $25 discrepancy.

**Mitigations:**
- Fee estimation based on historical data for each correspondent bank in the routing path
- Pre-transfer disclosure: "Estimated intermediary fees: $25-50. Recipient will receive approximately $9,950-$9,975"
- Option to send gross amount ($10,025) to ensure recipient receives exactly $10,000

---

### Situation #4 — Structuring detection across multiple accounts
**Dimension:** Abuse | **Severity:** Critical

**Preconditions:**
- Customer holds 3 accounts at the bank (personal checking, business, savings)
- Currency Transaction Report (CTR) threshold is $10,000

**Situation:**
Customer initiates: $9,500 wire from checking, $9,800 from business, and $9,700 from savings — all to the same beneficiary, all on the same day. Each transaction individually is below the CTR threshold.

**Expected Outcome:**
Transaction monitoring system aggregates transfers by: beneficiary + customer + time window. Detects pattern: same-day transfers to same beneficiary totaling $29,000 from related accounts. SAR (Suspicious Activity Report) alert generated. Transactions held pending compliance review.

**Failure Signal:**
Each transaction processes independently. No aggregation across accounts. Structuring pattern is not detected. Bank fails BSA/AML reporting obligation.

**Mitigations:**
- Cross-account aggregation in transaction monitoring (same beneficial owner, same beneficiary, rolling 24h window)
- Velocity checks: N transfers to same beneficiary within 24 hours triggers review
- Graph-based analysis: detect related accounts (shared address, phone, SSN) for aggregation

---

### Situation #5 — Holiday calendar mismatch causes value date rejection
**Dimension:** Temporal | **Severity:** Medium

**Preconditions:**
- US bank initiates wire on Friday to Japan
- Monday is a Japanese national holiday (not a US holiday)

**Situation:**
Transfer specifies value date of Monday (next business day in US). Japanese correspondent bank rejects: Monday is not a valid settlement date in JPY. Transfer bounces back with SWIFT rejection code.

**Expected Outcome:**
System checks BOTH originating and destination country holiday calendars when calculating value date. Automatically selects Tuesday as the value date. Customer sees: "Settlement date: Tuesday [date] (Monday is a holiday in Japan)."

**Failure Signal:**
Transfer fails. SWIFT rejection received 24 hours later. Customer is confused why their "next business day" transfer was rejected. Manual intervention required to resubmit.

**Mitigations:**
- Multi-country holiday calendar integration (originating, destination, intermediary, and currency settlement calendars)
- Pre-validation of value date against all relevant calendars before SWIFT submission
- Auto-adjustment to next valid date with customer notification

---

### Situation #6 — Dual approval timeout on high-value transfer
**Dimension:** Permission | **Severity:** Medium

**Preconditions:**
- Bank policy: transfers above $100,000 require dual approval (maker + checker)
- Maker initiates $250,000 transfer at 4:45 PM Friday

**Situation:**
Checker (approver) has left for the weekend. Approval request sits in queue. Customer expects the wire to settle Monday. Without dual approval, the transfer cannot be submitted to SWIFT until the checker approves — potentially Tuesday if Monday is the next business day.

**Expected Outcome:**
System shows estimated settlement date factoring in approval queue: "Pending dual approval. If approved by 5:00 PM Friday: settlement Monday. If approved Monday: settlement Tuesday." Escalation to backup approver after 2-hour timeout.

**Failure Signal:**
Customer believes transfer was sent Friday. It sits unapproved over the weekend. Settlement is delayed by 2 business days. Customer discovers the delay when checking with the recipient.

**Mitigations:**
- Automatic escalation to backup approver after configurable timeout (2 hours)
- Clear status tracking visible to customer: "Pending approval — 0 of 2 approvals received"
- Pre-submission approval: for known recurring transfers, allow pre-approved templates that bypass individual approval

---

## Chain It

### scenario → security (adversarial)
```bash
# Red-team the wire transfer system for fraud and compliance gaps
/autoresearch:security
Scope: src/transfers/**, src/compliance/**, src/fraud/**
Focus: Sanctions evasion, structuring detection, SWIFT message tampering, approval bypass
Iterations: 20
```

### scenario → debug → fix
```bash
/autoresearch:debug
Scope: src/transfers/**, src/fx/**, src/reconciliation/**
Symptom: Temporal issues — FX rate expiry, holiday calendar mismatches, value date rejections
Iterations: 15

/autoresearch:fix --from-debug
Guard: python -m pytest tests/transfers/
Iterations: 20
```

### predict → scenario (full pipeline)
```bash
/autoresearch:predict --adversarial --chain scenario,security,fix,ship
Scope: src/transfers/**
Goal: Ensure wire transfer system is compliant, fraud-resistant, and operationally resilient
```

---

## Tips

**Always use `--domain security` for financial scenarios.** Wire transfers are adversarial by nature — bad actors actively probe for compliance gaps. The security domain weights abuse and permission dimensions higher, surfacing structuring patterns, sanctions evasion, and approval bypasses that product-domain runs miss.

**Compliance is temporal.** Sanctions lists update daily, FX rates change by the second, and holiday calendars vary by country. Run a dedicated temporal scenario: `/autoresearch:scenario --depth deep --focus temporal` with `Scenario: Wire transfer value date calculation across multiple timezones and holiday calendars`.

**Reconciliation is where bugs hide.** The outgoing transfer may succeed, but reconciling the confirmation from the correspondent bank is a separate failure domain. Run: `/autoresearch:scenario --depth standard` with `Scenario: End-of-day reconciliation of 500 wire transfers with mismatches from correspondent bank confirmations`.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
