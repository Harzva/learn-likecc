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

FOLDER_DESCRIPTIONS: dict[str, str] = {
    "commands": "斜杠命令与交互式工作流入口。",
    "tools": "工具协议、工具实现与工具执行封装。",
    "services": "会话服务、压缩、索引、权限、同步等核心能力。",
    "hooks": "跨组件与会话的复用逻辑，常连接 UI 与核心状态。",
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
    "tasks": "任务对象与前后台任务编排。",
    "context": "上下文组织、注入与选择。",
    "state": "运行态状态树与共享状态容器。",
    "assistant": "助手会话与行为壳层。",
    "query": "查询编排、主循环与模型往返。",
    "native-ts": "原生集成的 TypeScript 桥。",
    "daemon": "守护进程与长连接后台。",
    "ssh": "SSH 场景支持。",
    "upstreamproxy": "代理与上游连接适配。",
    "screens": "少量完整屏视图。",
    "vim": "Vim 模式交互。",
    "outputStyles": "输出样式切换。",
    "voice": "语音相关入口。",
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
            }
        )
        for leaf in cat_node["children"]:
            raw_name = str(leaf["name"])
            folder_key = raw_name.rstrip("/").replace("（", "").replace("）", "")
            folder_id = f"folder:{folder_key}"
            folder_node = {
                "id": folder_id,
                "key": folder_key,
                "label": raw_name,
                "kind": "folder",
                "cat": cat_key,
                "size": int(leaf["value"]),
                "parent": cat_id,
                "description": FOLDER_DESCRIPTIONS.get(raw_name.rstrip("/"), FOLDER_DESCRIPTIONS.get(folder_key, "")),
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
                    "note": f"{cat_node['name']} 内部目录",
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
