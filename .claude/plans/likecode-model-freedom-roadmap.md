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
- [x] 将多窗口 Tab 模式映射到 `v1.0.2_plan.md`
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

### Milestone I：localhost Web UI 工作台

- [x] 产出第一版 `localhost Web UI` 设计稿，明确 CLI 与 Web UI 的分工
- [x] 产出第一版 `localhost Web UI` 读取协议草案
- [x] 起好第一版 localhost 只读接口骨架：`session / pane / transcript / events`
- [ ] 支持展示 session / pane 列表
- [ ] 支持 transcript 结构化展示
- [ ] 支持 tool / subagent 时间线
- [ ] 支持 model / provider 切换记录
- [ ] 支持思考过程卡片流
- [ ] 第二阶段再评估流程图、多窗格联动与子代理监控面板

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
- [x] 增加 `/show:slash`，可在终端内查看所有 slash command 与用法
- [x] 将 git / Pages / Release / plan 更新要求固化为 skill 与 rules
- [x] 新增“多窗口与 Subagent 视图设计稿 V1”，拆清快捷键、状态模型与 UI 分层
- [x] 将多窗口设计稿继续拆成可执行开发任务清单
- [x] 启动 logo 改为红色爱心，强化 Like Code 的 `like` 产品语义

### 待继续打钩

