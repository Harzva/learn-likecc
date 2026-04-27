Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md.
Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first,
then work from the task pool below.

Task types:
- temporary task:
  - a one-off task given by the user for immediate handling
  - do not add it into the recurring daemon loop task pool unless the user explicitly promotes it into a loop task
  - finish it once, report the result, and stop tracking it in the daemon prompt
- loop task:
  - a recurring task that should stay in the long-running task pool
  - eligible to be selected by future daemon ticks until it is completed, replaced, or explicitly removed

Interpretation rule:
- if the user explicitly says `临时任务`, treat it as temporary and do not persist it into the recurring pool
- if the user explicitly says `循环任务`, treat it as recurring and keep it in the pool
- if the user does not label the task type, prefer asking whether it should be temporary or recurring before changing the long-running prompt contract

Loop task format rule:
- every newly added loop task should default to the same structure:
  - keep the task text in `prompt.md` short
  - create a dedicated plan file under `.claude/plans/loloop/`
  - put detailed scope, checklist, status, and progress in that plan file
- do not keep long operational detail directly inside `prompt.md` once a task becomes a stable recurring task
- for a new loop task, prefer adding:
  - one short task entry in `prompt.md`
  - one dedicated `active-*-plan-v1.md` file

Loop rule:
- treat the items below as a task pool, not a single linear checklist
- keep explicit task continuity across ticks
- in each iteration, choose exactly one task that is currently the best next move
- if the previous loop task is not finished and not explicitly blocked, continue that same task first
- only pick a different task when the current one is completed, clearly blocked, downgraded by the user, or intentionally deferred with a written reason
- do not select tasks that are already marked `done`; treat them as closed unless the user explicitly reopens them
- prefer the task that is highest-value, lowest-risk, and easiest to verify locally
- keep each iteration bounded and finishable in one pass
- after the iteration, update the evolution note trail, prepare the next handoff, and after each successful iteration update GitHub
- when updating GitHub, also make sure GitHub Pages is updated or redeployed if the site-facing content changed

Meta-opt rule:
- when a bounded pass exposes a repeated loop-level inefficiency in selection, verification, publishing, or handoff, record exactly one short `loop improvement candidate` in the relevant plan or evolution note
- only promote a `loop improvement candidate` into `.codex-loop/prompt.md` after it has repeated or clearly improves the next tick
- keep prompt-level self-optimization short and operational; prefer rules that change future loop behavior rather than one-off content instructions

Task state rule:
- every loop task should be treated as having an implicit state: `active`, `blocked`, `deferred`, or `done`
- when a task becomes the current focus, mark it in the plan / evolution trail as the active task for the next tick
- do not abandon an active task just because a new task was added to the pool
- after an active task is marked `done`, the next tick may choose a new best-next task from the remaining pool
- `done` tasks are excluded from normal future selection; they should only re-enter the pool if the user explicitly reopens them or a new plan version replaces them
- if multiple remaining tasks are equally good after the active one is done, choose the most valuable one rather than random switching

Selection priority:
- first prefer tasks that unblock or strengthen the main site work
- then prefer tasks that produce publishable external artifacts
- avoid switching tasks mid-iteration unless the current choice is clearly blocked

Publishing rule:
- do not publish Zhihu articles late at night
- when a Zhihu article is ready, publish only during daytime hours between 08:00 and 23:00 local time
- if the current local time is outside that window, prepare everything needed for publishing, but defer the actual publish step until the allowed time window
- when the current local time is inside that window, give ready-to-publish Zhihu tasks a higher selection priority than usual so the loop has a better chance to finish the publish step in time
- when a new site topic, subtopic, or major page becomes mature enough to promote, remember to consider a matching Zhihu article or adaptation pass instead of leaving the result only on the site
- for site-derived Zhihu articles, prefer mature, older, visually rich, and already-polished topics; do not rush shallow or newly created topics into Zhihu just to fill the queue
- do not force every Zhihu article into one identical house style; choose or rotate a suitable style variant based on the topic, such as unpacked deep-dive, tool notebook, workflow recipe, field report, or hot-take summary
- avoid publishing multiple consecutive Zhihu articles with nearly the same opening cadence, section rhythm, and closing template unless the user explicitly wants strict template consistency
- recommendation-style articles are allowed, but Zhihu output must stay content-first: keep real technical substance, mechanism, method, code path, workflow, or principle in the body instead of writing pure praise / guide copy
- pure technical Zhihu articles are explicitly allowed and encouraged when the topic is better taught by principle, architecture, runtime, protocol, debugging path, or implementation logic than by recommending a page
- when an article cites repo code as evidence, do not stop at file paths alone; include short, relevant code excerpts in Markdown fenced blocks so the reader can see the mechanism directly
- use path references as provenance, but pair them with the actual snippet when the argument depends on implementation detail
- before any Zhihu publish, run one final copy audit with at least these four checks:
  - remove obvious AI-flavored template phrasing
  - make the article sound more professionally technical
  - keep the prose natural and human-readable instead of over-explained
  - keep claims evidence-backed and non-exaggerated

