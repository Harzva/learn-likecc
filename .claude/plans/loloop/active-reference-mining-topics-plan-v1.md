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
- [x] Choose `topic-agent-comparison` as the next bounded site-facing destination because the remaining `feynman / ChatDev / multica` references fit its runtime-topology scope
- [x] Add one repo-backed runtime-shell note so “Subagents vs Agent Teams” is grounded in concrete reference projects rather than staying purely abstract
- [x] Add one adjacent coordination-mode clarification so the three runtime shells also map back to distinct default collaboration styles
- [x] Mark the current `topic-agent-comparison` subthread locally deferred after the runtime-shell and coordination-mode passes because the next likely additions would be lower-signal taxonomy churn
- [x] Choose `topic-codex-loop-console` as the next bounded site-facing destination because `hermes-webui`, `claudecodeui`, and `hermes-hud` fit its operator-surface and session-visibility scope
- [x] Add one repo-backed operator-surface note clarifying why session browser, multi-session workbench, and operator HUD should not be treated as one generic AI shell
- [x] Mark the current `topic-codex-loop-console` subthread locally deferred after the operator-surface pass because another immediate pass would now be lower value than switching to a fresh reference destination
- [x] Choose `topic-agent-hot` as the next bounded site-facing destination because `OfficeCLI` fits the curated-hot format and adds an artifact-control CLI pattern that is missing from the current page
- [x] Add one repo-backed `OfficeCLI` hotspot note clarifying why document-control CLIs are a distinct agent tool surface, not just another coding shell
- [x] Mark the current `topic-agent-hot` subthread locally deferred after the `OfficeCLI` hotspot pass because another immediate pass would now be lower value than switching to a fresh reference destination
- [x] Choose `topic-agent` as the next bounded site-facing destination because the refreshed hotspot lane should be reflected back into the main Agent hub entry copy
- [x] Add one hub-entry sync note clarifying that `技术热点` now also covers official-source projects like `Hermes Agent` and artifact-control CLIs like `OfficeCLI`
- [x] Mark the current `topic-agent` subthread locally deferred after the hub-entry sync because another immediate pass would now be lower value than switching to a fresh reference destination
- [x] Choose `topic-ai-cli-agent` as the next bounded site-facing destination because the remaining `OpenCode / OfficeCLI / Claude Code / Codex / Qwen Code` references fit its CLI-shell scope directly
- [x] Add one repo-backed CLI shell-type note clarifying why workflow-complete terminal shells, TUI-first open shells, and artifact-control CLIs should not be taught as one flat bucket
- [x] Mark the current `topic-ai-cli-agent` subthread locally deferred after the CLI shell-type pass because another immediate pass would now be lower value than switching to a fresh reference destination
- [x] Choose `topic-ai-coding-tools` as the next bounded site-facing destination because the new CLI shell-type distinction should flow back into the higher-level tool taxonomy
- [x] Add one coding-tools hub sync note clarifying that the CLI Agent bucket now points to multiple shell types rather than one flat terminal route
- [x] Mark the current `topic-ai-coding-tools` subthread locally deferred after the CLI taxonomy sync because another immediate pass would now be lower value than switching to a fresh reference destination

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
- [x] First bounded destination on this line:
  - `site/topic-agent-comparison.html`
  - `site/md/topic-agent-comparison.md`
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
- [x] Current explicit destination for the second bounded pass:
  - `site/topic-agent-comparison.html`
  - `site/md/topic-agent-comparison.md`
- [x] Current explicit destination for the third bounded pass:
  - `site/topic-codex-loop-console.html`
  - `site/md/topic-codex-loop-console.md`
- [x] Current explicit destination for the fourth bounded pass:
  - `site/topic-agent-hot.html`
  - `site/md/topic-agent-hot.md`
- [x] Current explicit destination for the fifth bounded pass:
  - `site/topic-agent.html`
  - `site/md/topic-agent.md`
- [x] Current explicit destination for the sixth bounded pass:
  - `site/topic-ai-cli-agent.html`
  - `site/md/topic-ai-cli-agent.md`
- [x] Current explicit destination for the seventh bounded pass:
  - `site/topic-ai-coding-tools.html`
  - `site/md/topic-ai-coding-tools.md`

