# Evolution Note - Connector Runtime Daemon Topic

- Date: 2026-04-12
- Active plan: `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`
- Bounded target: 把 `Connector / Runtime / Daemon` 三层口径收成一页站内专题和一页设计说明首页。

## Completed

- 新建站内专题：
  - `site/topic-connector-runtime-daemon.html`
  - `site/md/topic-connector-runtime-daemon.md`
- 新建设计说明首页：
  - `docs/connector-runtime-daemon-design.md`
- 把 `Task 15` 的计划输出补成可教学、可执行、可持续对齐的三层：
  - 专题页讲概念
  - 设计页讲边界
  - plan 文件继续管实施节奏

## What stayed intentionally small

- 这轮没有继续扩 QR auth API 或真实 adapter
- 没有直接实现 conversation bridge
- 先把口径和层次固定下来，避免后面每轮都在概念上反复摇摆

## Next handoff

继续使用 `.claude/plans/loloop/active-connector-shell-wechat-bind-plan-v1.md`。
下一轮优先做其中一个：

1. 把 `mock flow / adapter flow / real runtime` 的边界再写清一层
2. 补 `conversation bridge` 的最小 contract
3. 让 workspace shell 直接链接到这页专题和设计说明
