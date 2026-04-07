# CC Source Layout

这个目录现在固定承载 3 条不同职责的源码线：

1. `ccsource/CC/claude-code-main`
   - 最原始的源码学习快照
   - 用来对应 Source Map 还原、课程分析、结构研究

2. `ccsource/CC/claude-code-rebuild`
   - 可运行的重建基线
   - 当前已恢复到 git commit `6a1afe3` (`v2.0.4: 程序可运行`)
   - 这个目录的职责是保留“已经重建完成，但还没叠加 Like Code 新功能”的基线

3. `ccsource/like-code-main`
   - 当前 Like Code 主开发线
   - 承载多 Provider、Web UI、pane/workspace 等持续定制功能
   - 当前先通过兼容别名切到新名字，旧路径 `ccsource/claude-code-main` 仍保留兼容

一句话区分：

- `CC/claude-code-main` 看“原始源码”
- `CC/claude-code-rebuild` 看“可运行重建基线”
- `like-code-main` 看“持续演进中的 Like Code 主线”