## What to extract for LikeCode

- [ ] session and thread visibility
- [x] bounded extraction on the operator-surface line:
  - distinguish session browser, multi-session workbench, and operator HUD before deciding what the local `Session Stack` should become
- [ ] terminal and pane layout patterns
- [ ] multi-agent control and delegation surfaces
- [x] bounded extraction on the artifact-control line:
  - distinguish document / artifact control CLIs from generic coding shells before treating all “agent CLI” references as the same surface
- [x] bounded extraction on the hub-alignment line:
  - reflect fresh hotspot scope back into the main Agent entry surface so leaf-page intake does not stay invisible at the hub level
- [x] bounded extraction on the CLI-shell line:
  - distinguish workflow-complete terminal shells, TUI-first open shells, and artifact-control CLIs before teaching “CLI Agent” as one category
- [x] bounded extraction on the tool-taxonomy line:
  - reflect the CLI shell-type distinction back into the higher-level AI coding-tools map so top-level categories do not flatten the subtopic
- [x] first bounded extraction on the multi-agent line:
  - distinguish research-agent CLI shells, workflow-orchestration shells, and managed-agent platform shells before treating all “agent teams” as one runtime shape
- [x] second bounded extraction on the multi-agent line:
  - distinguish single-entry role dispatch, configurable workflow orchestration, and long-lived teammate lifecycle as three different default coordination modes
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
- Current broader local state: the recent Task 8 wave is locally deferred until a stronger new reference family, repo cluster, or clearer destination appears; do not keep forcing fresh pages out of the same exhausted sample set
- First bounded Task 8 output landed in the Skill 市场专题 rather than opening a new topic, because the new `baoyu-skills` / `codex-plugin-cc` references directly strengthen the existing trust-chain explanation
- Current local state: the `topic-skillmarket` subthread is locally deferred until a new packaging reference, a stronger market-installation gap, or a better skills-ecosystem destination appears
- Second bounded Task 8 destination is now `topic-agent-comparison`, using `feynman`, `ChatDev 2.0`, and `Multica` to ground runtime-topology differences in repo evidence
- Current local state: the `topic-agent-comparison` subthread is locally deferred until a stronger multi-agent runtime gap, a better repo cluster, or a clearer site destination appears
- Third bounded Task 8 destination is now `topic-codex-loop-console`, using `hermes-webui`, `claudecodeui`, and `hermes-hud` to separate session browser, workbench, and operator-HUD surfaces before the local AI Terminal drifts into a generic “agent UI” bucket
- Current local state: the `topic-codex-loop-console` subthread is locally deferred until a stronger operator-UX pattern, CLI-control gap, or clearer site destination appears
- Fourth bounded Task 8 destination is now `topic-agent-hot`, using `OfficeCLI` to show that an agent-oriented CLI can expose a full artifact control plane, embedded `SKILL.md`, and live preview loop without being another general coding shell
- Current local state: the `topic-agent-hot` subthread is locally deferred until a stronger hotspot source, artifact-control pattern, or clearer site destination appears
- Fifth bounded Task 8 destination is now `topic-agent`, using a small hub-entry sync so the main Agent page advertises that the refreshed hotspot lane now covers official-source projects and artifact-control CLI patterns rather than only RSS-style blog summaries
- Current local state: the `topic-agent` subthread is locally deferred until a stronger hub-level intake, new subtopic destination, or clearer reference-backed gap appears
- Sixth bounded Task 8 destination is now `topic-ai-cli-agent`, using `OpenCode` and `OfficeCLI` to thicken the current `Claude Code / Codex / Qwen Code / MiniMax` framing into a clearer CLI shell-type comparison
- Current local state: the `topic-ai-cli-agent` subthread is locally deferred until a stronger CLI-control reference, new shell family, or clearer site destination appears
- Seventh bounded Task 8 destination is now `topic-ai-coding-tools`, using a small hub-sync pass so the top-level tooling map acknowledges the internal shell-type split already added to `topic-ai-cli-agent`
- Current local state: the `topic-ai-coding-tools` subthread is locally deferred until a stronger tooling-map intake, new tool family, or clearer reference-backed gap appears
