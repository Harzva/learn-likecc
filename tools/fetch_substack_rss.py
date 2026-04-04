#!/usr/bin/env python3
"""Fetch and list items from a Substack-style RSS feed (e.g. Daily Dose of DS).

Usage:
  python3 tools/fetch_substack_rss.py
  python3 tools/fetch_substack_rss.py --url https://blog.dailydoseofds.com/feed --limit 15 --json
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.request
import xml.etree.ElementTree as ET


def fetch_rss(url: str, timeout: float = 90.0) -> bytes:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "learn-likecc-rss-fetch/1.0 (+https://github.com/Harzva/learn-likecc)"},
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def parse_items(xml_bytes: bytes, limit: int | None) -> list[dict[str, str]]:
    root = ET.fromstring(xml_bytes)
    channel = root.find("channel")
    if channel is None:
        return []
    out: list[dict[str, str]] = []
    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub = (item.findtext("pubDate") or "").strip()
        desc = (item.findtext("description") or "").strip()
        if not title and not link:
            continue
        out.append({"title": title, "link": link, "pubDate": pub, "description": desc[:500]})
        if limit is not None and len(out) >= limit:
            break
    return out


def main() -> int:
    p = argparse.ArgumentParser(description="List recent posts from an RSS feed.")
    p.add_argument(
        "--url",
        default="https://blog.dailydoseofds.com/feed",
        help="RSS or Atom XML URL (Substack default: .../feed)",
    )
    p.add_argument("--limit", type=int, default=20, help="Max items (default 20)")
    p.add_argument("--json", action="store_true", help="Print JSON array to stdout")
    args = p.parse_args()

    try:
        raw = fetch_rss(args.url)
    except Exception as e:
        print(f"fetch failed: {e}", file=sys.stderr)
        return 1

    items = parse_items(raw, args.limit)
    if args.json:
        print(json.dumps(items, ensure_ascii=False, indent=2))
        return 0

    for i, it in enumerate(items, 1):
        print(f"{i}. {it['title']}")
        if it["link"]:
            print(f"   {it['link']}")
        if it["pubDate"]:
            print(f"   {it['pubDate']}")
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
