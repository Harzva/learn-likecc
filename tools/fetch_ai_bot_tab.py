#!/usr/bin/env python3
"""Fetch and extract AI工具集 homepage sections, favorites pages, or AJAX-only sub-tabs.

Examples (from repo root):
  python3 tools/fetch_ai_bot_tab.py --tab-id 94
  python3 tools/fetch_ai_bot_tab.py --term-id 86
  python3 tools/fetch_ai_bot_tab.py --favorites-url https://ai-bot.cn/favorites/ai-agent/
  python3 tools/fetch_ai_bot_tab.py --term-id 13 --format md
  python3 tools/fetch_ai_bot_tab.py --tab-id 94 --output tmp/ai-bot-term-95-94.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

HOME_URL = "https://ai-bot.cn/"
AJAX_URL = "https://ai-bot.cn/wp-admin/admin-ajax.php"
USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36"
)


def fetch_url(url: str, *, data: bytes | None = None, ajax: bool = False) -> str:
    headers = {
        "User-Agent": USER_AGENT,
        "Referer": HOME_URL,
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
    if ajax:
        headers.update(
            {
                "Origin": "https://ai-bot.cn",
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            }
        )
    req = urllib.request.Request(url, data=data, headers=headers, method="POST" if data else "GET")
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def fetch_tab_html(tab_id: int) -> str:
    form = urllib.parse.urlencode(
        {
            "action": "load_home_tab",
            "taxonomy": "favorites",
            "id": str(tab_id),
        }
    ).encode("utf-8")
    return fetch_url(AJAX_URL, data=form, ajax=True)


def fetch_home_html() -> str:
    return fetch_url(HOME_URL)


def fetch_favorites_html(url: str) -> str:
    return fetch_url(url)


class CardParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.cards: list[dict[str, str]] = []
        self._current: dict[str, str] | None = None
        self._capture: str | None = None
        self._buf: list[str] = []

    def _maybe_start_card(self, attrs_dict: dict[str, str]) -> bool:
        classes = attrs_dict.get("class", "")
        if "card" not in classes.split():
            return False
        self._current = {
            "href": attrs_dict.get("href", ""),
            "title": attrs_dict.get("title", ""),
            "data_id": attrs_dict.get("data-id", ""),
            "target_url": attrs_dict.get("data-url", ""),
        }
        return True

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {k: v or "" for k, v in attrs}
        if tag == "a" and self._maybe_start_card(attrs_dict):
            return
        if self._current is None:
            return
        if tag == "img":
            self._current["icon_alt"] = attrs_dict.get("alt", "")
            self._current["icon_src"] = attrs_dict.get("data-src") or attrs_dict.get("src", "")
        elif tag == "strong":
            self._capture = "name"
            self._buf = []
        elif tag == "p":
            classes = attrs_dict.get("class", "")
            if "text-xs" in classes.split():
                self._capture = "description"
                self._buf = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buf.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self._capture and tag in {"strong", "p"}:
            text = " ".join("".join(self._buf).split())
            if self._current is not None and text:
                self._current[self._capture] = text
            self._capture = None
            self._buf = []
            return
        if tag == "a" and self._current is not None:
            if self._current.get("name") or self._current.get("title"):
                self.cards.append(self._current)
            self._current = None


def extract_section_html(home_html: str, term_id: int) -> tuple[str, str, str]:
    marker = f'id="term-{term_id}"'
    marker_idx = home_html.find(marker)
    if marker_idx < 0:
        raise SystemExit(f"term-{term_id} not found on homepage")

    start = home_html.rfind('<div class="d-flex flex-fill align-items-center mb-4">', 0, marker_idx)
    if start < 0:
        raise SystemExit(f"could not locate section start for term-{term_id}")

    next_match = re.search(r'id="term-\d+"', home_html[marker_idx + len(marker) :])
    if not next_match:
        end = len(home_html)
    else:
        next_idx = marker_idx + len(marker) + next_match.start()
        end = home_html.rfind('<div class="d-flex flex-fill align-items-center mb-4">', marker_idx, next_idx)
        if end < 0:
            end = next_idx

    section_html = home_html[start:end]

    title_match = re.search(r"</i>\s*([^<]+?)\s*</h4>", section_html, re.S)
    title = " ".join(title_match.group(1).split()) if title_match else ""

    url_match = re.search(r"<a class='btn-move[^']*' href='([^']+)'", section_html)
    section_url = url_match.group(1) if url_match else ""
    return section_html, title, section_url


def extract_favorites_section_html(page_html: str) -> tuple[str, str]:
    start_marker = '<div class="content-layout">'
    start = page_html.find(start_marker)
    if start < 0:
        raise SystemExit("could not locate favorites page content-layout")

    end_markers = [
        '<div class="nav-down mb-4">',
        '<nav class="post-nav',
        '<div id="footer"',
        '<footer',
    ]
    end_candidates = [page_html.find(marker, start) for marker in end_markers]
    end_candidates = [idx for idx in end_candidates if idx > start]
    end = min(end_candidates) if end_candidates else len(page_html)
    section_html = page_html[start:end]

    title_match = re.search(r'<h4 class="text-gray text-lg mb-4">\s*(?:<i[^>]*></i>)?\s*([^<]+?)\s*</h4>', section_html, re.S)
    title = " ".join(title_match.group(1).split()) if title_match else ""
    return section_html, title


def render_markdown(cards: list[dict[str, str]]) -> str:
    lines = ["| Name | Description | Href | Target URL |", "| --- | --- | --- | --- |"]
    for card in cards:
        name = card.get("name", "").replace("|", "\\|")
        desc = card.get("description", "").replace("|", "\\|")
        href = card.get("href", "").replace("|", "%7C")
        target = card.get("target_url", "").replace("|", "%7C")
        lines.append(f"| {name} | {desc} | {href} | {target} |")
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description="Fetch ai-bot.cn tabs, homepage sections, or favorites pages and extract tool cards.")
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--tab-id", type=int, help="AJAX tab id, e.g. 94 for 降AI/AIGC率")
    group.add_argument("--term-id", type=int, help="Homepage section term id, e.g. 86 for AI智能体")
    group.add_argument("--favorites-url", help="Favorites category page URL, e.g. https://ai-bot.cn/favorites/ai-agent/")
    ap.add_argument(
        "--format",
        choices=("json", "md"),
        default="json",
        help="Output format",
    )
    ap.add_argument("--output", help="Optional output file path")
    args = ap.parse_args()

    if args.tab_id is not None:
        html = fetch_tab_html(args.tab_id)
        parser: CardParser = CardParser()
        parser.feed(html)
        result: dict[str, object] | list[dict[str, str]] = parser.cards
    elif args.term_id is not None:
        html = fetch_home_html()
        section_html, title, section_url = extract_section_html(html, args.term_id)
        parser = CardParser()
        parser.feed(section_html)
        result = {
            "term_id": args.term_id,
            "section_title": title,
            "section_url": section_url,
            "count": len(parser.cards),
            "items": parser.cards,
        }
    else:
        html = fetch_favorites_html(args.favorites_url)
        section_html, title = extract_favorites_section_html(html)
        parser = CardParser()
        parser.feed(section_html)
        result = {
            "favorites_url": args.favorites_url,
            "section_title": title,
            "count": len(parser.cards),
            "items": parser.cards,
        }

    if args.format == "md":
        cards = result if isinstance(result, list) else result["items"]
        payload = render_markdown(cards)  # type: ignore[arg-type]
    else:
        payload = json.dumps(result, ensure_ascii=False, indent=2)

    if args.output:
        output_path = Path(args.output)
        if not output_path.is_absolute():
            output_path = (Path.cwd() / output_path).resolve()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(payload + ("\n" if not payload.endswith("\n") else ""), encoding="utf-8")
    else:
        sys.stdout.write(payload)
        if not payload.endswith("\n"):
            sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
