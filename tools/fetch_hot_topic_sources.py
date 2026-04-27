#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "site" / "data" / "hot-topic-sources.json"
DEFAULT_OUTPUT = ROOT / "site" / "data" / "hot-topic-snapshot.json"
UA = "learn-likecc-hot-topic-fetch/1.0 (+https://github.com/Harzva/learn-likecc)"


class LinkCollector(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[dict[str, str]] = []
        self._current_href: str | None = None
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        href = dict(attrs).get("href")
        self._current_href = href or ""
        self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._current_href is None:
            return
        self._buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() != "a" or self._current_href is None:
            return
        text = re.sub(r"\s+", " ", "".join(self._buffer)).strip()
        if text:
            self.links.append({"href": self._current_href, "text": text})
        self._current_href = None
        self._buffer = []


def fetch_text(url: str, timeout: float = 60.0) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
    return raw.decode("utf-8", errors="replace")


def parse_rss(xml_text: str, source: dict, limit: int) -> dict:
    root = ET.fromstring(xml_text)
    channel = root.find("channel")
    items: list[dict[str, str]] = []
    if channel is not None:
        for item in channel.findall("item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub = (item.findtext("pubDate") or "").strip()
            desc = re.sub(r"\s+", " ", (item.findtext("description") or "").strip())[:240]
            if title or link:
                items.append(
                    {
                        "title": title,
                        "link": link,
                        "date": pub,
                        "note": desc,
                    }
                )
            if len(items) >= limit:
                break
    return {
        "source_id": source["id"],
        "label": source["label"],
        "kind": source["kind"],
        "source_url": source["url"],
        "route_hints": source.get("route_hints", []),
        "notes": source.get("notes", ""),
        "items": items,
    }


def parse_aibase_daily(html_text: str, source: dict, limit: int) -> dict:
    collector = LinkCollector()
    collector.feed(html_text)
    links = collector.links

    issue = None
    issue_index = -1
    for idx, item in enumerate(links):
        text = item["text"]
        if "AI 日报" in text and "查看日报" in text:
            issue = item
            issue_index = idx
            break

    items: list[dict[str, str]] = []
    if issue_index >= 0:
        for item in links[issue_index + 1 :]:
            text = item["text"]
            if text.startswith("往期日报"):
                break
            if "AI 日报" in text and "查看日报" in text:
                break
            if re.match(r"^\d+\s*[、.]", text):
                items.append(
                    {
                        "title": re.sub(r"^\d+\s*[、.]\s*", "", text),
                        "link": urljoin(source["url"], item["href"]),
                        "date": issue["text"].split("AI 日报", 1)[0].strip(),
                        "note": "来自 AIbase 日报聚合页，适合做热点 intake 与后续路由。",
                    }
                )
            if len(items) >= limit:
                break

    issue_link = urljoin(source["url"], issue["href"]) if issue else source["url"]
    issue_title = issue["text"] if issue else ""
    return {
        "source_id": source["id"],
        "label": source["label"],
        "kind": source["kind"],
        "source_url": source["url"],
        "current_issue": {
            "title": issue_title,
            "link": issue_link,
        },
        "route_hints": source.get("route_hints", []),
        "notes": source.get("notes", ""),
        "items": items,
    }


def parse_source(source: dict, limit: int) -> dict:
    kind = source.get("kind", "").strip()
    text = fetch_text(source["url"])
    if kind == "rss":
        return parse_rss(text, source, limit)
    if kind == "aibase-daily":
        return parse_aibase_daily(text, source, limit)
    raise ValueError(f"unsupported source kind: {kind}")


def load_sources(path: Path) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload.get("sources", [])


def build_snapshot(config_path: Path, limit: int) -> dict:
    sources = load_sources(config_path)
    parsed = []
    for source in sources:
        try:
            parsed.append(parse_source(source, limit))
        except Exception as exc:  # noqa: BLE001
            parsed.append(
                {
                    "source_id": source["id"],
                    "label": source["label"],
                    "kind": source.get("kind", ""),
                    "source_url": source["url"],
                    "route_hints": source.get("route_hints", []),
                    "notes": source.get("notes", ""),
                    "error": str(exc),
                    "items": [],
                }
            )
    return {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source_count": len(parsed),
            "config": str(config_path.relative_to(ROOT)),
        },
        "sources": parsed,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch configured hot-topic sources into a local snapshot.")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG), help="Path to source registry JSON")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Output JSON path")
    parser.add_argument("--limit", type=int, default=8, help="Max items per source")
    parser.add_argument("--json", action="store_true", help="Print JSON payload to stdout")
    parser.add_argument("--write", action="store_true", help="Write the snapshot to --output")
    args = parser.parse_args()

    config_path = Path(args.config)
    output_path = Path(args.output)

    try:
        payload = build_snapshot(config_path, args.limit)
    except Exception as exc:  # noqa: BLE001
        print(f"fetch_hot_topic_sources failed: {exc}", file=sys.stderr)
        return 1

    if args.write:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    if args.json or not args.write:
        print(json.dumps(payload, ensure_ascii=False, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
