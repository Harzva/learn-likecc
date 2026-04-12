# evolution-2026-04-12-chatdev-generation-shift.md

## Plan

- path: `.claude/plans/loloop/active-site-detail-polish-v1.md`
- bounded target: switch cleanly from the deferred Task 9 logo wave to one bounded Task 8 reference-mining pass, and tighten `topic-agent-comparison` with a repo-backed note about the `ChatDev 2.0` generation shift

## Completed

- selected Task 8 as the new best-next recurring slice because Task 9 was already locally deferred and Task 8 still had active unchecked focus items
- updated `site/topic-agent-comparison.html` and `site/md/topic-agent-comparison.md`
- added one explicit generation-shift note clarifying that `ChatDev 2.0` should now be taught as a zero-code multi-agent orchestration platform rather than only as the older virtual-software-company script
- kept the change tightly scoped to the existing runtime-shell section instead of opening a new page or reworking the whole comparison article

## Failed or Deferred

- did not start a second Task 8 destination in the same pass; the iteration stayed locked to one already-good destination
- did not reopen other locally deferred plans such as Task 4 or Task 6

## Reference-backed decision

- `reference/reference_agent/ChatDev/README.md` states that `ChatDev 2.0 (DevAll)` is a `Zero-Code Multi-Agent Platform`
- the same README distinguishes that from `ChatDev 1.0 (Legacy)`, which is the older `Virtual Software Company` framing
- applied teaching decision: when we compare runtime shells, `ChatDev` should now be anchored on orchestration-platform semantics, not only on the older role-play metaphor

## Verification

- `python3 tools/check_site_md_parity.py`

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-chatdev-generation-shift.md first. Task 9's first logo wave is already locally deferred, and Task 8 has now been reopened with one bounded `topic-agent-comparison` generation-shift pass. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 8 only if there is another clear repo-backed site-facing output with an active unchecked focus item; otherwise choose the next highest-value, low-risk recurring slice with a clearer active frontier. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
