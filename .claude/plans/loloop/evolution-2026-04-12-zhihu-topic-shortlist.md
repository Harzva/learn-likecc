# evolution-2026-04-12-zhihu-topic-shortlist.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: keep the overnight loop moving while Zhihu publication remains time-blocked
- bounded target: use one bounded Task 2 pass to choose the next 1 to 3 site topics worth Zhihu promotion, without generating another draft yet

## Completed

- treated the queued Zhihu publish as still time-blocked because the local time remained outside the allowed `08:00-23:00` window
- used the overnight pass for Task 2 topic selection instead of reopening the now-ready `36-*` workflow article for more wording churn
- reviewed current `site/topic-*.html` candidates against the existing `wemedia/zhihu/articles/*.md` coverage to avoid selecting pages that already have a strong dedicated Zhihu draft
- shortlisted `site/topic-vibepaper.html` as the strongest next promotion candidate because it already has a clear comparison spine, multiple concrete visuals, and no existing dedicated VibePaper Zhihu article
- shortlisted `site/topic-codex-loop-console.html` as the second candidate because the page is structurally clear and original, even though it would need a screenshot-first capture pass rather than relying on pre-existing diagrams
- shortlisted `site/topic-autoresearch-unpacked.html` as the third candidate because it has a clean five-layer teaching structure, but it ranks behind the first two due to overlap with earlier Autoresearch / Superpowers media coverage

## Candidate mapping

| Candidate | Site page | Why it is worth promoting | Existing Zhihu article status | Visual sections worth capturing |
| --- | --- | --- | --- | --- |
| `VibePaper` | `site/topic-vibepaper.html` | strong comparison frame, timely autonomous-research angle, already mature enough to teach three main samples plus one candidate lane | no dedicated VibePaper article yet | hero, main sample vs candidate lane diagram, shell comparison Mermaid, four-question comparison table |
| `codex-loop AI Terminal` | `site/topic-codex-loop-console.html` | highly original local operator-desk angle, strong workflow/tooling identity, good fit for screenshot-led Zhihu explanation | no dedicated article yet | local terminal overview, `Session Stack`, `Attention Queue`, `Desk Assignments`, shell roster layers |
| `Autoresearch / ARIS 解构` | `site/topic-autoresearch-unpacked.html` | clear five-layer structure and strong teaching value for research-loop protocols | no dedicated unpacked article yet, but related coverage already exists in article `21` | hero, five-layer structure section, protocol vs studio comparison, command-surface section |

## Failed or Deferred

- did not generate a new Zhihu draft in this pass because the user instructions for Task 2 explicitly prefer topic selection before writing
- did not capture screenshots yet because the shortlist itself was the bounded target, and only `topic-codex-loop-console` clearly needs a screenshot-first branch before drafting
- did not publish anything because the local time was still outside the allowed publication window

## Decisions

- keep `topic-vibepaper` as the strongest next Task 2 destination because it best balances page maturity, structural clarity, visual strength, and novelty relative to existing Zhihu coverage
- keep `topic-codex-loop-console` as the strongest fallback when a more tool-first, screenshot-led media artifact is preferable to another long conceptual article
- keep `topic-autoresearch-unpacked` on the shortlist, but behind the first two candidates because the media lane already contains adjacent Autoresearch coverage

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-zhihu-topic-shortlist.md first. If the local time is inside the allowed Zhihu window, resume Task 1 by publishing /home/clashuser/hzh/item_bo/learn-likecc/wemedia/zhihu/articles/24-Superset解构外层调度-知乎图文.md with the multimodal pipeline first. If the local time is still outside the window, do not reopen the now-ready `36-*` workflow article; the strongest next media move is to start Task 2 drafting from `site/topic-vibepaper.html`, unless a clearer stronger site or media slice appears. Update the relevant plan, record one new evolution note, and publish the commit. GitHub Pages only needs checking if site-facing files changed.
```
