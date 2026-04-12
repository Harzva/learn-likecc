# Codex-Loop In Sleep - AI-Scientist 专题

> **在线页面**: https://harzva.github.io/learn-likecc/topic-codex-loop-in-sleep.html  
> **本文件**: `site/md/topic-codex-loop-in-sleep.md`  
> **更新时间**: 2026-04-12

## 概要

这页专门讲一件事：

- `ARIS / Auto-Research In Sleep` 更像研究专用的 `in-sleep system`
- `codex-loop` 更像面向工程、站点、内容和发布的 `通用型 in-sleep shell`

重点不是比较谁“更强”，而是拆出：我们已经有哪些 sleep 能力，以及还该从 ARIS 借哪几层。

## 目录（对照 HTML）

- 为什么这条线值得从 AI-Scientist 里单独拆出来
- ARIS 真正比我们厚的，不是 daemon，而是外层方法系统
- 我们已经有的部分，其实已经很像通用型 in-sleep shell
- 真正还差的，是三层外壳再加厚
- 第一条真正回写到 codex-loop 路线图的借鉴能力
- 把这条线做成长期子专题，最顺的开展路线

## 各节摘要

### 为什么这条线值得单独拆

这一页真正关注的是三类问题：

- 循环如何持续
- 循环如何自我修正
- 循环如何沉淀长期记忆

所以值得讲的不是“我们也有 loop”，而是：
`ARIS` 是研究专用的 in-sleep system，`codex-loop` 是通用型 in-sleep shell。

### ARIS 提供了什么方法厚度

当前最值得借的五层是：

- `workflow family`
- `persistent wiki`
- `meta optimize`
- `watchdog health layer`
- `cross-model review`

如果只选三条优先借：

1. `meta-optimize`
2. `persistent wiki`
3. `watchdog health layer`

### [插图提示词]

用途：画 ARIS 到 codex-loop 的“可借鉴能力梯子”。  
形式：五层能力梯子图。  
提示词：左列放 ARIS，右列放 codex-loop，中间用五条横向梯子连接：workflow family、persistent wiki、meta optimize、watchdog health layer、cross-model review。ARIS 一侧标出对应模块名，codex-loop 一侧标出当前状态（已有 / 部分已有 / 缺失 / 待建设）。  
Mermaid 更适合：是。

### 我们已经有什么

`codex-loop` 目前已经有这些通用型 in-sleep 壳层：

- daemon + thread resume + prompt contract
- dedicated plans + evolution notes
- sticky active task + task board
- workspace shell
- GitHub / Pages / Zhihu 发布闭环

所以更准确的口径是：
`codex-loop` 已经是一种面向工程和知识站点的 `codex-loop in sleep`。

### 真正还差什么

当前主要差三层：

- 外层自优化
- 长期知识层
- 健康与执行分层

也就是：不是 loop 壳不存在，而是外层方法系统还需要继续加厚。

### 第一条真正回写的能力：meta-optimize

这一轮先不直接做自动改 prompt 的大系统，而是先把 `meta-optimize` 落成一条最小可执行规则：

- 每次 bounded pass 如果暴露了重复性的 loop 低效点，要写出一条短的 `loop improvement candidate`
- 只有当这条候选规则已经重复出现，或者能明确改善下一 tick，才允许写回 `.codex-loop/prompt.md`
- prompt 级回写必须保持短、可操作、能改变后续循环行为，而不是补一段解释性长文

当前 `codex-loop` 在这条线上最明显的三个缺口是：

| 层 | 当前状态 | 缺口 | 这次的最小回写 |
| --- | --- | --- | --- |
| logs | 已有 tick logs、evolution notes、handoff | 记录很多，但没有把重复低效点收敛成固定候选规则 | 要求每轮只提炼一条 `loop improvement candidate` |
| prompt | 主 prompt 已经能约束 task selection 和 publishing window | prompt 变更更多是人工临时补充，缺少“何时允许写回 prompt”的门槛 | 增加“重复出现或能改善下一 tick 才能升级到 prompt”的规则 |
| skill / plan | 会按 skill 执行，也会更新 active plan | 缺少把 loop-level 经验沉淀成可复用操作约束的薄层 | 先把 meta-opt 定位成短规则回写，而不是大而全的新系统 |

### 最顺的开展路线

建议顺序：

1. 固定站内口径：ARIS = 研究专用 in-sleep system，codex-loop = 通用型 in-sleep shell
2. 先把 `meta-optimize` 落成最小回写规则：每轮提炼一条 `loop improvement candidate`
3. 再继续补 `persistent wiki`、`watchdog` 这两条更重的外层能力
4. 在 AI-Scientist 专题里承担“研究系统如何长出 sleep 层”的解释任务

## 参考与原始链接

- https://github.com/wanshuiyin/Auto-claude-code-research-in-sleep
- `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/README.md`
- `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/AGENT_GUIDE.md`
- `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/skills/research-wiki/SKILL.md`
- `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/skills/meta-optimize/SKILL.md`
- `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/skills/monitor-experiment/SKILL.md`
- `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/tools/watchdog.py`
- `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/docs/CODEX_CLAUDE_REVIEW_GUIDE.md`
- `.codex-loop/prompt.md`
- `.claude/plans/loloop/`
- `tools/codex_loop_web_relay.py`
