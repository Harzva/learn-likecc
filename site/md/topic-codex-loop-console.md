# codex-loop AI Terminal（本地 MVP+）

> **在线页**（需本机 HTTP）：<http://127.0.0.1:8080/topic-codex-loop-console.html>（示例端口）  
> **HTML**：[`site/topic-codex-loop-console.html`](../topic-codex-loop-console.html)  
> **GitHub Pages**：仅作静态备份；真实能力依赖本机 relay：[`tools/codex_loop_web_relay.py`](../../tools/codex_loop_web_relay.py)

## 概要

这是一个本地版 `codex-loop` 网页控制台最小实现：

- 看 daemon 状态
- 看 daemon log / latest tick log
- 看最近一轮 thread 输出
- 以受保护模式向当前 thread 发消息
- 多面板拖拽与缩放
- 可新增 monitor pane
- 布局持久化
- 可选 daemon 启停按钮
- 当前 thread 的只读 / 可写锁状态
- tabbed workspace 与本地 shell pane

## 启动

1. 运行 relay：
   - `python3 tools/codex_loop_web_relay.py --workspace /home/clashuser/hzh/item_bo/learn-likecc`
2. 运行静态站：
   - `cd site && python3 -m http.server 8080`
3. 打开：
   - `http://127.0.0.1:8080/topic-codex-loop-console.html`

## 设计边界

- 这是 **本地工具页**，不是线上 GitHub Pages 可用能力
- 默认 **安全优先**
- 当 daemon 正在运行时，网页端默认不直接往同一 thread 写消息
- 如要强制发送，需要显式勾选风险开关
- monitor pane 现在是“日志/输出观察窗”，还不是完整 PTY 终端模拟器
- shell pane 是本地 PTY relay，不是远程主机管理器
- 当 daemon 正在运行时，thread 写入仍默认受保护

## 目标

这个 MVP 先证明三件事：

- `.codex-loop` 的后台状态可以被网页端观察
- `thread_id` 可以被网页端当成桥接目标
- “多终端 / 多 pane / 可拖拽”的控制面可以先从本地最小实现开始

## 本轮增强

- 在 Relay 区补了 daemon 启停按钮
- 布局会落到浏览器 `localStorage`
- 可以复制出多个 monitor pane，同时盯 daemon log、latest tick、last message
- 新增 thread lock 控制，能把当前 thread 标成只读或恢复可写
- 新增 shell workspace：可创建多个本地 shell session，并在 tab 间切换
- shell pane 现在带 terminal frame、session cwd 与输出行数，不再只是裸 PTY 日志框
- 新增本地 event timeline pane，集中记录 daemon、thread lock、shell 与 relay 的最近动作
- 新增 `Overview / Thread Desk / Shell Lab / Debug` workspace presets，可一键把 pane 排回预设工位并保留 `custom` 布局状态
- 新增 `Operation Guardrails` 状态条，集中提示 relay 连接、thread 冲突风险，以及 readonly / shell 失效时的恢复建议
- 现有 relay / daemon / thread / shell 操作状态改成统一的颜色反馈，并补了 `Last Action` 动作回执，便于快速判断刚刚是成功、等待还是失败
- shell pane 进一步补了 session `live / done / standby` 状态、terminal footer 和 `$` prompt composer，不再只是“有外框的日志输出”
- 各 pane 现在补了 `Control / Preview / Logs / Compose / Inspect / History / PTY` 类型层级和更清楚的头部色带，daemon、log、thread、shell 的分组更容易扫读
- 窄屏下新增更可靠的 fallback：toolbar 状态整行堆叠、preset/guardrail 不再挤成一行，terminal head/footer 与 prompt composer 会自动换成更适合手机调试的布局
- 第一次打开页面、或本地布局缓存损坏时，现在会直接回到受控的 `Overview` preset，而不是依赖零散的原始 pane 几何位置
- 新增 `Session Stack` 总览 pane，借了 Hermes WebUI / CloudCLI 的 session-sidebar 思路，把 relay、workspace、thread lock、最近动作和 shell roster 收成一处；同时把通用 monitor pane 从 `Overview` 退出，避免首屏继续堆成“很多盒子但没有 operator summary”
- `Session Stack` 现在不只是看板，还补了小型 operator actions：可直接打开 `Thread Desk`、切到 `Shell Lab`、新建 shell，并从 roster 里一键 focus 某个现有 shell session
