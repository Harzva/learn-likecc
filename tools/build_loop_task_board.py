#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
PROMPT_PATH = ROOT / ".codex-loop" / "prompt.md"
PLANS_DIR = ROOT / ".claude" / "plans" / "loloop"
OUTPUT_PATH = ROOT / "site" / "data" / "loop-task-board.json"
WORKSPACE_SHELL_CONFIG = ROOT / ".codex-loop" / "workspace-shell.json"


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
    "hot-topic-watch": {
        "topics": ["site/topic-hot-watch.html", "site/topic-agent-hot.html", "site/topic-rag-hot.html"],
        "evolution_patterns": ["hot-topic", "daily-watch"],
    },
    "likecode-workspace-app": {
        "topics": ["site/app-likecode-workspace.html", "site/topic-codex-loop-console.html", "site/topic-loop-task-board.html"],
        "evolution_patterns": ["likecode-workspace-app"],
    },
}

SEMANTIC_GROUPS = {
    "claude-changelog-watch": "发布跟踪 / 热点观察",
    "hot-topic-watch": "发布跟踪 / 热点观察",
    "site-map": "站点治理 / 导览结构",
    "reference-mining-topics": "专题挖掘 / 参考研究",
    "hermes-unpacked": "专题挖掘 / 参考研究",
    "vibepaper-hub": "专题挖掘 / 参考研究",
    "codex-loop-ai-terminal": "产品面板 / AI Terminal",
    "likecode-web-ui": "产品面板 / AI Terminal",
    "everything-agent-cli": "仓库产品化 / CLI 生态",
    "likecode-workspace-app": "产品面板 / AI Terminal",
}

PUBLISH_KEYWORDS = (
    "zhihu",
    "publish",
    "published",
    "发文",
    "发知乎",
    "发布",
    "推广",
)

ZHIHU_KEYWORDS = (
    "zhihu",
    "知乎",
    "zhuanlan.zhihu.com",
    "zhihu-publish",
    "wemedia/zhihu",
)


def slug_from_plan(path: str) -> str:
    return Path(path).stem.replace("active-", "").replace("-plan-v1", "")


def load_workspace_shell_config() -> dict:
    if not WORKSPACE_SHELL_CONFIG.exists():
        return {}
    try:
        return json.loads(WORKSPACE_SHELL_CONFIG.read_text(encoding="utf-8"))
    except Exception:
        return {}


def infer_github_remote() -> str:
    result = subprocess.run(
        ["git", "remote", "get-url", "origin"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    remote = result.stdout.strip()
    if not remote:
        return ""
    if remote.startswith("git@github.com:"):
        remote = "https://github.com/" + remote[len("git@github.com:") :]
    if remote.endswith(".git"):
        remote = remote[:-4]
    return remote


def infer_blob_base() -> str:
    remote = infer_github_remote()
    if remote.startswith("https://github.com/"):
        return remote + "/blob/main"
    return ""


def infer_pages_base(config: dict) -> str:
    explicit = (config.get("site_base_url") or "").rstrip("/")
    if explicit:
        return explicit
    remote = infer_github_remote()
    if not remote.startswith("https://github.com/"):
        return ""
    parsed = urlparse(remote)
    parts = parsed.path.strip("/").split("/")
    if len(parts) != 2:
        return ""
    owner, repo = parts
    return f"https://{owner.lower()}.github.io/{repo}"


def repo_blob_link(rel_path: str) -> str:
    base = infer_blob_base()
    return f"{base}/{rel_path}" if base else ""


def live_site_link(rel_path: str) -> str:
    config = load_workspace_shell_config()
    base = infer_pages_base(config)
    return f"{base}/{Path(rel_path).name}" if base else Path(rel_path).name


def git_date(path: Path) -> str:
    rel = path.relative_to(ROOT)
    cmd = ["git", "log", "-1", "--format=%cs", "--", str(rel)]
    result = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, check=False)
    return result.stdout.strip() or "unknown"


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


def summarize_markdown_body(text: str) -> str:
    lines = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("#"):
            continue
        if line.startswith("> **更新时间**"):
            continue
        if line.startswith("> **在线页面**"):
            continue
        if line.startswith("> **本文件**"):
            continue
        if line.startswith("> **说明**"):
            continue
        if line.startswith("> "):
            line = line[2:].strip()
        if line.startswith("- "):
            line = line[2:].strip()
        if line:
            lines.append(line)
        if len(lines) >= 2:
            break
    if not lines:
        return ""
    summary = re.sub(r"\s+", " ", " ".join(lines)).strip()
    return summary[:220]


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
        "updated_at": git_date(plan_path),
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
    text = latest.read_text(encoding="utf-8")
    return {
        "name": latest.name,
        "path": str(latest.relative_to(ROOT)),
        "href": repo_blob_link(str(latest.relative_to(ROOT))),
        "updated_at": git_date(latest),
        "summary": summarize_markdown_body(text),
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
                    "live_href": live_site_link(rel),
                    "blob_href": repo_blob_link(rel),
                }
            )
    return links


def semantic_group_for(slug: str) -> str:
    return SEMANTIC_GROUPS.get(slug, "其他循环任务")


def search_text_for(entry: dict, plan: dict, latest_evolution: dict | None) -> str:
    chunks = [
        entry.get("headline", ""),
        entry.get("prompt_excerpt", ""),
        entry.get("slug", ""),
        plan.get("title", ""),
        plan.get("goal", ""),
        " ".join(plan.get("current_focus", [])),
        " ".join(plan.get("scope", [])),
        " ".join(plan.get("validation", [])),
    ]
    if latest_evolution:
        chunks.append(latest_evolution.get("name", ""))
        chunks.append(latest_evolution.get("summary", ""))
    return re.sub(r"\s+", " ", " ".join(chunks)).strip()


def publish_flag_for(search_text: str, topic_links: list[dict[str, str]]) -> bool:
    lowered = search_text.lower()
    if any(keyword in lowered for keyword in PUBLISH_KEYWORDS):
        return True
    return any("zhihu" in (link.get("path") or "").lower() for link in topic_links)


def zhihu_flag_for(search_text: str) -> bool:
    return any(keyword.lower() in search_text.lower() for keyword in ZHIHU_KEYWORDS)


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
            latest_evolution = latest_evolution_for(slug)
            topic_links = topic_links_for(slug)
            search_text = search_text_for({**entry, "slug": slug}, plan, latest_evolution)
            recurring.append(
                {
                    **entry,
                    "type": "recurring",
                    "state": state,
                    "plan_path": rel_plan,
                    "slug": slug,
                    "plan_href": repo_blob_link(rel_plan),
                    "semantic_group": semantic_group_for(slug),
                    "latest_evolution": latest_evolution,
                    "topic_links": topic_links,
                    "has_topic": bool(topic_links),
                    "has_evolution": latest_evolution is not None,
                    "is_publish_ready": publish_flag_for(search_text, topic_links),
                    "is_zhihu_ready": zhihu_flag_for(search_text),
                    "search_text": search_text,
                    "plan": plan,
                }
            )
        else:
            search_text = re.sub(r"\s+", " ", " ".join([entry["headline"], entry["prompt_excerpt"]])).strip()
            inline.append(
                {
                    **entry,
                    "type": "inline",
                    "state": "queued",
                    "is_publish_ready": publish_flag_for(search_text, []),
                    "is_zhihu_ready": zhihu_flag_for(search_text),
                    "search_text": search_text,
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
            "semantic_groups": sorted({task["semantic_group"] for task in recurring}),
            "zhihu_ready_count": sum(1 for task in tasks if task.get("is_zhihu_ready")),
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