Examples:
- temporary task example:
  - optimize site traffic display such as topic visits and total visits
- loop task example:
  - use `$keyword-site-topic` to process keyword `XXX`: based on live web research, filter high-value articles and group them by topic, prefer official docs, original papers, original repos, and product pages as primary sources, then choose the most suitable existing site topic or hot page in learn-likecc to host the result, write a publish-ready Chinese Markdown draft into the appropriate `site/md/*.md`, insert `[插图提示词]` blocks where visual explanation helps, and append references and original-source links

In addition to the site-polish loop, keep the following two queued tasks available and execute them when the current bounded site pass is stable enough to branch into media work:

Task 1:
Please use `zhihu-publish` and first try to automatically publish:
`/home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md`
to Zhihu.

Requirements:
1. Check prerequisites first:
   - whether `wemedia/zhihu/cookies.json` exists and is usable
   - whether the article file exists
   - whether all local images referenced by the article exist
2. Choose the publishing pipeline according to repo skill rules:
   - if the Markdown contains local images, prefer the multimodal pipeline
   - if multimodal looks risky, run the text pipeline first as a stability baseline
3. Confirm the plan from repo evidence before publishing:
   - skill definition: `.claude/skills/zhihu-publish/SKILL.md`
   - article file: `wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md`
   - Zhihu style reference: `.claude/skills/gen-zhihu-article/SKILL.md`
   - publishing scripts: `wemedia/zhihu/`
4. If auto-publishing fails:
   - identify the failure stage clearly (cookie / selector / human verification / image upload)
   - keep debug evidence
   - give the safest fallback next step
5. Before publishing, run one final copy diagnosis:
   - remove AI-flavored template phrasing
   - tighten toward a more professional technical tone
   - improve readability and reduce over-explanation
   - verify that claims stay evidence-backed and not exaggerated
   - if the article reads mostly like a recommendation or praise post, rewrite it to add real technical substance before publishing
   - if the article relies on code evidence, make sure key code points are shown as short Markdown code excerpts rather than path-only references
   - use the dedicated `zhihu-copy-diagnose` skill or its local script; if it returns `BLOCK`, do not publish yet
6. If publishing succeeds:
   - return the Zhihu article URL or article ID
   - say which pipeline was used
   - update any relevant publish-record docs if needed

Task 2:
Please combine `gen-zhihu-article`, `webpage-screenshot-md`, and `zhihu-publish` to pick 1 to 3 site topics worth promoting, generate new Zhihu-style Markdown drafts, and publish when conditions allow.

Requirements:
1. Do topic selection first instead of writing immediately:
   - choose from `site/topic-*.html`
   - prefer topics that are structurally clear, visual, mature, and worth spreading
   - prioritize older, well-established topics with rich visuals; avoid newly created or shallow topics that are not yet deep or polished
2. Use repo evidence for topic selection:
   - topic source pages: `site/topic-*.html`
   - existing Zhihu articles: `wemedia/zhihu/articles/*.md`
   - Zhihu style template: `.claude/skills/gen-zhihu-article/SKILL.md`
   - webpage screenshot skill: `~/.codex/skills/webpage-screenshot-md/SKILL.md`
   - publishing chain: `.claude/skills/zhihu-publish/SKILL.md`
3. For each candidate topic, explain:
   - why it is worth promoting
   - which site page it maps to
   - whether a Zhihu article already exists
   - which visual sections or diagrams are worth capturing
4. After choosing a topic:
   - generate a new Zhihu Markdown draft under `wemedia/zhihu/articles/`
   - use a suitable Zhihu style variant instead of blindly repeating one fixed house style
   - prefer screenshots for strong visual modules instead of text-only description
5. If screenshots are needed:
   - use a local or published page for section-level capture
   - produce Markdown-ready image paths
6. Before publication, run one final copy diagnosis:
   - remove AI-flavored template phrasing
   - tighten toward a more professional technical tone
   - improve readability and reduce over-explanation
   - verify that claims stay evidence-backed and not exaggerated
   - use the dedicated `zhihu-copy-diagnose` skill or its local script; if it returns `BLOCK`, do not publish yet
7. If publication is approved:
   - continue with `zhihu-publish`
   - choose the safest viable publishing path

Task 3:
Please document and publish our Zhihu publishing workflow itself as a new article, and make the related skills independently publishable before the article goes live.

Requirements:
1. First turn the relevant workflow skills into independent GitHub-ready repositories under `exports/` when they are still only repo-local:
   - include the Zhihu publishing skill
   - include any directly relevant helper skill if it is part of the final article workflow
