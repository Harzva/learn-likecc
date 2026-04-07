# Agent 3 上下文 — v2.5.2 MD 镜像 + parity

**仓库**: `Harzva/learn-likecc`  
**总计划**: [v2.5.2_plan.md](../v2.5.2_plan.md)

**前置**: Agent 1 已定 **`stem`** 且 `site/<stem>.html` 已存在。

---

## 职责

1. 新增 **`site/md/<stem>.md`**：顶部元信息块（在线页、`site/md` 路径、说明）+ **目录对照** Agent 1 页面五区块的 **中文摘要**（风格对齐 [v2.5.1 Agent 3](../v2.5.1/agent-3-md-s01-s12.md)）。
2. 在 **`site/<stem>.html`** 页脚加入 **GitHub blob** 互链：  
   `https://github.com/Harzva/learn-likecc/blob/main/site/md/<stem>.md`  
   （`target="_blank"` `rel="noopener noreferrer"`，类名 `.md-source-link` 与全站一致）。
3. 运行 **`python3 tools/check_site_md_parity.py`**，确保新页不破坏校验（新 `stem` 会要求 **html 有链接 + md 存在**）。

---

## 任务清单 — 完成后 `[x]`

- [x] `site/md/<stem>.md` 已创建且结构与 v2.5.1 深化规范一致（`topic-cc-unpacked-zh`）
- [x] HTML 页脚互链正确（stem 与文件名一致）
- [x] `check_site_md_parity.py` 通过
- [x] **回写打钩**：本文件 + [v2.5.2_plan.md 第七节](../v2.5.2_plan.md)

---

## 完成定义

- Parity 脚本 **exit 0**
- MD 中注明 ccunpacked **参考致谢**（可与 HTML 互文，避免重复冗长）
