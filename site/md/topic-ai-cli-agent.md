# CLI Agent 专页

重点看四条线：

- Claude Code
- Codex
- Qwen Code
- MiniMax 的 Codex CLI 适配路线

这页不做“谁最强”的抽象排名，更关心：

- 你是不是把终端当主工作界面
- 你是要用产品，还是要研究开源 agent 壳层
- 你是选完整工作流，还是选平台生态收口

## 一句话理解

- Claude Code：终端工作流完成度很高
- Codex：OpenAI 编程代理产品线入口
- Qwen Code：官方开源终端 agent
- MiniMax：更适合作为模型接入现有 CLI agent，而不是单独成熟 CLI 品牌来看

## Repo-backed 补充：CLI Agent 其实至少有三种壳

如果把所有终端 agent 都放进一个篮子里，很容易误判它们到底在解决什么问题。结合 `reference/` 里的样本，更稳妥的教法是先分壳层。

| 壳层类型 | 代表样本 | 它主要解决什么 | 该怎么看 |
| --- | --- | --- | --- |
| workflow-complete terminal shell | Claude Code / Codex / Qwen Code / MiniMax 接入路线 | 把计划、执行、工具调用、模型接入和终端工作流压进一个主入口 | 适合把终端当主界面来用，重点看 workflow 完整度与生态收口 |
| TUI-first open shell | `reference/reference_agent/reference_control-agent-cli/anomalyco-opencode/` | 把 terminal UI、本地/远程 client、provider-agnostic 接入、内置 agent 模式做成更偏终端原生的交互壳 | 适合研究开源壳层、交互设计和 client/server 终端体验，而不只是“能不能写代码” |
| artifact-control CLI | `reference/reference_agent/reference_control-agent-cli/OfficeCLI/` | 让 agent 直接控制 Word / Excel / PowerPoint 这类文档产物，而不是只管代码仓库 | 适合把它看成 document control plane，不该再混回 generic coding shell |

所以这页后面再扩时，重点不该是“再多列几个名字”，而是先判断你要选的是哪一类终端壳。
