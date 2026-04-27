# 终端 Agent Runtime 解构 - Everything in Claude-Code
> **更新时间**: 2026-04-17

> **在线页面**: https://harzva.github.io/learn-likecc/topic-agent-runtime.html  
> **本文件**: `site/md/topic-agent-runtime.md`  
> **说明**: HTML 为权威阅读面；本文件为目录与摘要草稿。

## 概要

结合 Claude Code 重建源码，解释为什么它更像一个**终端 Agent Runtime**，而不只是“调模型 + 跑命令”的 CLI 壳。重点看启动边界、会话状态、query loop、工具控制面、扩展隔离与上下文治理。

## 目录（对照 HTML）

- **核心判断**
- **六层动态分层图**
- **Mermaid 总架构图**
- **从源码里拉一条主脊柱**
- **Source Map rebuild 版关键片段**
- **和普通 CLI 的分水岭**
- **最值得先读的源码锚点**
- **这页和站内其他专题怎么配合**

## 各节摘要（对照 HTML）

### 核心判断

说明真正重的不是模型调用，而是模型外面的运行时骨架：trust、状态、query loop、权限、MCP、子代理、memory、renderer。

### 六层动态分层图

用可切换的阶段面板展示六层：
- 启动与 trust 边界
- 会话状态内核
- query loop 主循环
- Tool / Command / Permission 控制面
- MCP / Skills / Plugins / Subagent 扩展与隔离
- 上下文治理与终端体验

### Mermaid 总架构图

把上面的六层再压成一张可视化总图，帮助读者先抓主干，再看源码片段。

### 从源码里拉一条主脊柱

用表格把代表文件和“这里解决什么”对应起来，帮助读者先抓主链，再回头深挖具体模块。

### Source Map rebuild 版关键片段

每层都配一小段重建源码摘录，不放源码截图，而是直接展示最能证明判断的片段。

### 和普通 CLI 的分水岭

对比普通命令壳和长期会话型本地 agent 运行时，强调为何 Claude Code 的工程重心已经明显落在运行时层。

### 最值得先读的源码锚点

列出最值得先打开的文件，避免直接在 1900+ 文件树里迷路。

### 这页和站内其他专题怎么配合

给出和 `topic-sourcemap`、`topic-source-derived`、`topic-cc-unpacked-zh`、`topic-everything-claude-code-unpacked` 的阅读顺序关系。
