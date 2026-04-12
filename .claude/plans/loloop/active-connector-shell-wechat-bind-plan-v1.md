# Active Connector Shell WeChat Bind Plan v1

## Goal

把 `codex-loop` 的 connector shell / WeChat bind 路线收成可持续推进的长期任务，让后续可以逐步从 “workspace + daemon + thread” 扩到 “扫码绑定 + 会话桥接 + connector 管理”。

## Current focus

- [x] 完成参考审计：确认 `DeepScientist` 已经具备网页端微信扫码绑定流程
- [x] 抽出最小链路：`start qr -> wait qr -> persist token -> long poll connector`
- [x] 把这条路线接入 `prompt.md` 长循环任务池
- [x] 决定 `codex-loop` 第一版 connector shell 先做到哪一层

## Reference anchors

- [x] `reference/reference_ai_scientist/DeepScientist/docs/zh/10_WEIXIN_CONNECTOR_GUIDE.md`
- [x] `reference/reference_ai_scientist/DeepScientist/src/deepscientist/daemon/app.py`
- [x] `reference/reference_ai_scientist/DeepScientist/src/deepscientist/connector/weixin_support.py`
- [x] `reference/reference_ai_scientist/DeepScientist/src/ui/src/components/settings/ConnectorSettingsForm.tsx`
- [ ] 决定是否补更多 `openclaw-weixin / iLink` 上游参考

## Build layers

### 1. Connector shell

- [x] 在 `codex-loop` workspace 里预留 connector 管理区
- [x] 显示 connector 状态、绑定状态、当前目标对话
- [x] 保持这层先以 UI shell 和本地状态为主，不急着直接打通微信协议

### 2. QR auth flow

- [x] 设计 `start qr / wait qr` 的 relay API 形态
- [x] 规划 session_key、qrcode_content、login status 的本地状态结构
- [x] 决定第一版是 mock flow、adapter flow，还是直接接某个上游 runtime

### 3. Conversation bridge

- [ ] 设计微信会话与 `codex-loop` thread / task / workspace 的绑定关系
- [ ] 明确 inbound / outbound 最小 contract
- [ ] 避免 daemon 与外部聊天入口同时写同一 thread

### 4. Runtime separation

- [ ] 区分 connector runtime、daemon runtime、workspace shell 的边界
- [ ] 评估后续是否需要单独 watchdog / queue / delivery layer

## Workspace outputs

- [x] `site/app-likecode-workspace.html` 补 connector shell 区块
- [x] `site/js/likecode-workspace.js` 补 connector 状态视图与交互入口
- [x] `tools/codex_loop_web_relay.py` 预留 connector API 契约
- [ ] 如有必要，再单独建 connector 专题页或设计页

## Routing rules

- `DeepScientist WeChat bind`
  - 作为参考样本，重点学习“扫码流程 + token 持久化 + connector runtime”
- `codex-loop`
  - 先收成 connector shell / bridge 规划，不急着承诺完整微信协议实现
- `workspace shell`
  - 继续作为控制面壳，承担连接器入口与状态展示

## Validation

- [x] `python3 tools/build_loop_task_board.py`
- [ ] 如涉及 workspace 代码，补：
  - [x] `python3 -m py_compile tools/codex_loop_web_relay.py`
  - [x] `node --check site/js/likecode-workspace.js`
  - [x] `python3 tools/check_site_md_parity.py`

## Current status

这条线已经完成第二层选择：`workspace app` 不再只停在本地 draft，而是开始通过 relay 读写 `.codex-loop/connector-shell.json`，并把 `start qr / wait qr` 收成 mock QR contract。下一步更值当的是区分 `mock flow / adapter flow / real runtime` 的边界，或者继续补 `conversation bridge`，而不是过早承诺真实微信绑定已经可用。
