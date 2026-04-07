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
- 切换 tab 时，主消息区开始切到该 tab 自己保存的 transcript，而不只是切标题与预览
- tab 开始真正绑定自己的 `model / provider / transcript / todo lane`，切换 tab 后能带出对应状态
- subagent 面板已从纯占位升级为第一版真实状态视图，可看到当前聚焦 transcript 与运行中的 agent
- 新增 `/show:slash`，可在终端内查看所有 slash command 与用法
- 启动 logo 改为红色爱心，强化 Like Code 的 `like` 含义
- 文档明确：`tab` 与 `branch` 不重复，但下一优先级应转向 panel / 分屏 / subagent 状态视图
- README 顶部与长期路线图同步更新，未完成项继续保留在 todo 中，方便后续按版本推进与发版同步
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
