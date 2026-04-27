# Evolution Note - Connector Shell WeChat Bind Seed

- Date: 2026-04-12
- Active plan: `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- Bounded target: 把 `connector shell / WeChat bind` 这条线从临时讨论升级成正式的长期任务与独立计划。

## Completed

- 参考审计已经确认：
  - `DeepScientist` 不是文档占位，而是真做了网页端微信扫码绑定
  - 关键链路是 `start qr -> wait qr -> persist token -> long poll connector`
- 新建了长期计划：
  - `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- 把这条线接进了 `.codex-loop/prompt.md`，作为 `Task 15`

## What stayed intentionally small

- 这轮没有直接实现微信协议、二维码登录 API 或 connector runtime
- 先把路线、边界和计划文件固定下来，避免在没有壳层设计前直接跳进协议接入

## Risks / constraints

- 真正的微信接入仍依赖上游协议/适配层，不是只靠 UI 就能完成
- 如果不先设计 thread / conversation 互斥，后续会和 daemon 写入冲突

## Next handoff

继续使用 `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`。
下一轮优先做其中一个最小可验证推进：

1. 在 workspace 里加 connector shell 占位区与状态模型
2. 设计 relay 的 `start qr / wait qr` API contract
3. 先把 conversation bridge 的绑定规则写清
