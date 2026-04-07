# LikeCode 自由模型路线图

## 背景

learn-likecc 现在已经不只是一个 Claude Code 源码学习仓库。

新的长期方向是把它推进成一个更自由的 likecode 工程：

- 模型可换
- API 可换
- provider 可换
- 同一个 session 内尽量可切模型
- 尽量不因切模型就被迫 compact

这条路线的判断依据，不是空想，而是当前恢复出的源码中已经存在一批可复用锚点：

- `set_model`
- `mainLoopModelOverride`
- session metadata 同步
- model switch breadcrumb 注入

这说明“同会话切模型”已经有实现雏形；真正难点在跨 provider 后的消息格式、工具调用、compact 边界、resume 一致性和能力差异统一。

---

## 长远目标

### Milestone A：产品叙事完成

- [x] README 首页改成 Learn LikeCode 口径
- [x] 首页明确提出“自由换模型”目标
- [x] 首页加入已完成绿钩 + 真实场景 todo
- [x] 在线站点首页同步新叙事
- [x] `site/md/README.md` 与 `site/md/index.md` 跟入口口径保持一致

### Milestone B：工程规划成文

- [x] 新建 LikeCode 专项路线图文档
- [x] 在计划中拆分长期目标与阶段任务
- [x] 当前已完成项按仓库传统打钩
- [x] 新需求必须进 plan、未完成必须留在 README todo 的规则已固化
- [ ] 把后续版本号规划映射到现有 `.claude/plans/v*.md`
- [ ] 将该路线图接入 CHANGELOG 或版本计划索引

### Milestone C：文档校验基线

- [x] 为仓库安装 `markdownlint` 本地工具链
- [x] 增加可重复执行的 Markdown lint 命令
- [x] 先覆盖 README 与站点入口 Markdown
- [ ] 再逐步扩大到 `.claude/plans/` 与 `site/md/`
- [ ] 形成 CI 或本地 pre-check 约定

### Milestone D：同 Session 切模型

- [x] 确认源码里存在 `set_model` / override / metadata 基础能力
- [x] 让 `/model` 菜单能看到本地配置过的外部模型
- [ ] 梳理切模型前后的状态流转图
- [ ] 设计外部可见的 `/model` / `continue-with-model` 产品行为
- [ ] 记录切换原因、切换成本、回退点
- [ ] 为切模型补充 breadcrumb / transcript 可解释性

### Milestone E：多 Provider 兼容层

- [x] 支持按模型读取本地 provider 路由配置
- [x] 支持 `modelRoutes` 这种免转义的项目本地配置格式
- [x] 支持路由项内单独覆盖 `baseURL`
- [x] 支持路由项内单独覆盖 `authToken`
- [x] 修复第三方兼容网关 `headers` 非标准结构兼容性
- [ ] 定义统一 provider adapter 接口
- [ ] 抽象请求/响应消息格式
- [ ] 抽象 tool use / tool result 兼容层
- [ ] 抽象流式事件兼容层
- [ ] 抽象 usage / cost 统计兼容层
- [ ] 梳理 provider capability matrix

### Milestone F：不 compact 也能切模型

- [ ] 识别“可直接切”的安全条件
- [ ] 识别“必须 compact / summarize / downshift”的触发条件
- [ ] 设计局部摘要 / 局部转译 / 局部降配策略
- [ ] 为失败切换提供自动回退机制
- [ ] 保住 todo、tool state、session continuity

### Milestone G：私人订制工作台

- [ ] 支持按任务路由模型
- [ ] 支持按项目设置默认 provider / 模型 / 预算
- [ ] 支持按团队设置风险策略与操作边界
- [ ] 支持白天强模型、夜间便宜模型的自动切换策略
- [ ] 支持“当前 session 卡住时换模型接手”

### Milestone H：多对话窗口与 Subagent 视图

- [ ] 支持同一个 session 下的多对话窗口 / 会话页签
- [ ] 设计参考 zellij 的快捷键逻辑：新建窗口、切换窗口、关闭窗口、重命名窗口
- [x] 产出第一版产品设计稿，明确快捷键方案、数据结构、UI 信息层与阶段边界
- [ ] 区分“主线程窗口”和“任务窗口 / review 窗口 / 搜索窗口”
- [ ] 为不同窗口保留各自 transcript、任务状态与模型状态
- [ ] 在后续 subagent 模式下，按窗口展示不同 subagent 到底在忙什么
- [ ] 支持展示 subagent 当前所在仓库 / 工作目录 / 正在执行的任务
- [ ] 评估 pane 模式与 tab 模式的取舍，先做 tab，再考虑分屏

---

## 当前回合交付

### 已完成

- [x] README 加入 Why LikeCode、自由换模型可行性判断、产品 Todo
- [x] README 增加 Phase 5 自由模型路线
- [x] 站点首页改成 Learn LikeCode 口径
- [x] 站点首页新增 LikeCode 路线视觉 roadmap 区
- [x] 站点首页新增绿色对钩 + 私人订制 Todo 展示区
- [x] 站点 Markdown 入口文案同步
- [x] 处理 `markdownlint` 缺失问题，改为仓库内安装方案
- [x] 为 API client 增加按模型自动切换 baseURL / authToken / headers 的本地路由层
- [x] `/model` 菜单开始展示本地已配置的外部模型
- [x] 启动界面改为 Like Code 风格头图与彩色状态信息
- [x] 启动界面展示 Global / Project / Local 三层 `.claude` 摘要
- [x] 启动界面展示当前命中的 `claude` 命令路径
- [x] 当前工程启动头改为显示仓库地址，降低路径理解成本
- [x] 增加 `/show`、`/show:global`、`/show:user`、`/show:project` 配置查看命令
- [x] 将 git / Pages / Release / plan 更新要求固化为 skill 与 rules
- [x] 新增“多窗口与 Subagent 视图设计稿 V1”，拆清快捷键、状态模型与 UI 分层
- [x] 将多窗口设计稿继续拆成可执行开发任务清单

### 待继续打钩

- [ ] 再逐步统一更多页面的 `Claude Code Course` 旧口径
- [ ] 把自由模型路线拆到具体版本计划
- [ ] 把多窗口设计稿进一步映射到具体版本计划与实现任务
- [ ] 实现第一版 tab 模式：新建、切换、关闭、重命名
- [ ] 把 transcript、todo、model/provider 状态真正绑定到 tab
- [ ] 增加 subagent 状态面板占位，先能展示仓库、任务与运行状态

---

## 推荐执行顺序

1. 先把文档叙事、计划文档、lint 基线立住。
2. 再把“同 session 切模型”的状态机和 transcript 设计清楚。
3. 然后做 provider adapter，避免一开始就在 Anthropic 绑定里越写越深。
4. 然后补“多对话窗口 / 会话页签 / subagent 工作视图”。
5. 最后再做“不 compact 切模型”和“私人订制工作台”。

---

## 相关设计稿

- `./multi-window-subagent-design-v1.md`
