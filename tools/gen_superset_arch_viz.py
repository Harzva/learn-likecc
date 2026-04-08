#!/usr/bin/env python3
"""Build Superset architecture treemap + knowledge graph JSON for the site.

Usage:
  python3 tools/gen_superset_arch_viz.py
  python3 tools/gen_superset_arch_viz.py --dry-run
"""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SUPERSET_ROOT = REPO_ROOT / "reference" / "reference_agent" / "reference_control-agent-cli" / "superset"
OUT_TREEMAP = REPO_ROOT / "site" / "data" / "superset-arch-treemap.json"
OUT_GRAPH = REPO_ROOT / "site" / "data" / "superset-arch-knowledge.json"

COUNT_SUFFIXES = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".sql",
    ".sh",
    ".yml",
    ".yaml",
    ".css",
}
IGNORE_DIRS = {
    ".git",
    "node_modules",
    "dist",
    "build",
    ".next",
    ".turbo",
    ".cache",
    "coverage",
    "release",
}

CATEGORY_SPEC = [
    {
        "key": "shell_apps",
        "label": "产品壳与工作台",
        "hint": "apps/desktop · web · api · docs 等",
        "description": "这层解决“用户在哪个外壳里观察和切换多个 agent”。它不是单个 CLI，而是完整工作台矩阵。",
        "analysis": "Superset 和普通 agent CLI 的差别，从顶层 apps 就已经开始了。它从设计上就是工作台，而不是终端增强脚本。",
        "read_hint": "先看 desktop、web、api，再回看 marketing/docs，最容易建立产品壳心智。",
    },
    {
        "key": "pane_surface",
        "label": "Pane 与前台工作位",
        "hint": "panes · ui · workspace-client",
        "description": "这层解决“工位”抽象：tab、pane、split layout、前台视图和工作位切换。",
        "analysis": "没有这层，多 agent 很容易退化成一堆散乱终端；有了这层，agent 才会变成可观察、可切换的工位。",
        "read_hint": "优先联读 panes、ui、workspace-client，先理解工作位，再理解具体运行体。",
    },
    {
        "key": "control_plane",
        "label": "调度中枢",
        "hint": "host-service · chat · trpc · auth · mcp",
        "description": "这层解决“谁在统一协调 runtime、路由、权限、事件与控制动作”。",
        "analysis": "真正的 orchestration kernel 不在 React 组件里，而在 host-service、chat runtime 和协议层里。",
        "read_hint": "先看 host-service，再串 chat、trpc、auth、mcp，最容易看清 control plane。",
    },
    {
        "key": "workspace_stack",
        "label": "工作区与隔离层",
        "hint": "workspace-fs · db · local-db · cli",
        "description": "这层解决“agent 跑在哪里、怎样隔离、怎样落库、怎样进入本地工作流”。",
        "analysis": "Superset 之所以能并行跑多个 agent 而不互相污染，关键不只是 terminal，而是 workspace/worktree/存储几层一起成立。",
        "read_hint": "读 workspace-fs、db、local-db，再补 cli/cli-framework，容易理解本地执行与隔离是怎样落地的。",
    },
    {
        "key": "shared_support",
        "label": "共享基础设施",
        "hint": "shared · email · metrics 等",
        "description": "这层放跨包共享能力与边缘但必要的基础设施。",
        "analysis": "它不直接定义主叙事，但决定这套系统怎样在多产品面之间复用能力、补齐体验。",
        "read_hint": "把它当作支撑层读，不要一开始陷进去；先建立主线，再回来补共享工具。",
    },
]

CATEGORY_BY_KEY = {item["key"]: item for item in CATEGORY_SPEC}

FOLDER_CATEGORY = {
    "admin": "shell_apps",
    "api": "shell_apps",
    "desktop": "shell_apps",
    "docs": "shell_apps",
    "electric-proxy": "shell_apps",
    "marketing": "shell_apps",
    "mobile": "shell_apps",
    "streams": "shell_apps",
    "web": "shell_apps",
    "panes": "pane_surface",
    "ui": "pane_surface",
    "workspace-client": "pane_surface",
    "host-service": "control_plane",
    "chat": "control_plane",
    "trpc": "control_plane",
    "auth": "control_plane",
    "mcp": "control_plane",
    "desktop-mcp": "control_plane",
    "workspace-fs": "workspace_stack",
    "db": "workspace_stack",
    "local-db": "workspace_stack",
    "cli": "workspace_stack",
    "cli-framework": "workspace_stack",
    "shared": "shared_support",
    "email": "shared_support",
    "macos-process-metrics": "shared_support",
}

