#!/usr/bin/env python3
"""Generate d01–d12 deep-dive pages and patch s01–s12 navigation for 24-lesson order."""
from __future__ import annotations

import argparse
import re
from pathlib import Path

from d_deep_content import DEEP_BODIES

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"

# (en_title, zh_title, deep_focus, part 1|2|3)
THEMES: list[tuple[str, str, str, int]] = [
    ("Agent Loop", "智能体循环", "stop_reason、消息边界与错误恢复精读", 1),
    ("Tool System", "工具系统", "注册表、校验失败与 ToolResult 契约", 1),
    ("Permission Model", "权限模型", "策略矩阵、审计点与 yolo 边界", 1),
    ("Command Interface", "命令接口", "入口分流、管道模式与配置优先级", 1),
    ("Context Compression", "上下文压缩", "摘要策略、触发时机与信息损失", 2),
    ("Subagent Fork", "子代理分支", "隔离上下文、合并策略与成本", 2),
    ("MCP Protocol", "MCP 协议", "握手、工具发现与安全边界", 2),
    ("Task Management", "任务管理", "依赖图、调度与失败重试", 2),
    ("Bridge IDE", "Bridge IDE", "WS 协议、状态同步与冲突", 3),
    ("Hooks Extension", "Hooks 扩展", "生命周期、沙箱与幂等", 3),
    ("Vim Mode", "Vim 模式", "键位映射、与 Readline 交互", 3),
    ("Git Integration", "Git 集成", "diff/merge 策略与自动化边界", 3),
]


def part_label(p: int) -> str:
    return {1: "Part 1: 核心架构", 2: "Part 2: 高级特性", 3: "Part 3: 扩展集成"}[p]


def d_page_html(n: int) -> str:
    en, zh, focus, part = THEMES[n - 1]
    lesson = n * 2
    deep_body = DEEP_BODIES[n - 1].rstrip() + "\n"

    prev_top = f'<a href="s{n:02d}.html" class="chapter-prev">← S{n:02d}</a>'
    if n < 12:
        nen = THEMES[n][0]
        next_top = f'<a href="s{n + 1:02d}.html" class="chapter-next">下一讲 S{n + 1:02d} →</a>'
    else:
        next_top = '<a href="index.html#courses" class="chapter-next">返回课程表 →</a>'

    prev_bot_href = f"s{n:02d}.html"
    prev_bot_text = f"← S{n:02d}: {en}"
    if n < 12:
        nen = THEMES[n][0]
        next_bot_href = f"s{n + 1:02d}.html"
        next_bot_text = f"下一讲: S{n + 1:02d}: {nen} →"
    else:
        next_bot_href = "index.html#courses"
        next_bot_text = "返回 24 讲课程表 →"

    mermaid_key = f"course-s{n:02d}"

    return f"""<!DOCTYPE html>
<html lang="zh-CN" data-site-sidebar="">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D{n:02d}: {en} 深挖 - Claude Code Course</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔬</text></svg>">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="nav-logo">🧠 Claude Code Course</a>
            <div class="nav-links"><a href="index.html#courses" class="nav-link">课程</a></div>
            <div class="nav-actions">
                <button id="theme-toggle" class="theme-toggle" title="切换主题">☀️</button>
            </div>
        </div>
    </nav>

    <main class="course-main">
        <div class="container">
            <div class="course-header">
                <div class="course-breadcrumb">
                    <a href="index.html">首页</a> / <a href="index.html#courses">课程</a> / D{n:02d} 深挖
                </div>
                <div class="course-nav">
                    <span class="course-part-badge">{part_label(part)} · 第 {lesson} 讲</span>
                    <div class="course-chapter-nav">
                        {prev_top}
                        {next_top}
                    </div>
                </div>
            </div>

            <article class="course-content">
                <p class="course-lesson-badge">24 讲路线 · 与 <a href="s{n:02d}.html">S{n:02d}</a> 配对</p>
                <h1 class="course-title">D{n:02d}: {en} <span class="subtitle">深挖 · {zh}</span></h1>

                <div class="course-quote">
                    <p>本讲在 <strong>S{n:02d}</strong> 主线之上，聚焦<strong>实现细节、边界条件与自测</strong>；导图与主线相同模块，便于对照。</p>
                    <p><strong>建议</strong>：先读完 S{n:02d}，再按下方顺序走读源码与练习。</p>
                </div>

                <figure class="mermaid-figure" aria-label="本章导图">
                    <figcaption class="mermaid-caption"><strong>模块导图</strong>（与 S{n:02d} 同源，便于对照）：{focus}</figcaption>
                    <div class="mermaid-diagram-scroll" data-mermaid-diagram="{mermaid_key}"></div>
                </figure>
{deep_body}
                <div class="chapter-navigation">
                    <a href="{prev_bot_href}" class="btn btn-secondary">{prev_bot_text}</a>
                    <a href="{next_bot_href}" class="btn btn-primary">{next_bot_text}</a>
                </div>
            </article>
        </div>
    </main>

    <footer class="footer"><div class="container"><p>© 2026 Claude Code Course. 仅供学习研究使用。</p></div></footer>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js" crossorigin="anonymous"></script>
    <script src="js/app.js"></script>
</body>
</html>
"""


