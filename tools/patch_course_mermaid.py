#!/usr/bin/env python3
"""Insert Mermaid figure after course-quote and set data-site-sidebar on course pages."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"

CAPTIONS = {
    1: "主循环：用户 / LLM / 工具与 tool_result 回流，直至停止调用工具。",
    2: "工具链路：Schema 描述 → 权限门 → 执行 → 结果回注循环。",
    3: "权限：策略判定、用户确认或自动放行后再执行敏感工具。",
    4: "CLI：入口解析交互 / 管道 / 模型与续聊等模式。",
    5: "压缩：对话历史过长时在保留语义下收缩上下文。",
    6: "子代理：父会话派生并行子会话，汇总结果回到主线。",
    7: "MCP：外部工具服务通过协议挂入 Agent 上下文。",
    8: "任务：队列、依赖与调度，组织多步异步工作。",
    9: "Bridge：IDE 扩展与本地 CLI 的实时双向通道。",
    10: "Hooks：在关键生命周期插入自定义脚本与检查。",
    11: "Vim：模态编辑键位与终端输入栈协同。",
    12: "Git：提交、分支与 PR 等操作嵌入对话工作流。",
}


def figure_for(n: int) -> str:
    cap = CAPTIONS[n]
    key = f"course-s{n:02d}"
    return f"""                <figure class="mermaid-figure" aria-label="本章导图">
                    <figcaption class="mermaid-caption"><strong>本章导图</strong>：{cap}</figcaption>
                    <div class="mermaid-diagram-scroll" data-mermaid-diagram="{key}"></div>
                </figure>

"""


def patch_file(path: Path, n: int) -> None:
    text = path.read_text(encoding="utf-8")
    if 'data-mermaid-diagram="course-s' in text:
        print("skip (already)", path.name)
        return
    text = text.replace('<html lang="zh-CN">', '<html lang="zh-CN" data-site-sidebar="">', 1)
    pattern = re.compile(
        r"(<div class=\"course-quote\">[\s\S]*?</div>)\s*\n(\s*<section class=\"section-block\">)",
        re.MULTILINE,
    )
    m = pattern.search(text)
    if not m:
        raise SystemExit(f"No course-quote block in {path}")
    fig = figure_for(n)
    new_text = text[: m.end(1)] + "\n\n" + fig + text[m.start(2) :]
    path.write_text(new_text, encoding="utf-8")
    print("patched", path.name)


def main() -> None:
    for n in range(1, 13):
        patch_file(SITE / f"s{n:02d}.html", n)


if __name__ == "__main__":
    main()
