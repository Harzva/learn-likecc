# Scenario: IoT Firmware Updates

> Explore failure modes in over-the-air (OTA) firmware updates: fleet management, rollback, connectivity loss mid-update, version compatibility, and bricked device recovery.

---

## The Command

```
/autoresearch:scenario --domain software --depth deep --focus recovery
Scenario: IoT device fleet receives over-the-air firmware update — download, verify, install, reboot, and report status back to management server
Iterations: 35
```

---

## What This Explores

Firmware updates to physical devices have unique constraints: no "undo" button, intermittent connectivity, heterogeneous hardware revisions, and bricked devices requiring physical intervention. A bad update to 10,000 devices in the field is an operational nightmare that can cost millions in truck rolls.

**Key dimensions weighted:**
- **Recovery** — bricked device, partial install, rollback to previous version, A/B partition switching
- **Error** — corrupt download, checksum mismatch, insufficient storage, incompatible hardware revision
- **Scale** — 50,000 devices updating simultaneously, CDN bandwidth, staggered rollout groups
- **Integration** — device management server down, certificate expiry, time-sync drift
- **Temporal** — update window constraints, battery level during install, scheduled maintenance windows

---

## Example Situations Generated

### Situation #1 — Power loss during firmware write
**Dimension:** Recovery | **Severity:** Critical

**Preconditions:**
- Battery-powered sensor device at 15% charge
- Firmware update downloads successfully and begins flash write

**Situation:**
Device battery dies at 60% through the firmware write. The active partition is partially overwritten and non-bootable.

**Expected Outcome:**
Device boots from the backup partition (A/B partition scheme). Reports "update failed — rolled back to v2.1.0" on next connection. Queues for retry when battery exceeds 40%.

**Failure Signal:**
Device is bricked — cannot boot from either partition. Requires physical access to reflash via JTAG/UART. If device is in a remote location (cell tower, pipeline sensor), truck roll costs $500+.

**Mitigations:**
- A/B partition scheme: never overwrite the running partition, write to inactive, swap on successful boot
- Minimum battery threshold (40%) enforced before starting update
- Watchdog timer: if new firmware doesn't reach "healthy" state within 90 seconds, auto-reboot to previous partition

---

### Situation #2 — Staggered rollout discovers bug at 5% deployment
**Dimension:** Scale | **Severity:** High

**Preconditions:**
- Fleet of 20,000 devices
- Rollout configured: 1% → 5% → 25% → 100% with health gate between stages

**Situation:**
1% rollout (200 devices) succeeds. 5% rollout (1,000 devices) shows 12% crash rate on devices with hardware revision B (different sensor chip). Revision A devices work fine.

**Expected Outcome:**
Health gate blocks promotion to 25%. Alert fires: "5% cohort failure rate 12% (threshold: 5%). Affected: hw_rev=B only." Rollout paused. Revision B devices auto-rollback. Revision A devices retain new firmware.

**Failure Signal:**
Health gate uses fleet-wide average (failure rate 3.5% across all revisions — below 5% threshold). Rollout promotes to 25%. 2,500 revision B devices crash. Firmware team discovers the issue from support tickets, not telemetry.

**Mitigations:**
- Segment health metrics by hardware revision, not just fleet-wide average
- Canary groups must include devices from each hardware revision
- Automatic rollback for affected segments, not all-or-nothing

---

### Situation #3 — Certificate expiry blocks update download
**Dimension:** Integration | **Severity:** High

**Preconditions:**
- Devices authenticate to update server via TLS with a pinned certificate
- Certificate was issued 364 days ago (expires tomorrow)

**Situation:**
Certificate expires at midnight UTC. Devices in UTC-8 timezone attempt updates at 10 PM local (6 AM UTC next day). TLS handshake fails. Devices retry every 30 minutes, creating a retry storm against the update server.

**Expected Outcome:**
Certificate rotation happened 30 days prior. Devices accept both old and new certificates during transition window. Monitoring alert fires at 30 days before expiry.

**Failure Signal:**
All devices lose ability to download updates. Retry storms overload the update server. The only fix is deploying a new certificate, but devices can't download the fix because... they can't connect.

**Mitigations:**
- Certificate rotation 60 days before expiry with dual-cert acceptance window
- Certificate expiry monitoring with alerts at 90, 60, 30, 7 days
- Fallback update mechanism (local network, USB) for certificate recovery scenarios
- Exponential backoff with jitter on retry to prevent thundering herd

---

### Situation #4 — Firmware downgrade attempt after security patch
**Dimension:** Permission | **Severity:** Critical