- [ ] 再逐步统一更多页面的 `Claude Code Course` 旧口径
- [ ] 把自由模型路线拆到具体版本计划
- [ ] 把多窗口设计稿进一步映射到具体版本计划与实现任务
- [x] 将多窗口设计稿进一步映射到 `v1.0.2-likecode` 版本计划
- [x] 实现第一版 tab 模式：新建、切换、关闭、重命名入口已接好，基础流程已可用
- [x] 为 tab 模式接入第一层状态骨架：`sessionTabs` + session metadata 映射
- [x] 顶部 tab UI 已接入主 REPL
- [x] `/tab` 命令已支持 list/new/next/prev/switch/rename/close/panel
- [x] `Ctrl+g` 前缀快捷键已支持新建、切换、关闭、面板切换、编号跳转
- [x] 明确 `tab` 与 `branch` 不是重复功能：前者是同 session 视图管理，后者是会话分叉
- [x] 明确 `panel` 与 `subagent` 不是重复功能：前者是工作区/视图层，后者是执行层
- [x] 明确“为什么不是直接多开终端”：内部 panel 解决的是同 session 编排与可视化，不只是多进程并行
- [x] 把 transcript、todo、model/provider 状态开始绑定到 tab
- [x] 增加第一版 subagent 状态面板，先能展示 transcript、任务与运行状态
- [x] 将 panel / 分屏提升为 tab 之后的最高优先级交付，并开始实现
- [x] 让 pane 模式下底部出现多个可见对话框区域，而不只是一个共享输入框
- [x] 让左右 pane 开始显示各自的 transcript 预览
- [x] 让非 active pane 升级成准可操作态：显示 transcript 摘要、todo 摘要、draft 提示与更明确的激活文案
- [x] 为左右 pane 增加更直接的聚焦入口：点击 pane、`/tab focus left|right|1|2`、`Ctrl+g h / l`
- [x] 让 pane 自己开始直接显示 task lane 摘要，而不只是依赖右侧 workspace 面板
- [x] 让启动界面直接显示 Web 工作台网址，方便用户从 CLI 初始界面跳转
- [x] 将启动头图进一步收成蓝色爱心 + `Like` 上置 + `code · Harzva restored · v2.1.88`
- [x] 将启动头里的 `Like` 继续放大为多行大字，和右侧 `code` 形成更完整的品牌头图
- [x] 让每个 tab 开始固定自己的逻辑 todo lane 标识，继续为真正隔离铺底
- [x] 让 tasks 链开始读取当前 active pane 的逻辑 lane override，继续向 pane 级任务隔离推进
- [x] 让切 tab 时主消息区开始切到各自 transcript
- [x] 让 todo lane 开始按 tab 保存和恢复
- [x] 产出 `localhost Web UI` 设计稿，明确第一版先做观察台：session/pane、结构化 transcript、时间线、切模型记录、思考过程卡片流
- [x] 产出 `localhost Web UI` 协议稿，明确 `session / pane / transcript / events` 的读取分层
- [x] 起好 `localhost Web UI` 第一版只读接口：`/api/sessions`、`/api/sessions/current`、`/api/sessions/current/panes`、`/api/sessions/current/panes/:paneId/transcript`、`/api/sessions/current/events`
- [x] 让 `localhost Web UI` 根路径从纯 JSON 索引升级成真正可浏览的 dashboard
- [x] 增加 `localhost Web UI` 的 `subagents` 读取接口，明确当前摘要主要来自 `AppState.tasks`
- [x] 让 transcript 摘要开始抽取 `text / thinking / tool_use / tool_result`，为工作流展示继续铺底
- [x] 让 Web UI transcript 继续细化成 `messages + cards + workflow` 三层结构
- [x] 让当前 active pane 在初始化进入时也优先恢复自己的 todo 快照，继续把 pane 隔离往下做实
- [x] 让 Web UI transcript 继续补出 `stages`，开始明确 prompt / thinking / tool / response 阶段节点
- [x] 让 tool 卡片开始带出 `input / output / toolUseId`
- [x] 让新建 pane/tab 以空 transcript 与空 todo 快照起步，减少跨 pane 的残留状态继承
- [x] 让 pane 的 `inputMode / pastedContents / stashedPrompt` 也开始按窗口保存和恢复
- [x] 让 Web UI transcript 继续补出 `turns / toolPairs`，开始支撑更真实的 turn replay 与工具输入输出配对
- [x] 让 Web UI 首页直接渲染 `Tool Pairs`，不再只停留在接口字段层
- [x] 让启动头的 `Like Code` 统一成蓝色品牌头图
- [x] 让 Web UI transcript 继续补出 `toolChains`，并给 `toolPairs` 增加 `chainId / step / previous / next`
- [x] 让 `progress` 消息也开始挂到对应的 tool 链上，增强真实工具执行中的中间过程可见性
- [x] 继续把 `vimMode / history search / bashes dialog / help / message selector` 往 pane 内部迁，减少 REPL 全局输入残留
- [x] 让 `message selector` 的预选消息也跟随 pane 保存和恢复，减少不同 pane 之间的恢复目标串线
- [x] 让 pane 的 `conversationId / submitCount` 也开始跟随窗口保存和恢复，进一步减少多个 pane 共用一份对话节奏
- [x] 让真实 `tool progress` 也开始进入 `toolChains`，让 Web UI 在最终结果返回前也能看到工具链正在执行
- [x] 让 transcript 的 `show all / dump mode` 也开始跟随 pane 保存和恢复，减少不同 pane 之间的查看状态串线
- [x] 让 transcript 搜索词也开始跟随 pane 保存和恢复，减少不同 pane 之间的阅读上下文串线
- [x] 让 transcript 搜索条的打开状态也开始跟随 pane 保存和恢复，减少切 pane 后搜索 UI 被统一重置
- [x] 让 transcript 搜索的命中数量与当前位置也开始跟随 pane 保存和恢复，减少切 pane 后重新丢失阅读锚点
- [x] 让退出 transcript 后的 pane 也尽量保留搜索上下文，重新进入后更接近继续上次阅读定位
- [x] 让 `toolChains.steps` 开始明确拆成 `tool_use / progress / tool_result`，让跨 turn 回放更像真实 coding 过程
- [x] 固定三套源码分层：`CC/claude-code-main` 看原始源码，`CC/claude-code-rebuild` 看可运行重建基线，`claude-code-main` 看 Like Code 主开发线
- [ ] 继续把多个可见对话框升级成真正的多活跃输入与多 transcript 并行
- [ ] 继续把 transcript / todo 做到真正隔离，而不只是先做 UI 层消息区与快照恢复
- [ ] 继续把 subagent 面板升级为更完整的工作视图，展示仓库、目录、当前任务与更多 live 状态
- [ ] 继续把 Claude 的 coding 过程提取得更细，支撑 Web UI 时间线、卡片流和流程图

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
- `./localhost-web-ui-design-v1.md`
- `./localhost-web-ui-protocol-v1.md`
- `./v1.0.2_plan.md`
