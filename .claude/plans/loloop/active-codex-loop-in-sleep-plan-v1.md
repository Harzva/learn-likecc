# Active Codex Loop In Sleep Plan v1

## Goal

把 `codex-loop in sleep` 做成 AI-Scientist 线里的稳定子专题与长期改进路线，而不是只停留在一次对 `ARIS` 的阅读分析上。

## Current focus

- [x] 把 `Auto-claude-code-research-in-sleep` clone 到 `reference/reference_ai_scientist/`
- [x] 完成第一版对照分析：`ARIS` vs `codex-loop`
- [x] 产出站内第一版子专题页
- [x] 把第一条“可借鉴能力”真正回写到 `codex-loop` 路线图

## Reference anchors

- [x] `reference/reference_ai_scientist/Auto-claude-code-research-in-sleep/`
- [x] `reference/reference_agent/aris/`
- [x] `reference/reference_agent/autoresearch/`
- [ ] 决定是否还需要补 `ARIS` 邻近仓库作对照

## Borrow lines

### 1. Meta optimize line

- [x] 识别 `meta-optimize` 是最值得借的外层能力之一
- [x] 把 `codex-loop` 当前日志 / prompt / skill 自优化缺口写清
- [x] 形成一版可执行的 `meta-opt` 路线草案

### 2. Persistent wiki line

- [x] 识别 `research-wiki` 是核心差异层
- [ ] 决定 `codex-loop` 应该先长 project wiki、topic wiki 还是 failed-attempt memory
- [ ] 把第一版 memory layout 写回站内和计划文件

### 3. Watchdog health layer

- [x] 识别 `watchdog.py` 提供了健康层样本
- [ ] 把 daemon / workspace / watchdog 三层边界写清
- [ ] 决定要不要在 `codex-loop` 里单独建 watchdog 计划线

### 4. Workflow family

- [x] 识别 `workflow family` 是 ARIS 的方法厚度来源之一
- [ ] 判断 `codex-loop` 现在已有的 site / publish / reference / workspace 线是否足够形成 family map
- [ ] 在站内补一张 `workflow family vs single loop shell` 对照图

### 5. Cross-model review

- [x] 识别 executor / reviewer 分工值得借
- [ ] 评估是否先在站点 / 发布链路里试点 reviewer role
- [ ] 避免在没有明确收益前把 loop 复杂度抬太高

## Topic outputs

- [x] `site/topic-codex-loop-in-sleep.html`
- [x] `site/md/topic-codex-loop-in-sleep.md`
- [ ] 从这页继续拆出一张结构图或方法图
- [ ] 在 `AI-Scientist` 总页里把它固定成长期子专题入口

## Routing rules

- `ARIS / Auto-Research In Sleep`
  - 优先解释成研究专用 `in-sleep system`
- `codex-loop`
  - 优先解释成通用型 `in-sleep shell`
- `watchdog / meta-opt / research-wiki`
  - 优先解释成外层能力，而不是某个零散 feature

## Validation

- [x] `python3 tools/refresh_site_topic_metadata.py`
- [x] `python3 tools/build_loop_task_board.py`
- [x] `python3 tools/check_site_md_parity.py`

## Current status

第一条 route-back 已经落地：先把 `meta-optimize` 回写成一条最小 prompt 规则，要求每轮把重复性的 loop 低效点收敛成一条 `loop improvement candidate`，并且只有在重复出现或明确改善下一 tick 时才升级进 `.codex-loop/prompt.md`。下一步重点可以切到 `persistent wiki` 或 `watchdog`，而不是继续泛写对照分析。
