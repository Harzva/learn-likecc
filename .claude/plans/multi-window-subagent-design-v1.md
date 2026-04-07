# 多窗口与 Subagent 视图设计稿 V1

## 背景

当前 Claude Code / Like Code 的主交互模型仍然是：

- 一个 session
- 一个主对话窗口
- 一条主 transcript

这对单任务是够用的，但对真实使用已经不够：

- 用户经常想在同一个 session 里并行做不同任务
- 用户不想为了 review、搜索、总结、写码反复新开进程
- 日后引入 subagent 后，用户需要知道不同 subagent 到底在忙什么
- 用户希望像 zellij 一样有明确的窗口切换心智，而不是只能靠历史消息硬扛

所以这条路线的目标不是“重造终端”，而是在现有 agent-cli 之上补一层**会话窗口管理**。

---

## V1 结论

### 先做什么

- 先做 `tab` 模式
- 再做 `pane` 模式
- 再接 `subagent live view`

### 为什么先做 `tab`

- `tab` 更贴近“同一 session 下多个任务窗口”的核心需求
- `tab` 对现有 CLI 渲染和输入焦点影响更小
- `tab` 容易先保住 transcript、todo、模型状态和窗口标题
- `pane` 会更早碰到复杂的布局、滚动、焦点、日志刷屏与窗口尺寸问题
- `subagent` 视图第一阶段并不一定需要真分屏，很多信息可以先挂在 tab 级状态卡片里

### V1 不做什么

- 不追求完整 zellij 平铺分屏
- 不做任意拖拽布局
- 不做无限窗口类型
- 不在第一版里把每个 subagent 都渲染成独立实时 pane

---

## 目标

### 用户目标

- 在一个 session 内同时保留多个任务上下文
- 快速切换“主线程写码 / review / 搜索 / 总结”窗口
- 不因为切换窗口就丢失各自 transcript 与 todo 状态
- 在未来 subagent 模式下，能看出不同 agent 在忙什么

### 工程目标

- 不破坏现有单窗口交互
- 不破坏现有 transcript、compact、resume、model switch 主链路
- 为未来 pane 和 subagent 视图预留稳定数据结构

---

## 真实场景

### 场景 1：同 session 分任务

- Tab 1：主线程写码
- Tab 2：review 变更
- Tab 3：搜索资料 / 汇总结论

### 场景 2：模型策略分流

- Tab 1：强模型负责修改方案
- Tab 2：快模型负责日志总结
- Tab 3：便宜模型负责批量整理

### 场景 3：未来 subagent 可见性

- Tab 1：主线程总控
- Tab 2：subagent A 在仓库 A 做实现
- Tab 3：subagent B 在仓库 B 做 review

---

## 快捷键方案 V1

设计原则：

- 借鉴 zellij 的“先进入窗口管理心智，再做动作”
- 尽量不和现有文本输入冲突
- 第一版尽量使用终端里更稳的组合键

### 推荐方案

- `Ctrl+g`：进入窗口管理前缀模式
- `Ctrl+g c`：新建 tab
- `Ctrl+g n`：切到下一个 tab
- `Ctrl+g p`：切到上一个 tab
- `Ctrl+g 1-9`：按编号切换 tab
- `Ctrl+g r`：重命名当前 tab
- `Ctrl+g x`：关闭当前 tab
- `Ctrl+g l`：打开 tab 列表
- `Ctrl+g s`：切换 subagent 状态面板

### 备选映射

- `Alt+1-9`：快速切换 tab
- `Alt+n` / `Alt+p`：顺序切换 tab

### 不建议第一版直接采用的键位

- `Ctrl+b`
  - 容易和 tmux 习惯冲突
- `Ctrl+a`
  - 容易和终端行首操作冲突
- 纯字母热键
  - 容易污染正常提示词输入

---

## 数据结构 V1

### 核心拆分

应明确拆成两层：

- `SessionState`
- `TabState`

### SessionState 建议字段

```ts
type SessionState = {
  sessionId: string
  activeTabId: string
  tabOrder: string[]
  tabs: Record<string, TabState>
  createdAt: string
  updatedAt: string
  layoutMode: "single" | "tabs" | "panes"
}
```

### TabState 建议字段

```ts
type TabState = {
  id: string
  title: string
  kind: "main" | "task" | "review" | "search" | "subagent"
  transcriptId: string
  todoSnapshotId?: string
  model?: string
  provider?: string
  worktreePath?: string
  repoLabel?: string
  status: "idle" | "running" | "waiting" | "error"
  subagentId?: string
  createdAt: string
  updatedAt: string
  unreadCount?: number
}
```

### 为什么这样拆

- session 负责“谁是当前焦点”和“窗口顺序”
- tab 负责“这个窗口里到底是什么任务、谁在执行、用什么模型”
- 未来要接 pane，也可以继续复用 `TabState`，只是在 layout 层挂更多容器信息

### 状态持久化建议

- 先复用现有 session metadata 存储体系
- 新增 `tabState` 段，而不是重写整个 session schema
- transcript 继续按现有消息机制存，tab 只做引用关系

