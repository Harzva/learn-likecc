# CC Source Layout

这个目录现在固定承载 3 条不同职责的源码线：

1. `ccsource/CC/claude-code-main`
   - 最原始的源码学习快照
   - 用来对应 Source Map 还原、课程分析、结构研究

2. `ccsource/CC/claude-code-rebuild`
   - 可运行的重建基线
   - 当前已恢复到 git commit `6a1afe3` (`v2.0.4: 程序可运行`)
   - 这个目录的职责是保留“已经重建完成，但还没叠加 Like Code 新功能”的基线
   - 首次进入时仍需先执行 `bun install`，否则会出现 `Cannot find module 'lodash-es/...'` 这类缺依赖报错
   - 历史里确实还有更新、且提交信息写着“功能测试完成 / 稳定运行”的版本，例如 `c75951f`、`50b6fb0`、`a1531fb`
   - 但现在 `6a1afe3` 这条基线已经通过修复重新跑通，因此当前不需要急着切到这些更晚提交
   - 后续如果要切换 rebuild 锚点，必须先在 [docs/commit-ledger.md](/home/clashuser/hzh/item_bo/learn-likecc/docs/commit-ledger.md) 里登记“相对上一版本到底多了什么”

3. `ccsource/like-code-main`
   - 当前 Like Code 主开发线
   - 承载多 Provider、Web UI、pane/workspace 等持续定制功能
   - 当前先通过兼容别名切到新名字，旧路径 `ccsource/claude-code-main` 仍保留兼容

一句话区分：

- `CC/claude-code-main` 看“原始源码”
- `CC/claude-code-rebuild` 看“可运行重建基线”
- `like-code-main` 看“持续演进中的 Like Code 主线”

提交治理补充：

- 以后凡是涉及源码线锚点、可运行性修复、release 基线变动的 commit，都要同步写入 [docs/commit-ledger.md](/home/clashuser/hzh/item_bo/learn-likecc/docs/commit-ledger.md)
- 记录内容至少包含：`commit`、职责、相对上一版本的变化、当前是否仍作为基线
