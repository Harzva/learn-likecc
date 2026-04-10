#!/usr/bin/env python3
"""Install a SKILL.md-based skill from a GitHub repository.

Examples:
  python3 tools/install_skill_from_github.py \
    --repo https://github.com/fanthus/agent-skills \
    --skill-path .claude/skills/github-repo-management \
    --target claude-user

  python3 tools/install_skill_from_github.py \
    --repo fanthus/agent-skills \
    --skill-path .claude/skills/github-repo-management \
    --target codex-user \
    --dry-run
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urlparse


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DEFAULT_PROJECT_ROOT = REPO_ROOT / ".claude" / "skills"
DEFAULT_CLAUDE_USER_ROOT = Path.home() / ".claude" / "skills"
DEFAULT_CODEX_USER_ROOT = Path.home() / ".codex" / "skills"

DISCOVERY_PATTERNS = (
    ".claude/skills/*/SKILL.md",
    ".codex/skills/*/SKILL.md",
    "skills/*/SKILL.md",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Install a skill directory from a GitHub repository."
    )
    parser.add_argument(
        "--repo",
        required=True,
        help="GitHub repository URL or owner/repo slug.",
    )
    parser.add_argument(
        "--skill-path",
        help=(
            "Path to the skill directory or SKILL.md within the repo. "
            "If omitted, auto-discovery is attempted."
        ),
    )
    parser.add_argument(
        "--name",
        help="Override local installed skill directory name.",
    )
    parser.add_argument(
        "--target",
        choices=("claude-user", "claude-project", "codex-user", "custom"),
        default="claude-user",
        help="Install target root. Default: claude-user.",
    )
    parser.add_argument(
        "--dest-root",
        help="Custom destination root directory. Required when --target custom.",
    )
    parser.add_argument(
        "--ref",
        default="HEAD",
        help="Git ref to clone. Default: HEAD.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would happen without writing files.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace an existing installed skill directory.",
    )
    return parser.parse_args()


def normalize_repo(repo_value: str) -> tuple[str, str]:
    repo_value = repo_value.strip()
    if repo_value.startswith(("http://", "https://")):
        parsed = urlparse(repo_value)
        parts = [part for part in parsed.path.strip("/").split("/") if part]
        if len(parts) < 2:
            raise ValueError(f"Could not parse owner/repo from URL: {repo_value}")
        owner, repo = parts[0], parts[1]
        if repo.endswith(".git"):
            repo = repo[:-4]
        return f"https://github.com/{owner}/{repo}.git", f"{owner}/{repo}"

    parts = [part for part in repo_value.split("/") if part]
    if len(parts) != 2:
        raise ValueError(
            "Repo must be a GitHub URL or owner/repo slug, "
            f"got: {repo_value}"
        )
    owner, repo = parts
    return f"https://github.com/{owner}/{repo}.git", f"{owner}/{repo}"


def resolve_dest_root(args: argparse.Namespace) -> Path:
    if args.target == "claude-user":
        return DEFAULT_CLAUDE_USER_ROOT
    if args.target == "claude-project":
        return DEFAULT_PROJECT_ROOT
    if args.target == "codex-user":
        return DEFAULT_CODEX_USER_ROOT
    if not args.dest_root:
        raise ValueError("--dest-root is required when --target custom")
    return Path(args.dest_root).expanduser().resolve()


def run(cmd: list[str], cwd: Path | None = None) -> None:
    subprocess.run(cmd, cwd=cwd, check=True)


def clone_repo(clone_url: str, ref: str, dest: Path) -> None:
    run(["git", "clone", "--depth", "1", clone_url, str(dest)])
    if ref != "HEAD":
        run(["git", "fetch", "--depth", "1", "origin", ref], cwd=dest)
        run(["git", "checkout", "FETCH_HEAD"], cwd=dest)


def find_skill_candidates(repo_dir: Path) -> list[Path]:
    matches: list[Path] = []
    for pattern in DISCOVERY_PATTERNS:
        matches.extend(repo_dir.glob(pattern))
    return sorted({path.resolve() for path in matches})


def resolve_skill_dir(repo_dir: Path, skill_path: str | None) -> Path:
    if skill_path:
        candidate = (repo_dir / skill_path).resolve()
        if candidate.name == "SKILL.md":
            candidate = candidate.parent
        skill_md = candidate / "SKILL.md"
        if not skill_md.is_file():
            raise FileNotFoundError(
                f"Resolved skill path does not contain SKILL.md: {candidate}"
            )
        return candidate

    candidates = find_skill_candidates(repo_dir)
    if not candidates:
        raise FileNotFoundError("No SKILL.md discovered in repository.")
    if len(candidates) > 1:
        rendered = "\n".join(
            f"- {path.relative_to(repo_dir)}" for path in candidates
        )
        raise ValueError(
            "Multiple skills discovered; pass --skill-path explicitly:\n" + rendered
        )
    return candidates[0].parent


def copy_skill(src_dir: Path, dest_dir: Path, force: bool) -> None:
    if dest_dir.exists():
        if not force:
            raise FileExistsError(
                f"Destination already exists: {dest_dir}\n"
                "Use --force to replace it."
            )
        shutil.rmtree(dest_dir)
    dest_dir.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(src_dir, dest_dir)


def main() -> int:
    args = parse_args()
    try:
        clone_url, repo_slug = normalize_repo(args.repo)
        dest_root = resolve_dest_root(args)
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    with tempfile.TemporaryDirectory(prefix="skillsmp-install-") as temp_dir:
        repo_dir = Path(temp_dir) / "repo"
        try:
            clone_repo(clone_url, args.ref, repo_dir)
            skill_dir = resolve_skill_dir(repo_dir, args.skill_path)
        except Exception as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1

        install_name = args.name or skill_dir.name
        dest_dir = dest_root / install_name

        print("Skill install plan")
        print(f"- repo: {repo_slug}")
        print(f"- ref: {args.ref}")
        print(f"- source: {skill_dir.relative_to(repo_dir)}")
        print(f"- target root: {dest_root}")
        print(f"- install dir: {dest_dir}")

        if args.dry_run:
            print("- mode: dry-run")
            return 0

        try:
            copy_skill(skill_dir, dest_dir, force=args.force)
        except Exception as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1

        print("- mode: installed")
        print("- result: success")
        return 0


if __name__ == "__main__":
    sys.exit(main())
