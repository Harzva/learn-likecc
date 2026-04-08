#!/usr/bin/env python3
"""Validate site/data/cc-loop-steps.json structure (no third-party deps).

Exit 0 if OK, 1 with stderr message if invalid.

Usage (repo root):
  python3 tools/check_cc_loop_steps.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PATH = REPO_ROOT / "site" / "data" / "cc-loop-steps.json"

REQUIRED_STEP_KEYS = ("id", "label", "title", "body")
OPTIONAL_STRING_KEYS = ("analysis", "pitfall", "read_hint")


def err(msg: str) -> None:
    print(f"check_cc_loop_steps: {msg}", file=sys.stderr)


def main() -> int:
    if not PATH.is_file():
        err(f"missing {PATH.relative_to(REPO_ROOT)}")
        return 1
    try:
        data = json.loads(PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        err(f"invalid JSON: {e}")
        return 1

    if not isinstance(data, dict):
        err("root must be an object")
        return 1

    meta = data.get("meta")
    if not isinstance(meta, dict):
        err("'meta' must be an object")
        return 1
    if "updated" not in meta or not isinstance(meta["updated"], str) or not meta["updated"].strip():
        err("meta.updated must be a non-empty string")
        return 1
    if "autoplay_base_ms" in meta:
        v = meta["autoplay_base_ms"]
        if not isinstance(v, int) or v < 200:
            err("meta.autoplay_base_ms must be int >= 200")
            return 1
    if "loop_autoplay" in meta and not isinstance(meta["loop_autoplay"], bool):
        err("meta.loop_autoplay must be boolean if present")
        return 1

    steps = data.get("steps")
    if not isinstance(steps, list) or len(steps) < 1:
        err("'steps' must be a non-empty array")
        return 1

    seen: set[str] = set()
    for i, s in enumerate(steps):
        if not isinstance(s, dict):
            err(f"steps[{i}] must be an object")
            return 1
        for k in REQUIRED_STEP_KEYS:
            if k not in s:
                err(f"steps[{i}] missing required key {k!r}")
                return 1
            if not isinstance(s[k], str) or not s[k].strip():
                err(f"steps[{i}].{k} must be a non-empty string")
                return 1
        sid = s["id"]
        if sid in seen:
            err(f"duplicate step id: {sid!r}")
            return 1
        seen.add(sid)

        if "terminal" in s:
            t = s["terminal"]
            if not isinstance(t, list) or not all(isinstance(x, str) for x in t):
                err(f"steps[{i}].terminal must be an array of strings")
                return 1
        for k in OPTIONAL_STRING_KEYS:
            if k in s and (not isinstance(s[k], str) or not s[k].strip()):
                err(f"steps[{i}].{k} must be a non-empty string")
                return 1
        if "links" in s:
            links = s["links"]
            if not isinstance(links, list):
                err(f"steps[{i}].links must be an array")
                return 1
            for j, L in enumerate(links):
                if not isinstance(L, dict):
                    err(f"steps[{i}].links[{j}] must be an object")
                    return 1
                if "href" not in L or "text" not in L:
                    err(f"steps[{i}].links[{j}] needs href and text")
                    return 1
                if not isinstance(L["href"], str) or not isinstance(L["text"], str):
                    err(f"steps[{i}].links[{j}] href/text must be strings")
                    return 1

    print(f"check_cc_loop_steps: OK ({len(steps)} steps, {len(seen)} unique ids)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
