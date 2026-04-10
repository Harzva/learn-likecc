# evolution-2026-04-11-site-cc-release-watch-2101-cert-store.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- milestone: 持续推进 Claude Code 发版监督 recurring task
- bounded target: 基于同一组官方 changelog 来源，再给 `2.1.101` 补一个企业接入视角的单关键词切片，优先落 OS CA certificate store trust

## Completed

- added a bounded `OS CA trust` section to the release-watch page in both HTML and Markdown
- framed the change as an enterprise TLS proxy / trust-boundary compatibility improvement rather than a generic networking tweak
- added a new `[插图提示词]` block centered on the system CA store, enterprise proxy, and `CLAUDE_CODE_CERT_STORE=bundled` fallback
- updated the active loop plan to record this adjacent `2.1.101` slice

## Failed or Deferred

- no browser render pass was run in this iteration
- no third `2.1.101` keyword slice was added in this round
- no Zhihu publication work was attempted because local time was still outside the allowed 08:00 to 23:00 window

## Decisions

- `OS CA trust` was worth a dedicated slice because it opens a distinct “enterprise access layer” teaching angle that is different from the previous team-knowledge-transfer angle
- later Task 4 passes should only keep mining `2.1.101` if the next keyword adds a similarly distinct control-plane lesson rather than repeating the same enterprise-access theme

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-11-site-cc-release-watch-2101-cert-store.md first, then choose exactly one best-next task from the pool by prioritizing main site work. Good next options are either one more bounded Task 4 slice from 2.1.101 only if it adds another genuinely distinct teaching angle, or a controlled return to Task 6 if the VibePaper hub becomes the better next-site move. Update the evolution note trail, prepare the next handoff, and after a successful iteration publish the site commit so GitHub Pages redeploys. If any branch reaches a Zhihu-ready state, prepare it but defer the publish step until local time is back inside 08:00 to 23:00.
```
