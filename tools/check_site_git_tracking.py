#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
SITE_MD = SITE / "md"


def tracked(path: Path) -> bool:
    result = subprocess.run(
        ["git", "ls-files", "--error-unmatch", str(path.relative_to(ROOT))],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return result.returncode == 0


def main() -> int:
    candidates = []
    candidates.extend(sorted(SITE.glob("topic-*.html")))
    candidates.extend(sorted(SITE_MD.glob("topic-*.md")))

    missing = [path for path in candidates if not tracked(path)]
    if not missing:
        print("check_site_git_tracking: OK")
        return 0

    print("check_site_git_tracking: found site pages that exist locally but are not tracked by git:")
    for path in missing:
        print(f"- {path.relative_to(ROOT)}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
