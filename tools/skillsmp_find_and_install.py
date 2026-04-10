#!/usr/bin/env python3
"""Search SkillsMP and auto-install the best matching skill from GitHub."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
import tempfile
import urllib.parse
from dataclasses import dataclass
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
INSTALLER = SCRIPT_DIR / "install_skill_from_github.py"
SEARCH_BASE = "https://r.jina.ai/http://skillsmp.com/search?q="


ENTRY_PATTERN = re.compile(
    r"^\[(?P<skill>[^\]]+?)\s+.*?\)from\s+\"(?P<repo>[^\"]+)\"\s+"
    r"(?P<desc>.*?)\s+\d{4}-\d{2}-\d{2}\]\((?P<url>https?://skillsmp\.com/skills/[^\)]+)\)$"
)


@dataclass
class Candidate:
    skill_label: str
    repo: str
    description: str
    skillsmp_url: str
    score: int = 0

    @property
    def skill_name(self) -> str:
        return self.skill_label.removesuffix(".md")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Search SkillsMP and install the best matching skill."
    )
    parser.add_argument("query", help="Search query, e.g. 'github repo management'")
    parser.add_argument(
        "--target",
        choices=("claude-user", "claude-project", "codex-user", "custom"),
        default="claude-user",
        help="Install target root. Default: claude-user.",
    )
    parser.add_argument("--dest-root", help="Custom destination root for --target custom.")
    parser.add_argument(
        "--limit", type=int, default=8, help="Max parsed candidates. Default: 8."
    )
    parser.add_argument(
        "--list-only",
        action="store_true",
        help="List candidates and recommendation without installing.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Resolve candidate and pass --dry-run to installer.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Pass --force to installer.",
    )
    parser.add_argument(
        "--pick",
        type=int,
        help="1-based candidate index to install instead of the default top candidate.",
    )
    parser.add_argument(
        "--name",
        help="Override installed local skill name.",
    )
    return parser.parse_args()


def fetch_search_markdown(query: str) -> str:
    url = SEARCH_BASE + urllib.parse.quote(query)
    completed = subprocess.run(
        [
            "curl",
            "-L",
            "--silent",
            "--show-error",
            "--max-time",
            "30",
            url,
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return completed.stdout


def parse_candidates(markdown: str, limit: int) -> list[Candidate]:
    candidates: list[Candidate] = []
    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        match = ENTRY_PATTERN.match(line)
        if not match:
            continue
        candidates.append(
            Candidate(
                skill_label=match.group("skill").strip(),
                repo=match.group("repo").strip(),
                description=match.group("desc").strip(),
                skillsmp_url=match.group("url").strip(),
            )
        )
        if len(candidates) >= limit:
            break
    return candidates


def normalize_token(token: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", token.lower())


def score_candidate(candidate: Candidate, query: str) -> int:
    query_tokens = [normalize_token(token) for token in query.split()]
    query_tokens = [token for token in query_tokens if token]
    haystacks = [
        normalize_token(candidate.skill_name),
        normalize_token(candidate.description),
        normalize_token(candidate.repo),
    ]
    score = 0
    for token in query_tokens:
        if token and any(token in hay for hay in haystacks):
            score += 3
    skill_joined = normalize_token(candidate.skill_name)
    desc_joined = normalize_token(candidate.description)
    if normalize_token(query) in skill_joined:
        score += 5
    if normalize_token(query) in desc_joined:
        score += 2
    # Prefer shorter, more task-specific names when scores tie.
    score -= max(0, len(candidate.skill_name) // 20)
    return score


def rank_candidates(candidates: list[Candidate], query: str) -> list[Candidate]:
    for candidate in candidates:
        candidate.score = score_candidate(candidate, query)
    return sorted(candidates, key=lambda item: item.score, reverse=True)


def find_skill_path(repo: str, preferred_name: str) -> str:
    with tempfile.TemporaryDirectory(prefix="skillsmp-probe-") as temp_dir:
        repo_dir = Path(temp_dir) / "repo"
        subprocess.run(
            ["git", "clone", "--depth", "1", f"https://github.com/{repo}.git", str(repo_dir)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        skill_files = sorted(repo_dir.glob("**/SKILL.md"))
        if not skill_files:
            raise RuntimeError(f"No SKILL.md found in repo {repo}")
        target_name = normalize_token(preferred_name)
        direct_matches: list[Path] = []
        weak_matches: list[Path] = []
        for skill_file in skill_files:
            rel_parent = skill_file.parent.relative_to(repo_dir)
            folder_token = normalize_token(skill_file.parent.name)
            rel_token = normalize_token(str(rel_parent))
            if folder_token == target_name or rel_token.endswith(target_name):
                direct_matches.append(rel_parent)
            elif target_name and (target_name in folder_token or target_name in rel_token):
                weak_matches.append(rel_parent)
        if len(direct_matches) == 1:
            return str(direct_matches[0])
        if len(direct_matches) > 1:
            raise RuntimeError(
                f"Ambiguous direct matches in repo {repo}: "
                + ", ".join(str(path) for path in direct_matches)
            )
        if len(skill_files) == 1:
            return str(skill_files[0].parent.relative_to(repo_dir))
        if len(weak_matches) == 1:
            return str(weak_matches[0])
        raise RuntimeError(
            f"Could not infer skill path for {preferred_name} in repo {repo}; "
            "please inspect repo manually."
        )


def build_install_command(
    candidate: Candidate,
    skill_path: str,
    args: argparse.Namespace,
) -> list[str]:
    cmd = [
        sys.executable,
        str(INSTALLER),
        "--repo",
        candidate.repo,
        "--skill-path",
        skill_path,
        "--target",
        args.target,
    ]
    if args.dest_root:
        cmd.extend(["--dest-root", args.dest_root])
    if args.name:
        cmd.extend(["--name", args.name])
    if args.dry_run or args.list_only:
        cmd.append("--dry-run")
    if args.force:
        cmd.append("--force")
    return cmd


def main() -> int:
    args = parse_args()
    try:
        markdown = fetch_search_markdown(args.query)
        candidates = parse_candidates(markdown, args.limit)
    except Exception as exc:
        print(f"error: failed to search SkillsMP: {exc}", file=sys.stderr)
        return 1

    if not candidates:
        print("error: no SkillsMP candidates parsed from search results", file=sys.stderr)
        return 1

    ranked = rank_candidates(candidates, args.query)
    print("SkillsMP candidates")
    for index, candidate in enumerate(ranked, start=1):
        print(f"{index}. {candidate.skill_name} [{candidate.score}]")
        print(f"   repo: {candidate.repo}")
        print(f"   page: {candidate.skillsmp_url}")
        print(f"   desc: {candidate.description}")

    pick_index = args.pick - 1 if args.pick else 0
    if pick_index < 0 or pick_index >= len(ranked):
        print("error: --pick out of range", file=sys.stderr)
        return 1
    selected = ranked[pick_index]

    try:
        skill_path = find_skill_path(selected.repo, selected.skill_name)
    except Exception as exc:
        print(f"error: candidate selected but verification failed: {exc}", file=sys.stderr)
        return 1

    print("\nSelected candidate")
    print(f"- skill: {selected.skill_name}")
    print(f"- repo: {selected.repo}")
    print(f"- inferred skill path: {skill_path}")
    print(f"- source: {selected.skillsmp_url}")

    if args.list_only:
        return 0

    cmd = build_install_command(selected, skill_path, args)
    print("\nInstaller command")
    print("- " + " ".join(sh_quote(part) for part in cmd))
    completed = subprocess.run(cmd, check=False)
    return completed.returncode


def sh_quote(value: str) -> str:
    if re.fullmatch(r"[A-Za-z0-9_./:=+-]+", value):
        return value
    return "'" + value.replace("'", "'\"'\"'") + "'"


if __name__ == "__main__":
    sys.exit(main())
