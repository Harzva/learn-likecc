#!/usr/bin/env python3
"""Demo LoopEvent stream as NDJSON on stdout (stdlib only).

Not a network server — pipe output to your own relay or inspect manually.

Usage (repo root):
  python3 tools/cc_loop_relay_demo.py
  python3 tools/cc_loop_relay_demo.py --fast
"""
from __future__ import annotations

import argparse
import json
import sys
import time

# Align with site/data/cc-loop-steps.json step ids for conceptual parity
DEMO = [
    ("input", "用户输入", "stdin / Ink TextInput"),
    ("message", "构造 user 消息", None),
    ("history", "合并 messages[]", "len=N"),
    ("system", "系统提示 + tools 定义", None),
    ("api", "流式请求模型", "model=…"),
    ("tokens", "上下文占用", "usage estimate"),
    ("tools_decide", "解析 stop_reason / tool_use", None),
    ("tools_run", "执行工具", "name=Read"),
    ("tool_result", "写回 tool_result", "tool_use_id=…"),
    ("loop_exit", "继续循环或结束", "stop_reason≠tool_use → exit"),
    ("render", "渲染 REPL", None),
]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--fast", action="store_true", help="minimal delay between lines")
    args = ap.parse_args()
    delay = 0.08 if args.fast else 0.45

    t0 = time.time()
    for stage, title, detail in DEMO:
        ev: dict = {
            "stage": stage,
            "ts": int((time.time() - t0) * 1000),
            "title": title,
        }
        if detail:
            ev["detail"] = detail
        line = json.dumps(ev, ensure_ascii=False)
        sys.stdout.write(line + "\n")
        sys.stdout.flush()
        time.sleep(delay)

    sys.stdout.write(
        json.dumps({"stage": "_end", "ts": int((time.time() - t0) * 1000), "title": "demo finished"}, ensure_ascii=False)
        + "\n"
    )
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
