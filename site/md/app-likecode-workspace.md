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
- 现在还多了一个本地 `connector shell` 草图面板，用来先表达 `shell mode / bind status / target dialog`，但不急着承诺微信协议已经接通
- 右侧是 runtime + 最近 log
- branding、Pages 基址和入口链接可以通过 `.codex-loop/workspace-shell.json` 覆盖，而不是继续写死到页面里

下一步会继续往真正的 LikeCode workspace 推：
- 更像多 pane terminal 的工作台布局
- connector shell 从本地状态继续长到 relay 合同，再决定是否值得接 QR auth flow