FOLDER_HINTS = {
    "desktop": "Electron 壳与桌面工作台入口。",
    "web": "浏览器端工作台或面板入口。",
    "api": "服务接口与 API 面。",
    "marketing": "产品官网与对外展示页。",
    "docs": "文档站与说明页。",
    "panes": "无头 pane/workspace 布局引擎。",
    "ui": "通用 UI 组件和前台视图支撑。",
    "workspace-client": "前台工作区客户端胶水层。",
    "host-service": "真正的调度中枢与 runtime 组装点。",
    "chat": "chat runtime、客户端和服务端协议栈。",
    "trpc": "跨前后端控制协议与路由层。",
    "auth": "身份与授权相关支撑。",
    "mcp": "MCP 相关能力与上下文协议支撑。",
    "desktop-mcp": "桌面侧 MCP 接入桥。",
    "workspace-fs": "工作区文件系统与隔离层。",
    "db": "共享数据库层。",
    "local-db": "本地数据库与本地状态承载。",
    "cli": "命令行入口与本地执行壳。",
    "cli-framework": "CLI 骨架与命令框架。",
    "shared": "跨包共享库与公共类型。",
    "email": "邮件相关基础设施。",
    "macos-process-metrics": "macOS 进程指标采集。",
}

CROSS_LINKS = [
    ("folder:desktop", "folder:panes", 5, "desktop 工作台需要 panes 才能把多个 agent 变成稳定工位"),
    ("folder:desktop", "folder:host-service", 5, "桌面前台真正依赖 host-service 提供 runtime、terminal 和事件"),
    ("folder:web", "folder:chat", 3, "Web 面要消费 chat runtime 的会话和控制协议"),
    ("folder:api", "folder:trpc", 3, "API 面和协议路由层天然相连"),
    ("folder:panes", "folder:ui", 4, "panes 提供布局抽象，ui 负责把工位渲染成具体前台"),
    ("folder:panes", "folder:workspace-client", 4, "workspace-client 把 pane 工作位接到具体工作区状态"),
    ("folder:host-service", "folder:chat", 5, "host-service 内部最关键的一条 runtime 就是 chat"),
    ("folder:host-service", "folder:trpc", 5, "host-service 通过 tRPC 暴露控制面"),
    ("folder:host-service", "folder:workspace-fs", 5, "工作区文件系统属于调度中枢的一部分"),
    ("folder:host-service", "folder:db", 4, "运行时、事件和状态最终都需要落到数据库或读取数据库"),
    ("folder:chat", "folder:auth", 3, "chat runtime 的可用性依赖认证和 provider 权限"),
    ("folder:chat", "folder:trpc", 4, "chat 控制动作需要经由协议层暴露给前台"),
    ("folder:workspace-fs", "folder:db", 3, "工作区与文件系统状态经常需要和数据库状态一起读"),
    ("folder:workspace-fs", "folder:local-db", 3, "本地工作区状态和本地数据库紧密耦合"),
    ("folder:mcp", "folder:desktop-mcp", 3, "桌面端 MCP 接入是 MCP 能力的一条具体落地线"),
    ("folder:cli", "folder:cli-framework", 3, "CLI 入口依赖命令框架定义行为边界"),
    ("folder:shared", "folder:ui", 2, "共享类型与公共工具会渗透到前台 UI 包"),
]


