# Reference Mining Topics Plan v1

Status: active  
Scope: mine `reference/` for strong ideas around agent control, CLI orchestration, skills, Web UI, HUD, and multi-agent workflow design, then turn them into site-ready subtopics or larger topic expansions.

## Current focus

- [ ] Review the newly added reference repos and identify the strongest web UI / agent-control ideas that can help LikeCode
- [ ] Choose the first site-facing output:
  - a new subtopic article
  - an update to an existing topic page
  - or a justified new major topic
- [ ] Prefer insights that help our own `LikeCode` web UI, CLI control, or agent-management design
- [x] Choose `topic-skillmarket` as the first bounded site-facing output for the current reference-mining wave because the new skill/plugin references fit its “discovery -> GitHub validation -> install” spine
- [x] Add one repo-evidence note showing what a trustworthy skill/plugin repo should expose after SkillsMP discovery
- [x] Add one packaging-surface note explaining how to review skill bundles versus plugin bundles after GitHub handoff
- [x] Mark the current `topic-skillmarket` subthread locally deferred after the repo-evidence and packaging-surface passes because another pass on the same pair would now be lower value than switching to a fresh reference destination

## Newly added references

- [x] `reference/reference_agent/feynman/`
- [x] `reference/reference_agent/ChatDev/`
- [x] `reference/reference_agent/multica/`
- [x] `reference/reference_agent/reference_control-agent-cli/OfficeCLI/`
- [x] `reference/reference_agent/reference_control-agent-cli/anomalyco-opencode/`
- [x] `reference/reference_agent/reference_control-agent-cli/opencode/`
- [x] `reference/reference_cc_ui/hermes-webui/`
- [x] `reference/reference_cc_ui/claudecodeui/`
- [x] `reference/reference_cc_ui/hermes-hud/`
- [x] `reference/reference_skill/baoyu-skills/`
- [x] reuse existing local anchor: `reference/reference_agent/hermes-agent/`

## Evaluation questions

- [ ] Which repos have the most useful ideas for agent / CLI / terminal control?
- [ ] Which repos have the strongest ideas for web UI / HUD / session visibility?
- [ ] Which repos have reusable ideas for skills, workflows, or knowledge packaging?
- [x] First bounded packaging answer:
  - `baoyu-skills` is a strong skill-bundle / marketplace-packaging reference
  - `codex-plugin-cc` is a strong plugin-bundle / command-surface reference
- [ ] Which repos deserve their own article versus only a comparison mention?

## Likely article directions

- [ ] LikeCode Web UI inspiration set:
  - `claudecodeui`
  - `hermes-webui`
  - `hermes-hud`
  - `opencode`
- [ ] Agent control / CLI orchestration comparison:
  - `OfficeCLI`
  - `opencode`
  - `multica`
  - `feynman`
- [ ] Multi-agent workflow / research studio comparison:
  - `ChatDev`
  - `multica`
  - `feynman`
- [ ] Skills / plugin packaging reference:
  - `baoyu-skills`
  - `hermes-agent`

## Site destination rules

- [ ] Prefer existing major topics first when the fit is clear:
  - Agent
  - 庖丁解牛
  - VibePaper
  - AI Terminal / Loop lab
- [ ] Open a new major topic only when the reference pattern is clearly broader than a single article
- [ ] Keep the destination page explicit before drafting
- [x] Current explicit destination for the first bounded pass:
  - `site/topic-skillmarket.html`
  - `site/md/topic-skillmarket.md`

## What to extract for LikeCode

- [ ] session and thread visibility
- [ ] terminal and pane layout patterns
- [ ] multi-agent control and delegation surfaces
- [ ] skills / plugins / knowledge packaging
- [x] first bounded extraction:
  - distinguish skill bundle packaging from plugin bundle packaging before deciding how a GitHub repo should be audited
- [ ] safety and approval boundaries
- [ ] event history, observability, and operator UX

## Validation

- [ ] Keep `python3 tools/check_site_md_parity.py` passing after each site-writing pass
- [ ] Use primary repo evidence instead of vague summary
- [ ] Leave clear local repo paths in the final article or topic notes

## Notes

- This plan is the canonical checklist for turning `reference/` discoveries into site content
- Favor bounded passes: inspect one pattern family, choose one site destination, produce one concrete improvement
- First bounded Task 8 output landed in the Skill 市场专题 rather than opening a new topic, because the new `baoyu-skills` / `codex-plugin-cc` references directly strengthen the existing trust-chain explanation
- Current local state: the `topic-skillmarket` subthread is locally deferred until a new packaging reference, a stronger market-installation gap, or a better skills-ecosystem destination appears
