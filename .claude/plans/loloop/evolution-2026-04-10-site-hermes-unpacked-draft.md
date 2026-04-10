# evolution-2026-04-10-site-hermes-unpacked-draft.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 站点细节持续打磨
- bounded target: 从新增循环任务里切入 Hermes Agent，把它从热点提及提升为庖丁解牛轴下的第一版解构草稿

## Completed

- audited Hermes primary sources from the official site / docs, the upstream GitHub repo, and the local snapshot under `reference/reference_agent/hermes-agent/`
- chose `topic-hermes-unpacked.html` as the correct host page under the 庖丁解牛 axis
- created the first unpacked-topic HTML draft at `site/topic-hermes-unpacked.html`
- created the synchronized source draft at `site/md/topic-hermes-unpacked.md`
- updated `site/topic-paoding-jieniu.html` so Hermes Agent now appears as the third visible subtopic on the hub page
- verified the new draft contains the intended source anchors, references, and `[插图提示词]` blocks

## Failed or Deferred

- no browser render pass was run in this iteration
- no Zhihu publication work was attempted because local time was already outside the allowed 08:00 to 23:00 window
- the Hermes unpacked topic is still a first draft; no bespoke visuals or code-driven diagrams were added yet

## Decisions

- place Hermes under 庖丁解牛 rather than leaving it on a generic hot page, because the repo structure supports a real control-plane拆解 instead of a short blurb
- keep the first pass text-first and code-path-anchored; visual diagrams can be added in later iterations once the section structure is stable

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-10-site-hermes-unpacked-draft.md first, then choose exactly one best-next task from the pool by prioritizing main site work. The most likely next move is a second Hermes pass: tighten the unpacked draft with one concrete architecture diagram or one code-anchored section upgrade, update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
