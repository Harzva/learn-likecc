# Claude Code vs Codex：编排型 vs 执行型
> **更新时间**: 2026-04-17

> **在线页面**: https://harzva.github.io/learn-likecc/topic-claude-codex-compare.html  
> **本文件**: `site/md/topic-claude-codex-compare.md`  
> **说明**: 本页对照 Claude Code 与 Codex 的定位差异，强调编排型 vs 执行型、Session vs Thread、Hook/Cron vs Daemon loop。

## 一句话结论

Claude Code 更像编排平台，Codex 更像执行回路。比的不是谁更强，而是你缺的是编排还是执行。

## 四张对照图

1. Claude Code · Codex：两种职责，不是两个命令行壳。
2. Claude Code 编排系统：Coordinator 统筹命令、工具、worker 与扩展。
3. Codex 执行型助手：读、改、跑、验的快速闭环。
4. 两条工作流：一个先搭系统，一个先开工。

## Session vs Thread

- Session 更像“会话级运行时”，承载权限、上下文与控制面。
- Thread 更像“执行级任务链”，承载每次任务闭环。

## Loop 的差异

- Claude Code 侧常见做法是用 hooks + cron/schedule 触发下一次任务。
- Codex 侧常见做法是用外部 daemon 或脚本定时触发 `codex exec`。

## 如何选择

- 需要控制面、权限、扩展与协作：选 Claude Code。
- 需要快速执行闭环：选 Codex。
- 需要二者协作：用 Claude 编排，Codex 执行。
