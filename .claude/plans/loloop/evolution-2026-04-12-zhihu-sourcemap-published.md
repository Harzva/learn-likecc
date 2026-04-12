# evolution-2026-04-12-zhihu-sourcemap-published.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: daytime publication-weighted media branch after closing the stale `24-*` Task 1 pointer
- bounded target: select one stronger unpublished topic draft, verify its local publish prerequisites, and publish it with the safest viable Zhihu pipeline

## Completed

- chose `wemedia/zhihu/articles/25-SourceMap源码专题-知乎图文.md` as the best next Task 2 candidate because it maps to the mature `topic-sourcemap` hub, already has a complete image-rich draft, and had no published record in the current evolution trail
- verified that the draft contains 8 local Markdown images and that all referenced files still exist
- rechecked the draft body and confirmed it behaves as a strong spreadable hub article rather than a stale or duplicate narrow note
- ran the preferred image-rich path `HEADLESS=false xvfb-run -a node publish_article_multimodal.js ./articles/25-SourceMap源码专题-知乎图文.md`
- successfully passed cookie login, editor selectors, image upload, and final publish
- published article URL: `https://zhuanlan.zhihu.com/p/2026724526382233468`

## Failed or Deferred

- did not need the text-only fallback because the multimodal pipeline succeeded on the first attempt
- did not publish a second media draft in the same iteration because this pass stayed bounded to one publish
- did not reopen non-media site work in this round because the daytime window still made one ready media artifact the stronger move

## Decisions

- after clearing a stale publish pointer, prefer the next bounded media move to be a mature unpublished hub-style draft rather than a weaker maintenance page
- keep treating `HEADLESS=false + xvfb-run + publish_article_multimodal.js` as the default safe Zhihu path for image-rich drafts in this environment
- treat the `25-*` SourceMap hub article as closed unless the user later asks for overwrite/edit behavior

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-zhihu-sourcemap-published.md first. The `25-SourceMap源码专题-知乎图文.md` draft has now been published successfully with the multimodal pipeline at `https://zhuanlan.zhihu.com/p/2026724526382233468`. Choose exactly one next bounded move from the remaining recurring pool. Because the daytime Zhihu window is still open, give another clearly ready unpublished media draft publication-weighted priority only if it is stronger than the current non-media frontiers; otherwise switch back to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
