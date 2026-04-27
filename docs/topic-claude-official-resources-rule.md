# Claude 官方资源翻译维护规则

适用页面：

- `site/topic-claude-official-resources.html`

适用来源：

- `https://claude.com/resources/tutorials`
- `https://claude.com/resources/use-cases`
- `https://www.anthropic.com/engineering`

## 维护原则

1. 先判断来源类型，不要把三类资源混在一起：
   - `tutorials` = 功能上手 / 产品导览
   - `use-cases` = 场景案例 / 工作方式
   - `engineering` = 工程方法 / 系统设计 / 产品实现
2. 优先翻与站内现有主线强相关的文章：
   - Claude Code
   - Managed Agents / Meta-Agent
   - Harness / loop / runtime
   - 权限、安全、tools、context engineering
3. 单篇翻译时保留原文链接和必要图片，不要只剩文字摘要。

## 图片规则

1. 先保总览页截图：
   - `site/images/claude-official-resources/tutorials-overview.png`
   - `site/images/claude-official-resources/use-cases-overview.png`
   - `site/images/claude-official-resources/engineering-overview.png`
2. 单篇文章默认至少保留一类视觉证据：
   - 封面图
   - 结构图
   - 界面截图
   - 关键对照图
3. 如果原文图片不适合直接热链，优先走本地截图资产。

## 单篇翻译落点

优先判断该文更适合进入哪条站内线：

- `tutorial.html`
- `topic-meta-agent.html`
- `topic-cc-release-watch.html`
- `topic-codex-loop-in-sleep.html`
- `topic-connector-runtime-daemon.html`
- 或新的独立子页

## 操作顺序

1. 更新 `site/topic-claude-official-resources.html` 的队列或入口
2. 必要时用截图流程刷新总览图或单篇图
3. 新增单篇翻译页
4. 把入口挂回合适专题
5. 更新对应 plan 与 evolution

## 不要做的事

- 不要把维护规则直接写进 HTML 正文
- 不要整页机械直译 `Use Cases`
- 不要丢掉工程博客里的关键图和结构说明
- 不要只加外链而不在站内给出落点判断
