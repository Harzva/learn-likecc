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

from cc_loop_demo_events import DEMO


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
