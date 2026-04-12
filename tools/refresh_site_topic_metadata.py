#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
from collections import OrderedDict
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE_DIR = ROOT / "site"
MD_DIR = SITE_DIR / "md"
DATA_DIR = SITE_DIR / "data"


GROUPS = OrderedDict(
    [
        (
            "核心入口",
            [
                "topic-site-map",
                "topic-sourcemap",
                "topic-paoding-jieniu",
                "topic-ai-zahuopu",
                "topic-agent",
                "topic-rag",
                "topic-llm",
                "topic-skillmarket",
                "topic-toolchain",
                "topic-vibepaper",
            ],
        ),
        (
            "Claude Code / LikeCode 深挖",
            [
                "topic-cc-unpacked-zh",
                "topic-cc-buddy",
                "topic-cc-loop-lab",
                "topic-cc-release-watch",
                "topic-claude-codex-bridge",
                "topic-codex-loop-console",
                "topic-loop-task-board",
                "topic-memory-harness",
                "topic-openharness",
                "topic-openharness-course",
                "topic-source-derived",
                "topic-superpowers-autoresearch",
                "topic-websites",
            ],
        ),
        (
            "Agent / CLI / 杂货铺子专题",
            [
                "topic-agent-hot",
                "topic-agent-papers",
                "topic-agent-comparison",
                "topic-ai-agents",
                "topic-ai-api",
                "topic-ai-benchmarks",
                "topic-ai-cli-agent",
                "topic-ai-coding-tools",
                "topic-everything-agent-cli",
                "topic-meta-agent",
                "topic-personal-knowledge",
            ],
        ),
        (
            "RAG / VibePaper 子专题",
            [
                "topic-rag-hot",
                "topic-rag-papers",
                "topic-autoresearch-unpacked",
                "topic-deepscientist-unpacked",
                "topic-hermes-unpacked",
            ],
        ),
    ]
)


META_RE = re.compile(r'^\s*<meta name="page:updated" content="[^"]*">\s*$', re.MULTILINE)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
MD_UPDATED_RE = re.compile(r"^> \*\*更新时间\*\*: .*$", re.MULTILINE)


def git_date(path: Path) -> str:
    rel = path.relative_to(ROOT)
    cmd = ["git", "log", "-1", "--format=%cs", "--", str(rel)]
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, check=False)
    value = result.stdout.strip()
    if value:
        return value
    return date.today().isoformat()


def ensure_html_meta(path: Path, updated: str) -> None:
    text = path.read_text(encoding="utf-8")
    meta_line = f'    <meta name="page:updated" content="{updated}">'
    if META_RE.search(text):
        updated_text = META_RE.sub(meta_line, text, count=1)
    else:
        marker = re.search(r'^\s*<meta name="description".*$', text, re.MULTILINE)
        if marker:
            insert_at = marker.end()
            updated_text = text[:insert_at] + "\n" + meta_line + text[insert_at:]
        else:
            viewport = re.search(r'^\s*<meta name="viewport".*$', text, re.MULTILINE)
            if viewport:
                insert_at = viewport.end()
                updated_text = text[:insert_at] + "\n" + meta_line + text[insert_at:]
            else:
                updated_text = text
    if updated_text != text:
        path.write_text(updated_text, encoding="utf-8")


def ensure_md_updated(path: Path, updated: str) -> None:
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    line = f"> **更新时间**: {updated}"
    if MD_UPDATED_RE.search(text):
        updated_text = MD_UPDATED_RE.sub(line, text, count=1)
    else:
        lines = text.splitlines()
        insert_at = 1
        while insert_at < len(lines) and lines[insert_at].startswith("> "):
            insert_at += 1
        payload = lines[:insert_at] + ([line] if insert_at == 1 else ["", line]) + lines[insert_at:]
        updated_text = "\n".join(payload) + ("\n" if text.endswith("\n") else "")
    if updated_text != text:
        path.write_text(updated_text, encoding="utf-8")


def clean_title(raw: str) -> str:
    title = re.sub(r"\s+", " ", raw).strip()
    title = title.replace(" - Learn LikeCode", "")
    title = title.replace(" - Claude Code Course", "")
    title = title.replace(" - AI杂货铺", "")
    return title


def group_for(slug: str) -> str:
    for group, slugs in GROUPS.items():
        if slug in slugs:
            return group
    return "其他专题"


def build_index() -> list[dict[str, str]]:
    items = []
    for html_path in sorted(SITE_DIR.glob("topic-*.html")):
        slug = html_path.stem
        text = html_path.read_text(encoding="utf-8")
        title_match = TITLE_RE.search(text)
        title = clean_title(title_match.group(1) if title_match else slug)
        updated = git_date(html_path)
        ensure_html_meta(html_path, updated)
        md_path = MD_DIR / f"{slug}.md"
        ensure_md_updated(md_path, updated)
        items.append(
            {
                "slug": slug,
                "title": title,
                "updated": updated,
                "group": group_for(slug),
                "href": f"{slug}.html",
                "md_path": f"site/md/{slug}.md",
            }
        )
    return items


def write_json(items: list[dict[str, str]]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "meta": {
            "updated": date.today().isoformat(),
            "count": len(items),
            "source": "git history + site/topic-*.html",
        },
        "groups": [
            {
                "name": group,
                "items": [item for item in items if item["group"] == group],
            }
            for group in list(GROUPS.keys()) + ["其他专题"]
            if any(item["group"] == group for item in items)
        ],
    }
    target = DATA_DIR / "site-topic-index.json"
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    items = build_index()
    write_json(items)
    print(f"refreshed {len(items)} topic pages")


if __name__ == "__main__":
    main()
