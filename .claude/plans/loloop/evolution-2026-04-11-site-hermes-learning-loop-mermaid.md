# evolution-2026-04-11-site-hermes-learning-loop-mermaid.md

## Plan

- path: `.claude/plans/loloop/active-hermes-unpacked-plan-v1.md`
- milestone: Hermes Agent 解构页从“一张六层主图”继续推进到“六层主图 + 学习闭环图”
- bounded target: 把 memory / skills 章节里的 learning-loop `[插图提示词]` 落成真实 Mermaid 图

## Completed

- updated `site/topic-hermes-unpacked.html` so the memory / skills section now contains a rendered Mermaid figure for the Hermes learning loop
- updated `site/md/topic-hermes-unpacked.md` with the same Mermaid source
- registered the new `hermes-learning-loop` diagram in `site/js/app.js`
- updated the dedicated Hermes plan and the umbrella site plan so Task 5 is now the active main-site line after the LikeCode defer decision

## Failed or Deferred

- no browser render pass was run in this iteration
- no second Hermes follow-up visual was added; this pass stayed bounded to one concrete learning-loop diagram
- no Zhihu task was attempted in this iteration

## Decisions

- choose Hermes over the remaining pool because it had a clear unfinished visual item and directly strengthens a main site topic page
- land the learning-loop Mermaid before further prose cleanup, because the memory / skills chapter had a ready-made `[插图提示词]` and this is easy to verify locally
- keep Task 5 active for the next tick; Hermes now has two real diagrams, but the page still has room for one more bounded structure or closeout pass

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-hermes-learning-loop-mermaid.md first, then continue Task 5 by reading .claude/plans/loloop/active-hermes-unpacked-plan-v1.md and choosing the next unchecked item from that dedicated plan. Stay on the Hermes line because it is now the active loop task again. The most likely next move is one more bounded Hermes pass such as tightening the final “what we can learn for our own stack” closeout, adding one more high-value Mermaid from the remaining gateway/session or execution-boundary prompt blocks, or improving the code-anchor scanability of the architecture chapter. Update both plans as needed, record the next evolution note, and after a successful iteration publish the commit and check GitHub Pages because this pass changes site-facing files.
```
