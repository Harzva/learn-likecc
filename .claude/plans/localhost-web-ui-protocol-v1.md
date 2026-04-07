# localhost Web UI 读取协议 V1

## 目标

为 Like Code 的 `localhost Web UI` 定义第一版读取协议，让 Web UI 能稳定读取：

- session 列表
- pane / tab 列表
- transcript 结构化消息
- tool / subagent / model-switch 时间线
- todo / task lane 摘要

第一版先做“观察台协议”，不急着做完整写入协议。

---

## 设计原则

- 先读，后写
- 先本地，后远程
- 先结构化摘要，后复杂联动
- 尽量复用 CLI 已有状态与 session metadata

---

## 协议分层

### Layer 1：Session Index

提供：

- session id
- 标题
- 当前模型 / provider
- 当前活动 pane
- 是否有运行中的 subagent
- 最近更新时间

建议形状：

```json
{
  "sessions": [
    {
      "id": "session-123",
      "title": "Like Code workspace",
      "activePaneId": "main",
      "model": "z-ai/glm-5",
      "provider": "z-ai",
      "hasRunningSubagents": false,
      "updatedAt": "2026-04-07T12:00:00.000Z"
    }
  ]
}
```

### Layer 2：Session Detail

提供：

- pane / tab 列表
- layout mode
- 当前活动 pane
- pane 的 transcript / todo / task 摘要

建议形状：

```json
{
  "session": {
    "id": "session-123",
    "layoutMode": "panes",
    "activePaneId": "tab-abc",
    "panes": [
      {
        "id": "main",
        "title": "Main",
        "model": "z-ai/glm-5",
        "provider": "z-ai",
        "status": "idle",
        "transcriptId": "main",
        "todoLaneId": "lane-main",
        "taskSummary": "idle",
        "draftPreview": "继续完成模型切换…"
      }
    ]
  }
}
```

### Layer 3：Transcript Feed

提供：

- 用户消息
- assistant 消息
- tool use
- tool result
- system message
- model switch breadcrumb

建议形状：

```json
{
  "paneId": "main",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "kind": "message",
      "text": "继续完成模型切换",
      "createdAt": "2026-04-07T12:00:00.000Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "kind": "tool_use",
      "toolName": "Bash",
      "summary": "Inspecting model route config"
    }
  ]
}
```

### Layer 4：Event Timeline

提供：

- tool 调用
- tool 结束
- subagent 启停
- provider / model 切换
- todo 变化
- pane 激活切换

建议形状：

```json
{
  "sessionId": "session-123",
  "events": [
    {
      "id": "evt-1",
      "type": "pane_focus",
      "paneId": "main",
      "createdAt": "2026-04-07T12:00:00.000Z"
    },
    {
      "id": "evt-2",
      "type": "model_switch",
      "paneId": "main",
      "fromModel": "claude-sonnet-4-5",
      "toModel": "z-ai/glm-5",
      "reason": "user-selected"
    }
  ]
}
```

---

## 第一版建议来源

### 可直接复用

- session metadata
- `sessionTabs`
- transcript message array
- `legacyTodosSnapshot`
- `taskPreviewLines`
- `taskPreviewSummary`
- slash command / tool 结果消息

### 需要额外补充的事件

- pane focus 事件
- provider route 命中事件
- model switch reason
- subagent progress summary

---

## 传输方式建议

### V1 推荐

- 本地只读 HTTP
- 只开 `localhost`
- CLI 侧暴露轻量状态接口

推荐入口：

- `GET /api/sessions`
- `GET /api/sessions/:id`
- `GET /api/sessions/:id/panes/:paneId/messages`
- `GET /api/sessions/:id/events`

### 为什么不先直接读文件

- session 数据并不只在单一文件里
- 运行态状态很多在内存中
- HTTP 层更容易给 Web UI 留演进空间

---

## 页面信息架构

### 左列：Sessions

- 当前可见 session
- 标题
- 当前模型 / provider
- 是否有运行中的 subagent

### 中列：Panes

- pane 标题
- pane 状态
- transcript / todo / task 摘要
- 当前是否 active

### 主视图：Transcript

- 结构化消息卡片
- tool use / tool result 分段
- model switch 标记
- retry / error / compact 边界

### 右列：Timeline / Inspector

- tool 时间线
- subagent 状态
- provider route 命中记录
- todo 变化摘要

---

## 第二版扩展

- Web UI 控制层
- pane 联动选择
- 流程图
- 子代理监控面板
- 回放模式

---

## 当前结论

- CLI 继续做最小可用验证
- Web UI 先做读取与展示
- 读取协议先保证“结构清楚”，再考虑“控制能力”
