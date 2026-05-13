# Claude Code 命令使用指南 - 庖丁解牛专题

> **更新时间**: 2026-05-02

> **在线页面**: https://harzva.github.io/learn-likecc/topic-cc-commands-guide.html
> **本文件**: `site/md/topic-cc-commands-guide.md`
> **说明**: HTML 为权威阅读面；本文件为目录与摘要草稿，便于 PR、离线阅读与 diff 审阅。

## 概要

Claude Code 斜杠命令的场景化指南：把命令分成会话管理、模型与成本、权限安全三条线，强调“什么时候用、为什么用”，而不是机械背命令清单。

## 目录（对照 HTML）

- 参考来源与版本锚定
- 命令是什么
- 第一类：会话与上下文管理命令
  - `/clear`：彻底清空，重新开始
  - `/compact`：压缩上下文
  - `/context`：决定要不要收拾
  - `/resume`：上次没做完的
  - `/rewind`：不满意就往前退
  - `/recap`：先收个口，再继续
  - 这组命令到底该怎么用
- 第二类：模型、推理强度与成本相关命令
  - `/model`：先判断任务类型
  - `/effort`：任务明确就收低，复杂再往上拨
  - `/status`：确认当前状态
  - `/cost`：建立成本意识
  - `/stats`：看结构
- 第三类：权限、安全与排障相关命令
  - 权限相关能力模型
  - `/doctor` 与 `/debug`
  - `/security-review`
- 核心原则总结
- 延伸阅读

## 各节摘要（对照 HTML）

### 参考来源与版本锚定

说明本页整理自社区文章，并以仓库源码镜像、Source Map 源码课和发版监督页作为技术校准入口。

### 命令是什么

把 Claude Code 命令分为基础控制命令、场景化能力命令、扩展能力命令三类，先建立分类心智。

### 第一类：会话与上下文管理命令

讲清 `/clear`、`/compact`、`/context`、`/resume`、`/rewind`、`/recap` 的使用场景。核心判断是当前任务该重开、该瘦身，还是该从旧会话继续。

### 第二类：模型、推理强度与成本相关命令

围绕 `/model`、`/effort`、`/status`、`/cost`、`/stats` 建立成本意识：执行型任务优先效率，判断型任务再考虑更强模型与更高推理强度。

### 第三类：权限、安全与排障相关命令

解释 `/permissions`、`/auto mode`、`/sandbox`、`/fewer-permission-prompts`、`/doctor`、`/debug`、`/security-review` 的边界和排障价值。

### 核心原则总结

最终原则是命令不靠数量取胜，而靠场景判断：会话先治理，模型按任务配，权限问题先诊断。

### 延伸阅读

串回 Claude Code 解构、S04、D04 与原文链接。

---

*正文与图表以网页版为准；本 MD 为讲义索引与审阅用草稿。*
