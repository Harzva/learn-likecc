# evolution-2026-04-12-connector-shell-qr-contract.md

## Plan

- path: `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- milestone: connector shell / WeChat bind QR contract
- bounded target: 把 `start qr / wait qr` 收成 relay 可调用的 mock contract，并让 workspace connector shell 改成优先通过 relay 读写 connector state

## Completed

- added a dedicated connector draft store at `.codex-loop/connector-shell.json`
- added relay endpoints:
  - `GET /api/connector/state`
  - `POST /api/connector/state`
  - `POST /api/connector/qr/start`
  - `POST /api/connector/qr/wait`
- expanded connector state to include:
  - `session_key`
  - `qrcode_content`
  - `login_status`
  - `runtime_mode`
- updated `app-likecode-workspace` to read and write connector state through the relay first, while keeping local state as the lightweight fallback

## Failed or Deferred

- did not promise a real WeChat QR runtime in this pass
- did not design the conversation bridge between inbound connector messages and `codex-loop` threads yet
- did not add a separate connector topic/design page in this pass

## Decisions

- keep `QR auth flow` at `mock relay contract` first because it is locally verifiable and pins the state shape without overcommitting protocol details
- treat `.codex-loop/connector-shell.json` as the first relay-visible persistence layer for connector shell state
- prefer clarifying `mock flow / adapter flow / real runtime` separation next, before attempting any real bind implementation

## Next Handoff

```text
Use codex-loop to continue the active plan at .claude/plans/loloop/active-site-detail-polish-v1.md. Read .claude/plans/loloop/evolution-2026-04-12-connector-shell-qr-contract.md first. Task 15 now has two bounded passes: a connector shell panel in the workspace app and a mock QR relay contract with `start qr / wait qr` plus persisted connector state. Choose exactly one next bounded move from the remaining recurring pool. Prefer staying on Task 15 only if the next slice cleanly clarifies `mock flow / adapter flow / real runtime` separation or defines the minimal conversation-bridge contract without forcing a real WeChat runtime; otherwise switch to the next higher-value low-risk recurring slice. Update the relevant plan, record one new evolution note, and publish the commit. If the next pass changes `site/**`, GitHub Pages should redeploy automatically after push.
```
