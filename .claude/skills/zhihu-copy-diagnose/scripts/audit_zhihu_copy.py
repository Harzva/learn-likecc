#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


AI_PATTERNS = [
    ("contrast_not_but", re.compile(r"不是[^。！？\n]{0,40}而是")),
    ("contrast_not_only_but", re.compile(r"不只是[^。！？\n]{0,40}而是")),
    ("true_importance_not_but", re.compile(r"真正重要的不是[^。！？\n]{0,40}而是")),
    ("looks_like_but", re.compile(r"它看起来像[^。！？\n]{0,40}(但|，但)")),
]

HYPE_PATTERNS = [
    ("too_strong_claim", re.compile(r"(最强|封神|炸裂|颠覆|碾压|秒杀|神级|无敌)")),
    ("promo_push", re.compile(r"(一定要看|强烈推荐|闭眼入|直接冲|必须收藏)")),
]

DRAG_PATTERNS = [
    ("over_explain", re.compile(r"(也就是说|换句话说|其实|本质上|真正的意思是)")),
]

EVIDENCE_PATTERNS = [
    re.compile(r"https?://"),
    re.compile(r"`[^`]+`"),
    re.compile(r"\[[^\]]+\]\([^)]+\)"),
]

MAX_EXAMPLES_PER_TYPE = 5


def count_matches(text: str, patterns: list[tuple[str, re.Pattern[str]]]) -> dict[str, int]:
    result: dict[str, int] = {}
    for name, pattern in patterns:
        result[name] = len(pattern.findall(text))
    return result


def evidence_count(text: str) -> int:
    return sum(len(p.findall(text)) for p in EVIDENCE_PATTERNS)


def split_sentences(text: str) -> list[str]:
    chunks = re.split(r"(?<=[。！？!?])\s+|\n+", text)
    return [chunk.strip() for chunk in chunks if chunk.strip()]


def collect_examples(text: str, patterns: list[tuple[str, re.Pattern[str]]]) -> dict[str, list[str]]:
    examples: dict[str, list[str]] = {name: [] for name, _ in patterns}
    for sentence in split_sentences(text):
        for name, pattern in patterns:
            if len(examples[name]) >= MAX_EXAMPLES_PER_TYPE:
                continue
            if pattern.search(sentence):
                examples[name].append(sentence)
    return {k: v for k, v in examples.items() if v}


def rewrite_hint(kind: str) -> str:
    hints = {
        "contrast_not_but": "把“不是……而是……”拆成两句，先直接下判断，再补原因。",
        "contrast_not_only_but": "去掉“ 不只是……而是…… ”的模板对照，改成更自然的直接描述。",
        "true_importance_not_but": "别用“真正重要的不是……而是……”，直接写出你认为最重要的点。",
        "looks_like_but": "少用“看起来像……但……”，改成更明确的分类或判断句。",
        "too_strong_claim": "把夸张词换成可验证、可落地的技术判断。",
        "promo_push": "去掉推销口吻，改成技术作者式推荐。",
        "over_explain": "删掉一层解释，优先保留最直接的信息。",
    }
    return hints.get(kind, "把这句改得更直接、更像技术作者，而不是模板化总结。")


def clean_fragment(text: str) -> str:
    return text.strip().strip("：: ，,。；;")


def extract_contrast_parts(sentence: str) -> tuple[str, str, str] | None:
    patterns = [
        re.compile(
            r"^(?P<prefix>.*?)(?:不是|不只是|真正重要的不是)(?P<left>[^，。；：:\n]{1,40})[，, ]*而是(?P<right>[^。！？\n]+)"
        ),
        re.compile(
            r"^(?P<prefix>.*?)(?:不是|不只是|真正重要的不是)(?P<left>[^，。；：:\n]{1,40})而是(?P<right>[^。！？\n]+)"
        ),
    ]
    for pattern in patterns:
        match = pattern.search(sentence)
        if match:
            prefix = clean_fragment(match.group("prefix"))
            left = clean_fragment(match.group("left"))
            right = clean_fragment(match.group("right"))
            if left and right:
                return prefix, left, right
    return None