def patch_s_chapter_nav(content: str, n: int) -> str:
    if n == 1:
        inner = """                        <span class="chapter-prev disabled">← 上一讲</span>
                        <a href="d01.html" class="chapter-next">下一讲 D01 →</a>"""
    elif n == 12:
        inner = f"""                        <a href="d11.html" class="chapter-prev">← D11</a>
                        <a href="d12.html" class="chapter-next">下一讲 D12 →</a>"""
    else:
        inner = f"""                        <a href="d{n - 1:02d}.html" class="chapter-prev">← D{n - 1:02d}</a>
                        <a href="d{n:02d}.html" class="chapter-next">下一讲 D{n:02d} →</a>"""
    return re.sub(
        r"<div class=\"course-chapter-nav\">\s*[\s\S]*?</div>",
        f"<div class=\"course-chapter-nav\">\n                        {inner.strip()}\n                    </div>",
        content,
        count=1,
    )


def patch_s_bottom_nav(content: str, n: int) -> str:
    en = THEMES[n - 1][0]
    if n == 1:
        block = """                <div class="chapter-navigation">
                    <a href="index.html#courses" class="btn btn-secondary">← 返回课程列表</a>
                    <a href="d01.html" class="btn btn-primary">下一讲: D01 深挖 →</a>
                </div>"""
    elif n == 12:
        p11 = THEMES[10][0]
        block = f"""                <div class="chapter-navigation">
                    <a href="d11.html" class="btn btn-secondary">← D11: {p11} 深挖</a>
                    <a href="d12.html" class="btn btn-primary">下一讲: D12 深挖 →</a>
                </div>"""
    else:
        pen, nen = THEMES[n - 2][0], THEMES[n][0]
        block = f"""                <div class="chapter-navigation">
                    <a href="d{n - 1:02d}.html" class="btn btn-secondary">← D{n - 1:02d}: {pen} 深挖</a>
                    <a href="d{n:02d}.html" class="btn btn-primary">下一讲: D{n:02d}: {nen} 深挖 →</a>
                </div>"""
    return re.sub(
        r"<div class=\"chapter-navigation\">\s*[\s\S]*?</div>\s*\n\s*</article>",
        block + "\n            </article>",
        content,
        count=1,
    )


def main() -> None:
    ap = argparse.ArgumentParser(description="Generate D pages and optionally patch S chapter nav.")
    ap.add_argument(
        "--d-only",
        action="store_true",
        help="Only write d01–d12.html (do not modify s01–s12).",
    )
    args = ap.parse_args()

    for n in range(1, 13):
        (SITE / f"d{n:02d}.html").write_text(d_page_html(n), encoding="utf-8")
        print("wrote", f"d{n:02d}.html")

    if args.d_only:
        return

    for n in range(1, 13):
        path = SITE / f"s{n:02d}.html"
        text = path.read_text(encoding="utf-8")
        text2 = patch_s_chapter_nav(text, n)
        text2 = patch_s_bottom_nav(text2, n)
        path.write_text(text2, encoding="utf-8")
        print("patched", path.name)


if __name__ == "__main__":
    main()
