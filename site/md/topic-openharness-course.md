# OpenHarness 源码课 · 与 Claude Code 思想架构对照

> **在线页面**: https://harzva.github.io/learn-likecc/topic-openharness-course.html  
> **本文件**: `site/md/topic-openharness-course.md`  
> **上游代码**: [HKUDS/OpenHarness](https://github.com/HKUDS/OpenHarness)（MIT）  
> **姊妹页**: [OpenHarness 专题导读](topic-openharness.md)（快速上手、S 课路径映射）

## 课程定位

本站 **24 讲（S01–S12 + D 深挖）** 默认主轴是 **Source Map 语境下重建的 TypeScript 树**（Claude Code 向实现阅读）。**本课**不重复逐行抄 TS，而是让你在 **同一套「Harness 层问题清单」** 下，读 **OpenHarness 的 Python 源码**，并始终回答四个问题：

1. **与 Claude Code 思想架构哪里相同？**（问题域一致处）  
2. **哪里不同？**（边界、抽象、产品取舍）  
3. **为什么不同？**（目标用户、协议栈、商业与许可证、演进路径）  
4. **OpenHarness 带来什么优势？**（在何种假设下值得选）

## 思想上相同的部分（问题域对齐）

两者都在解决 **「模型 + 工具 + 会话状态 + 治理」** 这一类 **Agent Harness** 问题，而非单纯「调一次 Chat API」：

| 维度 | 共性（读 S 课时脑内可平移） |
|------|---------------------------|
| **主循环** | 多轮对话、流式输出、tool-use 解析与再提交 |
| **工具层** | 注册 schema、执行、错误与重试、并行调用等工程细节 |
| **权限与治理** | 哪些操作要人点允许、规则匹配、Hooks 介入点 |
| **上下文** | 系统/用户/工具结果拼装、压缩与预算、项目级记忆文件 |
| **MCP** | 外接能力、资源与工具暴露给模型 |
| **多 Agent** | 子任务拆分、协调、会话隔离或合并 |
| **CLI / TUI** | 命令入口、交互界面、与编辑器的桥接思路 |

因此：**大框架类似**——你学完 S01/S02/S07，再打开 OpenHarness 的 `engine/`、`tools/`、`mcp/`，会有 **「认路感」**；差异主要在 **产品外壳、默认策略与实现细节**。

## 思想与架构上不同的地方

| 维度 | Claude Code（课内 TS 镜像） | OpenHarness |
|------|---------------------------|-------------|
| **产品定位** | 与 **Anthropic 商业产品**强绑定的一体化 CLI（订阅、账号、发布节奏由官方定） | **社区 Harness 基座**：多 workflow、多兼容 API、可自托管逻辑 |
| **Provider 模型** | 以 **Claude 系列 + 官方生态**为主轴（含 Bedrock 等变体） | **显式 workflow/profile**（如 `oh setup`）：Anthropic-compatible、OpenAI-compatible、订阅类 preset 等并列 |
| **许可证与源码** | 官方闭源；课内树为 **重建/镜像**，用于学习非官方发行物 | **MIT 全开源**，可 fork、改默认策略、接内网模型 |
| **实现栈** | TypeScript / 官方打包与更新通道 | **Python**，依赖与调试路径不同 |
| **功能边界** | 随官方路线图演进（插件市场、Remote Control、Auto mode 等 **产品特性**） | **另一套功能选择**（如 `ohmo`、channels、Swarm 命名与实现），**不必**与 CC 逐特性对齐 |
| **默认安全与合规** | 面向全球用户的 **官方默认**与托管策略 | 社区项目：**你可改**默认允许列表、Hooks、沙箱假设——**责任模型**更偏自运维 |

表中的「不同」很多不是「谁更先进」，而是 **谁为哪种交付形态负责**：**单一产品** vs **可改造基础设施**。

## 为什么不同（根因）

1. **目标不同**：Claude Code 要服务 **Anthropic 的订阅与合规叙事**；OpenHarness 要服务 **可审计、可分叉、多后端的 Harness 实验与集成**。  
2. **技术选型不同**：TS 利于与前端/桌面工具链统一；Python 利于 **AI 工程圈**快速改 prompt、工具与脚本胶水。  
3. **演进约束不同**：官方功能受 **发布列车、遥测、企业策略**约束；开源 Harness 更依赖 **PR 与社区共识**，迭代面更宽、兼容性责任分散在部署者。  
4. **法律与品牌边界**：课内 TS 树 **不得**冒充官方源码；OpenHarness **独立品牌**，与 Anthropic 无隶属关系——对照学习时务必 **分清楚三条线**：官方产品、重建镜像、MIT 开源实现。

## OpenHarness 的优势（在何种前提下成立）

| 优势 | 说明 |
|------|------|
| **可读可改** | 全仓库 MIT，适合教学、实验、内网定制（在合规使用 API 的前提下）。 |
| **多后端叙事** | 同一套 Harness 逻辑下切换 **多种兼容 API / workflow**，适合做 **供应商无关** 的课设或 PoC。 |
| **与 S 课「同构不同实现」** | 用已熟悉的模块划分（Loop、Tools、MCP…）去读 Python，**加速建立「Harness 元模型」**，减少对单一闭源实现的依赖。 |
| **社区扩展面** | Skills、插件、Swarm、channels 等走 **另一套组合**；适合研究「没有官方产品时 Harness 长什么样」。 |

**不宣称的优势**：不默认「比官方更强」「更安全」——安全与稳定性取决于 **你的配置、模型提供方与运维**；官方产品在 **默认安全策略、与企业集成** 上往往投入更大。

## 推荐学习路径

1. **任选一条入口**：先过一遍 [S01](https://harzva.github.io/learn-likecc/s01.html) 建立 Loop 心智，或先本地 `uv run oh` 跑通再回读。  
2. **对照表阅读**：打开 [OpenHarness 专题 · S 课 ↔ 路径](https://harzva.github.io/learn-likecc/topic-openharness.html#map)，每读一课 S，在 `src/openharness/` 打开对应目录，**只问**：同样问题 OH 在哪一层解决？差异是接口还是策略？  
3. **写三条笔记**：每单元各写 **相同点 / 不同点 / 原因**，即为本课作业。  

## 已上线讲稿

- **[OH01 · Agent Loop](oh01.md)**：对标 [S01](s01.md)。  
- **[OH02 · Tool System](oh02.md)**：对标 [S02](s02.md)。  
- OH03 起陆续补。

## 源码位置（本仓库）

```
reference/rererence_harness/OpenHarness/
```

（`rererence` 为历史目录拼写；若无子目录见仓库内 `reference/rererence_harness/README.md`。）

## 后续内容规划（可选）

- OH02 起与 S 课平行稿（每篇：文件入口、关键类、与 TS 镜像对照一句）。  
- 与 [发版监督](topic-cc-release-watch.md) 区分：该页跟踪 **官方 Claude Code CLI**；本课跟踪 **OpenHarness 上游 Release**（见 HKUDS 仓库）。
