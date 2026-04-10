# Claude Code 发版监督 · 官方版本速览

> **在线页面**: [https://harzva.github.io/learn-likecc/topic-cc-release-watch.html](https://harzva.github.io/learn-likecc/topic-cc-release-watch.html)  
> **本文件**: `site/md/topic-cc-release-watch.md`

## 导语

**发版监督**指：持续对照 **Anthropic 官方 Claude Code CLI** 的公开变更记录，弄清「每个版本大致改了什么」，并与本站 **Source Map 源码课**（重建 TS 树）的阅读节奏对齐。本站**不替代**官方 changelog，只在中文语境下做**速览表 + 维护约定**。

## 权威来源（请以这里为准核对全文）

| 来源 | 说明 |
| --- | --- |
| [Anthropic 文档 · Changelog](https://docs.anthropic.com/en/docs/claude-code/changelog) | 与 GitHub `CHANGELOG.md` 同步生成 |
| [GitHub · anthropics/claude-code CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) | 完整条目与历史版本 |
| [npm · @anthropic-ai/claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code) | 包版本与发布时间线 |
| CLI 内 `/release-notes` | 交互式版本说明（新版本起为版本选择器） |

本地版本：`claude --version` / `claude -v`。

## 近期版本速览（中文要点）

> 下表由维护者根据上游 `CHANGELOG.md` **手工摘录**；**完整 diff 级说明请读官方链接**。更新本页时：在表**顶部**插入新版本一行，并保留若干历史行以便对照。

| 版本 | 要点（非穷尽） |
| --- | --- |
| **2.1.101** | 新增 `/team-onboarding`，可基于本地 Claude Code 使用痕迹生成 teammate ramp-up guide；默认信任操作系统 CA 证书库以适配企业 TLS 代理；远程会话相关功能可自动创建默认 cloud environment；plan mode 在 org/auth 根本到不了 Claude Code Web 时会隐藏 `Refine with Ultraplan`；`focus mode` 会主动写更自足的最终总结；`brief mode` 遇到 plain text 会自动重试一次结构化消息；`tool-not-available` 报错开始解释“为什么当前上下文拿不到工具”；rate-limit retry 信息开始直接显示命中的限制类型和重置时间；refusal 错误现在会带出 API 侧给出的解释；同时修了一批 `--resume`、插件、权限、subagent、Remote Control 与长会话内存问题。 |
| **2.1.98** | Vertex AI 三方登录向导；新增 **Monitor tool** 用于流式读取后台脚本事件；Linux 子进程沙箱隔离与 `CLAUDE_CODE_SCRIPT_CAPS`；`--exclude-dynamic-system-prompt-sections` 改善跨用户 prompt cache；Perforce / worktree / tracing / LSP `clientInfo` 等工程向增强；同时修了一批 Bash 权限绕过与 `/resume` / hooks / transcript 问题。 |
| **2.1.97** | `NO_FLICKER` 的 Focus View；status line `refreshInterval`；`workspace.git_worktree` 进入 status line JSON；`/agents` 显示运行中 subagents；多项权限、`/resume`、MCP OAuth、上下文压缩、OTEL tracing 与 `NO_FLICKER` 修复。 |
| **2.1.92** | `forceRemoteSettingsRefresh` 策略；Bedrock 交互配置向导；`/cost` 按模型与缓存命中细分；`/release-notes` 改为交互选版；Remote Control 默认会话名带 hostname；移除 `/tag`、`/vim`（改走 `/config`）；Linux sandbox 附带 `apply-seccomp`；多项全屏/子代理/Homebrew 渠道修复 |
| **2.1.91** | MCP 工具结果可通过 `_meta` 放宽长度；`disableSkillShellExecution`；deeplink 支持多行；插件 `bin/` 可执行；`--resume` 与计划模式远程会话等修复；Edit 锚点缩短降 token |
| **2.1.90** | 新增 `/powerup` 交互教程；插件市场失败时保留缓存的 env；`.husky` 受保护；费率限制弹窗死循环、resume 与 prompt cache、PowerShell 安全与性能等多项修复 |
| **2.1.89** | PreToolUse 支持 `"defer"`；`CLAUDE_CODE_NO_FLICKER`；Auto mode 拒绝可重试；MCP 非阻塞与超时；Hooks、Edit/Read、SDK、stats、沙箱等大量修复与行为调整 |
| **2.1.87** | Cowork Dispatch 消息投递修复 |
| **2.1.86** | API 请求 `X-Claude-Code-Session-Id`；`.jj`/`.sl` 目录排除；旧会话 resume、插件脚本权限、多终端与 VS Code 扩展等问题修复 |
| **2.1.85** | MCP `headersHelper` 相关 env；Hooks 条件 `if`；deeplink 长度上限；MCP OAuth 发现；组织策略下插件屏蔽；OpenTelemetry 工具详情门控；多项 resume/MCP/UI 修复 |

## 新版关键词：/team-onboarding 开始把隐性用法写回团队文档

`2.1.101` 里最值得单独拎出来的新词，是 `/team-onboarding`。官方 changelog 对它的描述很短，但信号很强：Claude Code 不只是继续补单人会话体验，而是开始把 **你在本地怎样使用 Claude Code** 沉淀成可以交给同事的 ramp-up guide。

这条为什么值钱：

- 它把“个人工作习惯”往“团队可复制流程”推了一步
- 它不是让团队再手写一份抽象 wiki，而是从真实 usage 反推 onboarding 文档，这和本站一直强调的“从运行痕迹抽结构”是同一条思路
- 它意味着 Claude Code 的控制面不只盯当前 agent loop，也开始盯团队成员如何更快接上已有工作流

如果把 `Monitor tool`、status line、安全边界、prompt cache 都看成“把单次会话做得更可观察、更可控”，那 `/team-onboarding` 更像再补一层：**把个人会话里的 tacit knowledge 往团队入口迁移**。这对我们自己的 `codex-loop`、技能包、教程页都很相关，因为一旦系统不只服务一个人，最容易断的不是工具能力，而是新人怎样接上前人的命令面、目录结构和习惯动作。

### [插图提示词]

用途：画“Claude Code 团队 onboarding 生成链路”小图，强调从个人本地 usage 到 teammate guide 的沉淀过程。  
形式：流程图。  
提示词：画一个 Claude Code team onboarding flow。左侧是个人本地 Claude Code usage，包括 commands、workflows、plugins、naming habits；中间是 `/team-onboarding` 提取并整理这些模式；右侧是 teammate ramp-up guide，包含 recommended commands、project conventions、handoff notes。底部补一句说明：把 tacit usage 变成团队可复用入口。  
Mermaid 更适合：是。

### 本轮原始来源

- 官方文档：`https://code.claude.com/docs/en/changelog`（`2.1.101`, 2026-04-10）
- GitHub Raw：`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

## 再补一刀：plan mode 会在 Web 根本不可达时直接隐藏 Refine with Ultraplan

`2.1.101` 里还有一条很像能力前置判定的变化：当用户的 org 或 auth setup **根本到不了 Claude Code on the web** 时，plan mode 现在会 **直接隐藏 `Refine with Ultraplan`**，而不是先把按钮摆出来，再让你点到失败。

这条为什么值得记：

- 它把“功能存在”与“当前账户 / 组织 / 网络条件下能不能用”拆成了两层
- 它说明 Claude Code 团队开始把 capability gating 提前到交互层，而不是把失败留到按钮点击之后
- 它对我们自己的插件、远程会话、工具链页面都很相关，因为很多系统的问题不是功能没实现，而是 **当前环境根本不满足使用前提**，这时最好的体验不是报错，而是不要假装这项能力此刻可达

如果把之前的 cloud environment 自动创建看成“远程能力的底座前移”，那这一刀更像“远程 refinement 能力的前置判定”。一个是在满足前提时帮你自动补底座，另一个是在不满足前提时直接把入口收掉。两者共同说明 Claude Code 正在更认真地区分 **什么时候该自动补齐，什么时候该直接隐藏**。

### [插图提示词]

用途：画“Ultraplan 能力前置判定”小图，说明 org/auth/web reachability 检查与按钮显示之间的关系。  
形式：流程图。  
提示词：画一个 Claude Code Ultraplan gating flow。左侧是 plan mode UI，中间做 org check、auth check、web reachability check；如果都通过，则显示 Refine with Ultraplan；如果失败，则隐藏入口而不是让用户点击后报错。底部补一句说明：把能力判定前移到交互层。  
Mermaid 更适合：是。

### 本轮原始来源

- 官方文档：`https://code.claude.com/docs/en/changelog`（`2.1.101`, 2026-04-10）
- GitHub Raw：`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

## 再补一刀：focus mode 开始按“你只看最终消息”来写更自足的总结

`2.1.101` 里还有一条表面像写作风格调整、其实很像交付面被显式建模的变化：Claude 在 `focus mode` 下会 **写得更 self-contained**，因为系统知道你看到的只是最终消息，而不是整段中间过程。

这条为什么值得单独记：

- 它说明 Claude Code 团队已经不再把“最后一句回复”当成普通 chat 输出，而是把它当成一个有明确阅读场景的交付面
- 它把总结质量从“模型自由发挥”往“根据可见界面形态约束输出”推进了一步
- 它对我们自己的 `codex-loop`、长任务 handoff、总结页都很相关，因为一旦用户只能看到最后态，系统就必须主动把上下文补齐，否则就会出现“模型其实做对了，但最后消息不够自足”的交付失败

如果把前面的 brief retry 看成“格式契约出错时自动恢复”，那 focus-mode summary 更像“当只剩最终态可见时，系统主动重写输出契约”。它们都在说明 Claude Code 开始更认真地对待 **用户实际能看到什么，以及最后该交付成什么样**。

### [插图提示词]

用途：画“Claude Code focus mode 终态摘要”小图，对比可见全程和只见最终消息两种界面条件下的总结要求。  
形式：对比图。  
提示词：画一个 Claude Code focus mode final-message comparison。左侧是 full conversation view，用户能看到中间过程，summary 可以更短；右侧是 focus mode，只显示 final message，所以 summary 需要 self-contained，包含 context、decision、result、next step。底部补一句说明：输出形式要跟可见界面匹配。  
Mermaid 更适合：否，更适合左右对比卡片图。

### 本轮原始来源

- 官方文档：`https://code.claude.com/docs/en/changelog`（`2.1.101`, 2026-04-10）
- GitHub Raw：`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

## 再补一刀：refusal 错误开始把 API 侧解释带出来

`2.1.101` 里还有一条短小但很关键的变化：Claude Code 现在会 **在 refusal error message 里带上 API 提供的 explanation**，而不是只告诉你“被拒了”。

这条为什么值得记：

- 它把 refusal 从一个过于抽象的结果状态，往 **可解释的拒绝边界** 推进了一步
- 它让用户在排查问题时，终于能区分是提示内容、权限边界、策略命中还是别的上游原因，而不必面对一条没有上下文的拒绝提示
- 它对长期运行系统很重要，因为在真实 loop 里，拒绝本身并不可怕，真正昂贵的是 **不知道为什么被拒、因此不知道下一步该改什么**

如果把前面的 `tool-not-available`、rate-limit、brief retry 都看成“失败和恢复状态开始变得更可运营”，那 refusal explanation 就是在补最后一块：当系统没有继续执行时，它至少应该把上游 API 愿意透露的理由带给用户，而不是把拒绝再包成一层黑盒。

### [插图提示词]

用途：画“Claude Code refusal feedback 升级”小图，对比旧版空泛拒绝和新版带 explanation 的拒绝反馈。  
形式：对比图。  
提示词：画一个 Claude Code refusal feedback comparison。左侧是旧版 generic refusal error，只显示 request refused；右侧是新版 refusal error，附带 API-provided explanation 与 next-step hint。底部补一句说明：把拒绝从黑盒状态变成可解释的控制面反馈。  
Mermaid 更适合：否，更适合左右对比卡片图。

### 本轮原始来源

- 官方文档：`https://code.claude.com/docs/en/changelog`（`2.1.101`, 2026-04-10）
- GitHub Raw：`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

## 再补一刀：brief mode 遇到 plain text 会自己补一次结构化重试

`2.1.101` 里还有一条很像协议恢复层补课的变化：如果 `brief mode` 期待的是 **structured message**，但 Claude 先回了 plain text，系统现在会 **自动重试一次**，而不是把这次结构化失败原样甩给用户。

这条为什么值得单独记：

- 它说明 Claude Code 团队已经把“模型输出不符合预期格式”当成一个需要显式兜底的协议问题
- 它把一次常见的 structured-output 偏移，从用户手动重试变成系统自动修复
- 它对我们自己的 loop、agent 工具链和外层调度都很重要，因为长期系统最怕的不是模型完全失效，而是 **接口契约偶尔漂移**，结果把整条链卡死

如果把前面的 `tool-not-available`、rate-limit 解释都看成“失败状态更可解释”，那这一刀更像“格式失败更可恢复”。它在告诉我们：Claude Code 现在不只是想把错说清楚，也在开始把某些常见错直接在控制面内吞掉一层。

### [插图提示词]

用途：画“Claude Code brief mode 结构化重试”小图，说明 plain text 偏移、自动补一次重试和最终结构化消息之间的关系。  
形式：流程图。  
提示词：画一个 Claude Code brief mode structured retry flow。左侧是 brief mode request，中央第一次响应偏成 plain text，系统检测到 expected structured message 未满足；随后进入 automatic retry once；右侧得到 corrected structured message。底部补一句说明：把格式偏移从用户重试变成协议层自动恢复。  
Mermaid 更适合：是。

### 本轮原始来源

- 官方文档：`https://code.claude.com/docs/en/changelog`（`2.1.101`, 2026-04-10）
- GitHub Raw：`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

## 再补一刀：rate-limit retry 信息开始告诉你“撞上了什么限制，什么时候解封”

`2.1.101` 里还有一条看起来像文案优化、其实很像运维可解释性补课的变化：Claude Code 现在会 **在 rate-limit retry 提示里直接说明命中了哪类限制，以及它什么时候重置**，而不是只给一个不透明的秒数倒计时。

这条为什么值得记：

- 它把“现在不能继续”从黑盒等待变成了 **可判断的限流状态**
- 它把 retry 信息从单纯 countdown 提升成了一个更接近控制面反馈的结构化解释
- 它对长期运行 loop、多人共用额度、远程会话排障都更有用，因为你终于能区分自己撞上的到底是哪个闸门，而不是只能看着秒数流逝

对本站主线来说，这一刀和前面的 `tool-not-available` 很搭：一个解释“工具为什么此刻不能用”，一个解释“调用为什么此刻不能继续”。两者都在把以前偏黑盒的失败状态，改写成 **更可运营、更可分诊** 的控制面信号。

### [插图提示词]

用途：画“Claude Code 限流反馈升级”小图，对比 opaque countdown 和带 limit type / reset time 的新反馈。  
形式：对比图。  
提示词：画一个 Claude Code rate-limit feedback comparison。左侧是旧版 opaque seconds countdown，只显示 retry in N seconds；右侧是新版 explanatory retry message，明确标出 which limit was hit 和 reset time。底部补一句说明：把等待提示升级成可分诊的控制面反馈。  
Mermaid 更适合：否，更适合左右对比卡片图。

### 本轮原始来源

- 官方文档：`https://code.claude.com/docs/en/changelog`（`2.1.101`, 2026-04-10）
- GitHub Raw：`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

## 邻近关键词：OS CA trust 为什么是企业接入控制面的必要补课

`2.1.101` 里和上面那条并列、但更偏企业接入的一刀，是：Claude Code 现在 **默认信任操作系统 CA 证书库**。官方 changelog 直接点明目标场景是 enterprise TLS proxies，并且给了回退开关 `CLAUDE_CODE_CERT_STORE=bundled`。

这条为什么值得单独记：

- 它说明 Claude Code 的问题已经不只是“模型能不能调通”，而是“在真实企业网络与代理环境里能不能少折腾地接上”
- 它把证书信任策略从隐藏实现细节拉成了显式控制点：默认走系统 CA，必要时还能退回 bundled CA
- 它提醒我们，长期 agent 系统的可用性不仅取决于 prompt、tool 和权限模型，也取决于它能不能穿过组织级网络边界稳定工作

如果把 `/team-onboarding` 看成“团队入口层”的补课，那 OS CA trust 更像“企业接入层”的补课。对本站主线来说，这条线很适合和 Remote Control、企业代理、第三方 provider 接入一起看，因为很多系统不是死在 agent loop，而是死在最外层的网络与信任链。

### [插图提示词]

用途：画“Claude Code 企业 TLS 接入边界”小图，说明系统证书库、企业代理和 bundled CA 回退开关之间的关系。  
形式：结构图。  
提示词：画一个 Claude Code enterprise TLS trust flow。左侧是 Claude Code client，中间是 OS CA certificate store 与 enterprise TLS proxy，右侧是 upstream Claude service。旁边补一个 fallback 分支，标注 `CLAUDE_CODE_CERT_STORE=bundled` 可退回 bundled CAs。底部说明：这不是模型能力问题，而是企业网络信任链接入问题。  
Mermaid 更适合：是。

## 再补一刀：default cloud environment 自动创建，说明执行底座开始前移

`2.1.101` 里还有一条很容易被忽略，但对远程会话很关键的变化：`/ultraplan` 和其他 remote-session 功能现在会 **自动创建默认 cloud environment**，而不是要求你先去网页里手动做一遍 setup。

这条为什么值得单独记：

- 它把远程功能从“高级用户自己先铺好执行底座”往“命令触发时自动补底座”推进了一步
- 它让远程入口更像真正的 execution substrate，而不是文档里写着能用、实际还要先做一堆环境准备
- 它说明 Claude Code 团队已经开始把“远程环境是否存在”也纳入命令级体验设计，而不是把这层完全丢给用户自己兜底

如果把前面的 OS CA trust 看成企业网络接入层，这一条更像远程执行层。对本站主线来说，它和 Hermes 的 execution backend、以及我们自己一直在拆的“控制面能否自动补齐运行底座”是同一类问题：长期 agent 系统不是只有 prompt loop，还要决定环境从哪里来、何时创建、谁来托管。

### [插图提示词]

用途：画“Claude Code 远程执行底座自动补齐”小图，强调命令触发、默认 cloud environment 创建和远程功能落地之间的关系。  
形式：流程图。  
提示词：画一个 Claude Code remote environment bootstrap flow。左侧是 `/ultraplan` 与 other remote-session features 发起请求；中间是 system auto-creates default cloud environment；右侧是 remote execution session 启动并继续任务。底部补一句说明：把远程执行底座从手动前置 setup 变成命令触发时自动补齐。  
Mermaid 更适合：是。

## 再补一刀：tool-not-available 开始把“工具存在”和“当前上下文可用”拆开说

`2.1.101` 里还有一条很短、但很像控制面边界显化的改动：Claude Code 现在会 **更明确地解释 tool-not-available 错误**，告诉你为什么这个工具虽然存在，但 **当前上下文里不可用**，以及下一步该怎么继续。

这条为什么值得单独记：

- 它把“系统有没有这个工具”和“当前会话能不能用到它”拆成了两层判断
- 它说明 Claude Code 团队已经不满足于只把失败抛给用户，而是在把 **上下文 gating** 变成可解释的边界
- 它对我们自己的 `codex-loop`、技能包、插件链也很相关，因为长期系统里最常见的失败并不是工具根本不存在，而是调用时机、会话模式、权限状态或当前环境不满足

这里有一处明确推断：我把这条读成“Claude Code 正在更明确地把工具目录和上下文可用性拆开”。这个推断来自官方 changelog 里那句 **tool that exists but isn't available in the current context**，不是额外二手来源。

### [插图提示词]

用途：画“Claude Code 工具可用性边界”小图，说明工具存在、上下文判定、错误解释和后续动作之间的关系。  
形式：结构图。  
提示词：画一个 Claude Code tool availability boundary 图。左侧是 model 想调用某个 tool；中间分成两层判断：tool exists in system catalog，tool available in current context；如果第二层失败，就走到 tool-not-available explanation，给出 why unavailable 和 next step。底部补一句说明：把工具存在性和上下文可用性拆开解释，减少黑盒失败。  
Mermaid 更适合：是。

### 本轮原始来源

- 官方文档：`https://code.claude.com/docs/en/changelog`（`2.1.101`, 2026-04-10）
- GitHub Raw：`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

## 本轮关键词：Monitor tool 为什么值得盯

在 `2.1.98` 里，最值得单独盯住的关键词不是登录向导，而是 **Monitor tool for streaming events from background scripts**。这条变化说明 Claude Code 对“后台脚本不是一次性黑盒，而是持续产生活动流”的支持又往前走了一步。

对本站主线来说，它值钱在三个点：

- 它把“后台任务完成后给一个结果”往前推进到“后台任务运行中持续可观察”
- 它和我们一直在做的 `codex-loop` / 外层调度思路更接近：长期任务要想可控，除了能启动，还得能看见事件流
- 它提示未来 Claude Code 的工程重心不只是会不会调工具，而是**会不会把异步、后台、可观测性**一起纳入控制面

换句话说，如果之前你把 Claude Code 的后台能力理解成“丢一个任务出去，等它回来”，那 `Monitor tool` 更像是在补“中间那条状态回传链路”。这条线和我们在 Hermes 页里刚拆过的 gateway / cron / execution boundary 其实是同一类问题：**长期运行系统要不要暴露中间状态，如何暴露，暴露给谁看。**

### [插图提示词]

用途：画“Claude Code 后台脚本可观测性”小图，强调从后台脚本到事件流再到主会话的回传链路。  
形式：流程图。  
提示词：画一个 Claude Code background script monitor 流程图。左侧是主会话发起后台脚本，中间是后台脚本持续产生事件流，右侧是 Monitor tool 实时读取事件并把状态回传给主会话。底部补一条说明：这不是最终结果一次性返回，而是运行中事件可观测。  
Mermaid 更适合：是。

### 本轮原始来源

- 官方文档：`https://code.claude.com/docs/en/changelog`（`2.1.98`, 2026-04-09）
- GitHub Raw：`https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`

## 邻近关键词：status line 终于更像一个控制面观察窗

`2.1.97` 里最值得和上面那条 `Monitor tool` 一起读的，是 status line 的两处改动：新增 `refreshInterval`，以及把 `workspace.git_worktree` 注入 status line JSON 输入。单看是小功能，合起来其实是在补 Claude Code 的“会话外部可观测性”。

为什么这条值得记：

- `refreshInterval` 让状态行不再只是静态装饰，而能周期性重跑，逐步接近 lightweight dashboard
- `workspace.git_worktree` 说明 Claude Code 开始更明确地区分“当前在哪个 worktree 上工作”，这对多分支并行和 agent 分工很关键
- 如果把 `Monitor tool` 看成后台事件流入口，那 status line 就更像前台状态摘要入口；两者一起，控制面味道会更浓

### [插图提示词]

用途：画“Claude Code 可观测性双层”小图，把后台事件流和前台状态行放在同一张示意图里。  
形式：结构图。  
提示词：画一个 Claude Code observability 双层示意图。上层是主会话 UI，其中 status line 周期刷新并显示 worktree / branch / running 状态；下层是后台脚本持续产生事件，由 Monitor tool 读取。箭头说明：后台事件流进入控制面，前台状态行负责摘要展示。  
Mermaid 更适合：是。

## 另一个高价值关键词：subprocess sandboxing + Bash 权限硬化

如果从“工程安全性”角度看，`2.1.98` 里另一条值得单独拎出来的是：**Linux 子进程 PID namespace 隔离**，以及同一版里一串 Bash 权限绕过修复。官方 changelog 把它们分开写，但放在一起看更合理，因为它们共同指向一件事：Claude Code 正在把“脚本能跑”逐步升级成“脚本怎么被隔离、哪些命令必须重新过权限门”。

这条线为什么比一般 bugfix 更重要：

- `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` + PID namespace isolation，说明后台脚本不是随便在宿主环境裸跑
- `CLAUDE_CODE_SCRIPT_CAPS` 把“每个会话里脚本能被调用几次”也纳入约束，不只是看命令文本本身
- 同版修的 Bash 权限绕过问题覆盖反斜杠 flag、复合命令、env-var 前缀、`/dev/tcp` 和 wildcard 规则，说明权限模型正在从“匹配字面命令”向“理解命令形态”收紧

如果把上一段的 `Monitor tool` / status line 看成“可观测性补课”，这一段更像“可控性补课”。长期运行 agent 不只要看得见中间状态，也要更精细地限制后台脚本和 Bash 能怎样越过边界。

### [插图提示词]

用途：画“Claude Code 后台脚本安全边界”小图，说明脚本执行、PID namespace、脚本调用上限、Bash 权限检查之间的关系。  
形式：结构图。  
提示词：画一个 Claude Code background script security boundary 图。左侧是主会话触发后台脚本，中间是脚本执行层，外面套一层 PID namespace isolation 与 env scrub，旁边标出 `CLAUDE_CODE_SCRIPT_CAPS` 作为会话级调用上限，底部是 Bash permission gate，列出 env-var prefix、compound commands、network redirect 等风险检查点。  
Mermaid 更适合：是。

## 再补一刀：prompt cache 为什么开始要求“稳定系统提示骨架”

`2.1.98` 里还有一条很容易被忽略，但对长期会话和团队复用都很关键的变化：print mode 新增 `--exclude-dynamic-system-prompt-sections`，官方说明它用于 **improved cross-user prompt caching**。这不是单纯多一个 flag，而是在告诉我们 Claude Code 团队已经把“哪些 system prompt 内容应该稳定、哪些应该动态”当成缓存命中率问题来处理。

这条为什么值得单独记：

- prompt cache 命中的前提，不只是模型和输入相似，而是系统提示骨架不要每次都带进太多会变的字段
- 一旦存在 user-specific / runtime-specific 的动态段落，同一个工作流在跨用户、跨机器、跨会话时就更容易 cache miss
- 官方把它做成显式开关，说明 Claude Code 已经不把 prompt cache 只当底层黑盒优化，而是开始把“提示结构稳定性”暴露成可操作的工程参数

对本站主线来说，这一刀和前面的 `Monitor tool`、status line、安全边界其实能拼成一张更完整的控制面图：`Monitor tool` 解决的是运行中事件可观察，subprocess sandboxing 解决的是后台脚本边界可控制，而 `--exclude-dynamic-system-prompt-sections` 解决的是**长期会话与多人复用时，系统提示层到底要不要保持稳定骨架**。这条线对我们自己的 `codex-loop`、Like Code 和 Hermes 拆解都很重要，因为一旦外层调度越来越长，prompt cache 是否稳定，直接影响成本、响应速度和跨角色复用体验。

### [插图提示词]

用途：画“Claude Code prompt cache 命中/失配”小图，强调稳定 system prompt 骨架与动态段落分离。  
形式：对比图。  
提示词：画一个 Claude Code prompt cache 对比图。左侧是稳定的 system prompt skeleton，加少量独立 dynamic sections，被标注为 cache hit friendly；右侧是把 user-specific、runtime-specific 内容混进 system prompt 主体，标注为 cache miss prone。底部加一句说明：`--exclude-dynamic-system-prompt-sections` 的目标是把动态段落从共享缓存键里剥离。  
Mermaid 更适合：是。

## 本站如何维护本专题

1. **触发**：npm 新版本或官方 changelog 出现新小节时。  
2. **动作**：阅读 [CHANGELOG.md raw](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) 对应 `## x.y.z` 块，用 1～3 句中文概括**对用户可见**的变化，写入上表顶部。  
3. **文件**：同时改 `site/topic-cc-release-watch.html` 与 `site/md/topic-cc-release-watch.md` 中的同一张表（或以后抽成数据文件再议）。  
4. **边界**：本仓库 `ccsource/like-code-main` 为学习用 fork，**版本号不等于**官方 CLI；对照行为请以已安装的官方 `claude` 为准。

## 与源码课的关系

官方 CLI 的迭代会改变命令、设置项、Hooks 与工具行为；读 **S04 命令**、**S10 Hooks**、**S07 MCP** 等章节时，若与当前 CLI 不一致，先查官方 changelog 再回源码树对照。

- [Source Map 源码专题](topic-sourcemap.md)
- [开发日志](devlog.md)（仓库迭代记录，与官方发版不同轴）
