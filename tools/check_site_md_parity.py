#!/usr/bin/env python3
"""Verify site/*.html has matching site/md/<stem>.md and a correct GitHub blob link.

Exit 0 if OK, 1 if any page is missing MD or has wrong/missing link.

Usage (from repo root):
  python3 tools/check_site_md_parity.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SITE = REPO_ROOT / "site"
MD_DIR = SITE / "md"
BLOB_PREFIX = "https://github.com/Harzva/learn-likecc/blob/main/site/md/"
# href may use encoded or raw path; stem must match filename
HREF_RE = re.compile(
    r"https://github\.com/Harzva/learn-likecc/blob/main/site/md/([a-z0-9][a-z0-9._-]*)\.md",
    re.IGNORECASE,
)


def main() -> int:
    errors: list[str] = []
    html_files = sorted(SITE.glob("*.html"))
    if not html_files:
        print("no site/*.html", file=sys.stderr)
        return 1

    for html_path in html_files:
        stem = html_path.stem
        md_path = MD_DIR / f"{stem}.md"
        if not md_path.is_file():
            errors.append(f"MISSING_MD\t{html_path.relative_to(REPO_ROOT)}\texpected {md_path.relative_to(REPO_ROOT)}")

        text = html_path.read_text(encoding="utf-8", errors="replace")
        matches = HREF_RE.findall(text)
        if not matches:
            errors.append(f"MISSING_LINK\t{html_path.relative_to(REPO_ROOT)}\tno blob URL for site/md/{stem}.md")
            continue
        wrong = [m for m in matches if m.lower() != stem.lower()]
        if wrong:
            errors.append(
                f"WRONG_STEM\t{html_path.relative_to(REPO_ROOT)}\texpected {stem}.md, found {wrong!r}"
            )

    # Orphan md (except README): md without html
    for md_path in sorted(MD_DIR.glob("*.md")):
        if md_path.name.lower() == "readme.md":
            continue
        stem = md_path.stem
        if not (SITE / f"{stem}.html").is_file():
            errors.append(f"ORPHAN_MD\t{md_path.relative_to(REPO_ROOT)}\tno site/{stem}.html")

    if errors:
        print("check_site_md_parity: FAILED", file=sys.stderr)
        for line in errors:
            print(line, file=sys.stderr)
        return 1

    print(f"check_site_md_parity: OK ({len(html_files)} html, md dir has README + stems)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
