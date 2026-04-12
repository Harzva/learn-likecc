#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROMPT_PATH = ROOT / ".codex-loop" / "prompt.md"
PLANS_DIR = ROOT / ".claude" / "plans" / "loloop"
OUTPUT_PATH = ROOT / "site" / "data" / "loop-task-board.json"


TASK_BLOCK_RE = re.compile(r"^Task (\d+):\n(.*?)(?=^Task \d+:|\Z)", re.MULTILINE | re.DOTALL)
CHECKBOX_RE = re.compile(r"^- \[( |x)\] (.+)$", re.MULTILINE)


def slug_from_plan(path: str) -> str:
    return Path(path).stem.replace("active-", "").replace("-plan-v1", "")


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
            plan = parse_plan(plan_path)
            state = infer_state_label(plan["status"])
            recurring.append(
                {
                    **entry,
                    "type": "recurring",
                    "state": state,
                    "plan_path": rel_plan,
                    "slug": slug_from_plan(rel_plan),
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