def should_count_file(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in COUNT_SUFFIXES


def iter_files(root: Path):
    for path in root.rglob("*"):
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if should_count_file(path):
            yield path


def count_files(root: Path) -> int:
    return sum(1 for _ in iter_files(root))


def collect_top_level() -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    for bucket in ("apps", "packages"):
        bucket_dir = SUPERSET_ROOT / bucket
        for child in sorted(bucket_dir.iterdir()):
            if not child.is_dir():
                continue
            cat = FOLDER_CATEGORY.get(child.name, "shared_support")
            items.append(
                {
                    "name": child.name,
                    "path": f"{bucket}/{child.name}",
                    "bucket": bucket,
                    "cat": cat,
                    "value": count_files(child),
                }
            )
    return items


def build_treemap(items: list[dict[str, object]]) -> dict[str, object]:
    grouped: dict[str, list[dict[str, object]]] = {item["key"]: [] for item in CATEGORY_SPEC}
    for item in items:
        grouped[item["cat"]].append(
            {
                "name": item["path"],
                "value": item["value"],
                "cat": item["cat"],
            }
        )

    root_children = []
    for cat in CATEGORY_SPEC:
        leaves = sorted(grouped[cat["key"]], key=lambda leaf: (-leaf["value"], leaf["name"]))
        root_children.append({"name": cat["label"], "cat": cat["key"], "children": leaves})

    return {
        "meta": {
            "updated": str(date.today()),
            "source": "reference/reference_agent/reference_control-agent-cli/superset",
            "note_zh": "Superset Treemap 为教学向结构图：先按教学分区聚块，再展示 apps/packages 顶层目录文件量；不是静态依赖图。",
        },
        "legend": [{"key": item["key"], "label": item["label"], "hint": item["hint"]} for item in CATEGORY_SPEC],
        "root": {"name": "superset", "children": root_children},
    }


def folder_node(item: dict[str, object]) -> dict[str, object]:
    return {
        "id": f"folder:{item['name']}",
        "key": item["name"],
        "label": item["path"],
        "kind": "folder",
        "cat": item["cat"],
        "parent": f"cat:{item['cat']}",
        "size": item["value"],
        "hint": FOLDER_HINTS.get(item["name"], f"{item['path']} 目录"),
        "description": FOLDER_HINTS.get(item["name"], f"{item['path']} 是 Superset 顶层结构中的一个目录块。"),
        "analysis": f"{item['path']} 属于 {CATEGORY_BY_KEY[item['cat']]['label']}，文件量约 {item['value']}，适合当作该分区的代表目录来读。",
        "read_hint": f"建议从 `{item['path']}` 的入口文件或 README 先建立作用，再回看它与相邻目录的连接。",
    }


def build_knowledge(items: list[dict[str, object]]) -> dict[str, object]:
    nodes = []
    contains_links = []
    for cat in CATEGORY_SPEC:
        nodes.append(
            {
                "id": f"cat:{cat['key']}",
                "key": cat["key"],
                "label": cat["label"],
                "kind": "category",
                "cat": cat["key"],
                "size": sum(int(item["value"]) for item in items if item["cat"] == cat["key"]),
                "hint": cat["hint"],
                "description": cat["description"],
                "analysis": cat["analysis"],
                "read_hint": cat["read_hint"],
            }
        )

    for item in items:
        nodes.append(folder_node(item))
        contains_links.append(
            {
                "source": f"cat:{item['cat']}",
                "target": f"folder:{item['name']}",
                "weight": 1,
                "kind": "contains",
                "note": f"{item['path']} 属于 {CATEGORY_BY_KEY[item['cat']]['label']}。",
            }
        )

    cross_links = [
        {"source": src, "target": dst, "weight": weight, "kind": "cross", "note": note}
        for src, dst, weight, note in CROSS_LINKS
    ]

    return {
        "meta": {
            "updated": str(date.today()),
            "source": "reference/reference_agent/reference_control-agent-cli/superset",
            "note_zh": "Superset 知识图谱强调“最值得一起读的关系”，不是机械 import 图；块内结构用于建立目录心智，跨块联系用于建立阅读顺序。",
        },
        "legend": [{"key": item["key"], "label": item["label"], "hint": item["hint"]} for item in CATEGORY_SPEC],
        "nodes": nodes,
        "contains_links": contains_links,
        "cross_links": cross_links,
        "loop_links": [],
        "loop_category_links": [],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    items = collect_top_level()
    treemap = build_treemap(items)
    knowledge = build_knowledge(items)

    if args.dry_run:
        print(json.dumps({"treemap": treemap, "knowledge": knowledge}, ensure_ascii=False, indent=2))
        return 0

    OUT_TREEMAP.write_text(json.dumps(treemap, ensure_ascii=False, indent=2) + "\n")
    OUT_GRAPH.write_text(json.dumps(knowledge, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {OUT_TREEMAP.relative_to(REPO_ROOT)} and {OUT_GRAPH.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
