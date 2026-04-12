# evolution-2026-04-12-connector-shell-first-layer.md

## Plan

- path: `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- milestone: connector shell / WeChat bind 第一层
- bounded target: 决定 `codex-loop` 第一版 connector shell 先做到哪一层，并把这层最小 UI 壳落到 workspace app

## Completed

- decided that v1 connector shell should stay at `workspace app + local state` rather than promising a live WeChat protocol integration
- added a connector shell draft panel to `site/app-likecode-workspace.html`
- added local browser-persisted connector state in `site/js/likecode-workspace.js`
- exposed three first-layer fields:
  - `shell mode`
  - `bind status`
  - `target dialog`
- synced the first-layer decision into `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`

## Failed or Deferred

- did not add relay QR APIs in this pass
- did not touch `tools/codex_loop_web_relay.py` in this pass
- did not promise a real WeChat runtime in this pass

## Decisions

- first build the operator-facing connector shell before touching QR auth or conversation bridge contracts
- treat mock/local connector state as the safest first layer because it is easy to verify and does not over-commit the runtime design
- prefer `QR auth flow` contract design as the next Task 15 follow-up

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-connector-shell-first-layer.md first. Task 15 now has its first real product pass: `app-likecode-workspace` contains a connector shell draft panel with browser-persisted local state, and the plan now explicitly chooses `UI shell + local state` as the v1 layer. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 15 only if the next slice cleanly designs the `QR auth flow` relay contract or clarifies connector/runtime separation without forcing a real WeChat runtime; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
