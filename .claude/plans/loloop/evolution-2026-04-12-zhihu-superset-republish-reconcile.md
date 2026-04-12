# evolution-2026-04-12-zhihu-superset-republish-reconcile.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: daytime queued media publishing
- bounded target: execute the still-pointed Task 1 Superset Zhihu publish in the allowed window, then reconcile the task contract if the target already has a published record

## Completed

- re-read the repo-local Zhihu publish evidence from `.claude/skills/zhihu-publish/SKILL.md`, `.claude/skills/gen-zhihu-article/SKILL.md`, `wemedia/zhihu/README.md`, the target article, and the current `wemedia/zhihu/` scripts before executing the queued publish task
- rechecked that `wemedia/zhihu/cookies.json` exists, the target article exists, and all 8 local Markdown image paths still resolve under `wemedia/zhihu/images/`
- reused the already verified headful path and ran `HEADLESS=false xvfb-run -a node publish_article_multimodal.js ./articles/24-Superset解构外层调度-知乎图文.md`
- confirmed the current publish chain still succeeds end-to-end: cookie login, editor selectors, title/body fill, image upload, publish click, and final redirect all worked
- received a fresh published article URL from this rerun: `https://zhuanlan.zhihu.com/p/2026720924573902712`
- reconciled the queued media contract after the run by checking the existing evolution trail and confirming that `24-*` already had an earlier published record, so Task 1 should no longer be treated as an open queued publish target

## Failed or Deferred

- did not need the text-only fallback because the multimodal pipeline succeeded again on the first attempt
- did not overwrite the previously published Superset article in place because the queued task was framed as a direct publish attempt, not an edit-in-place request
- did not continue into another media publish in this same iteration because the bounded goal here was to clear and reconcile the stale Task 1 pointer

## Decisions

- treat Task 1 as completed and stale, not as a recurring ready-publish target
- keep `HEADLESS=false + xvfb-run + publish_article_multimodal.js` as the current safest image-rich Zhihu path in this environment
- loop improvement candidate: before executing a queued media publish, first grep the evolution trail for an existing published record of the same article and only republish if the user explicitly wants a new post or overwrite pass

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-zhihu-superset-republish-reconcile.md first. The stale queued Task 1 pointer for `24-Superset解构外层调度-知乎图文.md` has now been reconciled: the multimodal publish path still works, but the article already had a prior published record, so do not target `24-*` again unless the user explicitly asks for overwrite/edit behavior. Choose exactly one next bounded move from the remaining recurring pool. Because the daytime Zhihu window is still open, give another clearly ready media task publication-weighted priority if it is stronger than the non-media frontiers; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
