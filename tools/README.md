# tools/ 脚本说明

均在**仓库根目录**执行，需 **Python 3**（无第三方依赖，除非另有说明）。

| 脚本 | 作用 |
|------|------|
| `check_site_md_parity.py` | 校验每个 `site/*.html` 是否有对应 `site/md/<stem>.md` 与正确 GitHub blob 链接（[CI 引用](../.github/workflows/site-md-parity.yml)）。 |
| `gen_cc_overview.py` | 根据 `site/data/cc-overview.json` 写回 `topic-cc-unpacked-zh.html` 内三表；`--check`、`--verify-in-sync`、`--dry-run`。 |
| `gen_cc_arch_treemap.py` | 扫描 `ccsource/claude-code-main/src` 下各子目录 TS/TSX 数量，写 `site/data/cc-arch-treemap.json`（Treemap）；`--verify-in-sync`；无镜像时 verify 仅校验 JSON。 |
| `check_cc_loop_steps.py` | 校验 `site/data/cc-loop-steps.json` 结构（唯一 `id`、必填字段等）。 |
| `cc_loop_demo_events.py` | 模块：演示用 `(stage, title, detail)` 列表，供下面两个脚本复用。 |
| `cc_loop_relay_demo.py` | 向 **stdout** 打印 NDJSON 形式 demo 事件。 |
| `cc_loop_sse_relay.py` | 本机 **SSE** 服务（默认 `127.0.0.1:8769/events`），供 `topic-cc-loop-lab.html` 联调。 |