2. For each exported skill:
   - make it a standalone repository under `exports/`
   - ensure it has a usable README
   - commit it
   - push it to GitHub
3. Only after the repositories exist and their links are known, draft the Zhihu article about the end-to-end pipeline.
4. The article should explain the linked workflow clearly:
   - generating a Zhihu-style draft
   - generating or capturing visuals when needed
   - publishing or editing on Zhihu
   - using `codex-loop` to keep refining the pipeline
   - make the article technique-first and workflow-first, not a generic recommendation for the site
   - if a recommendation angle is present, keep it secondary to concrete implementation detail, failure handling, and publishable operating steps
   - when referencing scripts or skill internals, include compact code excerpts in Markdown so the article shows the mechanism instead of only naming files
5. The article must include repo evidence and links where appropriate:
   - the `codex-loop` repository
   - the exported Zhihu-related skill repositories
   - the local workflow files or scripts that prove the pipeline
6. Before publishing, verify that the article includes the final GitHub links rather than placeholder text.
7. Run one final copy diagnosis:
   - remove AI-flavored template phrasing
   - tighten toward a more professional technical tone
   - improve readability and reduce over-explanation
   - verify that claims stay evidence-backed and not exaggerated
   - use the dedicated `zhihu-copy-diagnose` skill or its local script; if it returns `BLOCK`, do not publish yet
8. If publication is approved:
   - publish with `zhihu-publish`
   - return the Zhihu link or article ID

Task 4:
Loop task: keep tracking Claude changelogs and turning worthwhile updates into site-ready topic drafts by following the dedicated plan file:
- `.claude/plans/loloop/active-claude-changelog-watch-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer primary sources and keep changelog-driven drafts aligned with the best-fit site topic page.

Task 5:
Loop task: keep advancing the Hermes Agent 庖丁解牛 line by following the dedicated plan file:
- `.claude/plans/loloop/active-hermes-unpacked-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Keep the Hermes unpacked topic aligned across:
   - `site/topic-hermes-unpacked.html`
   - `site/md/topic-hermes-unpacked.md`
   - `reference/reference_agent/hermes-agent/`

Task 6:
Loop task: keep expanding `VibePaper` as a rolling hub for autonomous research and paper-production systems by following the dedicated plan file:
- `.claude/plans/loloop/active-vibepaper-hub-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Keep the VibePaper hub aligned across:
   - `site/topic-vibepaper.html`
   - `site/md/topic-vibepaper.md`
   - `reference/reference_agent/`

Task 7:
Loop task: keep improving the local `codex-loop` AI Terminal by following the dedicated plan file:
- `.claude/plans/loloop/active-codex-loop-ai-terminal-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Keep the AI Terminal aligned across:
   - `site/topic-codex-loop-console.html`
   - `site/md/topic-codex-loop-console.md`
   - `tools/codex_loop_web_relay.py`

Task 8:
Loop task: keep mining `reference/` for interesting agent / CLI / UI ideas and turn them into new site subtopics or even new hub topics by following the dedicated plan file:
- `.claude/plans/loloop/active-reference-mining-topics-plan-v1.md`
- `reference/REFERENCE-STRUCTURE.md`

Execution rule:
1. Read that plan first.
2. Refresh `reference/REFERENCE-STRUCTURE.md` before a bounded pass:
   - compare the current `reference/` tree with the structure file
   - record any newly added repo
   - mark any repo that still has no clear site destination
3. Continue the current unchecked / active item instead of randomly switching.
4. If a new repo appears, or an existing repo still has no site-facing landing point, prioritize that gap over opening a lower-value parallel branch.
5. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
6. Prefer turning strong reference findings into:
   - a new subtopic article
   - a refreshed existing topic page
   - or a justified new major topic when the pattern is large enough

Task 9:
Loop task: keep improving LikeCode Web UI and the agent-management panel by following the dedicated plan file:
- `.claude/plans/loloop/active-likecode-web-ui-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer reference-backed improvements that help:
   - Web UI structure
   - AI terminal / workspace flow
   - agent session visibility
   - agent-management and operator control surfaces
   - local logo-asset system for tool walls: image-first with letter fallback

Task 10:
Loop task: keep improving the umbrella repo `everything-agent-cli-to-claude-code`, its related `*-plugin-cc` family story, and the matching site recommendation by following the dedicated plan file:
- `.claude/plans/loloop/active-everything-agent-cli-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer improvements that strengthen:
   - umbrella repo positioning
   - wrapper verification and runnable examples
   - clarity of the related plugin-family repos
   - site-facing recommendation and teaching copy

