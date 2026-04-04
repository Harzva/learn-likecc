#!/usr/bin/env python3
"""Regenerate site/md/dNN.md from site/dNN.html: dual-version banner, TOC from h2, short blurbs."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
MD_DIR = SITE / "md"
BASE = "https://harzva.github.io/learn-likecc"
GH_MD = "https://github.com/Harzva/learn-likecc/blob/main/site/md"


def strip_tags(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def extract_article(html: str) -> str:
    m = re.search(r"<article[^>]*>([\s\S]*)</article>", html, re.I)
    return m.group(1) if m else html


def extract_title(html: str) -> str:
    m = re.search(r"<title>([^<]+)</title>", html, re.I)
    return strip_tags(m.group(1)) if m else "Course"


def sections_from_article(art: str) -> list[tuple[str, str]]:
    """Split by <h2...>...</h2>, return (heading, first_p_blurb)."""
    chunks = re.split(r'(?=<h2\b)', art)
    out: list[tuple[str, str]] = []
    for ch in chunks:
        hm = re.search(r"<h2[^>]*>([\s\S]*?)</h2>", ch, re.I)
        if not hm:
            continue
        h = strip_tags(hm.group(1))
        rest = ch[hm.end() :]
        pm = re.search(r"<p[^>]*>([\s\S]*?)</p>", rest, re.I)
        blurb = strip_tags(pm.group(1))[:320] + ("…" if pm and len(strip_tags(pm.group(1))) > 320 else "") if pm else "（详见网页版该节。）"
        out.append((h, blurb))
    return out


def build_md(stem: str, title: str, sections: list[tuple[str, str]]) -> str:
    lines = [
        f"# {title}",
        "",
        "> **双版本阅读**",
        f"> - **网页版（排版 / 主题 / Mermaid）**: [{BASE}/{stem}.html]({BASE}/{stem}.html) — 当前浏览器所见即此版。",
        f"> - **Markdown 版（PR / 离线 / diff）**: 本仓库 [`site/md/{stem}.md`]({GH_MD}/{stem}.md) — 在 GitHub 上打开或拉取后本地编辑。",
        "",
        "## 目录（对照 HTML）",
        "",
    ]
    for h, _ in sections:
        lines.append(f"- {h}")
    lines.append("")
    lines.append("## 各节摘要")
    lines.append("")
    for h, blurb in sections:
        lines.append(f"### {h}")
        lines.append("")
        lines.append(blurb if blurb else "（见在线页。）")
        lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*正文与图表以网页版为准；本 MD 为讲义索引与审阅用草稿。*")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    for n in range(1, 13):
        stem = f"d{n:02d}"
        html_path = SITE / f"{stem}.html"
        md_path = MD_DIR / f"{stem}.md"
        if not html_path.is_file():
            print(f"missing {html_path}", file=sys.stderr)
            return 1
        html = html_path.read_text(encoding="utf-8", errors="replace")
        art = extract_article(html)
        title = extract_title(html)
        sections = sections_from_article(art)
        if not sections:
            sections = [("（未解析到章节）", "请直接阅读网页版。")]
        md_path.write_text(build_md(stem, title, sections), encoding="utf-8")
        print("wrote", md_path.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
