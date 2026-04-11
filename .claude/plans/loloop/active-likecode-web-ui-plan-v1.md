# LikeCode Web UI Plan v1

Status: active  
Scope: continuously improve LikeCode Web UI, AI terminal experience, and the agent-management panel using repo-local implementation work plus strong reference evidence from `reference/`.

## Current focus

- [x] Identify the highest-value Web UI / agent-management pattern we should borrow next
- [x] Use `reference/reference_cc_ui/hermes-webui/` and `reference/reference_cc_ui/claudecodeui/` as the first bounded source pair for a session-visibility pass
- [x] Continue the LikeCode Web UI line with the next operator-control or agent-management slice after the new session-stack overview pass
- [x] Keep Task 9 active with the next bounded operator-control or agent-management follow-up after the session-stack action shortcuts
- [x] Continue Task 9 with the next bounded follow-up after the new thread-lock shortcuts land in the session stack
- [x] Continue Task 9 with the next bounded follow-up after the session-stack action rows and focus controls get their narrow-screen fallback
- [x] Continue Task 9 with the next bounded follow-up after the new ownership / approval summary strip lands in the session stack
- [x] Continue Task 9 with the next bounded follow-up after the shell roster is regrouped into active / standby / closed session lanes
- [x] Continue Task 9 with the next bounded follow-up after the new desk-assignment ledger lands in the session stack
- [x] Continue Task 9 with the next bounded follow-up after the growing `Session Stack` gets explicit section hierarchy labels
- [x] Continue Task 9 with the next bounded follow-up after the new cross-session `Session Pulse` row lands under `Control Summary`
- [x] Continue Task 9 with the next bounded follow-up after the `Desk Assignments` rows gain dual assignment/approval badges
- [x] Continue Task 9 with the next bounded follow-up after the `Session Stack` panel head gains daemon/thread/shell headline badges
- [x] Continue Task 9 with the next bounded follow-up after the `Session Stack` gets an action-oriented `Attention Queue` for relay/thread/shell
- [x] Continue Task 9 with the next bounded follow-up after the `Session Stack` gets a compact `Session Identity` layer for daemon/thread/shell seats
- [x] Continue Task 9 with the next bounded follow-up after the `Shell Roster` gets workspace labels derived from `cwd`
- [x] Continue Task 9 with the next bounded follow-up after the `Shell Roster` header gets a compact runtime summary
- [x] Continue Task 9 with the next bounded follow-up after the `Session Stack` header gets a compact ownership cue
- [x] Continue Task 9 with the next bounded follow-up after the `Session Stack` header also surfaces shell standby pressure
- [x] Mark the current LikeCode session-stack micro-wave locally deferred after the latest header follow-ups because further frontend-only additions are now low-yield without a new reference signal or backend capability gap
- [x] Reopen Task 9 for one bounded site-facing teaching pass once the frontend micro-wave is deferred, so the existing `Session Stack` layers read like an explicit operator-control contract instead of a pile of UI tweaks
- [x] Continue Task 9 with one bounded approval-boundary teaching pass after the five-layer operator-control contract landed

## Main product areas

- [ ] Web UI information architecture
- [ ] AI terminal / workspace flow
- [ ] agent list, session list, and status visibility
- [ ] operator control surfaces
- [ ] event history, observability, and debugging UX
- [ ] multi-pane / multi-tab coordination

## Strong reference set

- [x] `reference/reference_cc_ui/claudecodeui/`
- [x] `reference/reference_cc_ui/hermes-webui/`
- [x] `reference/reference_cc_ui/hermes-hud/`
- [x] `reference/reference_agent/reference_control-agent-cli/opencode/`
- [x] `reference/reference_agent/reference_control-agent-cli/anomalyco-opencode/`
- [x] `reference/reference_agent/reference_control-agent-cli/OfficeCLI/`
- [x] `reference/reference_agent/hermes-agent/`
- [x] `reference/reference_agent/multica/`

## What to extract

- [ ] terminal and pane layout patterns
- [x] session / thread visibility patterns
- [ ] agent-management surfaces
- [ ] daemon / task / runtime status presentation
- [ ] safety controls and approval boundaries
- [ ] workflow shortcuts that improve operator speed

## Expected outputs

- [x] UI improvement pass in a local LikeCode-facing surface:
  - add a reference-backed `Session Stack` operator overview to `site/topic-codex-loop-console.html`
