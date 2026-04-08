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
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SRC = REPO_ROOT / "ccsource" / "claude-code-main" / "src"
OUT = REPO_ROOT / "site" / "data" / "cc-arch-treemap.json"

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

    return {
        "meta": {
            "updated": date.today().isoformat(),
            "source": "ccsource/claude-code-main/src",
            "metric": "TypeScript / TSX file count per folder",
            "note_zh": "由 tools/gen_cc_arch_treemap.py 生成；更新镜像后请重新运行并提交。",
        },
        "legend": [
            {"key": "tools_commands", "label": "工具与命令", "hint": "commands/ · tools/"},
            {"key": "core", "label": "核心处理", "hint": "services · hooks · 会话与查询等"},
            {"key": "ui", "label": "UI 层", "hint": "components · ink · 终端界面"},
            {"key": "bridge", "label": "桥接与集成", "hint": "bridge · plugins · remote"},
            {"key": "infra", "label": "基础设施", "hint": "cli · entrypoints · 运行时支撑"},
            {"key": "support", "label": "支撑与工具库", "hint": "utils · constants · types"},
            {"key": "personality", "label": "个性与实验向", "hint": "如 buddy 等"},
        ],
        "root": {"name": "src", "children": children},
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

    if args.dry_run:
        print(text, end="")
        return 0

    if args.verify_in_sync:
        if not OUT.is_file():
            print(f"gen_cc_arch_treemap: missing {OUT}", file=sys.stderr)
            return 1
        existing = OUT.read_text(encoding="utf-8")
        if existing != text:
            print(
                "gen_cc_arch_treemap: OUT OF SYNC — run: python3 tools/gen_cc_arch_treemap.py",
                file=sys.stderr,
            )
            return 1
        print("gen_cc_arch_treemap: OK (in sync)")
        return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text, encoding="utf-8")
    print(f"gen_cc_arch_treemap: wrote {OUT.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
