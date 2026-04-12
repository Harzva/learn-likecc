# evolution-2026-04-12-connector-shell-runtime-separation.md

## Plan

- path: `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- milestone: connector shell / runtime separation
- bounded target: 把 `mock flow / adapter flow / external runtime` 收成 relay 可保存、workspace 可见的 lane 结构，并明确 `runtime owner / write policy`

## Completed

- expanded connector state with:
  - `runtime_owner`
  - `write_policy`
- updated the workspace connector shell to expose three runtime lanes:
  - `mock-flow / workspace-shell / local-draft`
  - `adapter-flow / relay-adapter / single-thread-bind`
  - `external-runtime / connector-runtime / queue-gated`
- turned lane selection into operator actions instead of leaving the separation only in the plan prose

## Failed or Deferred

- did not define inbound / outbound conversation bridge fields in this pass
- did not add a delivery queue or watchdog layer in this pass
- did not promise a real WeChat runtime in this pass

## Decisions

- use `runtime owner` to express which layer currently owns protocol/runtime responsibility
- use `write policy` to express how aggressively connector traffic may write into loop state
- prefer a minimal conversation-bridge contract next, before adding any real external connector runtime

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-connector-shell-runtime-separation.md first. Task 15 now has three bounded passes: connector shell UI, mock QR relay contract, and explicit runtime-lane separation with `runtime owner / write policy`. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 15 only if the next slice cleanly defines the minimal conversation-bridge contract or makes a concrete delivery-layer decision without forcing a real WeChat runtime; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
