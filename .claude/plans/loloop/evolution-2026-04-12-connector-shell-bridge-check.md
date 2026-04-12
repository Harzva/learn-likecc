# evolution-2026-04-12-connector-shell-bridge-check.md

## Plan

- path: `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- milestone: connector shell / enforcement hook
- bounded target: 给 `bridge_lock_rule / delivery_guardrail` 增加一个最小 `bridge check`，让 relay 能基于 daemon、thread lock、connector state 给出 direct-inject 判定

## Completed

- added `POST /api/connector/bridge/check`
- the relay now returns:
  - `allow_direct_inject`
  - `decision`
  - `reason`
  - `suggested_action`
- the workspace connector shell now exposes a `Check Guardrail` action and shows the latest decision inline
- updated the design note so guardrails are no longer just static contract fields

## Failed or Deferred

- did not add a real delivery worker in this pass
- did not wire connector guardrail decisions into `thread/send` hard enforcement in this pass
- did not promise a real WeChat runtime in this pass

## Decisions

- keep the current delivery decision at `no separate worker yet`; the relay-visible contract is enough for now
- use `bridge check` as the minimum enforcement hook before any real external connector runtime is considered
- prefer switching away from Task 15 next unless a clearly stronger final pre-runtime enforcement slice appears

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-connector-shell-bridge-check.md first. Task 15 now has five bounded passes: connector shell UI, mock QR relay contract, explicit runtime-lane separation, bridge guardrails, and a minimal `bridge check` enforcement hook. Choose exactly one next bounded move from the remaining recurring pool. Prefer switching away from Task 15 unless there is a clearly stronger final pre-runtime enforcement slice than the other active plans; otherwise pick the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
