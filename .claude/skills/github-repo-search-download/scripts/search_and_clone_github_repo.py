#!/usr/bin/env python3
"""Search GitHub repositories and optionally clone one into a target directory."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import urllib.parse
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Search GitHub repositories and clone the selected candidate."
    )
    parser.add_argument("query", help="Search keywords, e.g. 'autonomous research studio'")
    parser.add_argument(
        "--dest-root",
        required=True,
        help="Directory where the selected repository should be cloned.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=8,
        help="Maximum number of candidates to retrieve. Default: 8.",
    )
    parser.add_argument(
        "--pick",
        type=int,
        default=1,
        help="1-based ranked candidate index to clone. Default: 1.",
    )
    parser.add_argument(
        "--min-stars",
        type=int,
        default=0,
        help="Minimum star count filter. Default: 0.",
    )
    parser.add_argument(
        "--language",
        help="Optional language qualifier, e.g. python, typescript, rust.",
    )
    parser.add_argument(
        "--owner",
        help="Optional owner/org qualifier, e.g. anthropics.",
    )
    parser.add_argument(
        "--name",
        help="Override local destination folder name.",
    )
    parser.add_argument(
        "--branch",
        help="Optional branch to clone.",
    )
    parser.add_argument(
        "--list-only",
        action="store_true",
        help="Only print ranked candidates; do not clone.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace the destination directory if it already exists.",
    )
    parser.add_argument(
        "--full",
        action="store_true",
        help="Do a full clone instead of shallow clone.",
    )
    return parser.parse_args()


def build_search_query(args: argparse.Namespace) -> str:
    parts = [args.query.strip()]
    if args.language:
        parts.append(f"language:{args.language}")
    if args.owner:
        parts.append(f"user:{args.owner}")
    if args.min_stars > 0:
        parts.append(f"stars:>={args.min_stars}")
    return " ".join(part for part in parts if part)


def run_json(cmd: list[str]) -> dict:
    completed = subprocess.run(
        cmd,
        check=True,
        text=True,
        capture_output=True,
    )
    return json.loads(completed.stdout)


def search_repos(args: argparse.Namespace) -> list[dict]:
    query = build_search_query(args)
    encoded_query = urllib.parse.quote(query, safe="")
    payload = run_json(
        [
            "gh",
            "api",
            f"search/repositories?q={encoded_query}&sort=stars&order=desc&per_page={args.limit}",
        ]
    )
    items: list[dict] = []
    for item in payload.get("items", []):
        items.append(
            {
                "nameWithOwner": item["full_name"],
                "description": item.get("description"),
                "stargazerCount": item.get("stargazers_count", 0),
                "updatedAt": item.get("updated_at"),
                "url": item.get("html_url"),
                "defaultBranch": item.get("default_branch"),
            }
        )
    return items


def print_candidates(items: list[dict]) -> None:
    print("GitHub candidates")
    for idx, item in enumerate(items, start=1):
        branch = item.get("defaultBranch") or "unknown"
        desc = (item.get("description") or "").strip()
        print(f"{idx}. {item['nameWithOwner']}")
        print(f"   stars: {item.get('stargazerCount', 0)}")
        print(f"   updated: {item.get('updatedAt', 'unknown')}")
        print(f"   branch: {branch}")
        print(f"   url: {item.get('url', '')}")
        if desc:
            print(f"   desc: {desc}")


def clone_repo(item: dict, args: argparse.Namespace) -> Path:
    dest_root = Path(args.dest_root).expanduser().resolve()
    folder_name = args.name or item["nameWithOwner"].split("/")[-1]
    dest_dir = dest_root / folder_name

    if dest_dir.exists():
        if not args.force:
            raise FileExistsError(
                f"Destination already exists: {dest_dir}\nUse --force to replace it."
            )
        shutil.rmtree(dest_dir)

    dest_root.mkdir(parents=True, exist_ok=True)

    clone_cmd = ["git", "clone"]
    if not args.full:
        clone_cmd.extend(["--depth", "1"])
    if args.branch:
        clone_cmd.extend(["--branch", args.branch])
    clone_cmd.extend([item["url"] + ".git", str(dest_dir)])

    subprocess.run(clone_cmd, check=True)
    return dest_dir


def main() -> int:
    args = parse_args()
    try:
        candidates = search_repos(args)
    except Exception as exc:
        print(f"error: failed to search GitHub repos: {exc}", file=sys.stderr)
        return 1

    if not candidates:
        print("error: no GitHub repositories matched the query", file=sys.stderr)
        return 1

    print_candidates(candidates)

    pick_index = args.pick - 1
    if pick_index < 0 or pick_index >= len(candidates):
        print("error: --pick out of range", file=sys.stderr)
        return 1

    selected = candidates[pick_index]
    selected_branch = args.branch or selected.get("defaultBranch") or "default"

    print("\nSelected candidate")
    print(f"- repo: {selected['nameWithOwner']}")
    print(f"- url: {selected['url']}")
    print(f"- branch: {selected_branch}")
    print(f"- dest-root: {Path(args.dest_root).expanduser().resolve()}")
    print(f"- clone mode: {'full' if args.full else 'shallow'}")

    if args.list_only:
        print("- mode: list-only")
        return 0

    try:
        dest_dir = clone_repo(selected, args)
    except Exception as exc:
        print(f"error: failed to clone selected repository: {exc}", file=sys.stderr)
        return 1

    print("- mode: cloned")
    print(f"- destination: {dest_dir}")
    print("- result: success")
    return 0


if __name__ == "__main__":
    sys.exit(main())
