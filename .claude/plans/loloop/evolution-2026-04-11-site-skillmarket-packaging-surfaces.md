# evolution-2026-04-11-site-skillmarket-packaging-surfaces.md

## Plan

- path: `.claude/plans/loloop/active-reference-mining-topics-plan-v1.md`
- milestone: 在 Task 8 的首个已落地目的地里，把“仓库证据面”继续收紧成可执行的包装面对照
- bounded target: 为 `topic-skillmarket` 增加一个简洁对照，说明回到 GitHub 后应如何区分 skill bundle 与 plugin bundle 的审核重点

## Completed

- updated `site/topic-skillmarket.html` with one new packaging-surface table comparing `baoyu-skills` and `codex-plugin-cc`
- updated `site/md/topic-skillmarket.md` with the matching summary so the page now distinguishes skill-bundle review from plugin-bundle review
- updated the dedicated Task 8 plan so the first packaging-oriented extraction is explicit instead of only implied by the repo-evidence note

## Failed or Deferred

- no browser render pass was run in this iteration
- no new topic page was opened; this pass stayed bounded to deepening the same Skill 市场专题 destination
- no Zhihu task was attempted in this iteration

## Decisions

- keep working inside `topic-skillmarket` because the current reference pair still has one more high-value teaching distinction: “skill marketplace bundle” and “plugin command bundle” are not the same packaging surface
- use `baoyu-skills` for the marketplace-bundle side because its `.claude-plugin/marketplace.json`, per-skill `SKILL.md`, and publishing docs are all explicit
- use `codex-plugin-cc` for the plugin-bundle side because its marketplace entry, nested plugin metadata, commands, agents, skills, and tests make the command-surface packaging clear

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-skillmarket-packaging-surfaces.md first, then continue Task 8 by reading .claude/plans/loloop/active-reference-mining-topics-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the reference-mining line because it remains the active loop task. The most likely next move is one more bounded reference-backed pass such as deciding whether the current Skill 市场专题 subthread is now ready for a local defer decision, or choosing the next explicit destination from the remaining reference patterns without opening a new major topic too early. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check GitHub Pages because this pass changes site-facing files.
```
