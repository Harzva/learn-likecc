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
- `Session Stack` 的 Thread 卡片里进一步补了 `Readonly / Writable` 快捷操作，不必先切进 `Thread Compose` 才能改当前 thread 的写保护状态
- 针对这些新按钮与 roster controls，窄屏 fallback 也继续跟上：小窗或手机调试时会整列堆叠，而不是把 action row 和 focus 控件挤成一团
- `Session Stack` 里再补了一层 compact ownership / approval summary：把 daemon ownership、thread write guard、shell seat 三件事压成一排状态条，避免 operator 还要自己从 guardrail 和多张卡片里二次拼装当前控制权
- `Shell Roster` 进一步从平铺列表改成轻量 session-management 视图：表头直接显示 `active / standby / closed` 计数，正文按 `Active Seat / Standby Sessions / Closed Sessions` 分组，聚焦当前 shell 和扫读后台会话会更快
- 在 `Session Stack` 里又补了一个 `Desk Assignments` ledger，把 `Overview / Thread Desk / Shell Lab` 三个工位当前到底接管了什么对象直接列出来，并保留一行一个 `Open` 跳转，减少 operator 在 summary、card、roster 之间来回比对
- `Session Stack` 继续做了结构化分段，把 `Quick Actions / Control Summary / Desk Assignments / Surface Detail / Shell Sessions` 明确拆开；在信息已经变厚之后，这比继续堆新状态层更有价值
- `Control Summary` 下又补了一排 `Session Pulse` 小卡片，专门概括当前 workspace、thread bind、daemon lane 和 shell coverage；这是 cross-session 快照，不是新的控制路径
- `Session Stack` 现在又补了一层 `Attention Queue`，把 relay / thread / shell 三条最可能需要 operator 立刻处理的信号压成一排 action-oriented 小卡片；它回答的是“下一步该处理什么”，不是重复罗列状态
- `Attention Queue` 下面又加了一层 `Session Identity`，专门把 daemon pid / 当前 thread 绑定 / active shell id 这类“具体是谁”抬到 `Desk Assignments` 之前；这样 operator 先看一排 identity 就能知道当前各工位到底接着哪个对象
- `Shell Roster` 里的每个 shell card 现在也补了一个前端派生的 workspace label，直接从 `cwd` 抽出短标识；会话多起来时，不必先读完整路径也能分辨哪个 shell 大致挂在哪个工作区
- `Shell Roster` 表头现在还多了一行 `Active Runtime` 式摘要，把当前活跃 shell 的 `session / workspace / pid` 先压成一条；如果没有 live seat，也会退化成 standby 或 closed 的 runtime 快照
- `Session Stack` 自己的 panel head 现在也补了一条 ownership cue：如果 shell 有 live seat，就直接在标题下露出 `Shell Lab · session @ workspace`；否则退化成 daemon pid 或当前 thread 绑定，让 operator 不滚动 body 也知道现在最热的是哪条 lane
- 这条 headnote 现在还会顺手带出 shell standby 压力：有 live seat 时直接补 `+N standby`，没有 live seat 但还有 parked shells 时则退成 `Shell Lab · standby N @ workspace`
- `Desk Assignments` 每行现在是双 badge：既显示当前 assignment，也显示 approval / coverage 辅助标签，比如 `relay ready`、`daemon linked`、`standby N`，这样非-shell 状态也不再只能藏在说明文字里
- `Session Stack` 顶部标题区也不再只有一个 `N shells` badge，而是直接露出 `daemon / thread / shells` 三条 headline 状态，先看 panel head 就知道主控面现在大概是什么状态