---

## UI 信息层 V1

### 顶部主导航层

第一层显示：

- 当前 session 名称
- 当前 tab 列表
- 当前激活 tab
- 当前 tab 的模型 / provider / 状态

示例：

```text
[Main* sonnet] [Review glm-5] [Search minimax] [+]
```

### 次级状态栏

第二层显示当前 tab 的关键信息：

- tab 类型
- 当前模型
- 当前 provider
- 当前仓库 / 工作目录
- 是否绑定 subagent
- 当前状态：运行中 / 等待中 / 错误

### subagent 面板层

默认折叠，按快捷键展开。

展示：

- subagent 名称
- 所在仓库
- 工作目录
- 当前任务摘要
- 最近一条进度
- 运行状态

### 为什么这样分层

- 顶部 tab 行解决“我现在在哪个窗口”
- 次级状态栏解决“这个窗口在干什么”
- subagent 面板解决“是谁在干活、在哪干、干到哪一步”

---

## Tab 与 Pane 的优先级判断

### 第一阶段：Tab

应优先交付：

- 新建 / 切换 / 重命名 / 关闭
- tab 级 transcript 保持
- tab 级模型状态保持
- tab 级任务类型显示

### 第二阶段：Pane

在 tab 稳定后，再考虑：

- 左右分屏
- 上下分屏
- 固定 pane 挂 subagent 日志
- pane 间焦点切换

### 第三阶段：Subagent Live View

当 subagent 体系更稳定后，再做：

- 按 tab 聚合 subagent
- 按仓库 / agent 类型筛选
- 主线程与 subagent 的状态联动
- 子任务完成 / 失败提醒

---

## V1 交付边界

### 必须有

- tab 数据结构
- tab 列表 UI
- tab 快捷键
- tab 级 transcript / 状态保持
- tab 级模型与 provider 显示

### 可以后补

- tab 模板
- tab 搜索
- tab 分组
- 未读计数
- subagent 详情展开

### 暂不做

- pane 布局编辑器
- 拖拽重排
- 多行复杂状态仪表板

---

## 推荐实施顺序

1. 先补 session 内 `tabState` 数据模型。
2. 再补顶部 tab UI 和切换动作。
3. 然后把 transcript / todo / model 状态绑定到 tab。
4. 再补快捷键和 tab 管理动作。
5. 最后补 subagent 状态面板的占位与数据接口。

---

## 开发任务清单 V1

### Phase 1：状态层改造

- [x] 为 session metadata 增加 `activeTabId`
- [x] 为 session metadata 增加 `tabOrder`
- [x] 为 session metadata 增加 `tabs` 映射
- [x] 新增 `sessionTabs`、`SessionTabState`、`SessionTabsMetadata` 基础类型
- [ ] 为 tab 增加 `title`、`kind`、`transcriptId`、`model`、`provider`
- [ ] 为 tab 增加 `status`、`repoLabel`、`worktreePath`
- [ ] 兼容旧 session：无 tab 数据时自动落回单窗口模式

### Phase 2：Tab UI

- [ ] 顶部增加 tab 行
- [ ] 高亮当前激活 tab
- [ ] 支持显示 tab 标题、模型、provider、运行状态
- [ ] 支持显示 `+` 新建入口
- [ ] 当 tab 过多时支持滚动或折叠展示

### Phase 3：Tab 行为

- [ ] 新建 tab
- [ ] 切换 tab
- [ ] 重命名 tab
- [ ] 关闭 tab
- [ ] 关闭最后一个任务 tab 时保留主窗口 tab

### Phase 4：状态绑定

- [ ] transcript 与 tab 绑定
- [ ] todo snapshot 与 tab 绑定
- [ ] model/provider 状态与 tab 绑定
- [ ] 当前工作目录与 tab 绑定
- [ ] tab 切换后恢复对应输入上下文

### Phase 5：快捷键

- [ ] 增加窗口管理前缀模式
- [ ] 接入 `Ctrl+g c / n / p / r / x / l / s`
- [ ] 为 `Alt+1-9` 预留快速跳转能力
- [ ] 给冲突按键补降级方案

### Phase 6：Subagent 面板占位

- [ ] 增加可折叠 subagent 面板
- [ ] 面板支持显示 subagent 名称、仓库、目录、任务、状态
- [ ] 面板支持显示最近一条进度摘要
- [ ] 未接入真实 subagent 前先支持占位数据结构

### Phase 7：验证与发布

- [ ] 覆盖单窗口旧 session 的回归验证
- [ ] 覆盖多 tab 新 session 的切换验证
- [ ] 覆盖 tab 与 `/model`、`/show` 共存验证
- [ ] README 与 roadmap 打钩同步
- [ ] CHANGELOG、Release、GitHub Pages 文档同步

---

## 对 README / 路线图的要求

- README 顶部保留这条需求，直到 tab 模式真正完成
- 路线图里把“设计稿完成”和“实现完成”拆成两个不同打钩项
- 后续若开始编码，应把 V1 先映射到具体版本计划，而不是只留在长期路线图
