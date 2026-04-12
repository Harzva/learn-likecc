# Autoresearch / ARIS 解构

> **在线页面**: https://harzva.github.io/learn-likecc/topic-autoresearch-unpacked.html  
> **本文件**: `site/md/topic-autoresearch-unpacked.md`  
> **更新时间**: 2026-04-12

本页归入 **VibePaper 专题**，目标不是介绍 Autoresearch 有多少子命令，而是拆它如何把 `goal + metric + scope + verify + rollback + git memory` 收成一个 plugin-style 的研究循环协议；当前也把 **ARIS（Auto-Research In Sleep）** 作为这条样本线的延伸分支一并纳入。

## 目录（对照 HTML）

### 参考来源与版本锚定

官方来源优先：

- `https://github.com/uditgoenka/autoresearch`
- `https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep`
- `https://github.com/karpathy/autoresearch`

本地锚点：

- `reference/reference_agent/autoresearch/README.md`
- `reference/reference_agent/autoresearch/COMPARISON.md`
- `reference/reference_agent/autoresearch/claude-plugin/.claude-plugin/plugin.json`
- `reference/reference_agent/autoresearch/claude-plugin/skills/autoresearch/SKILL.md`
- `reference/reference_agent/autoresearch/claude-plugin/commands/autoresearch/`
- `reference/reference_agent/autoresearch/guide/`
- `reference/reference_agent/aris/README.md`
- `reference/reference_agent/aris/skills/`
- `reference/reference_agent/aris/docs/`

### 01 · 为什么 Autoresearch / ARIS 值得单独拆

它最值得讲的是 loop contract：goal、metric、scope、verify、rollback、git memory。它更像研究循环协议层，而不是厚重工作台。ARIS 则把这套方法包装成更强调“睡觉时持续推进”的叙事和跨代理技能包。

### 02 · 先拆成五层：Autoresearch 到底在拼什么

- 宿主层：Claude Code / plugin 安装路径
- 协议层：goal / metric / scope / verify / rollback / git memory
- 主循环层：`/autoresearch`
- 子命令面：`plan / security / ship / debug / fix / scenario / predict / learn / reason`
- 知识与文档层：`guide/`、references、COMPARISON

结论：它更像一个 `plugin-style research loop protocol`。

### [插图提示词]

用途：画出 Autoresearch 的五层总图。  
形式：分层结构图。  
提示词：画一个 Autoresearch 五层架构图，底部是 Claude Code 宿主能力，中间是 goal/metric/scope/verify/rollback/git memory 协议层，再上面是 /autoresearch 主循环，右侧展开 plan/security/ship/debug/fix/scenario/predict/learn/reason 子命令面，顶部是 guide 和 comparison 文档层，箭头标出配置、迭代、验证、回滚和日志沉淀。  
Mermaid 更适合：是。

### 03 · 它的控制面到底在哪：不是界面，而是那套 loop contract

Autoresearch / ARIS 的主脑不在某个页面，而在 goal、metric、scope、verify、guard、rollback、git memory 这套 contract 里。只要 contract 定义清楚，它就能把模糊的改进愿望转成连续迭代问题。

### 04 · 九条子命令不是散功能，而是扩展协议面

`plan`、`security`、`ship`、`debug`、`fix`、`scenario`、`predict`、`learn`、`reason` 更像围绕同一套 loop contract 做的不同子协议，而不是简单工具箱。

### 05 · 它和 DeepScientist 的根本差异：研究协议 vs 研究工作台

Autoresearch / ARIS 更像 plugin / command surface / loop contract；DeepScientist 更像 local-first research studio / quest repo。前者适合讲研究协议，后者适合讲研究工作台。

### 06 · 对我们自己的站点和值得学什么

- 自动科研不一定要先做厚 UI，先把 loop contract 讲清楚也可以形成强方法论。
- goal、metric、scope、verify、rollback、git memory 很适合直接变成教程骨架。
- 后续 VibePaper 的比较页应继续围绕控制面与持久状态来写。

### 参考与原始链接

- https://github.com/uditgoenka/autoresearch
- https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep
- https://github.com/karpathy/autoresearch
- `reference/reference_agent/autoresearch/README.md`
- `reference/reference_agent/autoresearch/COMPARISON.md`
- `reference/reference_agent/autoresearch/claude-plugin/.claude-plugin/plugin.json`
- `reference/reference_agent/autoresearch/claude-plugin/skills/autoresearch/SKILL.md`
- `reference/reference_agent/autoresearch/claude-plugin/commands/autoresearch/`
- `reference/reference_agent/autoresearch/guide/`
- `reference/reference_agent/aris/README.md`
- `reference/reference_agent/aris/skills/`
- `reference/reference_agent/aris/docs/`
