# LikeCode Workspace（本地 App）

> **在线页**（需本机 HTTP + relay）：<http://127.0.0.1:8080/app-likecode-workspace.html>  
> **HTML**：[`site/app-likecode-workspace.html`](../app-likecode-workspace.html)

这是一个从 `topic-codex-loop-console` 继续长出来的独立 app 风格页面。  
它的目标不是替代文章页，而是把三件事收成一个真正可操作的本地工作台：

1. 看长期任务池
2. 直接编辑 active plan
3. 同屏查看 daemon / thread / tick log

当前版本先做最小闭环：
- 左侧任务池来自 `site/data/loop-task-board.json`
- 中间是 relay 保护下的 plan editor
- editor 旁边会把 `- [ ]` / `- [x]` 解析成可点 checklist，并回写到 markdown
- 同一个 app 壳里还可以生成并保存一份轻量 evolution note 草稿
- 右侧是 runtime + 最近 log

下一步会继续往真正的 LikeCode workspace 推：
- 更强的 thread/runtime 同步
- 更像多 pane terminal 的工作台布局
