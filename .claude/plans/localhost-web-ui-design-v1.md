# localhost Web UI 工作台设计稿 V1

## 背景

CLI 这条线已经验证出价值：

- 同一个 session 里的多 tab / pane 是真实需求
- provider / model / todo / transcript 绑定是值得做的
- subagent 状态可见性确实会提升可理解性

但 CLI 也越来越接近它的表达边界：

- 一个终端天然只有一个键盘焦点
- 多滚动区、多输入区、多 transcript 同时交互很难自然
- 想把思考过程、工具调用、subagent、provider 切换结构化展示时，TUI 的表达力明显不如 Web UI

所以 Like Code 后续不该只押注 CLI，也应该并行探索一个 `localhost` 工作台。

---

## 产品判断

### CLI 继续负责什么

- 原生 Agent CLI 主流程
- 快速 tab / pane 验证
- 贴近 Claude Code 原使用习惯的最小可用能力
- 低开销的真实工作流试验

### Web UI 负责什么

- 更复杂的多窗格工作台
- transcript 的结构化展示
- tool / subagent / provider 事件时间线
- Claude 思考过程的卡片化展示
- 更强的状态联动、过滤、流程图与监控视图

### 结论

- CLI 不是被放弃，而是继续承担“最小可用验证”
- Web UI 则承担“高级工作台实验”

---

## V1 目标

第一版 `localhost Web UI` 不追求完整控制台替代，而是先做“更好的观察与理解界面”。

### 第一版先做

- session / pane 列表
- transcript 结构化展示
- tool / subagent 时间线
- model / provider 切换记录
- 思考过程卡片流

### 第二版再做

- 流程图
- 多窗格联动
- 子代理监控面板

---

## V1 页面结构

### 1. Session 列

展示：

- 当前 session 列表
- session 标题
- 当前模型 / provider
- 活跃 pane 数量
- 是否有运行中的 subagent

作用：

- 先解决“我现在在看哪个 session”
- 后续支持从 CLI 恢复 / attach 到某个 session

### 2. Pane 列

展示：

- 当前 session 下的 pane / tab 列表
- pane 标题
- 当前任务摘要
- model / provider
- todo 数量
- 当前状态：idle / running / waiting / error

作用：

- 先解决“这个 session 下有哪些任务窗口”
- 将来与 CLI 的 pane 状态形成一一对应

### 3. Transcript 主视图

展示：

- 结构化消息流
- 用户消息 / assistant 消息 / tool use / tool result 分块
- provider 与 model 切换点
- 失败 / 重试 / compact / resume 边界

作用：

- 不再只是终端输出回放
- 让 transcript 变成可以读、可以定位、可以解释的结构

### 4. 时间线视图

展示：

- tool 调用时间线
- subagent 启停与状态更新
- model / provider 切换时间点
- todo 变化

作用：

- 先解决“谁先发生、谁后发生”
- 为后续流程图打基础

### 5. 思考过程卡片流

展示：

- 当前阶段目标
- 最近一步推理摘要
- 工具选择原因
- 切模型原因
- 当前阻塞点

说明：

- 不追求暴露原始内部 chain-of-thought
- 目标是把用户可见、可解释、可复盘的 reasoning 摘要结构化展示出来

---

## 数据来源建议

### 复用现有来源

- session metadata
- transcript 消息流
- tool use / tool result
- task / subagent 状态
- model switch breadcrumb
- todo 快照

### 需要补的新事件

- pane 激活 / 切换事件
- provider 路由命中事件
- 切模型原因摘要
- subagent 任务进度摘要
- transcript 结构化分段索引

---

## V1 技术边界

### 不急着做

- Web UI 直接替代 CLI 输入
- 多用户远程协作
- 任意拖拽布局
- 复杂可视化编排器

### 先做对的

- 先读现有 session 数据
- 先做观察台，不强求控制台
- 先把信息结构设计清楚
- 再决定要不要把输入与控制也搬到 Web UI

---

## 与 CLI 的关系

不是二选一，而是分工：

- CLI：生产工作流
- Web UI：可视化工作台

短期建议：

1. CLI 继续补 pane transcript / todo 真隔离
2. Web UI 先做观察与理解层
3. 做完后再判断是否需要把“多活跃输入”转向 Web UI

---

## 第一版任务拆分

- [ ] 定义 Web UI 的 session / pane / event 读取协议
- [ ] 梳理 transcript 结构化展示的数据模型
- [ ] 定义 tool / subagent / model-switch 时间线事件模型
- [ ] 定义“思考过程卡片流”的用户可见字段
- [ ] 画出 localhost 工作台页面信息架构
- [ ] 评估是直接读本地状态文件，还是增加本地 bridge / HTTP 层

---

## 成功标准

- 用户能在 Web UI 一眼看出当前 session 下有哪些 pane
- 用户能读懂某个 pane 的 transcript、tool 时间线、provider 切换记录
- 用户能看出“谁在忙什么”，而不是只看到一长串终端文本
- 这套设计能反过来指导 CLI 到底该做到哪里、哪里该交给 Web UI
