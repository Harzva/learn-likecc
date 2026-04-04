# Agent 4 上下文 — v2.5.1 深挖 D01–D12 深化 + 检测汇总

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.1_plan.md](../v2.5.1_plan.md)

---

## 前置条件

- Agent 1–3 已在 [v2.5.1_plan.md](../v2.5.1_plan.md) 将第四、五、六节任务打钩（或 PR 已合并且总计划已更新）。

---

## 职责

1. 深化 **`site/md/d01.md` … `site/md/d12.md`**（同 Agent 3 标准：目录 + 每节摘要）。  
2. 运行 **`python3 tools/check_site_md_parity.py`**（须 exit 0）。  
3. **抽检** 至少 6 页（2 hub + 2 S + 2 D）MD 目录与 HTML 章节是否明显错位。  
4. 填写 [v2.5.1_plan.md 第七节「执行汇总」表](../v2.5.1_plan.md)。

---

## 任务清单 — 完成后 `[x]`

- [x] `d01`–`d12` 共 12 个 MD 已深化
- [x] `python3 tools/check_site_md_parity.py` 通过
- [x] 抽检记录写入总计划「执行汇总」或本节下方备注
- [x] 填写总计划「执行汇总」表（完成日期、CI 链接、遗留）
- [x] **回写打钩**：本文件 + [v2.5.1_plan.md 第七节](../v2.5.1_plan.md)
- [x] 将 **v2.5.1_plan.md 文首状态**改为「✅ 已完成」（全部收口后）

---

## Agent 4 执行备注（完成后填写）

| 项 | 内容 |
|----|------|
| 抽检页面 | **Hub**：`index.md` / `tutorial.md`；**S**：`s01.md` / `s06.md`；**D**：`d01.md` / `d08.md`。对照对应 HTML 的 `h2` 标题与 MD「目录（对照 HTML）」逐项核对，未见错位或缺节。 |
| parity 输出 | `check_site_md_parity: OK (38 html, md dir has README + stems)` |
| 遗留 | 无。深挖页 HTML 页脚已用 `.md-source-dual` 与 MD 顶部「双版本阅读」形成互链；全站其他页面若需同样页脚样式可后续按需扩展。 |