def suggested_rewrite(kind: str, sentence: str) -> str:
    stripped = sentence.strip()
    if kind in {"contrast_not_but", "contrast_not_only_but", "true_importance_not_but"}:
        parts = extract_contrast_parts(stripped)
        if parts:
            prefix, left, right = parts
            if "也不是" in stripped:
                if prefix:
                    return f"{prefix}更值得讲的是{right}。前面的并列项可以后面再展开。"
                return f"更值得讲的是{right}。前面的并列项可以后面再展开。"
            if right.startswith(("一个", "一套", "一页", "一层", "一种")):
                if prefix:
                    return f"{prefix}就是{right}。{left}不是这里的重点。"
                return f"它就是{right}。{left}不是这里的重点。"
            if "怎么" in right or "为何" in right:
                if prefix.endswith("解决的"):
                    return f"{prefix[:-3]}更关心{right}。{left}可以放到后面再讨论。"
                if prefix:
                    return f"{prefix}更关心{right}。{left}可以放到后面再讨论。"
                return f"这里更关心{right}。{left}可以放到后面再讨论。"
            if prefix.endswith("价值") or "价值" in prefix:
                return f"{prefix}在于{right}。{left}不是这里的重点。"
            if "最值得讲" in prefix or "最有传播价值" in prefix:
                return f"{prefix}是{right}。{left}可以后面再展开。"
            if prefix:
                return f"{prefix}在于{right}。{left}不是这一段的重点。"
            return f"重点在于{right}。{left}可以放到后一句再补。"
        return "先直接写结论，再补一句原因，不要用模板化对照句。"
    if kind == "looks_like_but":
        return "直接给分类判断，例如“它更像一个……系统/工作台/协议层”，不要先设假对立。"
    if kind == "too_strong_claim":
        return "把夸张词换成可验证判断，例如“更完整 / 更清楚 / 更适合当前场景”。"
    if kind == "promo_push":
        return "把推荐口吻改成技术判断，例如“适合作为……入口/参考/样本”。"
    if kind == "over_explain":
        simplified = re.sub(r"^(也就是说|换句话说|其实|本质上|真正的意思是)[，,：: ]*", "", stripped)
        if simplified and simplified != stripped:
            return simplified
        return "删掉这一层解释，优先保留最直接的结论句。"
    return "把这句改得更直接、更像技术作者，而不是模板化总结。"


def suggestion_records(groups: dict[str, list[str]]) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for kind, sentences in groups.items():
        for sentence in sentences:
            records.append(
                {
                    "kind": kind,
                    "sentence": sentence,
                    "rewrite_hint": rewrite_hint(kind),
                    "suggested_rewrite": suggested_rewrite(kind, sentence),
                }
            )
    return records


def grouped_paragraphs(text: str) -> list[str]:
    parts = re.split(r"\n\s*\n", text.strip())
    return [part.strip() for part in parts if part.strip()]


def rewrite_paragraph(paragraph: str) -> str:
    rewritten = paragraph
    rewritten = re.sub(r"(也就是说|换句话说|其实|本质上|真正的意思是)[，,：: ]*", "", rewritten)
    rewritten = re.sub(r"(不只是)([^。！？\n]{0,40})而是", r"\2，重点放在", rewritten)
    rewritten = re.sub(r"(真正重要的不是)([^。！？\n]{0,40})而是", r"更重要的是", rewritten)
    rewritten = re.sub(r"(不是)([^。！？\n]{0,40})而是", r"重点是", rewritten)
    rewritten = re.sub(r"它看起来像([^。！？\n]{0,40})(但|，但)", "它更接近", rewritten)
    rewritten = re.sub(r"\s{2,}", " ", rewritten)
    return rewritten.strip()


def paragraph_patch_records(text: str) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    for paragraph in grouped_paragraphs(text):
        kinds: list[str] = []
        for name, pattern in AI_PATTERNS + HYPE_PATTERNS + DRAG_PATTERNS:
            if pattern.search(paragraph):
                kinds.append(name)
        if not kinds:
            continue
        records.append(
            {
                "kinds": ", ".join(sorted(set(kinds))),
                "original_paragraph": paragraph,
                "suggested_paragraph": rewrite_paragraph(paragraph),
            }
        )
    return records


def write_suggestions_file(path: Path, payload: dict) -> Path:
    out_path = path.with_name("rewrite-suggestions.md")
    lines = [
        f"# rewrite-suggestions.md",
        "",
        f"- article: `{path.name}`",
        f"- status: `{payload['status']}`",
        f"- message: {payload['message']}",
        "",
        "## Reasons",
        "",
    ]
    for reason in payload["reasons"]:
        lines.append(f"- {reason}")

    groups = [
        ("AI-flavored phrasing", payload.get("ai_suggestions", [])),
        ("Hype / promo tone", payload.get("hype_suggestions", [])),
        ("Over-explaining drag", payload.get("drag_suggestions", [])),
    ]

    for title, records in groups:
        if not records:
            continue
        lines.extend(["", f"## {title}", ""])
        for idx, record in enumerate(records, 1):
            lines.extend(
                [
                    f"### {idx}. {record['kind']}",
                    "",
                    f"原句：{record['sentence']}",
                    "",
                    f"诊断：{record['rewrite_hint']}",
                    "",
                    f"建议改写：{record['suggested_rewrite']}",
                    "",
                ]
            )

    out_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    return out_path


