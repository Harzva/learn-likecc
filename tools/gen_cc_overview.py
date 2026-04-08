#!/usr/bin/env python3
"""Generate architecture/tools/commands tables for topic-cc-unpacked-zh.html from JSON.

Data: site/data/cc-overview.json (deployed with site; single source for table rows).

Usage (repo root):
  python3 tools/gen_cc_overview.py                 # inject tables into HTML
  python3 tools/gen_cc_overview.py --dry-run       # print generated HTML to stdout only
  python3 tools/gen_cc_overview.py --check         # validate JSON only
  python3 tools/gen_cc_overview.py --verify-in-sync  # fail if HTML markers ≠ JSON render (CI)

Markers in topic-cc-unpacked-zh.html (do not remove):
  <!-- cc-overview:begin architecture-table --> ... <!-- cc-overview:end architecture-table -->
  <!-- cc-overview:begin tools-table --> ... <!-- cc-overview:end tools-table -->
  <!-- cc-overview:begin commands-table --> ... <!-- cc-overview:end commands-table -->
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = REPO_ROOT / "site" / "data" / "cc-overview.json"
HTML_PATH = REPO_ROOT / "site" / "topic-cc-unpacked-zh.html"

BLOCKS = (
    ("architecture-table", "architecture"),
    ("tools-table", "tools"),
    ("commands-table", "commands"),
)


def _col3(row: dict) -> str:
    if row.get("col3_html"):
        return row["col3_html"]
    links = row.get("col3_links") or []
    sep = row.get("col3_sep", "、")
    parts = []
    for L in links:
        h = html.escape(L["href"], quote=True)
        t = html.escape(L["text"])
        parts.append(f'<a href="{h}">{t}</a>')
    return sep.join(parts)


def render_table(thead: list[str], rows: list[dict]) -> str:
    th = "".join(f"<th>{html.escape(c)}</th>" for c in thead)
    body = []
    for r in rows:
        c1 = html.escape(r["col1"])
        c2 = r["col2_html"]
        c3 = _col3(r)
        body.append(f"<tr><td>{c1}</td><td>{c2}</td><td>{c3}</td></tr>")
    return (
        '<table class="options-table">\n'
        f"<tr>{th}</tr>\n"
        + "\n".join(body)
        + "\n</table>"
    )


def load_payload() -> dict:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    for key in ("architecture", "tools", "commands"):
        if key not in data:
            raise ValueError(f"missing key: {key}")
        block = data[key]
        if "thead" not in block or "rows" not in block:
            raise ValueError(f"{key}: need thead and rows")
    return data


def build_tables(data: dict) -> dict[str, str]:
    out = {}
    for marker_suffix, key in BLOCKS:
        block = data[key]
        out[marker_suffix] = render_table(block["thead"], block["rows"])
    return out


def extract_block(html_text: str, marker_name: str) -> str:
    begin = f"<!-- cc-overview:begin {marker_name} -->"
    end = f"<!-- cc-overview:end {marker_name} -->"
    try:
        i = html_text.index(begin) + len(begin)
        j = html_text.index(end, i)
    except ValueError as e:
        raise RuntimeError(f"missing markers for {marker_name!r}") from e
    return html_text[i:j].strip()


def norm_fragment(s: str) -> str:
    lines = [ln.strip() for ln in s.splitlines()]
    lines = [ln for ln in lines if ln]
    return "\n".join(lines)


def replace_block(html_text: str, marker_name: str, new_inner: str) -> str:
    begin = f"<!-- cc-overview:begin {marker_name} -->"
    end = f"<!-- cc-overview:end {marker_name} -->"
    pattern = re.compile(
        re.escape(begin) + r"\s*.*?\s*" + re.escape(end),
        re.DOTALL,
    )
    replacement = begin + "\n" + new_inner + "\n" + end
    new_text, n = pattern.subn(replacement, html_text, count=1)
    if n != 1:
        raise RuntimeError(f"expected 1 block for {marker_name!r}, replaced {n}")
    return new_text


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--dry-run", action="store_true", help="print tables only")
    ap.add_argument("--check", action="store_true", help="validate JSON schema")
    ap.add_argument(
        "--verify-in-sync",
        action="store_true",
        help="ensure topic-cc-unpacked-zh.html marker regions match JSON render",
    )
    args = ap.parse_args()

    if not JSON_PATH.is_file():
        print(f"missing {JSON_PATH}", file=sys.stderr)
        return 1

    try:
        data = load_payload()
    except (json.JSONDecodeError, ValueError) as e:
        print(f"JSON error: {e}", file=sys.stderr)
        return 1

    if args.check:
        print("cc-overview.json: OK")
        return 0

    tables = build_tables(data)
    meta = data.get("meta") or {}
    foot = ""
    if meta.get("updated"):
        foot = (
            f'<p class="section-desc cc-overview-footnote" style="margin-top:0.5rem;font-size:0.9rem;opacity:0.9">'
            f'表与命令 pill 墙数据来自 <code>site/data/cc-overview.json</code>（更新日期 {html.escape(meta["updated"])}）；'
            f'改表请运行 <code>python3 tools/gen_cc_overview.py</code>；'
            f'改 pill 清单直接编辑 JSON 内 <code>command_pills</code>。</p>'
        )

    if args.dry_run:
        for marker_suffix, _key in BLOCKS:
            print(f"--- {marker_suffix} ---")
            print(tables[marker_suffix])
        if foot:
            print("--- footnote (appended to commands-table in inject mode) ---")
            print(foot)
        return 0

    if args.verify_in_sync:
        if not HTML_PATH.is_file():
            print(f"missing {HTML_PATH}", file=sys.stderr)
            return 1
        html_text = HTML_PATH.read_text(encoding="utf-8")
        ok = True
        for marker_suffix, _key in BLOCKS:
            inner = tables[marker_suffix]
            if marker_suffix == "commands-table" and foot:
                inner = inner + "\n" + foot
            try:
                got = extract_block(html_text, marker_suffix)
            except RuntimeError as e:
                print(f"gen_cc_overview verify: {e}", file=sys.stderr)
                return 1
            if norm_fragment(got) != norm_fragment(inner):
                print(
                    f"gen_cc_overview verify: MISMATCH for {marker_suffix!r} — "
                    "run `python3 tools/gen_cc_overview.py` and commit HTML",
                    file=sys.stderr,
                )
                ok = False
        if not ok:
            return 1
        print("gen_cc_overview: HTML marker blocks in sync with cc-overview.json")
        return 0

    if not HTML_PATH.is_file():
        print(f"missing {HTML_PATH}", file=sys.stderr)
        return 1

    text = HTML_PATH.read_text(encoding="utf-8")
    for marker_suffix, _key in BLOCKS:
        inner = tables[marker_suffix]
        if marker_suffix == "commands-table" and foot:
            inner = inner + "\n" + foot
        text = replace_block(text, marker_suffix, inner)
    HTML_PATH.write_text(text, encoding="utf-8", newline="\n")
    print(f"updated {HTML_PATH.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
