# evolution-2026-04-12-connector-shell-bridge-guardrail.md

## Plan

- path: `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- milestone: connector shell / bridge guardrail
- bounded target: 把 “daemon 与外部聊天入口不要同时写同一 thread” 收成显式的 `bridge_lock_rule / delivery_guardrail` 合同

## Completed

- expanded connector state with:
  - `bridge_lock_rule`
  - `delivery_guardrail`
- updated the workspace connector shell to expose three guardrail presets:
  - `daemon-holds-thread / queue-only`
  - `manual-unlock-before-inject / operator-ack`
  - `runtime-readonly-when-daemon-active / queue-gated`
- updated the design note so the bridge contract no longer stops at `mode / target / policy / status`

## Failed or Deferred

- did not add a real delivery queue worker in this pass
- did not wire connector guardrails into actual thread-send enforcement in this pass
- did not promise a real WeChat runtime in this pass

## Decisions

- treat `bridge_lock_rule` as the field that says who owns thread write safety
- treat `delivery_guardrail` as the field that says whether connector traffic stays queue-first or may proceed under stronger operator/runtime gates
- prefer a concrete delivery-layer decision next, before attempting any real external connector runtime

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-connector-shell-bridge-guardrail.md first. Task 15 now has four bounded passes: connector shell UI, mock QR relay contract, explicit runtime-lane separation, and bridge guardrails with `bridge_lock_rule / delivery_guardrail`. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 15 only if the next slice cleanly makes a concrete delivery-layer decision or pins one minimal enforcement hook without forcing a real WeChat runtime; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
