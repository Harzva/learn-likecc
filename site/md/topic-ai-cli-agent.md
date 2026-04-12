# CLI Agent 专页
> **更新时间**: 2026-04-12

重点先看一张更完整的谱系图：

- Claude Code
- Codex
- Qwen Code
- OpenCode
- Gemini CLI
- MiniMax 的 Codex CLI 适配路线
- Cursor / Qoder / Trae 这类终端相邻工作台

这页不做“谁最强”的抽象排名，更关心：

- 你是不是把终端当主工作界面
- 你是要用产品，还是要研究开源 agent 壳层
- 你是选完整工作流、开源终端壳，还是终端相邻工作台

## 一句话理解

- Claude Code：终端工作流完成度很高
- Codex：OpenAI 编程代理产品线入口
- Qwen Code：官方开源终端 agent
- OpenCode：更偏 TUI-first 的开源终端壳层
- Gemini CLI：Google 模型生态进入 terminal workflow 的代表
- MiniMax：更适合作为模型接入现有 CLI agent，而不是单独成熟 CLI 品牌来看
- Cursor / Qoder / Trae：和 CLI Agent 有交集，但更适合归到编辑器或工作台路线

## Repo-backed 补充：CLI Agent 其实至少有三种壳

如果把所有终端 agent 都放进一个篮子里，很容易误判它们到底在解决什么问题。结合 `reference/` 里的样本，更稳妥的教法是先分壳层。

| 壳层类型 | 代表样本 | 它主要解决什么 | 该怎么看 |
| --- | --- | --- | --- |
| workflow-complete terminal shell | Claude Code / Codex / Qwen Code / MiniMax 接入路线 | 把计划、执行、工具调用、模型接入和终端工作流压进一个主入口 | 适合把终端当主界面来用，重点看 workflow 完整度与生态收口 |
| TUI-first open shell | `reference/reference_agent/reference_control-agent-cli/anomalyco-opencode/` | 把 terminal UI、本地/远程 client、provider-agnostic 接入、内置 agent 模式做成更偏终端原生的交互壳 | 适合研究开源壳层、交互设计和 client/server 终端体验，而不只是“能不能写代码” |
| artifact-control CLI | `reference/reference_agent/reference_control-agent-cli/OfficeCLI/` | 让 agent 直接控制 Word / Excel / PowerPoint 这类文档产物，而不是只管代码仓库 | 适合把它看成 document control plane，不该再混回 generic coding shell |

所以这页后面再扩时，重点不是只把名字越列越多，而是先判断你要选的是哪一类终端壳。

## 站内实验线：Everything Agent-CLI to Claude Code

如果前面的内容是在回答“CLI Agent 有哪些路线”，那这个仓库回答的是另一个更工程化的问题：

**怎么把网页登录 + 官方 CLI 才能用的能力重新接回 Claude Code / LikeCode 主工作流。**

- 仓库：<https://github.com/Harzva/everything-agent-cli-to-claude-code>
- 本地路径：`projects/everything-agent-cli-to-claude-code/`

它的核心思路是：

- Claude Code / LikeCode 继续当 control plane
- `codex`、`gemini`、`qwen`、`grok` 等官方 CLI 变成外部 worker
- 通过统一的 `usecli:*` 命名和 workflow 规范，把这些能力编排回同一个 coding loop

这也是它值得挂进 CLI Agent 专题的原因：

- 它不是再多列一个产品名
- 而是在回答“终端里的多模型能力如何真正被调度起来”
- 它已经附带 `tests/test_wrappers.sh` 这类本地 smoke test，不只是概念说明
- 同时也给 `gemini-plugin-cc`、`qwen-plugin-cc`、`grok-plugin-cc` 到 `cursor/qoder/trae-plugin-cc` 这一整条插件家族提供 umbrella repo
- 而且分层是清楚的：统一命名、workflow 和 wrapper 留在总仓库，provider 细节下沉到各自 `*-plugin-cc`

如果要继续往下拆，站内已经单独开了一页子专题：

- `topic-everything-agent-cli.html`
- https://harzva.github.io/learn-likecc/topic-everything-agent-cli.html

## 别混淆：有些产品和 CLI Agent 有关，但不该直接当成纯 CLI

| 路线 | 代表样本 | 为什么会被误放进 CLI Agent | 更准确的归类 |
| --- | --- | --- | --- |
| terminal-adjacent IDE | Cursor | 它有 terminal、agent、命令执行和工作流自动化，因此经常被口头叫成“Cursor CLI” | 更适合归到 AI IDE / 编辑器工作台，而不是纯 CLI 主战壳 |
| coding studio / workspace | Qoder | 它有 agentic 编程和研发空间属性，很多人会把整个平台误缩写成一个 CLI | 更像研发空间或 agent 工作台 |
| AI IDE with agent mode | Trae | 它和 Solo、编辑器、Agent 模式经常一起出现，容易在讨论里被压扁成单个 CLI | 更适合归到 AI IDE / agent 工作台路线 |

## Repo-backed 再补一层：CLI Agent 的 approval surface 也不一样

只分壳层还不够，因为很多 CLI agent 真正让人卡住的，不是“能不能进终端”，而是**它到底让你批准什么**。

| approval surface | 代表样本 | 真正被批准的对象 | 选型时该怎么看 |
| --- | --- | --- | --- |
| action approval | `reference/reference_agent/reference_control-agent-cli/opencode/README.md` + `internal/permission/permission.go` | 单次 tool action，或当前 session 的持续放行 | 适合重视即时操作流畅度的人，但要分清它批准的是动作，不是整个工作区都“安全了” |
| artifact review | `reference/reference_agent/reference_control-agent-cli/OfficeCLI/SKILL.md` | 文稿修改提案，先 `mark` 再 review / apply | 适合文档、表格、演示文稿这类产物控制场景；重点不是快，而是先审再落盘 |
| dangerous-command gate | `reference/reference_agent/hermes-agent/hermes_cli/main.py` | 危险命令执行；默认要过 prompt，只有显式 `--yolo` 才整体绕过 | 适合把它当风险姿态来理解，而不是把 `--yolo` 当普通 convenience flag |

所以 CLI Agent 不只是“产品壳 / 开源壳 / 文档壳”的差别，还要看 approval model：

- 如果你主要想降低日常 tool 调用摩擦，优先看 action approval 做得是否清楚。
- 如果你主要在改文档、表格、演示稿，优先看 artifact review 是否独立存在。
- 如果某个工具把全局绕过 approval 当卖点，那更像风险开关，不该被包装成普通工作流体验。

这样看，`Claude Code / Codex / Qwen Code / MiniMax 接入路线` 这条主战线之外，`OpenCode / OfficeCLI / Hermes Agent` 更像是在补三种不同的 approval surface，而不是只是在补“更多名字”。
