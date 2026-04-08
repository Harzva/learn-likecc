---
name: full_unpackd_rep
description: Use when the task is to unpack a local reference repository into a Chinese structural topic page, update site navigation, stamp dates, and leave behind a reusable deconstruction note for the repo.
---

# full_unpackd_rep

Use this skill when the user wants to turn a reference repository into a Chinese “庖丁解牛” topic page instead of leaving only scattered notes. 典型输入会提到：

- “把这个 reference 仓库做成解构网页”
- “做类似 CC 解构 的结构页”
- “把某个工程拆成专题，并接进站点导航”

默认目标是把一个本地参考仓库沉淀成三类产物：

1. `reference/.../our/` 下的分析笔记或延续既有笔记
2. `site/topic-*.html` + `site/md/*.md` 的结构专题页
3. 站点导航、专题总页、路线图的接线更新

## 输入与边界

- 参考仓库通常位于 `reference/` 下；优先使用本地代码和文档，不先假设外网信息。
- 如果站内已经有总专题页，优先把新页作为子专题挂进去，而不是再造平行入口。
- 用户若指定专题名、技能名、页面名，优先遵从用户命名；只有在明显冲突时才做最小修正。

## 工作流

### 1. 先识别“这个仓库到底是什么层”

优先读这些入口：

- 仓库根 `README.md`
- 顶层 `apps/`、`packages/`、`plans/`、`docs/`
- 已有本地分析稿：`reference/.../our/`

目标不是穷举文件，而是找出 4 到 6 个稳定层次，例如：

- 产品壳
- 调度内核
- 布局 / 工作位
- 运行时 / 控制协议
- 数据 / 事件 / 结果回收

### 2. 选定“解构视角”

不要写成文件清单。要先决定这页想回答什么问题，例如：

- 它是怎样做到 meta-agent 的
- 它如何把 workspace / terminal / review 串起来
- 它的 control plane 在哪一层

页面结构必须围绕这个主问题展开。

### 3. 产出或续写分析稿

如果 `reference/.../our/` 已有同主题笔记，优先续写或吸收它；没有再新建。

分析稿里至少要有：

- 日期
- 一句话结论
- 4 到 6 个结构层
- 对 Like Code / 当前工程的启发

### 4. 落成结构专题页

在 `site/` 下新建或更新 `topic-*.html`，并同步创建 `site/md/*.md`。

默认页面要求：

- 标题明确是“某某解构”或“某某庖丁解牛”
- 结构上更像 `topic-cc-unpacked-zh.html` 这种分节页面，而不是纯概念短页
- 开头说明参考来源与锚定日期
- 每节都围绕结构层展开，而不是堆名词
- 能回链到总专题页与相关专题

### 5. 接入站点导航

至少检查这些位置是否需要接线：

- `site/index.html`
- 对应专题总页，例如 `site/topic-paoding-jieniu.html`
- 相关总专题页，例如 `site/topic-agent.html`
- `site/js/app.js` 里的侧栏
- 对应 Markdown 镜像 `site/md/*.md`

如果旧入口只是概念页，而新页是更具体的承载页，优先让新页占据导航位。

### 6. 日期规则

所有新专题页都要带日期：

- HTML `<meta name="page:updated" content="YYYY-MM-DD">`
- Markdown 头部写清 `更新时间`
- 如果正文是分析稿或产品稿，开头也写日期

站点页脚日期由全站脚本注入，但页面元数据仍要显式填写。

### 7. 更新仓库路线图

如果这次改动属于用户可见的站点结构、专题、技能或产品定位调整，顺手更新：

- `.claude/plans/likecode-model-freedom-roadmap.md`

记录新增专题、导航调整、技能沉淀等关键结果。

## 写作准则

- 不要把“终端数量”误写成“智能体能力”
- 不要只写“支持很多 agent”，要写清控制面、状态流、执行隔离、结果回收
- 不要把结构页写成 README 翻译稿；本站页面需要面向当前工程的吸收视角
- 如果页面承载某个概念，例如 `meta-agent`，要把概念落到具体文件和结构层上

## 验证

完成后至少做这些检查：

- `python3 tools/check_site_md_parity.py`
- 如果改了 `site/js/app.js`，执行 `node --check site/js/app.js`
- 用 `rg` 复查旧入口文案是否还有漏改

## 输出清单

完成一次“解构专题”后，默认应当留下：

- 新或更新的结构专题页
- 对应 Markdown 镜像
- 导航接线
- 日期元数据
- 路线图记录
- 可复用技能本身
