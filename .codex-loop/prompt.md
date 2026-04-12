Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md.
Read .claude/plans/loloop/evolution-2026-04-10-site-superset-overview-cache.md first,
then work from the task pool below.

Task types:
- temporary task:
  - a one-off task given by the user for immediate handling
  - do not add it into the recurring 10-minute loop task pool unless the user explicitly promotes it into a loop task
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
- prefer the task that is highest-value, lowest-risk, and easiest to verify locally
- keep each iteration bounded and finishable in one pass
- after the iteration, update the evolution note trail, prepare the next handoff, and after each successful iteration update GitHub
- when updating GitHub, also make sure GitHub Pages is updated or redeployed if the site-facing content changed

Task state rule:
- every loop task should be treated as having an implicit state: `active`, `blocked`, `deferred`, or `done`
- when a task becomes the current focus, mark it in the plan / evolution trail as the active task for the next tick
- do not abandon an active task just because a new task was added to the pool
- after an active task is marked `done`, the next tick may choose a new best-next task from the remaining pool
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
5. If publishing succeeds:
   - return the Zhihu article URL or article ID
   - say which pipeline was used
   - update any relevant publish-record docs if needed

Task 2:
Please combine `gen-zhihu-article`, `webpage-screenshot-md`, and `zhihu-publish` to pick 1 to 3 site topics worth promoting, generate new Zhihu-style Markdown drafts, and publish when conditions allow.

Requirements:
1. Do topic selection first instead of writing immediately:
   - choose from `site/topic-*.html`
   - prefer topics that are structurally clear, visual, mature, and worth spreading
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
   - follow the repo's existing Zhihu house style
   - prefer screenshots for strong visual modules instead of text-only description
5. If screenshots are needed:
   - use a local or published page for section-level capture
   - produce Markdown-ready image paths
6. If publication is approved:
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
5. The article must include repo evidence and links where appropriate:
   - the `codex-loop` repository
   - the exported Zhihu-related skill repositories
   - the local workflow files or scripts that prove the pipeline
6. Before publishing, verify that the article includes the final GitHub links rather than placeholder text.
7. If publication is approved:
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

Execution rule:
1. Read that plan first.
2. Continue the current unchecked / active item instead of randomly switching.
3. After each bounded pass:
   - mark progress in the plan file
   - check off any completed item
   - record the result in the evolution trail
4. Prefer turning strong reference findings into:
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
