#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROMPT_PATH = ROOT / ".codex-loop" / "prompt.md"
PLANS_DIR = ROOT / ".claude" / "plans" / "loloop"
OUTPUT_PATH = ROOT / "site" / "data" / "loop-task-board.json"
GITHUB_BLOB_BASE = "https://github.com/Harzva/learn-likecc/blob/main"


TASK_BLOCK_RE = re.compile(r"^Task (\d+):\n(.*?)(?=^Task \d+:|\Z)", re.MULTILINE | re.DOTALL)
CHECKBOX_RE = re.compile(r"^- \[( |x)\] (.+)$", re.MULTILINE)

TASK_LINK_HINTS = {
    "claude-changelog-watch": {
        "topics": ["site/topic-cc-release-watch.html"],
        "evolution_patterns": ["cc-release-watch"],
    },
    "hermes-unpacked": {
        "topics": ["site/topic-hermes-unpacked.html", "site/topic-paoding-jieniu.html"],
        "evolution_patterns": ["site-hermes"],
    },
    "vibepaper-hub": {
        "topics": ["site/topic-vibepaper.html"],
        "evolution_patterns": ["site-vibepaper"],
    },
    "codex-loop-ai-terminal": {
        "topics": ["site/topic-codex-loop-console.html"],
        "evolution_patterns": ["site-codex-loop-terminal", "site-console"],
    },
    "reference-mining-topics": {
        "topics": ["site/topic-agent-comparison.html", "site/topic-ai-cli-agent.html", "site/topic-skillmarket.html"],
        "evolution_patterns": ["site-agent-comparison", "site-skillmarket", "site-console", "site-agent-hot", "site-ai-cli-agent"],
    },
    "likecode-web-ui": {
        "topics": ["site/topic-codex-loop-console.html", "site/topic-ai-coding-tools.html", "site/topic-ai-agents.html"],
        "evolution_patterns": ["site-likecode", "tool-logo"],
    },
    "everything-agent-cli": {
        "topics": ["site/topic-everything-agent-cli.html", "site/topic-ai-cli-agent.html"],
        "evolution_patterns": ["everything-agent-cli", "cli-agent"],
    },
    "site-map": {
        "topics": ["site/topic-site-map.html"],
        "evolution_patterns": ["site-map", "topic-index"],
    },
}


def slug_from_plan(path: str) -> str:
    return Path(path).stem.replace("active-", "").replace("-plan-v1", "")


def repo_blob_link(rel_path: str) -> str:
    return f"{GITHUB_BLOB_BASE}/{rel_path}"


def extract_section(text: str, heading: str) -> list[str]:
    pattern = re.compile(rf"^## {re.escape(heading)}\n(.*?)(?=^## |\Z)", re.MULTILINE | re.DOTALL)
    match = pattern.search(text)
    if not match:
        return []
    lines = [line.rstrip() for line in match.group(1).strip().splitlines()]
    return lines


def clean_lines(lines: list[str]) -> list[str]:
    return [line.strip() for line in lines if line.strip()]


