"""Shared demo tuples for cc_loop_relay_demo / cc_loop_sse_relay (stdlib only).

Each item: (stage_id, title, detail_or_none)
"""
from __future__ import annotations

# Align with site/data/cc-loop-steps.json step ids
DEMO: list[tuple[str, str, str | None]] = [
    ("input", "用户输入", "stdin / Ink TextInput"),
    ("message", "构造 user 消息", None),
    ("history", "合并 messages[]", "len=N"),
    ("system", "系统提示 + tools 定义", None),
    ("api", "流式请求模型", "model=…"),
    ("tokens", "上下文占用", "usage estimate"),
    ("tools_decide", "解析 stop_reason / tool_use", None),
    ("tools_run", "执行工具", "name=Read"),
    ("tool_result", "写回 tool_result", "tool_use_id=…"),
    ("loop_exit", "继续循环或结束", "stop_reason≠tool_use → exit"),
    ("render", "渲染 REPL", None),
]
