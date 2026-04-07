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
| **2.1.92** | `forceRemoteSettingsRefresh` 策略；Bedrock 交互配置向导；`/cost` 按模型与缓存命中细分；`/release-notes` 改为交互选版；Remote Control 默认会话名带 hostname；移除 `/tag`、`/vim`（改走 `/config`）；Linux sandbox 附带 `apply-seccomp`；多项全屏/子代理/Homebrew 渠道修复 |
| **2.1.91** | MCP 工具结果可通过 `_meta` 放宽长度；`disableSkillShellExecution`；deeplink 支持多行；插件 `bin/` 可执行；`--resume` 与计划模式远程会话等修复；Edit 锚点缩短降 token |
| **2.1.90** | 新增 `/powerup` 交互教程；插件市场失败时保留缓存的 env；`.husky` 受保护；费率限制弹窗死循环、resume 与 prompt cache、PowerShell 安全与性能等多项修复 |
| **2.1.89** | PreToolUse 支持 `"defer"`；`CLAUDE_CODE_NO_FLICKER`；Auto mode 拒绝可重试；MCP 非阻塞与超时；Hooks、Edit/Read、SDK、stats、沙箱等大量修复与行为调整 |
| **2.1.87** | Cowork Dispatch 消息投递修复 |
| **2.1.86** | API 请求 `X-Claude-Code-Session-Id`；`.jj`/`.sl` 目录排除；旧会话 resume、插件脚本权限、多终端与 VS Code 扩展等问题修复 |
| **2.1.85** | MCP `headersHelper` 相关 env；Hooks 条件 `if`；deeplink 长度上限；MCP OAuth 发现；组织策略下插件屏蔽；OpenTelemetry 工具详情门控；多项 resume/MCP/UI 修复 |

## 本站如何维护本专题

1. **触发**：npm 新版本或官方 changelog 出现新小节时。  
2. **动作**：阅读 [CHANGELOG.md raw](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) 对应 `## x.y.z` 块，用 1～3 句中文概括**对用户可见**的变化，写入上表顶部。  
3. **文件**：同时改 `site/topic-cc-release-watch.html` 与 `site/md/topic-cc-release-watch.md` 中的同一张表（或以后抽成数据文件再议）。  
4. **边界**：本仓库 `ccsource/like-code-main` 为学习用 fork，**版本号不等于**官方 CLI；对照行为请以已安装的官方 `claude` 为准。

## 与源码课的关系

官方 CLI 的迭代会改变命令、设置项、Hooks 与工具行为；读 **S04 命令**、**S10 Hooks**、**S07 MCP** 等章节时，若与当前 CLI 不一致，先查官方 changelog 再回源码树对照。

- [Source Map 源码专题](topic-sourcemap.md)
- [开发日志](devlog.md)（仓库迭代记录，与官方发版不同轴）
