# evolution-2026-04-12-codex-loop-in-sleep-ladder-diagram.md

## Plan

- path: `.claude/plans/loloop/active-codex-loop-in-sleep-plan-v1.md`
- milestone: give the `codex-loop in sleep` line one concrete structure artifact instead of leaving the five borrow lines as prose only
- bounded target: add one Mermaid ladder diagram that maps `ARIS` to `codex-loop in sleep` across workflow family, persistent wiki, meta optimize, watchdog, and cross-model review

## Completed

- added a new Mermaid key `codex-loop-in-sleep-ladder` in `site/js/app.js`
- inserted a main Mermaid figure into `site/topic-codex-loop-in-sleep.html` right after the existing prompt block so the five borrow lines are now visible as an actual structure map
- added a matching Markdown note in `site/md/topic-codex-loop-in-sleep.md` so the source text now records why the figure exists and how it reduces future reopen cost
- marked the Task 14 workflow-family / structure-diagram follow-up as completed in the dedicated plan

## Failed or Deferred

- did not add a second diagram for reviewer-role or watchdog-only detail because this pass stayed bounded to one structure artifact
- did not reopen the broader `watchdog` implementation line because the current high-value gap was presentation and structure, not runtime code

## Decisions

- treat the `codex-loop in sleep` line as locally healthier now that the five borrow lines have a concrete visual anchor instead of only prose
- prefer switching away from Task 14 on the next tick unless a clearly stronger `watchdog` or reviewer-role slice outranks the other active plans

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-codex-loop-in-sleep-ladder-diagram.md first. The `codex-loop in sleep` line now has a concrete Mermaid ladder diagram that turns the five ARIS borrow lines into a visible `ARIS vs codex-loop in sleep` structure map. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 14 unless there is a clearly stronger watchdog or reviewer-role slice than the other active plans; otherwise pick the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