Task 11:
Loop task: keep the site-wide mind map and per-topic last-updated metadata synchronized by following the dedicated plan file:
- `.claude/plans/loloop/active-site-map-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/topic-site-map.html`
   - `site/md/topic-site-map.md`
   - `site/data/site-topic-index.json`
   - per-page `page:updated` metadata on `site/topic-*.html`

Task 12:
Loop task: keep the hot-topic intake layer healthy by following the dedicated plan file:
- `.claude/plans/loloop/active-hot-topic-watch-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `.claude/skills/hot-topic-curation/`
   - `site/data/hot-topic-sources.json`
   - `site/data/hot-topic-snapshot.json`
   - `site/topic-hot-watch.html`
   - routed hotspot pages such as `site/topic-agent-hot.html` and `site/topic-rag-hot.html`

Task 13:
Loop task: keep growing the independent LikeCode workspace app by following the dedicated plan file:
- `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/app-likecode-workspace.html`
   - `site/js/likecode-workspace.js`
   - `site/md/app-likecode-workspace.md`
   - `tools/codex_loop_web_relay.py`

Task 14:
Loop task: keep advancing the `codex-loop in sleep` line by following the dedicated plan file:
- `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/topic-codex-loop-in-sleep.html`
   - `site/md/topic-codex-loop-in-sleep.md`
   - `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/`
   - `.codex-loop/prompt.md`
   - `.claude/plans/loloop/`

Task 15:
Loop task: keep building the connector shell and WeChat bind line for `codex-loop` by following the dedicated plan file:
- `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/app-likecode-workspace.html`
   - `site/js/likecode-workspace.js`
   - `tools/codex_loop_web_relay.py`
   - `.codex-loop/prompt.md`
   - `.claude/plans/loloop/`

Task 16:
Loop task: keep growing the `Design/UI` line for deck pages, slides, programmatic video, and drawing/demo plugins by following the dedicated plan file:
- `.claude/plans/loloop/active-design-ui-topic-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/topic-design-ui.html`
   - `site/topic-design-ui-tutorial.html`
   - `site/topic-design-ui-unpacked.html`
   - `reference/reference_design_ui/`
   - drawing / demo plugin integration paths for the site and media workflow

Task 17:
Loop task: keep growing the paper-reading topic line by following the dedicated plan file:
- `.claude/plans/loloop/active-paper-reading-topic-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/topic-agent-papers.html`
   - `site/topic-paper-*.html`
   - `site/images/paper-reading/`
   - `reference/reference_paper/`
   - future paper-topic hubs and their analysis pages

Task 18:
Loop task: keep growing the GitHub achievements / badge line by following the dedicated plan file:
- `.claude/plans/loloop/active-github-achievements-topic-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/topic-github-achievements.html`
   - `site/md/topic-github-achievements.md`
   - `site/topic-toolchain.html`
   - `site/js/app.js`
   - future badge / icon references and usage guidance

Task 19:
Loop task: keep running the site-wide 文案体检 by following the dedicated plan file:
- `.claude/plans/loloop/active-site-copy-tone-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/index.html`
   - `site/topic-*.html`
   - `site/md/*.md`
   - developer-facing hub copy, hero copy, and navigation-adjacent explanations

Task 20:
Loop task: keep growing the Claude official resources translation line by following the dedicated plan file:
- `.claude/plans/loloop/active-claude-official-resources-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/topic-claude-official-resources.html`
   - `site/md/topic-claude-official-resources.md`
   - `docs/topic-claude-official-resources-rule.md`
   - `site/images/claude-official-resources/`
   - `tutorial.html`
5. Prefer this route order:
   - `Anthropic Engineering` for deep article translations
   - `Tutorials` for product-facing supplements
   - `Use Cases` for selective scenario writeups, not whole-shelf bulk translation

Task 21:
Loop task: keep promoting the diary line from `reference/diary.txt` into the site (keep the original voice) by following the dedicated plan file:
- `.claude/plans/loloop/active-diary-showcase-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `reference/diary.txt`
   - site diary / personal record pages or hubs
   - `site/md/`
   - `site/topic-*.html`

Task 22:
Loop task: keep auditing topic creation time and readability / quality uplift for new or weak topics by following the dedicated plan file:
- `.claude/plans/loloop/active-topic-quality-audit-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `site/topic-*.html`
   - `site/md/*.md`
   - `site/data/site-topic-index.json`
   - any topic metadata that records creation/update time

Task 23:
Loop task: keep building the `Claude Code Simulator` LivePPT demo line by following the dedicated plan file:
- `.claude/plans/loloop/active-claude-code-simulator-liveppt-plan-v1.md`

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer changes that keep these aligned:
   - `reference/reference_design_ui/LivePPT/`
   - `site/topic-design-ui.html`
   - `site/topic-design-ui-tutorial.html`
   - simulator demo outputs, prompts, and related showcase pages in the repo
