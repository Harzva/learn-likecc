# Connector / Runtime / Daemon - CodeXLoop 架构专题

> **在线页面**: https://harzva.github.io/learn-likecc/topic-connector-runtime-daemon.html  
> **本文件**: `site/md/topic-connector-runtime-daemon.md`  
> **更新时间**: 2026-04-17

## 概要

这页专门解释 `CodeXLoop` 里最容易混掉的三层：

- `Connector`
- `Runtime`
- `Daemon`

核心结论是：

- `Connector` 负责平台协议与扫码登录
- `Runtime` 负责对外 API、状态查询和调度路由
- `Daemon` 负责长期循环和任务推进

所以“扫码接微信”不等于“直接把微信绑到 daemon”。

## 目录（对照 HTML）

- 为什么要把这三层单独讲清楚
- 三层角色：谁负责什么
- 从消息进来到任务推进，中间到底经过了什么
- 微信扫码接入到底属于哪一层
- 对 CodeXLoop 的直接要求

## 各节摘要

### 为什么单列

最容易混淆的三件事是：

- 扫码登录
- API 服务
- 后台循环

所以这页的任务就是把“扫码”“接线”“执行”拆开。

### 三层角色

- `Connector`：电话线路 / 渠道网关
- `Runtime`：前台 / API 调度台
- `Daemon`：后台执行引擎

每层都应该清楚自己负责什么，也清楚自己不该承担什么。

### [插图提示词]

用途：画 CodeXLoop 的 Connector / Runtime / Daemon 三层协作图。  
形式：三层消息流图。  
提示词：左侧放外部平台（WeChat, Feishu, Telegram），第一层是 Connector（QR auth, session identity, inbound/outbound adapter），第二层是 Runtime（API router, webhook intake, task/thread/workspace router），第三层是 Daemon（loop scheduler, plan reader, evolution writer, publish actions），箭头从左到右贯穿，并在底部补一条 workspace shell UI 控制面。  
Mermaid 更适合：是。

### 微信扫码属于哪层

微信扫码绑定主要是两层合作：

- `Connector` 完成二维码登录、token/account 持久化、长轮询
- `Runtime` 提供 `start qr / wait qr` 一类 API，并把结果暴露给 UI

而 `Daemon` 仍然主要负责长期任务推进，不应该直接承担扫码登录流程。

### 对 CodeXLoop 的直接要求

建议顺序：

1. 先把 `connector shell` 做稳
2. 再做 `QR auth flow`
3. 最后做 `conversation bridge`

## 参考与原始链接

- `reference/reference_ai_scientist/DeepScientist/docs/zh/10_WEIXIN_CONNECTOR_GUIDE.md`
- `reference/reference_ai_scientist/DeepScientist/src/deepscientist/daemon/app.py`
- `reference/reference_ai_scientist/DeepScientist/src/deepscientist/connector/weixin_support.py`
- `reference/reference_ai_scientist/DeepScientist/src/ui/src/components/settings/ConnectorSettingsForm.tsx`
- `docs/connector-runtime-daemon-design.md`