def summarize_first_sentence(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return ""
    first = lines[0]
    return first


def parse_plan(plan_path: Path) -> dict:
    text = plan_path.read_text(encoding="utf-8")
    title = text.splitlines()[0].lstrip("# ").strip()
    status_match = re.search(r"^Status:\s*(.+)$", text, re.MULTILINE)
    scope_match = re.search(r"^Scope:\s*(.+)$", text, re.MULTILINE)
    status = status_match.group(1).strip() if status_match else "unknown"
    goal = scope_match.group(1).strip() if scope_match else ""

    current_focus_lines = clean_lines(extract_section(text, "Current focus"))
    if not current_focus_lines:
        current_focus_lines = clean_lines(extract_section(text, "Goal"))

    scope_lines = clean_lines(extract_section(text, "Scope"))
    if not scope_lines:
        for alt in [
            "Main product areas",
            "Current sample set",
            "Likely article directions",
            "Expected outputs",
            "Keyword workflow",
            "Growth workflow",
        ]:
            scope_lines = clean_lines(extract_section(text, alt))
            if scope_lines:
                break
    validation_lines = clean_lines(extract_section(text, "Validation"))
    notes_lines = clean_lines(extract_section(text, "Notes"))

    checks = CHECKBOX_RE.findall(text)
    completed = sum(1 for state, _ in checks if state == "x")
    total = len(checks)
    progress = round((completed / total) * 100) if total else None

    return {
        "title": title,
        "status": status,
        "goal": goal,
        "current_focus": current_focus_lines[:6],
        "scope": scope_lines[:8],
        "validation": validation_lines[:6],
        "notes": notes_lines[:4],
        "completed_count": completed,
        "total_count": total,
        "progress": progress,
    }


def infer_state_label(status: str) -> str:
    lowered = status.lower()
    if "done" in lowered:
        return "done"
    if "deferred" in lowered:
        return "deferred"
    if "block" in lowered:
        return "blocked"
    if "active" in lowered:
        return "active"
    return "queued"


def latest_evolution_for(slug: str) -> dict | None:
    hints = TASK_LINK_HINTS.get(slug, {})
    patterns = hints.get("evolution_patterns", [])
    matches = []
    for path in PLANS_DIR.glob("evolution-*.md"):
        name = path.name
        if any(pattern in name for pattern in patterns):
            matches.append(path)
    if not matches:
        return None
    latest = sorted(matches)[-1]
    return {
        "name": latest.name,
        "path": str(latest.relative_to(ROOT)),
        "href": repo_blob_link(str(latest.relative_to(ROOT))),
    }


def topic_links_for(slug: str) -> list[dict[str, str]]:
    hints = TASK_LINK_HINTS.get(slug, {})
    links = []
    for rel in hints.get("topics", []):
        path = ROOT / rel
        if path.exists():
            links.append(
                {
                    "label": path.stem,
                    "path": rel,
                    "href": path.name,
                }
            )
    return links


def build_payload() -> dict:
    prompt_text = PROMPT_PATH.read_text(encoding="utf-8")
    tasks = []
    recurring = []
    inline = []

    for task_id, body in TASK_BLOCK_RE.findall(prompt_text):
        body = body.strip()
        headline = summarize_first_sentence(body)
        plan_match = re.search(r"- `(.claude/plans/loloop/active-[^`]+\.md)`", body)
        entry = {
            "id": int(task_id),
            "headline": headline,
            "prompt_excerpt": "\n".join(clean_lines(body.splitlines())[:8]),
        }

        if plan_match:
            rel_plan = plan_match.group(1)
            plan_path = ROOT / rel_plan
            slug = slug_from_plan(rel_plan)
            plan = parse_plan(plan_path)
            state = infer_state_label(plan["status"])
            recurring.append(
                {
                    **entry,
                    "type": "recurring",
                    "state": state,
                    "plan_path": rel_plan,
                    "slug": slug,
                    "plan_href": repo_blob_link(rel_plan),
                    "latest_evolution": latest_evolution_for(slug),
                    "topic_links": topic_links_for(slug),
                    "plan": plan,
                }
            )
        else:
            inline.append(
                {
                    **entry,
                    "type": "inline",
                    "state": "queued",
                }
            )

    tasks.extend(recurring)
    tasks.extend(inline)

    state_counts = {}
    for task in recurring:
        state_counts[task["state"]] = state_counts.get(task["state"], 0) + 1

    return {
        "meta": {
            "updated_from": str(PROMPT_PATH.relative_to(ROOT)),
            "task_count": len(tasks),
            "recurring_count": len(recurring),
            "inline_count": len(inline),
            "state_counts": state_counts,
        },
        "recurring": recurring,
        "inline": inline,
    }


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = build_payload()
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"built loop task board with {payload['meta']['task_count']} tasks")


if __name__ == "__main__":
    main()
