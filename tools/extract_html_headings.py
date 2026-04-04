#!/usr/bin/env python3
"""Extract h2/h3 headings from a site/*.html file as a Markdown outline draft.

Skips content inside <script>, <style>, and <noscript>. Intended for human
paste-and-polish when deepening site/md/<stem>.md (v2.5.1+).

Usage (from repo root):
  python3 tools/extract_html_headings.py site/s01.html
  python3 tools/extract_html_headings.py --stem s01
  python3 tools/extract_html_headings.py site/tutorial.html --flat
"""
from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SITE = REPO_ROOT / "site"


class HeadingExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.headings: list[tuple[int, str]] = []
        self._skip = 0
        self._in_heading: int | None = None
        self._buf: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self._skip > 0:
            return
        if tag in ("script", "style", "noscript"):
            self._skip += 1
            return
        if tag == "h2":
            self._end_heading()
            self._in_heading = 2
            self._buf = []
        elif tag == "h3":
            self._end_heading()
            self._in_heading = 3
            self._buf = []

    def handle_endtag(self, tag: str) -> None:
        if self._skip > 0:
            if tag in ("script", "style", "noscript"):
                self._skip -= 1
            return
        if tag in ("h2", "h3"):
            self._end_heading()

    def _end_heading(self) -> None:
        if self._in_heading is None:
            return
        text = "".join(self._buf).strip()
        text = re.sub(r"\s+", " ", text)
        if text:
            self.headings.append((self._in_heading, text))
        self._in_heading = None
        self._buf = []

    def handle_data(self, data: str) -> None:
        if self._skip > 0 or self._in_heading is None:
            return
        self._buf.append(data)


def normalize_path(arg: str) -> Path:
    p = Path(arg)
    if not p.is_absolute():
        p = (REPO_ROOT / p).resolve()
    return p


def outline_markdown(headings: list[tuple[int, str]], flat: bool) -> str:
    if flat:
        lines = []
        for level, text in headings:
            prefix = "##" if level == 2 else "###"
            lines.append(f"{prefix} {text}")
        return "\n".join(lines)

    lines = ["## 目录（对照 HTML，草稿）", ""]
    stack_depth = 0  # 0 = at h2 level, 1 = inside last h2 for h3
    for level, text in headings:
        if level == 2:
            lines.append(f"- {text}")
            stack_depth = 1
        else:
            indent = "  " if stack_depth else ""
            lines.append(f"{indent}- {text}")
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description="Extract h2/h3 from site HTML as Markdown outline.")
    ap.add_argument(
        "path",
        nargs="?",
        help="Path to HTML (e.g. site/s01.html) relative to cwd or absolute",
    )
    ap.add_argument(
        "--stem",
        metavar="STEM",
        help=f"Shorthand: read {SITE}/<stem>.html",
    )
    ap.add_argument(
        "--flat",
        action="store_true",
        help="Emit ## / ### lines instead of a bullet tree",
    )
    args = ap.parse_args()

    if bool(args.path) == bool(args.stem):
        ap.error("provide exactly one of: PATH or --stem STEM")

    if args.stem:
        html_path = SITE / f"{args.stem}.html"
    else:
        html_path = normalize_path(args.path)

    if not html_path.is_file():
        print(f"not a file: {html_path}", file=sys.stderr)
        return 1

    raw = html_path.read_text(encoding="utf-8", errors="replace")
    parser = HeadingExtractor()
    parser.feed(raw)
    parser._end_heading()

    print(outline_markdown(parser.headings, args.flat))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
