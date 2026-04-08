#!/usr/bin/env python3
"""Build site/data/cc-arch-treemap.json from ccsource/claude-code-main/src TS counts.

Categories align with topic-cc-unpacked-zh architecture legend (teaching labels).

Usage (repo root):
  python3 tools/gen_cc_arch_treemap.py              # write JSON
  python3 tools/gen_cc_arch_treemap.py --dry-run  # stdout only
  python3 tools/gen_cc_arch_treemap.py --verify-in-sync  # fail if file stale
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SRC = REPO_ROOT / "ccsource" / "claude-code-main" / "src"
OUT = REPO_ROOT / "site" / "data" / "cc-arch-treemap.json"
OUT_GRAPH = REPO_ROOT / "site" / "data" / "cc-arch-knowledge.json"

# Leaf directory name -> category key (must match site CSS / JS legend)
DIR_CAT: dict[str, str] = {
    "commands": "tools_commands",
    "tools": "tools_commands",
    "services": "core",
    "hooks": "core",
    "context": "core",
    "assistant": "core",
    "tasks": "core",
    "coordinator": "core",
    "query": "core",
    "state": "core",
    "proactive": "core",
    "jobs": "core",
    "components": "ui",
    "ink": "ui",
    "screens": "ui",
    "vim": "ui",
    "outputStyles": "ui",
    "voice": "ui",
    "bridge": "bridge",
    "remote": "bridge",
    "plugins": "bridge",
    "native-ts": "bridge",
    "cli": "infra",
    "entrypoints": "infra",
    "server": "infra",
    "daemon": "infra",
    "ssh": "infra",
    "environment-runner": "infra",
    "upstreamproxy": "infra",
    "self-hosted-runner": "infra",
    "bun-polyfill": "infra",
    "bootstrap": "infra",
    "migrations": "infra",
    "utils": "support",
    "constants": "support",
    "types": "support",
    "keybindings": "support",
    "memdir": "support",
    "skills": "support",
    "_external": "support",
    "schemas": "support",
    "sessionTranscript": "support",
    "moreright": "support",
    "buddy": "personality",
}

DEFAULT_CAT = "support"

ROOT_TS_LABEL = "（src 根 .ts/.tsx）"
ROOT_TS_CAT = "core"

LEGEND_SPEC: list[dict[str, str]] = [
    {"key": "tools_commands", "label": "工具与命令", "hint": "commands/ · tools/"},
    {"key": "core", "label": "核心处理", "hint": "services · hooks · 会话与查询等"},
    {"key": "ui", "label": "UI 层", "hint": "components · ink · 终端界面"},
    {"key": "bridge", "label": "桥接与集成", "hint": "bridge · plugins · remote"},
    {"key": "infra", "label": "基础设施", "hint": "cli · entrypoints · 运行时支撑"},
    {"key": "support", "label": "支撑与工具库", "hint": "utils · constants · types"},
    {"key": "personality", "label": "个性与实验向", "hint": "如 buddy 等"},
]

CATEGORY_DESCRIPTIONS: dict[str, str] = {
    "tools_commands": "命令入口、工具定义与执行编排，最接近用户显式触发层。",
    "core": "会话、查询、状态与任务流转，是智能体主循环的核心处理带。",
    "ui": "终端 UI、组件树与 Ink 渲染层，负责把状态变成交互界面。",
    "bridge": "IDE / 插件 / 远端集成，把 Claude Code 接到外部环境。",
    "infra": "CLI、entrypoints、server 与运行时骨架，负责启动与承载。",
    "support": "类型、常量、工具库与键位等公共支撑层。",
    "personality": "实验向或人格化能力，通常不是主干但能影响体验。",
}

CATEGORY_ANALYSIS: dict[str, str] = {
    "tools_commands": "这一块回答的是“模型之外，宿主究竟开放了什么动作面”。commands 决定显式工作流入口，tools 决定模型可见能力面，二者一起定义了用户意图如何被翻译成可执行动作。",
    "core": "这是最值得反复读的一块，因为它承载会话推进、上下文裁剪、工具回灌、任务调度与状态跃迁。很多体验差异表面上出现在 UI，根因其实都埋在这里。",
    "ui": "UI 层不是简单的显示层，而是把主循环中的消息、工具状态、权限提示和焦点变化投影成可操作的终端界面。它决定用户能否感知系统当前处于哪一轮、哪一步。",
    "bridge": "这一块负责把 Claude Code 从“本地终端程序”扩展成可连接 IDE、插件、远端宿主的系统。只看主循环而不看 bridge，很容易低估外部环境对行为的影响。",
    "infra": "基础设施层决定系统怎么启动、以什么形态常驻、如何兼容不同运行环境。它不直接决定回答内容，却决定很多能力能否稳定落地。",
    "support": "支撑层体量很大，说明这套代码库高度依赖共享工具、类型契约与静态常量来维持复杂系统的一致性。理解这里，能更快读懂跨目录调用。",
    "personality": "这一块通常不决定主流程正确性，但会明显改变产品气质、提示节奏和陪伴感。它体现的是“体验策略”，不是底层骨架。",
}

CATEGORY_READ_HINT: dict[str, str] = {
    "tools_commands": "先从 commands 和 tools 里各挑一个完整工作流读穿，再回看 query / services，最容易把“入口”和“执行”接起来。",
    "core": "优先看 query、services、context、tasks 四块；这四块能把主循环、上下文、工具和执行生命周期连成一张图。",
    "ui": "先看 components/App 一类骨架组件，再看 hooks 与 ink；这样能分清业务界面、状态胶水和终端渲染三层。",
    "bridge": "从 bridge 主目录入手，再分别补 remote 和 plugins；最后回看 server / entrypoints，理解桥接能力怎样被承载。",
    "infra": "建议先看 cli、entrypoints、server 三块，再补 migrations 和 daemon；这样能先建立启动路径，再看兼容与后台运行。",
    "support": "不要试图一次读完 utils。先按调用链回查 types、constants、utils，再根据需要补 skills、memdir、keybindings。",
    "personality": "体量不大，可以在理解主干后快速读完；先看 buddy 的 prompt / sprite / notification 三类文件。",
}

FOLDER_DESCRIPTIONS: dict[str, str] = {
    "commands": "斜杠命令、命令子树与交互式工作流入口。",
    "tools": "工具 schema、工具实现与工具执行运行时。",
    "services": "会话服务、上下文压缩、记忆、权限、统计和工具编排等核心运行能力。",
    "hooks": "把 UI、通知、订阅与运行态粘起来的复用 hooks。",
    "components": "主要交互组件与终端界面碎片。",
    "ink": "Ink 渲染与终端 UI 基础设施。",
    "bridge": "桥接 IDE、外部宿主与运行时通道。",
    "plugins": "插件生态与外部扩展点。",
    "remote": "远程环境、远端上下文与连接抽象。",
    "cli": "CLI 启动、参数入口与命令行承载层。",
    "entrypoints": "不同运行入口与启动路径。",
    "server": "服务端形态与长驻能力。",
    "migrations": "版本迁移与兼容性处理。",
    "utils": "通用工具函数与基础复用库。",
    "types": "类型定义与跨模块契约。",
    "constants": "常量、配置键与静态枚举。",
    "keybindings": "键盘映射与交互绑定。",
    "memdir": "本地记忆目录与持久化辅助。",
    "skills": "技能与高层任务能力挂钩点。",
    "tasks": "本地、远端、子代理和工作流任务对象与调度单元。",
    "context": "上下文容器、通知与 overlay 等对话环境组织层。",
    "state": "全局 AppState、store、selector 与共享状态容器。",
    "assistant": "助手会话发现、选择、门控与历史壳层。",
    "query": "主循环的查询装配、状态跃迁、停止钩子与 token 预算控制。",
    "native-ts": "原生集成的 TypeScript 桥。",
    "daemon": "守护进程与长连接后台。",
    "ssh": "SSH 场景支持。",
    "upstreamproxy": "代理与上游连接适配。",
    "screens": "少量完整屏视图。",
    "vim": "Vim 模式交互。",
    "outputStyles": "输出样式切换。",
    "voice": "语音相关入口。",
    "src 根 .ts/.tsx": "src 根上的顶层抽象、共享入口与跨目录胶水文件。",
}

FOLDER_METADATA: dict[str, dict[str, str]] = {
    "commands": {
        "analysis": "commands 是“显式入口层”：用户敲下 slash 命令或进入某条命令工作流时，意图会先在这里被拆成具体子命令、参数校验和后续跳转。它更像宿主编排层，而不是模型内部推理层。",
        "read_hint": "先看 `add-dir`、`agents`、`bridge` 这类有完整子树的命令，再回看 `commands.ts` 和 `cli/handlers`，最容易把命令入口串起来。",
        "connect_note": "commands 把 slash/CLI 意图分流成具体工作流，是用户显式入口的第一层。",
    },
    "tools": {
        "analysis": "tools 决定模型在一轮对话里究竟看见哪些能力、如何声明参数、怎样执行以及怎样把结果写回。把它读透，才能理解“模型会不会用工具”和“工具结果怎样进入下一轮”。",
        "read_hint": "优先看 `AgentTool`、`FileReadTool`、`BashTool` 一类代表性工具，再联读执行层与 query 回灌路径。",
        "connect_note": "tools 定义模型可见能力面，并负责把 tool_use 变成真实执行。",
    },
    "services": {
        "analysis": "services 不是传统 Web 项目里的薄 service 层，而是 Claude Code 的能力中台。会话推进、记忆压缩、权限、分析埋点、工具编排这些真正决定行为稳定性的逻辑，很多都沉在这里。",
        "read_hint": "先看 `toolOrchestration`、`SessionMemory`、上下文压缩和权限相关服务，再联读 `query`、`tasks`、`assistant`。",
        "connect_note": "services 承担会话推进、上下文压缩、权限与工具编排，是主循环背后的核心能力层。",
    },
    "hooks": {
        "analysis": "hooks 重要的不是 React 语法，而是它把状态订阅、通知、IDE 状态、文件建议等运行时信号编织进界面。很多“为什么这个提示会在这一刻出现”的答案都在这里。",
        "read_hint": "先看 `notifs`、IDE 状态和文件建议相关 hooks，再回看 `components` 与 `state` 的调用点。",
        "connect_note": "hooks 把界面组件和运行态信号粘在一起，是 UI 与核心状态之间的胶水层。",
    },
    "src 根 .ts/.tsx": {
        "analysis": "src 根文件通常承载 QueryEngine、Task、Tool、main 这类顶层抽象，不属于单个子目录，却决定整套系统怎么装配。它们像目录树之上的骨架件，适合用来快速建立总图。",
        "read_hint": "建议先看 `QueryEngine.ts`、`Task.ts`、`Tool.ts`、`main.tsx`，再回到对应子目录深挖实现细节。",
        "connect_note": "src 根文件放的是跨目录骨架件和顶层入口，负责把各子系统装配成完整运行时。",
    },
    "tasks": {
        "analysis": "tasks 把本地 shell、主会话、远端 agent、MCP 监控、workflow 等长生命周期动作包装成可管理对象。它是把“一次模型决策”延展成“可中断、可监控执行流”的关键层。",
        "read_hint": "优先看 `LocalMainSessionTask`、`LocalShellTask`、`RemoteAgentTask`，再联读 `services` 与 `tools`。",
        "connect_note": "tasks 承接 shell、agent、workflow 和 remote session 的执行生命周期，是动作落地层。",
    },
    "context": {
        "analysis": "context 不只是 React Context。它承担的是“这一轮还能读取哪些环境信息、通知和覆盖层”的注入职责，决定消息流之外还有哪些辅助状态会影响界面和交互。",
        "read_hint": "先看 `QueuedMessageContext`、`notifications`、`modalContext`、`overlayContext`，再回看 `state` 和 `hooks`。",
        "connect_note": "context 负责把队列消息、通知、弹层与环境状态注入当前会话阅读面。",
    },
    "state": {
        "analysis": "state 是 UI 与核心逻辑共享的事实源。它不只是存值，还定义 selector、变更派生和视图辅助逻辑，所以很多“显示错位”“状态不同步”类问题都要回到这里找。",
        "read_hint": "先看 `AppStateStore`、`selectors`、`onChangeAppState`，再回看 `hooks` 和 `components` 的消费路径。",
        "connect_note": "state 维护全局事实源，让服务层变化能够稳定投影到界面与交互。",
    },
    "assistant": {
        "analysis": "assistant 更像“会话人格与实例外壳”：它负责会话选择、历史发现、门控和入口包装，让不同对话实例能被恢复、切换和约束。",
        "read_hint": "先看 `sessionHistory`、`sessionDiscovery`、`gate`，再联读 `query` 和 `services`。",
        "connect_note": "assistant 负责助手会话的发现、门控和历史外壳，是主循环的会话承接层。",
    },
    "query": {
        "analysis": "query 最接近主循环中枢。消息如何组装、何时停、token 预算如何控、响应如何跃迁，核心判断都在这里。想理解 agent loop，query 是最值得逐文件读的目录之一。",
        "read_hint": "优先看 `transitions`、`tokenBudget`、`deps`、`stopHooks`，并与 `QueryEngine.ts` 对照着读。",
        "connect_note": "query 负责主循环中的查询装配、状态跃迁和预算控制，是模型往返的中枢。",
    },
    "coordinator": {
        "analysis": "coordinator 体量虽小，但位置很高。它回答的是系统在多模式、多实体协作时该如何切换协调策略，而不是执行某个具体动作。",
        "read_hint": "先看 `coordinatorMode.ts`，再顺手回到 `tasks` 和 agent 相关入口理解它的影响面。",
        "connect_note": "coordinator 决定高层协调模式，是小而高位的策略开关。",
    },
    "jobs": {
        "analysis": "jobs 负责某些可异步或独立执行的分类判断工作，不是主循环中枢，但能把耗时或旁路线逻辑从主执行面剥离出去。",
        "read_hint": "目前可直接看 `classifier.ts`，再联读触发它的服务或命令入口。",
        "connect_note": "jobs 放置可独立调度的后台判断任务，用来减轻主链路压力。",
    },
    "proactive": {
        "analysis": "proactive 反映系统并非完全被动等待输入，而是在某些条件下会主动给出建议或触发补充动作。目录很薄，但体现了产品交互策略的一个方向。",
        "read_hint": "先看 `index.ts`，再沿调用链回查是谁在什么时机触发主动能力。",
        "connect_note": "proactive 是主动建议与主动触发能力的入口，体现了系统的非被动交互策略。",
    },
    "components": {
        "analysis": "components 承担了绝大多数用户可见体验。从对话区、权限框、状态条到各种功能面板，最终都是在这里拼成界面的，所以它是理解“用户实际看见什么”的第一现场。",
        "read_hint": "先看 `App.tsx` 和 REPL 相关主界面，再挑权限弹窗、进度条、代理/会话相关组件各读一个完整链路。",
        "connect_note": "components 是终端产品界面的主体，负责把主循环状态组织成用户可操作的交互面。",
    },
    "ink": {
        "analysis": "ink 在这里不是简单的第三方依赖封装，而是被深度扩展成终端渲染引擎。布局、文本测量、滚动、渲染优化和终端能力探测，都沉在这一层。",
        "read_hint": "先看 `components/App.tsx`、`renderer.ts`、layout 相关实现，再回看业务组件如何落到 Ink 树上。",
        "connect_note": "ink 提供终端渲染底座，负责把组件树变成可刷新的文本界面。",
    },
    "vim": {
        "analysis": "vim 目录把编辑器式操作抽成 motion、operator、text object 和状态跃迁规则，是高级终端交互体验的一块专门能力。",
        "read_hint": "按 `motions -> operators -> textObjects -> transitions` 的顺序读，最容易建立心智模型。",
        "connect_note": "vim 专门承接类编辑器交互语义，让终端输入具备更强操作性。",
    },
    "screens": {
        "analysis": "screens 放的是少量完整视图级页面，适合看“某个大功能如何把组件、状态和服务组装在一起”。",
        "read_hint": "可从 `REPL.tsx` 入手，再看 `Doctor.tsx` 或 `ResumeConversation.tsx` 对比不同场景。",
        "connect_note": "screens 表示完整页面级视图，是多组件与状态的组装点。",
    },
    "outputStyles": {
        "analysis": "输出样式体量很小，却决定文本呈现的风格切换入口，属于“影响感知但不重”的体验调节点。",
        "read_hint": "看 `loadOutputStylesDir.ts` 即可，再回查谁在启动或设置路径中消费它。",
        "connect_note": "outputStyles 负责加载输出风格配置，影响终端内容的最终呈现方式。",
    },
    "voice": {
        "analysis": "voice 是语音相关能力的极薄入口，说明该方向在当前代码基中仍是附属能力，而非主干交互路径。",
        "read_hint": "先看 `voiceModeEnabled.ts`，再沿引用点确认它如何接入主界面。",
        "connect_note": "voice 提供语音模式开关入口，是附加交互能力的接入点。",
    },
    "bridge": {
        "analysis": "bridge 是 Claude Code 脱离纯终端、进入 IDE 和外部宿主场景的关键层。消息、权限、状态、指针乃至 debug 能力都要在这里重新适配外部通道。",
        "read_hint": "先看 `bridgeMain`、`bridgeMessaging`、`bridgeApi`，再补 `bridgeUI` 和权限回调。",
        "connect_note": "bridge 负责把 CLI 运行时接到 IDE、宿主和外部消息通道，是外联核心。",
    },
    "native-ts": {
        "analysis": "native-ts 暴露了这套系统对原生能力的需求边界，例如布局引擎、文件索引、颜色 diff。目录不大，但通常和性能、系统能力或跨语言封装有关。",
        "read_hint": "先看 `yoga-layout`，再看 `file-index`、`color-diff` 这类功能点，理解它们为何不能只靠纯 JS 完成。",
        "connect_note": "native-ts 封装原生能力入口，用来补足纯 TypeScript 在性能和系统接口上的边界。",
    },
    "remote": {
        "analysis": "remote 负责远程 session、WebSocket 与权限桥接，说明 Claude Code 的执行面并不一定和 UI 在同一进程、同一机器上。",
        "read_hint": "优先看 `RemoteSessionManager`、`SessionsWebSocket`、`remotePermissionBridge`。",
        "connect_note": "remote 承接远程会话、连接和权限桥，是跨机器运行的关键一层。",
    },
    "plugins": {
        "analysis": "plugins 体量小但战略位置高。它说明系统为外部扩展预留了注册点，真正复杂的地方常常不在这里，而在它如何与 bridge、tools、settings 协同。",
        "read_hint": "先看 `builtinPlugins.ts` 与 `bundled/index.ts`，再回查插件如何被加载和暴露。",
        "connect_note": "plugins 提供内建和打包插件注册点，是扩展生态进入系统的门。",
    },
    "cli": {
        "analysis": "cli 是终端入口总管。参数解析、handler 分发、前后台模式和命令行输出都在这里汇合，所以它是理解“程序怎样启动并接住用户输入”的关键目录。",
        "read_hint": "先看 `entrypoints/cli.tsx` 对应入口，再读 `handlers` 子目录和 `print.ts`。",
        "connect_note": "cli 负责接住终端输入、分派 handler 并承载前后台命令流程。",
    },
    "entrypoints": {
        "analysis": "entrypoints 代表系统存在多种运行方式: CLI、MCP、SDK、控制通道等。它是不同产品形态共享同一核心能力的接头板。",
        "read_hint": "先看 `cli.tsx`、`mcp.ts`、`sdk/*`，对比不同入口共用与差异化的部分。",
        "connect_note": "entrypoints 把 CLI、MCP、SDK 等不同运行形态接到同一核心代码基。",
    },
    "migrations": {
        "analysis": "migrations 集中处理设置、模型默认值和旧配置升级，说明这套系统在持续演进中非常重视向后兼容。读这里能看出产品策略如何落到历史配置治理上。",
        "read_hint": "顺着文件名读即可，重点看模型迁移和设置迁移各自覆盖什么场景。",
        "connect_note": "migrations 负责旧设置与模型策略升级，是演进过程中的兼容层。",
    },
    "server": {
        "analysis": "server 目录承载 headless、direct-connect 和 session manager 等服务式运行形态。它揭示了 Claude Code 并非只能以前台 REPL 运行，还可以作为长连服务存在。",
        "read_hint": "先看 `server.ts`、`sessionManager.ts`、`connectHeadless.ts`，再看 direct-connect 相关实现。",
        "connect_note": "server 提供 headless 与 direct-connect 承载层，让系统可以以服务方式常驻。",
    },
    "bun-polyfill": {
        "analysis": "bun-polyfill 说明代码基需要在非 Bun 环境模拟部分 Bun 接口，是运行时兼容设计的一部分。",
        "read_hint": "直接看 `index.ts` 与 `bun.ts` 即可，重点理解哪些接口被补平。",
        "connect_note": "bun-polyfill 为运行时补齐 Bun 风格接口，降低环境差异对上层代码的影响。",
    },
    "daemon": {
        "analysis": "daemon 负责后台长驻进程和 worker 注册，是把一次性 CLI 执行扩展为持续服务能力的基础设施。",
        "read_hint": "先看 `main.ts`，再看 `workerRegistry.ts` 理解后台能力如何挂载。",
        "connect_note": "daemon 承接后台长驻能力，是长期运行形态的核心入口。",
    },
    "ssh": {
        "analysis": "ssh 目录回答的是“如何把会话安全地投送到远端 shell 环境”。体量不大，但通常与连接状态、权限和会话生命周期强相关。",
        "read_hint": "直接看 `createSSHSession.ts` 与 `SSHSessionManager.ts`。",
        "connect_note": "ssh 封装远程 shell 会话管理，是跨主机执行的底层通道之一。",
    },
    "upstreamproxy": {
        "analysis": "upstreamproxy 负责上游中继与代理适配，常用于网络、转发或企业环境下的连接改写。",
        "read_hint": "先看 `relay.ts`，再看 `upstreamproxy.ts`，理解它如何介入请求路径。",
        "connect_note": "upstreamproxy 处理上游连接代理与中继，是网络通路适配层。",
    },
    "bootstrap": {
        "analysis": "bootstrap 通常承担初始化状态的拼装工作。文件少但靠前，适合拿来理解系统最初如何准备默认运行上下文。",
        "read_hint": "查看 `state.ts`，再顺着调用链回到 `entrypoints` 或 `main`。",
        "connect_note": "bootstrap 负责最初状态装配，是程序启动早期的初始化胶水层。",
    },
    "environment-runner": {
        "analysis": "environment-runner 暗示系统支持某种独立环境执行器形态。它通常不是日常阅读主线，但能反映部署和封装策略。",
        "read_hint": "先看 `main.ts`，再确认它从哪里被调用、服务于什么场景。",
        "connect_note": "environment-runner 提供独立环境执行入口，用于特定部署或封装场景。",
    },
    "self-hosted-runner": {
        "analysis": "self-hosted-runner 指向自托管运行形态，说明这套系统预留了脱离官方托管环境独立承载的路径。",
        "read_hint": "阅读 `main.ts` 后，再结合 `server` 和 `entrypoints` 理解整体承载模式。",
        "connect_note": "self-hosted-runner 负责自托管执行入口，是部署形态扩展的一部分。",
    },
    "utils": {
        "analysis": "utils 体量巨大，说明大量跨域细节被抽成通用助手函数与基础设施。它不适合独立通读，更适合沿调用链回查，否则容易在细节海里迷路。",
        "read_hint": "优先按问题回查：看到陌生调用时再跳进对应 util，不建议把整个目录当主线起点。",
        "connect_note": "utils 提供跨目录共享的基础助手函数，是整套系统复用密度最高的工具层。",
    },
    "types": {
        "analysis": "types 是跨模块契约层。很多目录之间之所以能稳定协作，依赖的不是命名默契，而是这里定义的 message、tool、ID、UI 元素等结构约束。",
        "read_hint": "优先看与当前调用链直接相关的类型，例如 message、tool、ids，再回到业务实现。",
        "connect_note": "types 统一跨模块结构契约，保证消息、工具和状态在不同目录间可稳定流动。",
    },
    "constants": {
        "analysis": "constants 汇总了静态规则、文案键、输出样式和风险指令等系统约束。它体现的是“默认行为如何被硬编码或集中配置”。",
        "read_hint": "先按主题读 `messages`、`keys`、`outputStyles`、`apiLimits`，再回查谁在消费这些常量。",
        "connect_note": "constants 集中保存静态规则与配置键，是行为边界和默认值的落点。",
    },
    "skills": {
        "analysis": "skills 代表更高层的任务能力封装。它通常以 prompt、workflow 或策略组合的形式影响模型行为，是把低层能力打包成更高语义单元的地方。",
        "read_hint": "先看 `bundled/index.ts`，再挑 `loop`、`debug`、`remember` 一类技能看它们如何包装能力。",
        "connect_note": "skills 把底层能力包装成更高语义任务单元，是行为策略的组合层。",
    },
    "keybindings": {
        "analysis": "keybindings 承接快捷键 schema、解析、匹配和冲突处理，是终端交互体验里非常工程化的一层。",
        "read_hint": "按 `defaultBindings -> parser -> resolver -> reservedShortcuts` 的顺序读，会比较顺。",
        "connect_note": "keybindings 定义和解析快捷键体系，保障复杂终端交互可预测。",
    },
    "memdir": {
        "analysis": "memdir 负责会话外部记忆的发现、筛选、归因和路径管理。它是长上下文之外的一条持久化补充路径，也是超长任务稳定性的关键支点。",
        "read_hint": "先看 `memdir.ts`、`findRelevantMemories.ts`、`teamMemPrompts.ts`，再回看 `services` 如何消费它。",
        "connect_note": "memdir 提供会话外记忆存取与筛选能力，是长任务续航的重要支撑层。",
    },
    "_external": {
        "analysis": "_external 往往是对外部模块或预加载能力的接缝层，体量虽小，但常承担与构建、运行环境耦合较高的工作。",
        "read_hint": "看 `preload.ts` 即可，再确认它在哪个入口被提前加载。",
        "connect_note": "_external 处理外部模块预加载，是运行时接入外部能力的细小接缝层。",
    },
    "moreright": {
        "analysis": "moreright 是一个特定体验特性的专属目录，说明代码基允许某些细粒度体验能力以独立模块方式存在，而不强塞进通用层。",
        "read_hint": "看 `useMoreRight.tsx`，再从引用点判断它服务于哪条交互路径。",
        "connect_note": "moreright 承载特定体验能力的独立实现，是小范围功能模块化的例子。",
    },
    "schemas": {
        "analysis": "schemas 体量虽小，但承担结构校验与约束角色，常是动态输入与静态契约之间的桥。",
        "read_hint": "直接阅读 `hooks.ts`，再看它被谁用于校验或导出。",
        "connect_note": "schemas 保存结构校验定义，用来把动态输入收束到可验证契约上。",
    },
    "sessionTranscript": {
        "analysis": "sessionTranscript 负责把会话过程沉淀成可保存、可回放或可导出的转录内容，是调试、恢复和审计的一个支点。",
        "read_hint": "先看 `sessionTranscript.ts`，再回查触发导出或保存的入口。",
        "connect_note": "sessionTranscript 管理会话转录与落盘，是恢复和审计能力的基础点。",
    },
    "buddy": {
        "analysis": "buddy 是人格化与陪伴感最直接的落点。sprite、prompt、notification 这些实现不会改变主循环骨架，却会明显改变用户对系统“性格”的感知。",
        "read_hint": "先看 `prompt.ts`、`companion.ts`、`CompanionSprite.tsx`，再看通知 hook 如何触发它。",
        "connect_note": "buddy 承载人格化陪伴体验，让系统在主流程之外增加可感知的性格层。",
    },
}

CROSS_LINKS: list[dict[str, object]] = [
    {"source": "components", "target": "hooks", "weight": 5, "note": "UI 组件大量依赖 hooks 取状态与行为"},
    {"source": "components", "target": "services", "weight": 4, "note": "界面最终由服务层提供数据与动作"},
    {"source": "components", "target": "ink", "weight": 4, "note": "组件树落在 Ink 渲染层"},
    {"source": "components", "target": "state", "weight": 3, "note": "交互状态与界面同步"},
    {"source": "commands", "target": "tools", "weight": 5, "note": "命令经常触发工具执行或编排工具链"},
    {"source": "commands", "target": "services", "weight": 4, "note": "命令最终落入服务层能力"},
    {"source": "commands", "target": "cli", "weight": 3, "note": "命令入口挂在 CLI 工作流上"},
    {"source": "tools", "target": "services", "weight": 5, "note": "工具执行结果回灌核心服务"},
    {"source": "tools", "target": "bridge", "weight": 3, "note": "部分工具连接外部宿主与 IDE"},
    {"source": "tools", "target": "utils", "weight": 3, "note": "工具实现广泛复用底层工具库"},
    {"source": "services", "target": "query", "weight": 5, "note": "主循环和服务层相互驱动"},
    {"source": "services", "target": "context", "weight": 4, "note": "上下文选择与压缩是核心服务的一部分"},
    {"source": "services", "target": "assistant", "weight": 4, "note": "助手行为常由服务层组织"},
    {"source": "services", "target": "tasks", "weight": 4, "note": "任务调度与服务能力耦合很深"},
    {"source": "services", "target": "state", "weight": 4, "note": "状态变化由服务更新和消费"},
    {"source": "hooks", "target": "state", "weight": 4, "note": "hooks 把状态绑定到界面与交互"},
    {"source": "hooks", "target": "context", "weight": 3, "note": "hooks 经常读写上下文与选择结果"},
    {"source": "bridge", "target": "plugins", "weight": 4, "note": "插件扩展通过桥接层接入"},
    {"source": "bridge", "target": "remote", "weight": 4, "note": "远端会话与桥接通道关系紧密"},
    {"source": "bridge", "target": "server", "weight": 3, "note": "桥接常需要服务端或 daemon 形态承载"},
    {"source": "entrypoints", "target": "cli", "weight": 4, "note": "入口文件组织 CLI 启动路径"},
    {"source": "entrypoints", "target": "server", "weight": 3, "note": "不同入口指向交互式或服务式运行"},
    {"source": "utils", "target": "types", "weight": 4, "note": "公共工具依赖统一类型契约"},
    {"source": "utils", "target": "constants", "weight": 3, "note": "工具库与常量层大量共享"},
    {"source": "memdir", "target": "services", "weight": 3, "note": "记忆目录为服务层提供持久化落点"},
]

LOOPLINE_STEPS: list[dict[str, object]] = [
    {
        "key": "input",
        "label": "输入",
        "description": "终端、管道或外部宿主把原始请求送进主循环入口。",
        "analysis": "这一段不是“模型推理”的一部分，而是运行时把外界请求正规化的入口层。它决定输入来自 CLI、桥接宿主还是别的 entrypoint，也决定后续会话初始化拿到哪些环境信息。",
        "read_hint": "先看 cli / entrypoints，再看 bridge，能最快理解请求是怎么进入主循环的。",
        "links": [("cli", 3, "CLI/终端入口"), ("entrypoints", 2, "启动路径"), ("bridge", 2, "外部宿主输入")],
    },
    {
        "key": "message",
        "label": "消息",
        "description": "把原始输入封装成 user message，并准备放入对话序列。",
        "analysis": "真正喂给模型的从来不是“裸字符串”，而是消息对象。这里的关键是把输入转换成统一消息结构，这样后续历史拼接、tool_result 回灌和 UI 展示才能共享同一套契约。",
        "read_hint": "优先看 query 和 types，理解 message shape；再看 assistant，理解会话壳层如何承接这些消息。",
        "links": [("query", 4, "消息进入查询主链"), ("assistant", 2, "助手会话外壳"), ("types", 2, "消息结构契约")],
    },
    {
        "key": "history",
        "label": "历史",
        "description": "拼入此前多轮 user / assistant / tool_result，形成完整上下文。",
        "analysis": "这一段决定模型看到的是“当前一句话”，还是“带有完整因果链的会话状态”。历史并不只是聊天记录，而是包含 tool_use / tool_result 配对、压缩后内容与上下文排序规则的工作上下文。",
        "read_hint": "先看 context 与 services，再看 state；如果想理解 tool_result 为什么必须按顺序回灌，再回头看 query。",
        "links": [("context", 4, "上下文组织"), ("state", 3, "运行态历史"), ("services", 3, "历史与会话服务")],
    },
    {
        "key": "system",
        "label": "系统",
        "description": "系统提示、规则、权限与策略一起约束这一轮调用。",
        "analysis": "系统层真正做的是“收紧模型自由度”：哪些规则先注入、哪些能力暴露给模型、哪些权限要在运行前后再拦一次。它是行为边界，不只是提示词模板。",
        "read_hint": "先看 services，理解系统规则如何组织；再看 constants / skills，理解规则源和静态配置从哪来。",
        "links": [("services", 3, "系统级策略组织"), ("constants", 2, "策略常量"), ("skills", 2, "技能/规则输入")],
    },
    {
        "key": "tooling",
        "label": "工具集",
        "description": "把当前轮可见的工具定义整理给模型，这一步是主循环里非常关键但常被忽略的一层。",
        "analysis": "模型不是天然“知道有哪些工具”，运行时必须把工具 schema、可见性和参数契约显式提供出去。这里决定了模型到底能不能发出正确的 tool_use，以及为什么同一个会话里不同轮次工具面可能不同。",
        "read_hint": "先看 tools，再看 commands，最后看 types；这三块组合起来才是完整的工具暴露面。",
        "links": [("tools", 4, "工具定义与协议"), ("commands", 2, "命令可切换工具可见性"), ("types", 2, "工具 schema 契约")],
    },
    {
        "key": "api",
        "label": "API",
        "description": "将消息、系统提示与工具定义一起送往模型 API，通常以流式方式回收响应。",
        "analysis": "这一步不只是“发请求”，而是把 messages、system、tools 和运行时参数编组成模型调用载荷，再把流式 chunk 解析回结构化事件。很多 UI 的“边生成边显示”也要依赖这里的流式回收机制。",
        "read_hint": "优先看 query 和 services，理解调用链；再看 server，理解服务形态下如何承载这一层。",
        "links": [("query", 4, "模型调用主链"), ("services", 3, "API 调用服务"), ("server", 2, "服务式承载")],
    },
    {
        "key": "token",
        "label": "Token",
        "description": "检查窗口预算、上下文长度与压缩需求，决定还能塞多少历史。",
        "analysis": "Token 预算本质上是在做“上下文经济学”：哪些历史必须保留，哪些内容可压缩，什么时候要触发 memdir / 外部记忆补充。它会直接影响模型能不能稳定做出工具决策。",
        "read_hint": "先看 services，再看 context；如果想理解超长会话如何续命，再看 memdir。",
        "links": [("services", 4, "压缩与预算管理"), ("context", 3, "上下文裁剪"), ("memdir", 2, "外部记忆补充")],
    },
    {
        "key": "tool_decision",
        "label": "判工具",
        "description": "模型决定是直接回答，还是发出 tool_use 继续推进这一轮。",
        "analysis": "这里的关键不是“要不要调用工具”这么简单，而是模型是否认为现有上下文足以直接回答，还是必须借助外部执行来补足事实、状态或副作用。这个判断会受工具暴露面、当前消息结构、token 预算以及前序 tool_result 质量共同影响。",
        "read_hint": "优先看 query 与 tools，理解判定发生在哪里；再看 commands，理解某些工作流为什么会显著改变工具使用倾向。",
        "links": [("tools", 4, "工具可调用面"), ("query", 4, "模型响应解析"), ("commands", 2, "命令式工作流可能影响判定")],
    },
    {
        "key": "execute",
        "label": "执行",
        "description": "宿主执行工具、命令、任务或桥接调用，拿到结果。",
        "analysis": "一旦模型发出 tool_use，控制权就短暂回到宿主。这里真正重要的是：执行环境是谁、有没有权限、是否经过桥接层、结果如何标准化返回。也就是说，这一步是“模型意图”向“运行时动作”的翻译层。",
        "read_hint": "先看 tools，再看 bridge / tasks；如果是命令触发的工作流，再补看 commands。",
        "links": [("tools", 5, "工具执行"), ("commands", 3, "命令驱动执行"), ("bridge", 3, "桥接外部宿主"), ("tasks", 2, "任务编排")],
    },
    {
        "key": "feedback",
        "label": "回流",
        "description": "把工具结果包装成 tool_result，再送回对话，让模型继续思考。",
        "analysis": "执行完工具并不意味着流程结束，真正闭环发生在结果被规范化写回消息流之后。只有这样模型才能把执行结果当作新的上下文继续推理，而不是把工具执行视为旁路事件。",
        "read_hint": "优先看 query 和 context，再看 state；这三块一起决定 tool_result 如何回灌且不打乱顺序。",
        "links": [("query", 4, "回灌到主循环"), ("context", 3, "回写上下文"), ("state", 2, "同步会话状态")],
    },
    {
        "key": "loop",
        "label": "循环",
        "description": "若还需继续调用工具则返回模型，否则准备收束输出。",
        "analysis": "Claude Code 类系统的核心不是单次调用，而是这个 while-loop。每一轮都会重新评估上下文、工具面和最新结果，所以“循环”是状态推进器，而不是简单的重复。",
        "read_hint": "先看 query，再看 services 和 assistant；这三块能解释一轮为何继续、何时结束。",
        "links": [("query", 4, "循环枢纽"), ("services", 3, "会话推进"), ("assistant", 2, "助手轮次控制")],
    },
    {
        "key": "render",
        "label": "呈现",
        "description": "把最终文本、工具卡片与状态反馈渲染到终端 UI 或外部宿主。",
        "analysis": "最终输出不是单纯把文本 print 出来，而是把 assistant reply、工具活动、通知与交互状态投影到 Ink/组件树中。也正因为有这一层，用户才能看到结构化工具卡片、状态条和可继续交互的界面。",
        "read_hint": "先看 components 和 ink，再看 hooks；如果输出还会同步到外部宿主，再补看 bridge。",
        "links": [("components", 5, "最终界面组件"), ("ink", 4, "终端渲染"), ("hooks", 3, "前后插逻辑"), ("bridge", 2, "外部宿主呈现")],
    },
]


def nest_by_category(flat: list[dict]) -> list[dict]:
    by_cat: dict[str, list[dict]] = defaultdict(list)
    for ch in flat:
        by_cat[str(ch["cat"])].append(ch)
    order_keys = [x["key"] for x in LEGEND_SPEC]
    out: list[dict] = []
    used: set[str] = set()
    for key in order_keys:
        leaves = by_cat.get(key)
        if not leaves:
            continue
        used.add(key)
        meta = next(x for x in LEGEND_SPEC if x["key"] == key)
        out.append(
            {
                "name": meta["label"],
                "cat": key,
                "children": sorted(leaves, key=lambda x: -int(x["value"])),
            }
        )
    for key, leaves in sorted(by_cat.items()):
        if key in used or not leaves:
            continue
        out.append(
            {
                "name": key,
                "cat": key,
                "children": sorted(leaves, key=lambda x: -int(x["value"])),
            }
        )
    return out


def count_ts_files(dir_path: Path) -> int:
    if not dir_path.is_dir():
        return 0
    n = 0
    for p in dir_path.rglob("*"):
        if p.is_file() and p.suffix in (".ts", ".tsx"):
            n += 1
    return n


def count_root_ts(src: Path) -> int:
    n = 0
    for p in src.iterdir():
        if p.is_file() and p.suffix in (".ts", ".tsx"):
            n += 1
    return n


def build_payload() -> dict:
    if not SRC.is_dir():
        raise FileNotFoundError(f"missing mirror: {SRC}")

    children: list[dict] = []
    for p in sorted(SRC.iterdir(), key=lambda x: x.name.lower()):
        if not p.is_dir():
            continue
        if p.name.startswith("."):
            continue
        v = count_ts_files(p)
        if v == 0:
            continue
        cat = DIR_CAT.get(p.name, DEFAULT_CAT)
        children.append({"name": p.name + "/", "value": v, "cat": cat})

    children.sort(key=lambda x: -x["value"])

    root_ts = count_root_ts(SRC)
    if root_ts:
        children.append({"name": ROOT_TS_LABEL, "value": root_ts, "cat": ROOT_TS_CAT})

    nested = nest_by_category(children)

    return {
        "meta": {
            "updated": date.today().isoformat(),
            "source": "ccsource/claude-code-main/src",
            "metric": "TypeScript / TSX file count per folder",
            "note_zh": "由 tools/gen_cc_arch_treemap.py 生成；更新镜像后请重新运行并提交。",
            "layout_zh": "双层：先按教学分区聚块，再在块内按子目录细分。",
        },
        "legend": [{"key": x["key"], "label": x["label"], "hint": x["hint"]} for x in LEGEND_SPEC],
        "root": {"name": "src", "children": nested},
    }


def folder_text_meta(folder_key: str, raw_name: str) -> dict[str, str]:
    meta = FOLDER_METADATA.get(folder_key) or FOLDER_METADATA.get(raw_name.rstrip("/")) or {}
    description = meta.get("description") or FOLDER_DESCRIPTIONS.get(raw_name.rstrip("/"), FOLDER_DESCRIPTIONS.get(folder_key, ""))
    analysis = meta.get("analysis", "")
    read_hint = meta.get("read_hint", "")
    connect_note = meta.get("connect_note")
    if not connect_note:
        if description:
            connect_note = f"{folder_key} 负责{description.rstrip('。')}。"
        else:
            connect_note = f"{folder_key} 是这一教学分区里的组成目录。"
    return {
        "description": description,
        "analysis": analysis,
        "read_hint": read_hint,
        "connect_note": connect_note,
    }


def build_knowledge_payload(tree_payload: dict) -> dict:
    root = tree_payload["root"]
    nodes: list[dict[str, object]] = []
    contains_links: list[dict[str, object]] = []
    folder_index: dict[str, dict[str, object]] = {}

    for cat_node in root["children"]:
        cat_key = str(cat_node["cat"])
        cat_id = f"cat:{cat_key}"
        total = sum(int(ch["value"]) for ch in cat_node["children"])
        nodes.append(
            {
                "id": cat_id,
                "key": cat_key,
                "label": str(cat_node["name"]),
                "kind": "category",
                "cat": cat_key,
                "size": total,
                "hint": next((x["hint"] for x in LEGEND_SPEC if x["key"] == cat_key), ""),
                "description": CATEGORY_DESCRIPTIONS.get(cat_key, ""),
                "analysis": CATEGORY_ANALYSIS.get(cat_key, ""),
                "read_hint": CATEGORY_READ_HINT.get(cat_key, ""),
            }
        )
        for leaf in cat_node["children"]:
            raw_name = str(leaf["name"])
            folder_key = raw_name.rstrip("/").replace("（", "").replace("）", "")
            text_meta = folder_text_meta(folder_key, raw_name)
            folder_id = f"folder:{folder_key}"
            folder_node = {
                "id": folder_id,
                "key": folder_key,
                "label": raw_name,
                "kind": "folder",
                "cat": cat_key,
                "size": int(leaf["value"]),
                "parent": cat_id,
                "description": text_meta["description"],
                "analysis": text_meta["analysis"],
                "read_hint": text_meta["read_hint"],
            }
            nodes.append(folder_node)
            folder_index[raw_name.rstrip("/")] = folder_node
            folder_index[folder_key] = folder_node
            contains_links.append(
                {
                    "source": cat_id,
                    "target": folder_id,
                    "weight": max(1, int(leaf["value"])),
                    "kind": "contains",
                    "note": text_meta["connect_note"],
                }
            )

    cross_links: list[dict[str, object]] = []
    for spec in CROSS_LINKS:
        src = folder_index.get(str(spec["source"]))
        dst = folder_index.get(str(spec["target"]))
        if not src or not dst:
            continue
        cross_links.append(
            {
                "source": src["id"],
                "target": dst["id"],
                "weight": int(spec["weight"]),
                "kind": "cross",
                "note": str(spec["note"]),
            }
        )

    loop_nodes: list[dict[str, object]] = []
    loop_links: list[dict[str, object]] = []
    loop_category_links: list[dict[str, object]] = []
    for i, step in enumerate(LOOPLINE_STEPS):
        loop_id = f"loop:{step['key']}"
        cat_weights: dict[str, int] = defaultdict(int)
        loop_nodes.append(
            {
                "id": loop_id,
                "key": step["key"],
                "label": step["label"],
                "kind": "loop",
                "cat": "core",
                "size": 1,
                "step_index": i,
                "description": step["description"],
                "analysis": step["analysis"],
                "read_hint": step["read_hint"],
            }
        )
        if i > 0:
            prev_id = f"loop:{LOOPLINE_STEPS[i - 1]['key']}"
            loop_links.append(
                {
                    "source": prev_id,
                    "target": loop_id,
                    "weight": 4,
                    "kind": "loop",
                    "note": "主循环阶段推进",
                }
            )
        for folder_key, weight, note in step["links"]:
            target = folder_index.get(str(folder_key))
            if not target:
                continue
            cat_weights[str(target["cat"])] += int(weight)
            loop_links.append(
                {
                    "source": loop_id,
                    "target": target["id"],
                    "weight": int(weight),
                    "kind": "loop_map",
                    "note": str(note),
                }
            )
        for cat_key, weight in sorted(cat_weights.items()):
            loop_category_links.append(
                {
                    "source": loop_id,
                    "target": f"cat:{cat_key}",
                    "weight": int(weight),
                    "kind": "loop_category",
                    "note": "该主线阶段主要落在此教学分区",
                }
            )

    return {
        "meta": {
            "updated": tree_payload["meta"]["updated"],
            "source": tree_payload["meta"]["source"],
            "note_zh": "块内结构来自目录树统计；跨块联系为教学向依赖归纳，帮助建立阅读顺序与心智模型。",
        },
        "legend": tree_payload["legend"],
        "nodes": nodes + loop_nodes,
        "contains_links": contains_links,
        "cross_links": cross_links,
        "loop_links": loop_links,
        "loop_category_links": loop_category_links,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--verify-in-sync", action="store_true")
    args = ap.parse_args()

    if args.verify_in_sync and not SRC.is_dir():
        if not OUT.is_file():
            print(f"gen_cc_arch_treemap: missing {OUT}", file=sys.stderr)
            return 1
        try:
            json.loads(OUT.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"gen_cc_arch_treemap: invalid JSON in {OUT}: {e}", file=sys.stderr)
            return 1
        print("gen_cc_arch_treemap: OK (no src mirror in CI; JSON valid)")
        return 0

    try:
        payload = build_payload()
    except FileNotFoundError as e:
        if args.verify_in_sync:
            print(
                f"gen_cc_arch_treemap: verify needs {SRC}",
                file=sys.stderr,
            )
            return 1
        print(f"gen_cc_arch_treemap: SKIP ({e})", file=sys.stderr)
        return 0

    text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    graph_payload = build_knowledge_payload(payload)
    graph_text = json.dumps(graph_payload, ensure_ascii=False, indent=2) + "\n"

    if args.dry_run:
        print(text, end="")
        return 0

    if args.verify_in_sync:
        if not OUT.is_file() or not OUT_GRAPH.is_file():
            print(f"gen_cc_arch_treemap: missing {OUT} or {OUT_GRAPH}", file=sys.stderr)
            return 1
        existing = OUT.read_text(encoding="utf-8")
        existing_graph = OUT_GRAPH.read_text(encoding="utf-8")
        # meta.updated 使用「今天」会导致跨日 CI 误报；校验树与数值时沿用已提交文件中的日期
        try:
            prev = json.loads(existing)
            pu = (prev.get("meta") or {}).get("updated")
            if pu and isinstance(payload.get("meta"), dict):
                payload["meta"]["updated"] = pu
                if isinstance(graph_payload.get("meta"), dict):
                    graph_payload["meta"]["updated"] = pu
        except json.JSONDecodeError:
            pass
        text = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
        graph_text = json.dumps(graph_payload, ensure_ascii=False, indent=2) + "\n"
        if existing != text or existing_graph != graph_text:
            print(
                "gen_cc_arch_treemap: OUT OF SYNC — run: python3 tools/gen_cc_arch_treemap.py",
                file=sys.stderr,
            )
            return 1
        print("gen_cc_arch_treemap: OK (in sync)")
        return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text, encoding="utf-8")
    OUT_GRAPH.write_text(graph_text, encoding="utf-8")
    print(
        "gen_cc_arch_treemap: wrote "
        f"{OUT.relative_to(REPO_ROOT)} and {OUT_GRAPH.relative_to(REPO_ROOT)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
