# active-site-detail-polish-v1.md

## Goal

Use small, low-risk iterations to keep improving the teaching quality and polish of the `site/` experience.

## Optimization pillars

Prioritize future iterations along these three lines:

- visual maturity
  - improve color discipline, spacing rhythm, card polish, and visual consistency
- professional clarity
  - improve terminology accuracy, explanatory strength, and teaching value of examples and diagrams
- layout rationality
  - improve section order, navigation flow, grouping, and mobile/desktop reading rhythm

## Current focus

Superset 解构页的 overview 组件细节优化。

## Success condition

- one concrete site detail is improved without breaking page structure
- the improvement is verified with at least one local check
- one evolution note records what changed and what the next small polish target should be

## Tasks

- [x] Reduce redundant `superset-overview.json` fetches in `site/js/superset-overview.js`
- [x] Add a lightweight loading state for Superset overview mounts
- [x] Verify the updated script with `node --check`
- [x] Preview another high-value site detail candidate and choose the next micro-iteration
- [x] Add a lightweight loading state for the Superset treemap mount
- [x] Verify the treemap script with `node --check`
- [x] Review the Superset knowledge-graph mount for the next micro-iteration
- [x] Add a lightweight loading state for the Superset knowledge-graph mount
- [x] Verify the knowledge-graph script with `node --check`
- [x] Choose one more Superset page candidate by optimization pillar and complete a visual-maturity pass
- [x] Replace ad-hoc inline styling on `site/topic-superset-unpacked.html` with scoped classes
- [x] Verify the Superset page no longer uses inline `style=` attributes
- [x] Inspect one more site-shell accessibility or mobile detail for the next micro-iteration
- [x] Improve mobile page-subnav accessibility state and dismissal behavior
- [x] Verify the site shell update with `node --check site/js/app.js`
- [x] Inspect one more high-value site-shell or page-layout detail for the next micro-iteration
- [x] Improve mobile site-sidebar accessibility state and dismissal behavior
- [x] Verify the sidebar update with `node --check site/js/app.js`
- [x] Current site shell is stable enough to branch into queued media work
- [x] Choose one more page-level visual-maturity candidate outside the Superset page
- [x] Replace bridge-page hero inline styling on `site/topic-claude-codex-bridge.html` with scoped classes
- [x] Verify the bridge page no longer uses inline `style=` attributes
- [x] Branch into the remaining queued media workflow work
- [x] Choose one more hub-page visual-maturity candidate after the media branch
- [x] Replace `topic-paoding-jieniu.html` inline layout styling with scoped classes
- [x] Verify the paoding hub page no longer uses inline `style=` attributes
- [x] Choose one more hub-page visual-maturity candidate after the paoding pass
- [x] Replace `topic-agent.html` inline layout styling with scoped classes
- [x] Verify the agent hub page no longer uses inline `style=` attributes
- [x] Choose one more hub-page visual-maturity candidate after the agent pass
- [x] Replace `topic-rag.html` inline layout styling with scoped classes
- [x] Verify the RAG hub page no longer uses inline `style=` attributes
- [x] Choose one more concept-page visual-maturity candidate after the RAG pass
- [x] Replace `topic-meta-agent.html` inline layout styling with scoped classes
- [x] Verify the meta-agent page no longer uses inline `style=` attributes
- [x] Choose one more article-page layout candidate after the meta-agent pass
- [x] Replace `topic-skillmarket.html` inline article layout styling with scoped classes
- [x] Verify the skillmarket page no longer uses inline `style=` attributes
- [x] Choose one more article-page layout candidate after the skillmarket pass
- [x] Replace `topic-personal-knowledge.html` inline article layout styling with scoped classes
- [x] Verify the personal-knowledge page no longer uses inline `style=` attributes
- [x] Choose one more hot-page layout candidate after the personal-knowledge pass
- [x] Replace `topic-rag-hot.html` inline layout styling with scoped classes
- [x] Verify the RAG hot page no longer uses inline `style=` attributes
- [x] Choose one more hot-page layout candidate after the RAG-hot pass
- [x] Replace `topic-agent-hot.html` inline layout styling with scoped classes
- [x] Verify the Agent hot page no longer uses inline `style=` attributes
- [x] Choose one more small page-layout candidate after the Agent-hot pass
- [x] Replace `topic-agent-papers.html` inline layout styling with scoped classes
- [x] Verify the Agent papers page no longer uses inline `style=` attributes
- [x] Choose the Hermes unpacked-topic task as the next main-site move from the recurring pool
- [x] Create the first `topic-hermes-unpacked` site draft under the 庖丁解牛 axis
- [x] Add Hermes Agent as a visible subtopic entry on `topic-paoding-jieniu.html`
- [x] Choose a second Hermes pass as the next bounded move after the draft landed
- [x] Add one code-anchored Hermes runtime-flow section to the unpacked draft
- [x] Verify the Hermes draft now includes the new runtime-flow anchors and nav hook
- [x] Choose a third Hermes pass focused on memory/skills boundaries
- [x] Add one code-backed Hermes memory/skills boundary table to the unpacked draft
- [x] Verify the Hermes draft now includes the new memory/skills anchors
- [x] Choose a fourth Hermes pass focused on gateway/session boundaries
- [x] Add one code-backed Hermes gateway/session boundary breakdown to the unpacked draft
- [x] Verify the Hermes draft now includes the new gateway/session anchor terms
- [x] Choose a fifth Hermes pass focused on environment backends and execution boundaries
- [x] Add one code-backed Hermes environment/backend boundary breakdown to the unpacked draft
- [x] Verify the Hermes draft now includes the new execution-boundary anchor terms
- [x] Choose a sixth Hermes pass focused on stack comparison and synthesis
- [x] Add one final Hermes synthesis section comparing Hermes to our Claude Code / Like Code / codex-loop split
- [x] Verify the Hermes draft now includes the new compare-stack anchor terms
- [x] Choose one Hermes visual pass focused on the six-layer architecture
- [x] Add one concrete Mermaid artifact for the Hermes six-layer structure
- [x] Verify the Hermes draft and `site/js/app.js` now include the new diagram key
- [x] Choose Task 4 as the next recurring main-site move after Hermes stabilized
- [x] Update the Claude Code release-watch topic with one new official changelog slice
- [x] Verify the release-watch draft now includes the new 2.1.98 and Monitor-tool anchors
- [x] Stay on Task 4 for one adjacent bounded changelog slice
- [x] Update the Claude Code release-watch topic with one new 2.1.97 status-line slice
- [x] Verify the release-watch draft now includes the new 2.1.97 and status-line anchors
- [x] Stay on Task 4 for one more bounded 2.1.98 keyword slice
- [x] Update the Claude Code release-watch topic with one new security-focused keyword note
- [x] Verify the release-watch draft now includes the new subprocess-sandbox and security anchors
- [x] Stay on Task 4 for one more bounded 2.1.98 keyword slice after the security note
- [x] Update the Claude Code release-watch topic with one new prompt-cache-focused keyword note
- [x] Verify the release-watch draft now includes the new dynamic-system-prompt and prompt-cache anchors
- [x] Shift from Task 4 to Task 6 after the 2.1.98 release-watch bundle stabilized
- [x] Add one four-question comparison frame to the VibePaper hub for the current anchor systems
- [x] Verify the VibePaper draft now includes the new control-plane / durable-state comparison anchors
- [x] Stay on Task 6 for one bounded new-candidate intake pass
- [x] Clone one new autonomous research / paper-production repo into `reference/reference_agent/`
- [x] Add one classified short-candidate note for the new repo to the VibePaper hub
- [x] Stay on Task 6 for one bounded VibePaper consolidation pass after the intake
- [x] Integrate `AI Scientist-v2` into the main four-question comparison frame and reading route
- [x] Verify the VibePaper draft now includes the new third-sample comparison anchors
- [x] Stay on Task 6 for one bounded teaching-clarity pass after the consolidation
- [x] Add one compact VibePaper section comparing research control-plane thickness across the three samples
- [x] Verify the VibePaper draft now includes the new control-plane-thickness anchors
- [x] Stay on Task 6 for one bounded micro-visual-structure pass after the thickness note
- [x] Add one compact thickness-summary table for protocol shell vs studio shell vs paper pipeline shell
- [x] Verify the VibePaper draft now includes the new shell-summary table anchors
- [x] Stay on Task 6 for one bounded visual pass after the shell-summary table
- [x] Add one concrete Mermaid artifact for the VibePaper shell comparison
- [x] Verify the VibePaper draft and `site/js/app.js` now include the new shell diagram key
- [x] Stay on Task 6 for one bounded controlled-intake pass after the shell visual
- [x] Clone one more strong-primary-source candidate into `reference/reference_agent/`
- [x] Add one four-question candidate note for `AIDE ML` without promoting it into the main sample table

## Guardrail

Keep each round bounded to one page or one UI component cluster.

## Next target candidates

- tighten one more detail on `site/topic-superset-unpacked.html`
- review another data-driven page for repeated fetch or loading-state gaps
- improve one small mobile or accessibility detail in the site shell
- choose the next pass by mapping it to one of the three optimization pillars above
