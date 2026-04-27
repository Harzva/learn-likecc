# Loop 机制对照：Claude Hook、Codex Daemon 与 LikeCode /loop
> **更新时间**: 2026-04-22

> **在线页面**: https://harzva.github.io/learn-likecc/topic-loop-mechanisms.html  
> **本文件**: `site/md/topic-loop-mechanisms.md`  
> **说明**: 本页比较三种 loop 实现：Claude Stop hook/Ralph Loop、Codex 外部 daemon loop、LikeCode `/loop` 的应用内 cron scheduler。

## 一句话结论

三者都叫 loop，但触发边界不同：

- Claude/Ralph Loop：在 runtime 的 `Stop` hook 上阻止结束，并把 `reason` 回灌给模型。
- Codex loop：外部 daemon 周期性调用 `codex exec resume`，恢复同一 thread。
- LikeCode `/loop`：bundled skill 调用 `CronCreate`，应用内 scheduler 定时把 prompt 入队。

## Claude Hook / Ralph Loop

Ralph Loop 的关键不是直接调用 Claude API，而是使用 Claude Code runtime 的 `Stop` hook。

流程：

1. 用户启动 Ralph Loop，写入本地 state。
2. Claude 正常执行任务。
3. Claude 准备停止时，runtime 触发 `Stop` hook。
4. hook 读取 transcript 和 state，检查任务是否完成。
5. 未完成则返回 `decision:"block"` 和 `reason`。
6. runtime 阻止结束，并把 `reason` 重新送回模型上下文。

## Codex 外部 Daemon Loop

Codex 当前没有 Claude Code 这种可配置 Stop hook，所以 loop 由外部脚本实现。

流程：

1. shell 脚本启动 daemon。
2. daemon 保存 workspace、prompt、state dir、thread id。
3. 每个 tick 调用 `codex exec` 或 `codex exec resume`。
4. prompt 从 stdin 传入。
5. Codex 推进一个 bounded slice。
6. daemon 写日志、heartbeat、thread id，等待下一次 tick。

## LikeCode /loop Cron

LikeCode `/loop` 是 bundled skill，不是系统级 Linux crontab。

流程：

1. 用户输入 `/loop 5m check tests`。
2. `src/skills/bundled/loop.ts` 生成指令，让 Claude 解析 interval 和 prompt。
3. Claude 调用 `CronCreate` 创建 cron task。
4. `src/utils/cronScheduler.ts` 用 `setInterval(1000ms)` 检查到期任务。
5. `src/hooks/useScheduledTasks.ts` 把到期 prompt 作为 meta notification 入队。
6. recurring task 重新计算下一次 fire time。

它像 cron，是因为使用 cron 表达式和定时任务模型；它不是 Linux cron，是因为真正循环发生在应用进程里。

## 对照

| 维度 | Claude Hook / Ralph | Codex 外部 Daemon | LikeCode /loop Cron |
|---|---|---|---|
| 触发来源 | runtime 生命周期事件 | 外部进程时间循环 | 应用内 scheduler |
| 关键入口 | `Stop` hook | shell/Python daemon | `/loop` bundled skill |
| 续跑方式 | block stop + reason refeed | resume 同一 Codex thread | prompt 入队 |
| 状态存储 | plugin/local state + transcript | `.codex-loop` state/log/thread id | cron task registry / app state |
| 是否 Linux cron | 不是 | 更像 while + sleep | 不是系统 cron，是 app-level cron |
