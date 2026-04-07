# Changelog

## Unreleased

- 为“多窗口 / 会话页签 / subagent 工作视图”新增第一版独立设计稿，明确 `tab` 优先于 `pane`
- 将该设计稿进一步拆成可执行开发任务清单：状态层、Tab UI、Tab 行为、状态绑定、快捷键、Subagent 面板、验证与发布
- 新增 `v1.0.2_plan.md`，把 tab 模式起步版正式映射到具体版本计划
- 在代码里接入 `sessionTabs`、`SessionTabState`、`SessionTabsMetadata` 第一层状态骨架，为后续 tab UI 和快捷键铺底
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
