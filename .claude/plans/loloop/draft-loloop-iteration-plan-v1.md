# loloop-iteration-plan.md

## Goal

Evolve `loloop` from a plain plan wrapper into a stronger iterative method with better in-loop correction and post-iteration review while still using the official `/loop`.

## 承上启下

`v2.5.2_plan.md` 已经把站点里的 loop / loop-in-loop 表达与实验基座做出来了。
当前这一步不再继续扩大 `v2.5.2` 的站点范围，而是把其中的方法论抽出来，沉淀为 `.claude/skills/loloop` 的下一阶段能力。

## Scope

- [x] 把 review checkpoint 写入 `loloop` skill
- [ ] 设计 `loloop` 的“每轮复盘最小模板”，避免 evolution note 退化成流水账
- [ ] 设计 `loloop` 的“失败后改写下一轮 /loop handoff”规则
- [ ] 真实跑一轮 `loloop`，留下一条完整 evolution 记录
- [ ] 评估是否要把 `loloop` 再拆成工程版 / 论文版两个变体

## Deliverable

- 更成熟的 `loloop` 技能说明
- 一条真实 evolution 记录
- 下一轮 `/loop` 可直接使用的 handoff