- [x] UI follow-up pass in the same surface:
  - add operator shortcuts and shell-focus actions so the session stack is actionable instead of read-only
- [x] UI follow-up pass in the same surface:
  - add `Readonly / Writable` quick actions so thread protection can be changed from the session stack overview
- [x] UI follow-up pass in the same surface:
  - harden the new session-stack action rows and focus controls for narrow-screen debugging
- [x] UI follow-up pass in the same surface:
  - add a compact daemon/thread/shell ownership summary strip so operator control and approval state can be scanned without hopping between panes
- [x] UI follow-up pass in the same surface:
  - regroup the shell roster into `active / standby / closed` lanes and add shell metrics so multi-session state reads more like lightweight session management than a flat list
- [x] UI follow-up pass in the same surface:
  - add a `Desk Assignments` ledger so `Overview / Thread Desk / Shell Lab` visibly declare which seat they currently own and can be reopened from one row
- [x] UI follow-up pass in the same surface:
  - add explicit section hierarchy labels so `Quick Actions / Control Summary / Desk Assignments / Surface Detail / Shell Sessions` stop reading like one undifferentiated block
- [x] UI follow-up pass in the same surface:
  - add a compact `Session Pulse` snapshot row so workspace, thread bind, daemon lane, and shell coverage are readable before the deeper assignment/detail layers
- [x] UI follow-up pass in the same surface:
  - upgrade `Desk Assignments` into dual-badge rows so assignment and approval/coverage context are both visible without reading the full note text
- [x] UI follow-up pass in the same surface:
  - upgrade the `Session Stack` title area into a three-badge headline summary for daemon/thread/shell instead of a single shell-count chip
- [x] UI follow-up pass in the same surface:
  - add an action-oriented `Attention Queue` so relay / thread / shell expose the next likely operator move instead of only reporting passive state
- [x] UI follow-up pass in the same surface:
  - add a compact `Session Identity` layer so daemon pid / current thread bind / active shell seat can be scanned before the verbose assignment ledger
- [x] UI follow-up pass in the same surface:
  - add workspace labels to shell roster cards so multi-session shell scanning does not depend on reading full `cwd` paths
- [x] UI follow-up pass in the same surface:
  - add a compact runtime summary to the shell roster header so the active session / workspace / pid can be scanned before entering the card list
- [x] UI follow-up pass in the same surface:
  - add a compact ownership cue to the `Session Stack` header so the hottest current lane is visible before entering the body
- [x] UI follow-up pass in the same surface:
  - extend the `Session Stack` headnote so it also exposes shell standby pressure instead of only naming the hottest current lane
- [ ] site-facing article or subtopic when a design pattern is worth documenting
- [x] site-facing article or subtopic when a design pattern is worth documenting:
  - turn the existing `Session Stack` implementation into a five-layer operator-control contract on `site/topic-codex-loop-console.html`
- [x] site-facing article or subtopic when a design pattern is worth documenting:
  - add one approval-boundary ladder clarifying why ownership guard, action approval, and artifact review should not be flattened into one generic “safe / unsafe” state on `site/topic-codex-loop-console.html`
- [ ] evolution notes tying specific references to specific UI decisions

## Destination hints

- [ ] `site/topic-codex-loop-console.html`
- [ ] existing agent / loop / terminal related site topics
- [ ] future LikeCode Web UI topic if this grows large enough

## Validation

- [ ] Keep code changes locally verifiable
- [ ] Keep site / md parity valid when site docs are updated
- [ ] Name the borrowed pattern and its source repo in the evolution note

## Notes

- This is the canonical checklist for LikeCode Web UI and agent-management evolution
- Prefer bounded passes: one reference pattern, one concrete UI improvement, one validated result
- Current local state: the recent `Session Stack` / `Shell Roster` refinement chain is locally deferred until a new reference-backed gap, stronger agent-management requirement, or backend capability change appears
- Current local state: the frontend micro-wave is still deferred, but the page now also has one explicit teaching layer explaining `Quick Actions -> Attention Queue -> Session Identity -> Desk Assignments -> Shell Roster` as a control-surface reading order
- Current local state: the latest bounded teaching follow-up now also spells out an approval ladder from `OpenCode / OfficeCLI / Hermes Agent`; do not reopen this page again unless a stronger backend approval surface or genuinely new operator-control reference appears
