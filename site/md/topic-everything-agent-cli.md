# Everything Agent-CLI to Claude Code

> **在线页面**: https://harzva.github.io/learn-likecc/topic-everything-agent-cli.html  
> **本文件**: `site/md/topic-everything-agent-cli.md`

这页是 `CLI Agent` 专题下的一条实验子线，专门讲：

**怎么把网页登录、订阅权益、官方 CLI 才能用的能力重新接回 Claude Code / LikeCode 主工作流。**

## 一句话结论

`everything-agent-cli-to-claude-code` 的核心不是“再接一个 API”，而是把被网页登录和官方 CLI 壳隔离的能力，重新恢复成 Claude Code / LikeCode 可调度的外部 worker。

## 01 · 它到底在解决什么问题

这条线针对的是很真实的工作流裂缝：

- 有些能力绑定在网页登录和官方 CLI 上
- 你有额度、有订阅，但没有对等公开 API
- 同一任务里想混用多个模型
- 又不想开七个终端来回切

所以它更像一个：

- 多模型 CLI 编排层
- 而不是普通的 API 聚合层

## 02 · 架构心智模型

```text
Claude Code / LikeCode
        ->
umbrella skill: usecli:*
        ->
provider wrapper
        ->
official provider CLI
        ->
web-login entitlement / subscription / free quota
```

关键点：

- 主工作台继续留在 Claude Code / LikeCode
- 外部 CLI 变成 worker
- `codex`、`gemini`、`qwen`、`grok` 可以进入同一个 workflow
- `cursor / qoder / trae` 这类命令面还不稳定的工具，也能先以 scaffold repo 占位

## 03 · 仓库家族怎么拆

当前家族分层：

- `everything-agent-cli-to-claude-code`
  - umbrella repo
  - 负责定位、命名、workflow、registry、总入口
- `gemini-plugin-cc`
  - Gemini provider bridge
- `qwen-plugin-cc`
  - Qwen provider bridge
- `grok-plugin-cc`
  - Grok provider bridge
- `cursor-plugin-cc`
  - Cursor scaffold bridge
- `qoder-plugin-cc`
  - Qoder scaffold bridge
- `trae-plugin-cc`
  - Trae scaffold bridge

这种拆法的价值在于：

- 总仓库讲控制面和统一命名
- 子仓库讲 provider 细节和本机差异

## 04 · 现在是怎么验证的

这条线已经有一组最小可跑验证：

- umbrella wrapper 测试：
  - `projects/everything-agent-cli-to-claude-code/tests/test_wrappers.sh`
- provider 测试：
  - `projects/gemini-plugin-cc/tests/test_wrapper.sh`
  - `projects/qwen-plugin-cc/tests/test_wrapper.sh`
  - `projects/grok-plugin-cc/tests/test_wrapper.sh`
- scaffold placeholder 测试：
  - `projects/cursor-plugin-cc/tests/test_wrapper.sh`
  - `projects/qoder-plugin-cc/tests/test_wrapper.sh`
  - `projects/trae-plugin-cc/tests/test_wrapper.sh`

这意味着：

- 已接入的 provider 在测命令构造和 workflow 输出
- 还没真实接上的 scaffold 仓库，也先测统一参数面和占位契约

## 05 · 它和 CLI Agent 专题的关系

`topic-ai-cli-agent.html` 讲的是：

- 有哪些路线
- 应该怎么分类

这一页讲的是：

- 如果真想把多个 provider CLI 接回一个主工作流
- 工程上应该怎么做

两页合起来的关系更像：

- 前者给地图
- 这页给施工方案
