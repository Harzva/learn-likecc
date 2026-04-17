# evolution-2026-04-18-likecode-workspace-shell-roster-group-active-route.md

## Plan

- path: `.claude/plans/loloop/active-likecode-workspace-app-plan-v1.md`
- task: Task 13, independent LikeCode workspace app
- bounded target: keep improving the shell surface by connecting the roster list group to the active-seat routing explanation

## Completed

- added `workspace-shell-active-route-text` to the shell roster group's `aria-describedby`
- kept `workspace-shell-roster-pulse-text` on the same group so route context and live/closed counts travel together
- recorded the shell roster group active-route association in `site/md/app-likecode-workspace.md`
- updated the Task 13 plan trail with the landed pass and the next handoff

## Failed or Deferred

- no browser render pass was run in this iteration
- no relay, local-storage, or command execution behavior changed; this pass only adjusts static group context semantics

## Verification

- `node --check site/js/likecode-workspace.js`
- `python3 tools/check_site_md_parity.py`
- `python3 -m py_compile tools/codex_loop_web_relay.py`
- `git diff --check -- site/app-likecode-workspace.html site/md/app-likecode-workspace.md .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md .claude/plans/loloop/evolution-2026-04-18-likecode-workspace-shell-roster-group-active-route.md`

## Next Handoff

```text
Use codex-loop to continue the active Task 13 plan at .claude/plans/loloop/active-likecode-workspace-app-plan-v1.md. Continue the two-hundred-twenty-third bounded follow-up on structural shell-surface improvements, pick one small operator-control or explanation pass after the shell-roster group active-route association pass, update the evolution trail, verify locally, commit, and push.
```
