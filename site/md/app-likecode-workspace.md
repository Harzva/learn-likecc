# LikeCode Workspace Shell（本地 App）

> **在线页**（需本机 HTTP + relay）：<http://127.0.0.1:8080/app-likecode-workspace.html>  
> **HTML**：[`site/app-likecode-workspace.html`](../app-likecode-workspace.html)

这是一个从 `topic-codex-loop-console` 继续长出来的独立 app 风格页面。  
它现在的目标已经不只是 LikeCode 单仓库自用，而是逐步抽成一个 **可跨工程、跨用户复用的 codex-loop workspace shell**。

它的核心不是替代文章页，而是把三件事收成一个真正可操作的本地工作台：

1. 看长期任务池
2. 直接编辑 active plan
3. 同屏查看 daemon / thread / tick log

当前版本先做最小闭环：
- 左侧任务池默认通过 relay 读取当前 workspace 的 `site/data/loop-task-board.json`
- 中间是 relay 保护下的 plan editor
- editor 旁边会把 `- [ ]` / `- [x]` 解析成可点 checklist，并回写到 markdown
- 同一个 app 壳里还可以生成并保存一份轻量 evolution note 草稿
- 顶部会尽量根据 daemon 最近一次消息推断“它刚刚实际跑的是哪个 Task”，并提供一键跳转
- 现在还多了一个本地 `connector shell` 草图面板，用来先表达 `shell mode / bind status / target dialog`
- 这层已经开始走 relay 合同：workspace 会优先读写 `.codex-loop/connector-shell.json`，并暴露 `session_key / login_status / qrcode_content`
- `QR auth flow` 这轮先只定义 `start qr / wait qr` 的 mock API，不承诺真实微信 runtime 已经接通
- connector shell 现在还明确区分三条 runtime lane：
  - `mock-flow / workspace-shell / local-draft`
  - `adapter-flow / relay-adapter / single-thread-bind`
  - `external-runtime / connector-runtime / queue-gated`
- 在 runtime lane 之外，这版还补了 conversation bridge contract：
  - `queue-ticket / workspace / daemon-safe / draft`
  - `thread-inject / thread:pending / single-thread-bind / risky`
  - `task-handoff / task:pending / ticket-first / planned`
- 这意味着 workspace 已经能表达“外部聊天入口应不应该直写 thread，还是先变成 queue / task handoff”，而不只是停留在扫码壳层
- 这轮再往前补了两类 guardrail 字段：
  - `bridge_lock_rule`
  - `delivery_guardrail`
- 这样“daemon 正在推进时是否允许注入 thread”至少先是显式策略，不再只是口头约定
- relay 现在还补了一个最小 `bridge check`，可以根据 daemon / thread lock / connector state 给出一次 direct-inject 判定
- 右侧是 runtime + 最近 log
- branding、Pages 基址和入口链接可以通过 `.codex-loop/workspace-shell.json` 覆盖，而不是继续写死到页面里
- 这轮又补了一个 `Workspace Contract` 面板，会把 relay 已经知道的 `workspace root / site base / task board path / config path / repo & blob base` 直接显示出来
- 这样跨工程复用不再只是“后端其实支持”，而是前端自己也把当前 workspace contract 讲清楚
- 这轮再补一层写入边界：面板现在也会显示 `site root / allowed edit roots / allowed edit files`
- 这样操作者在页面里就能直接看到 plan / evolution 写回到底被限制在什么范围，不需要再去翻 relay 源码猜写入合同
- 这轮还把 relay 已有的 shell session API 接成了一个最小 `Shell Seats` roster
- 所以 app 现在不只知道 daemon / thread / log，也能直接看见当前 shell seat、创建新 shell、关闭选中的 shell，而不用先跳去另一张监视器页
- 这轮再往前补了一层：选中 shell seat 后，app 会直接读取并显示这条 seat 的最近输出
- 所以 `Shell Seats` 不再只是生命周期面板，而开始长成真正的只读 shell surface
- 这轮又把 `/api/shell/write` 接成了最小命令发送框
- 所以现在可以对选中的 shell seat 直接发一条 `pwd / ls / git status` 这类命令，而不用先跳回监视器页
- 这轮再把这层操作面补成 `Shell Presets`
- 所以对最常见的检查动作，已经不需要先手打命令，直接点 `pwd / ls / git status / python -V` 就能触发一次最小 shell probe
- 这轮再补了一个本地 `Recent Commands` 回放条
- 所以最近几条成功命令会留在页面里，刷新后也还能一键重放，不需要反复重打同样的 probe
- 这轮又给 shell 输出补了一个 `output from` 标签
- 所以当前看到的输出会尽量标出它最近是由哪条命令打出来的，减少重放以后“这块输出到底对应哪次 probe”的歧义
- 这轮再往前补了一个本地 `updated` 时间戳
- 所以最近一次重放、命令标签和当前输出之间现在至少共享一条最小时间线，不会只知道“是什么命令”却不知道“是什么时候打出来的”
- 这轮又把 seat 级别的 provenance 空状态补清楚了
- 所以如果某个 shell seat 的输出不是从当前 workspace shell 发出来的，页面会明确提示 `unknown on this seat / no local send yet`，而不是继续拿 `--` 糊过去
- 这轮再补了一个 `清空本地记忆` 入口
- 所以 recent replay、`output from` 和 `updated` 这些本地 provenance 都可以在页面里显式重置，不需要手动清整个浏览器存储
- 这轮再补了一条 scope note
- 所以页面会明确提醒：`Recent Commands`、`output from`、`updated` 都只是浏览器本地记忆，不是 relay 端持久化出来的 shell 历史
- 这轮又把 reset 的作用域补清楚了
- 所以 `清空全部本地记忆` 明确表示这是全局本地清空，不是只针对当前 shell seat 的单独 provenance reset
- 这轮再给 `unknown on this seat` 补了一条动态 hint
- 所以当某个 seat 没有本地 provenance 时，页面会直接提示这通常意味着“输出早于当前浏览器记忆”或“本地记忆刚被全局清空”
- 这轮又把已知 provenance 的 success hint 收短了
- 所以正常路径现在只会提示“这个 seat 正在和上面的本地 probe 对齐”，不再在成功态里反复讲实现细节
- 这轮再把说明层级拆成了两个 badge
- 所以 panel 里的 `browser-local memory` 继续表示全局本地记忆范围，而 `seat-local hint / gap / cue` 专门表示当前 shell seat 的 provenance 状态，两层信息不会再混在一行文字里
- 这轮再给 `Recent Commands` 行首补了一个 current-seat cue
- 所以切换 shell seat 时，recent replay 不会继续像全局命令条那样悬空，而是会直接标出当前 seat 以及它最近一次本地命令是否已经对齐
- 这轮再把当前 seat 的最近本地命令在 `Recent Commands` 里做了高亮
- 所以 replay 按钮本身也会和 `output from` / current-seat cue 对齐，而不只是靠一条 badge 文案提醒操作者当前上下文
- 这轮再把非当前命令的 replay button 标成 `shared · ...`
- 所以同一行里现在会直接区分“当前 seat 的本地命令”和“仍可复用、但不属于当前 seat 上下文的全局 recent memory”

下一步会继续往真正的 LikeCode workspace 推：
- 更像多 pane terminal 的工作台布局
- connector shell 从最小 guardrail enforcement 继续长到真正的 delivery-layer 决策，再决定是否值得接真实 QR auth flow