def write_patch_file(path: Path, payload: dict) -> Path:
    out_path = path.with_name("rewrite-patch.md")
    lines = [
        "# rewrite-patch.md",
        "",
        f"- article: `{path.name}`",
        f"- status: `{payload['status']}`",
        "",
        "下面按段落给出更完整的替代稿，方便直接改写原文。",
    ]

    patch_records = payload.get("paragraph_patch_records", [])
    for idx, record in enumerate(patch_records, 1):
        lines.extend(
            [
                "",
                f"## Paragraph {idx}",
                "",
                f"- flags: `{record['kinds']}`",
                "",
                "### 原段落",
                "",
                record["original_paragraph"],
                "",
                "### 建议替代稿",
                "",
                record["suggested_paragraph"],
            ]
        )

    out_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Diagnose a Zhihu Markdown draft before publish.")
    parser.add_argument("article", help="Path to Zhihu markdown article")
    parser.add_argument("--json", action="store_true", help="Print JSON result")
    parser.add_argument("--no-write-suggestions", action="store_true", help="Do not write rewrite-suggestions.md next to the article")
    args = parser.parse_args()

    path = Path(args.article).expanduser()
    if not path.is_absolute():
        path = (Path.cwd() / path).absolute()
    if not path.exists():
        raise SystemExit(f"article not found: {path}")

    text = path.read_text(encoding="utf-8")
    ai_counts = count_matches(text, AI_PATTERNS)
    hype_counts = count_matches(text, HYPE_PATTERNS)
    drag_counts = count_matches(text, DRAG_PATTERNS)
    ai_examples = collect_examples(text, AI_PATTERNS)
    hype_examples = collect_examples(text, HYPE_PATTERNS)
    drag_examples = collect_examples(text, DRAG_PATTERNS)
    ai_suggestions = suggestion_records(ai_examples)
    hype_suggestions = suggestion_records(hype_examples)
    drag_suggestions = suggestion_records(drag_examples)
    paragraph_patches = paragraph_patch_records(text)
    evidence = evidence_count(text)

    total_ai = sum(ai_counts.values())
    total_hype = sum(hype_counts.values())
    total_drag = sum(drag_counts.values())

    reasons: list[str] = []
    status = "PASS"

    if total_ai >= 2:
        status = "BLOCK"
        reasons.append("AI-flavored contrast phrasing is still too repetitive")

    if total_hype >= 2 and status != "BLOCK":
        status = "WARN"
        reasons.append("professional tone is weakened by hype-like wording")

    if total_drag >= 8 and status == "PASS":
        status = "WARN"
        reasons.append("copy may still feel over-explained")

    if evidence < 3:
        if status == "PASS":
            status = "WARN"
        reasons.append("evidence density looks weak for a technical article")

    if not reasons:
        reasons.append("copy looks publishable under current rule set")

    payload = {
        "status": status,
        "article": str(path),
        "ai_phrase_counts": ai_counts,
        "ai_phrase_examples": ai_examples,
        "ai_suggestions": ai_suggestions,
        "hype_counts": hype_counts,
        "hype_examples": hype_examples,
        "hype_suggestions": hype_suggestions,
        "drag_counts": drag_counts,
        "drag_examples": drag_examples,
        "drag_suggestions": drag_suggestions,
        "paragraph_patch_records": paragraph_patches,
        "evidence_count": evidence,
        "message": "先别发" if status == "BLOCK" else ("建议再改一轮" if status == "WARN" else "可以继续发布"),
        "reasons": reasons,
    }

    suggestion_path = None
    patch_path = None
    if not args.no_write_suggestions:
        suggestion_path = write_suggestions_file(path, payload)
        patch_path = write_patch_file(path, payload)
        payload["rewrite_suggestions_path"] = str(suggestion_path)
        payload["rewrite_patch_path"] = str(patch_path)

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print(f"[zhihu-copy-diagnose] {payload['status']} :: {path.name}")
        print(f"- message: {payload['message']}")
        print(f"- ai_phrase_counts: {ai_counts}")
        print(f"- hype_counts: {hype_counts}")
        print(f"- drag_counts: {drag_counts}")
        print(f"- evidence_count: {evidence}")
        if suggestion_path:
            print(f"- rewrite_suggestions: {suggestion_path}")
        if patch_path:
            print(f"- rewrite_patch: {patch_path}")
        for reason in reasons:
            print(f"- reason: {reason}")
        example_groups = [
            ("ai_suggestions", ai_suggestions),
            ("hype_suggestions", hype_suggestions),
            ("drag_suggestions", drag_suggestions),
        ]
        for label, group in example_groups:
            if not group:
                continue
            print(f"- {label}:")
            for record in group:
                print(f"  - {record['kind']}:")
                print(f"    - sentence: {record['sentence']}")
                print(f"    - rewrite_hint: {record['rewrite_hint']}")
                print(f"    - suggested_rewrite: {record['suggested_rewrite']}")

    return 2 if status == "BLOCK" else 0


if __name__ == "__main__":
    raise SystemExit(main())
