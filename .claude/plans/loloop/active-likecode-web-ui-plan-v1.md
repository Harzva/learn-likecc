# LikeCode Web UI Plan v1

Status: active  
Scope: continuously improve LikeCode Web UI, AI terminal experience, and the agent-management panel using repo-local implementation work plus strong reference evidence from `reference/`.

## Current focus

- [x] Identify the highest-value Web UI / agent-management pattern we should borrow next
- [x] Use `reference/reference_cc_ui/hermes-webui/` and `reference/reference_cc_ui/claudecodeui/` as the first bounded source pair for a session-visibility pass
- [x] Continue the LikeCode Web UI line with the next operator-control or agent-management slice after the new session-stack overview pass
- [x] Keep Task 9 active with the next bounded operator-control or agent-management follow-up after the session-stack action shortcuts
- [x] Continue Task 9 with the next bounded follow-up after the new thread-lock shortcuts land in the session stack
- [ ] Continue Task 9 with the next bounded follow-up after the session-stack action rows and focus controls get their narrow-screen fallback

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
- [ ] site-facing article or subtopic when a design pattern is worth documenting
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
