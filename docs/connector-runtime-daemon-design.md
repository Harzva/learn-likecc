# Connector / Runtime / Daemon Design Note v1

## Purpose

这是一份给 `Task 15` 的第一页设计说明，用来固定 `CodeXLoop` 在 connector shell / wechat bind 这条线上的系统边界。

目标不是一次做完微信接入，而是先回答三个问题：

1. 哪一层负责扫码登录？
2. 哪一层负责对外 API 与状态查询？
3. 哪一层负责长期 loop 与任务推进？

## Core model

### Connector

职责：

- 平台协议适配
- `QR auth`
- 会话身份管理
- 入站 / 出站消息编解码

典型对象：

- `weixin`
- `feishu`
- `telegram`

它不应该：

- 直接推进长期任务
- 直接拥有完整 plan / evolution / task 调度逻辑

### Runtime

职责：

- 暴露 API
- 接收 webhook / UI 操作
- 聚合状态
- 把外部事件路由到 thread / task / workspace

典型对象：

- `connector status`
- `start qr / wait qr`
- `workspace state`
- `thread bind`

它不应该：

- 直接承接所有平台协议细节
- 自己变成 loop 引擎

### Daemon

职责：

- 定时唤醒
- 读取 `prompt.md`
- 选择 active task
- 读取 plan
- 推进 bounded iteration
- 写 evolution / handoff / logs

它不应该：

- 直接承担扫码登录交互
- 直接等同于 connector runtime

## WeChat bind flow

建议的最小流程：

1. UI 请求 `POST /api/connectors/weixin/login/qr/start`
2. Runtime 创建一次 QR login session
3. Connector adapter 返回：
   - `session_key`
   - `qrcode_content`
   - `status=wait`
4. UI 轮询 `POST /api/connectors/weixin/login/qr/wait`
5. Connector adapter 返回：
   - `wait / scanned / expired / confirmed`
6. 一旦 `confirmed`：
   - 保存 token / account identity
   - 更新 connector state
   - Runtime 将其暴露给 workspace shell

## Conversation bridge

这一层还未实现，但设计上必须先明确：

- 一个外部会话是否映射到：
  - 一个 thread
  - 一个 workspace
  - 一个 task
  - 或者一个 quest-like container
- daemon 是否允许与 connector 同时写入同一 thread
- 如果不允许，谁持锁，谁等待

当前建议：

- 外部 connector 默认不直接写正在被 daemon 持续推进的 thread
- 先通过 runtime 做“桥接工单”或“待处理消息队列”
- 真正的 thread 注入由受控路径触发

### Minimal bridge contract

当前先固定最小合同，不提前承诺 delivery worker 已经存在：

- `bridge_mode`
  - `queue-ticket`
  - `thread-inject`
  - `task-handoff`
- `bridge_target`
  - `workspace`
  - `thread:<id>`
  - `task:<id>`
  - `inbox:<channel>`
- `bridge_policy`
  - `daemon-safe`
  - `ticket-first`
  - `single-thread-bind`
  - `runtime-locked`
- `bridge_status`
  - `draft`
  - `planned`
  - `guarded`
  - `risky`
- `bridge_lock_rule`
  - `daemon-holds-thread`
  - `manual-unlock-before-inject`
  - `runtime-readonly-when-daemon-active`
- `delivery_guardrail`
  - `queue-only`
  - `operator-ack`
  - `queue-gated`

推荐含义：

- `queue-ticket / daemon-safe`
  - 外部会话先变成待处理工单，不直接写 daemon 正在推进的 thread
- `task-handoff / ticket-first`
  - 外部会话先落到某个 task，再由 workspace 或 runtime 决定是否转成 thread 操作
- `thread-inject / single-thread-bind`
  - 只用于明确知道目标 thread 且需要人工或锁保护时
- `runtime-locked`
  - 预留给未来真实 connector runtime 接入后的硬保护模式
- `daemon-holds-thread / queue-only`
  - daemon 推进中的 thread 默认不能被 connector 直接写入
- `manual-unlock-before-inject / operator-ack`
  - 需要人工确认或先解除 thread 锁之后，才允许更激进的注入
- `runtime-readonly-when-daemon-active / queue-gated`
  - 预留给未来真实 runtime 接入后的强保护模式

### Minimal enforcement hook

在真实 delivery worker 出现之前，runtime 至少应能回答一个问题：

- 当前 bridge 合同下，是否允许 direct inject

最小检查输入：

- connector state
- daemon running state
- thread lock mode

最小检查输出：

- `allow_direct_inject`
- `decision`
- `reason`
- `suggested_action`

## Recommended implementation phases

### Phase 1

Connector shell only

- workspace 中可见 connector 卡片
- 可见 bind status / target dialog / mock QR state
- 不承诺真实微信协议实现

### Phase 2

QR auth contract

- `start qr / wait qr`
- session_key / status / expiry / refresh
- relay 层持久化 connector shell state

### Phase 3

Conversation bridge

- connector conversation → thread/task/workspace mapping
- lock / queue / guardrail

### Phase 4

Real adapter

- 真正接入上游微信 runtime
- 把 mock flow 替换为 adapter flow

## Immediate alignment targets

后续这条线应持续对齐：

- `site/app-likecode-workspace.html`
- `site/js/likecode-workspace.js`
- `tools/codex_loop_web_relay.py`
- `.codex-loop/prompt.md`
- `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`

## Current stance

当前最重要的不是宣称 `CodeXLoop` 已经支持微信扫码绑定，而是把三层边界和实现顺序固定下来：

- 先有 connector shell
- 再有 QR auth contract
- 最后再接 real runtime