**Preconditions:**
- v2.3.0 patches a critical security vulnerability (CVE)
- All devices updated to v2.3.0

**Situation:**
An attacker with access to the device management API attempts to push v2.2.0 (vulnerable version) to the fleet, or a misconfigured automation script references the old version.

**Expected Outcome:**
Devices reject firmware versions older than the current "minimum version" (anti-rollback counter). API rejects downgrade requests: "Cannot deploy v2.2.0 — minimum version is v2.3.0 (security floor)."

**Failure Signal:**
Devices accept the downgrade. Security vulnerability is re-introduced across the fleet. Attacker can now exploit the known CVE.

**Mitigations:**
- Anti-rollback counter in secure boot: hardware fuse prevents booting firmware below minimum version
- Server-side minimum version enforcement: API rejects any deploy below the security floor
- Audit log for all firmware deploy requests with alerting on downgrade attempts

---

### Situation #5 — Update server overwhelmed by 50,000 simultaneous downloads
**Dimension:** Scale | **Severity:** High

**Preconditions:**
- All 50,000 devices are configured to check for updates at midnight UTC
- New firmware is published at 11:55 PM UTC

**Situation:**
At midnight, 50,000 devices simultaneously request the 25MB firmware binary. CDN bandwidth spikes to 1.25 TB. Devices on slow connections timeout and retry, amplifying the load.

**Expected Outcome:**
Devices use jittered check-in windows (midnight ± 2 hours random offset). CDN serves firmware from edge nodes. Server returns 429 with `Retry-After` header for overflow requests.

**Failure Signal:**
CDN origin overloaded. Devices receive partial downloads. Checksum validation fails. All devices retry simultaneously, creating cascading failure.

**Mitigations:**
- Randomized check-in window (each device offsets by 0-4 hours from configured time)
- CDN with multi-region edge caching for firmware binaries
- Server-side rate limiting with `Retry-After` headers and exponential backoff
- Delta updates (diff-based) to reduce download size by 80%

---

### Situation #6 — Time-sync drift causes scheduled update to fire during business hours
**Dimension:** Temporal | **Severity:** Medium

**Preconditions:**
- Retail POS devices configured to update at 2:00 AM local time (store closed)
- Device's internal clock has drifted 6 hours due to failed NTP sync

**Situation:**
Device clock reads 2:00 AM but actual time is 8:00 AM — store is open with customers. Device begins firmware update, reboots mid-transaction. Customer's payment is interrupted.

**Expected Outcome:**
Update scheduler cross-references NTP time, not just device clock. If NTP sync has failed for >24 hours, update is deferred and alert is raised. Active transaction detection blocks reboot.

**Failure Signal:**
POS device reboots during active transaction. Customer's payment fails. Store loses revenue. Support ticket describes "device randomly restarted."

**Mitigations:**
- Require successful NTP sync within 24 hours before allowing scheduled updates
- Application-level "busy" flag: update deferred while transactions are in progress
- Maintenance window validation: cross-check device clock against server time before proceeding

---

## Chain It

### scenario → security
```bash
# Audit firmware update security — signing, anti-rollback, supply chain
/autoresearch:security --focus firmware
Scope: src/ota/**, src/firmware/**, src/device-management/**
Focus: Firmware signing, anti-rollback, certificate management, supply chain integrity
Iterations: 20
```

### scenario → debug → fix
```bash
/autoresearch:debug
Scope: src/ota/**, src/fleet/**
Symptom: Recovery failures — bricked devices, partial updates, A/B partition issues
Iterations: 15

/autoresearch:fix --from-debug
Guard: make test
Iterations: 20
```

### predict → scenario (adversarial)
```bash
/autoresearch:predict --adversarial --chain scenario,security,fix
Scope: src/ota/**
Goal: Harden OTA update pipeline against supply chain attacks and firmware tampering
```

---

## Tips

**Recovery is the #1 dimension for IoT.** Unlike web apps where you can redeploy in minutes, a bricked IoT device may require physical access. Every scenario should answer: "what happens if this fails mid-update, and how does the device recover?"

**Test with `--focus recovery` and `--focus error` in separate runs.** Recovery scenarios (what happens after failure) and error scenarios (what causes failure) surface different bugs. Run both.

**Delta updates change the risk profile.** If your OTA uses binary diffs instead of full images, run a separate scenario: `/autoresearch:scenario --depth deep --focus edge-cases` with `Scenario: Delta firmware update where base version varies across fleet`. Delta updates introduce a new class of bugs — wrong base version, corrupt diff, partial application.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
