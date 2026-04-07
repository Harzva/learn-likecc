# Changelog

## Unreleased

- 为“多窗口 / 会话页签 / subagent 工作视图”新增第一版独立设计稿，明确 `tab` 优先于 `pane`
- 将该设计稿进一步拆成可执行开发任务清单：状态层、Tab UI、Tab 行为、状态绑定、快捷键、Subagent 面板、验证与发布
- 新增 `v1.0.2_plan.md`，把 tab 模式起步版正式映射到具体版本计划
- 在代码里接入 `sessionTabs`、`SessionTabState`、`SessionTabsMetadata` 第一层状态骨架，为后续 tab UI 和快捷键铺底
- 主 REPL 已接入顶部 tab UI，支持显示当前 tab、模型/provider/状态和 `+ /tab new` 提示
- 新增 `/tab` 管理命令，支持 list/new/next/prev/switch/rename/close/panel
- 新增 `Ctrl+g` 前缀快捷键，第一批支持新建、切换、关闭、面板切换和编号跳转
- `panel / 分屏` 第一版已经接入主 REPL，支持在工作区侧栏里展示当前 tab、任务和 subagent 状态
- pane 模式下底部开始出现多个可见对话框区域，不再永远只有一个共享视觉输入框
- 左右 pane 开始显示各自保存下来的 transcript 预览，分屏里不再继续共用同一段可见对话内容
- non-active pane 已升级成“准可操作态”，开始显示自己的 transcript 摘要、todo 摘要、draft 提示和更明确的激活文案
- 新增 `/tab focus left|right|1|2`，并补上 `Ctrl+g h / l`，让左右 pane 的聚焦切换更贴近分屏心智
- pane 现在开始直接显示自己的 task lane 摘要，不用只靠 workspace 侧栏判断“这边在忙什么”
- 每个 tab 开始固定自己的逻辑 todo lane 标识，为后续真正的 pane todo 隔离继续铺底
- tasks 链开始读取当前 active pane 的逻辑 lane override，向 pane 级任务隔离继续推进
- 切换 tab 时，主消息区开始切到该 tab 自己保存的 transcript，而不只是切标题与预览
- todo lane 开始按 tab 保存和恢复，切换 tab 后会看到对应 tab 自己那份待办/任务快照
- tab 开始真正绑定自己的 `model / provider / transcript / todo lane`，切换 tab 后能带出对应状态
- subagent 面板已从纯占位升级为第一版真实状态视图，可看到当前聚焦 transcript 与运行中的 agent
- 新增 `/show:slash`，可在终端内查看所有 slash command 与用法
- 启动 logo 改为红色爱心，强化 Like Code 的 `like` 含义
- 文档明确：`tab` 与 `branch` 不重复，但下一优先级应转向 panel / 分屏 / subagent 状态视图
- README 顶部与长期路线图同步更新，未完成项继续保留在 todo 中，方便后续按版本推进与发版同步
- 新增 localhost Web UI 工作台设计稿，明确 CLI 继续做最小可用验证，Web UI 承接结构化 transcript、时间线、切模型记录和思考过程卡片流
- 新增 localhost Web UI 读取协议草案，拆出 `session / pane / transcript / events` 四层读取模型
- 起好 localhost 第一版只读接口骨架，当前已支持 `/api/sessions`、`/api/sessions/current`、`/api/sessions/current/panes`、`/api/sessions/current/panes/:paneId/transcript`、`/api/sessions/current/events`
- localhost 根路径已从纯 JSON API 索引升级成可直接打开的 dashboard，开始展示 `session / pane / transcript / subagent / events`
- 新增 `/api/sessions/current/subagents`，当前 subagent 摘要主要来自 `AppState.tasks` 与 pane 绑定关系
- transcript 摘要开始抽取 `text / thinking / tool_use / tool_result`，为后续工作流与流程图展示继续铺底
- Web UI transcript 已继续细化为 `messages / cards / workflow` 三层结构，开始同时展示消息流、thinking 卡片和工具时间线
- 当前 active pane 在初始化进入时也会优先恢复自己保存下来的 todo 快照，继续把 pane 隔离往更真实的方向推进
- Web UI transcript 已继续补出 `stages`，开始按 `prompt / thinking / tool / response / system` 展示更清楚的阶段节点
- tool 卡片开始带出 `input / output / toolUseId`，更接近真实 coding 过程观察台
- 新建 pane/tab 会以空 transcript 与空 todo 快照起步，减少跨 pane 的全局残留状态继承
- pane 的 `inputMode / pastedContents / stashedPrompt` 已开始按窗口保存和恢复，继续降低不同 pane 之间共享同一份输入态的问题
- Web UI transcript 已补出 `turns / toolPairs`，开始支持更清楚的 tool 输入输出配对与 turn replay
- Web UI 首页已直接渲染 `Tool Pairs`，不再只在接口里暴露
- Web UI transcript 已继续补出 `toolChains`，并给 `toolPairs` 增加 `chainId / step / previous / next`，开始更清楚地串起跨 turn 的同一条工具链
- `progress` 消息也开始挂到对应的 tool 链上，增强真实工具执行中的中间过程可见性
- pane 现在会继续保存和恢复 `vimMode / history search / bashes dialog / help / message selector` 这些输入相关开关，进一步减少全局 REPL 输入残留
- `message selector` 的预选消息也会跟随 pane 保存和恢复，减少不同窗口之间的恢复目标串线
- pane 的 `conversationId / submitCount` 也开始跟随窗口保存和恢复，进一步减少多个 pane 共用同一份对话节奏
- 真实 `tool progress` 也开始进入 `toolChains`，让 Web 工作台在最终 `tool_result` 返回前先展示执行中的工具链
- transcript 的 `show all / dump mode` 也开始跟随 pane 保存和恢复，减少不同窗口之间的查看状态串线
- transcript 搜索条的打开状态也开始跟随 pane 保存和恢复，减少切 pane 后搜索 UI 被统一重置
- transcript 搜索词也开始跟随 pane 保存和恢复，减少不同窗口之间的阅读上下文串线
- transcript 搜索的命中数量与当前位置也开始跟随 pane 保存和恢复，减少切 pane 后重新丢失阅读锚点
- `toolChains.steps` 已开始明确拆成 `tool_use / progress / tool_result`，让 Web 侧回放更接近真实 coding 过程
- 启动头的蓝色爱心、蓝色 `Like` 与蓝色 `code` 已统一成一套品牌头图
- 启动界面新增 Web 工作台网址，并把 logo 收成蓝色爱心 + 多行大字 `Like` + `code · Harzva restored · v2.1.88`
- 本轮以文档与规划推进为主，暂不单独提升 release 版本号，避免出现“版本先发、功能未落地”的错位

## 1.0.1-likecode - 2026-04-07

- 新增多 Provider 第一阶段能力：支持项目本地 `modelRoutes`，可按模型自动切换 `baseURL`、`authToken`、`headers`
- `/model` 菜单开始自动展示本地配置过的外部模型
- 修复第三方兼容网关 `headers` 结构不标准导致的重试与日志链路崩溃
- 启动界面升级为 `Like Code` 风格，支持彩色信息层、仓库地址展示、命令路径展示
- 启动界面新增 Global / Project / Local 三层 `.claude` 配置摘要
- 新增 `/show`、`/show:global`、`/show:user`、`/show:project`，方便在无编辑器环境下查看配置、技能、hooks、rules、modelRoutes
- README、站点首页、专项路线图与 Markdown lint 工具链同步更新

## 1.0.0-likecode - 2026-04-07

- 建立 Learn LikeCode 叙事与产品化首页
- 完成启动页品牌化基础与项目本地配置实验路径
- 建立自由模型路线图与仓库内 Markdown lint 基线
