# Memory 长期记忆：写入、整合、检索与安全
> **更新时间**: 2026-04-12

> **在线页面**: https://harzva.github.io/learn-likecc/topic-memory-harness.html  
> **本文件**: `site/md/topic-memory-harness.md`  
> **仓库完整稿（与专题同源）**: `wemedia/zhihu/articles/13-Memory长期记忆-写入检索与安全.md`

## 概要

梳理 Claude Code 类 **Harness** 如何把长期记忆落成 **Markdown + 索引 + YAML 元数据**：分阶段写入、定期整合、用独立模型筛选待读文件、沙箱约束写路径。下图与正文为**教学示意**，细节以官方文档与当前产品为准。

## 目录（对照 HTML）

- **导语**：定位与免责声明
- **1. 写入（阶段一）** + Mermaid
- **四种 type** + Mermaid
- **MEMORY.md 与单文件示例**
- **2. 阶段二：定期整合** + Mermaid
- **3. 删除哲学**
- **4. 检索** + Mermaid
- **5. 安全三层** + Mermaid
- **6. Harness 四条纪律**

---

## 1. 阶段一：逐轮写入（Mermaid）

```mermaid
flowchart TD
    A[后台 Agent 浏览最近 N 条消息] --> B[接收现有记忆 避免重复创建]
    B --> Q{值得记住?}
    Q -->|否| S[跳过]
    Q -->|是| F{新建或更新?}
    F -->|新建| N[新建 .md 记忆文件]
    F -->|更新| U[更新已有文件]
    N --> I[写入 MEMORY.md 索引]
    U --> I
```

## 四种记忆类型

```mermaid
flowchart TD
    ROOT[type / frontmatter] --> U[用户 user]
    ROOT --> PR[项目 project]
    ROOT --> FB[反馈 feedback]
    ROOT --> RF[参考 ref]
```

## 阶段二：整合

```mermaid
flowchart TD
    T{距上次整合≥24h 且 会话≥5?}
    T -->|否| X[不触发]
    T -->|是| SA[分叉子 Agent]
    SA --> R1[读 MEMORY.md 与主题文件]
    R1 --> R2[关键词从日志/会话取信号]
    R2 --> MG[合并 日期与事实校正]
    MG --> PRU[修剪 索引与矛盾]
    PRU --> D[完成]
```

## 检索与陈旧提示

```mermaid
flowchart TD
    IDX[MEMORY.md 恒入提示 有上限] --> SCAN[扫描 frontmatter 列表]
    SCAN --> SON[独立模型选 Top5]
    SON --> LOAD[载入正文]
    LOAD --> ST{早于约1天?}
    ST -->|是| WARN[陈旧警告 先验证]
    ST -->|否| OK[可参考]
```

## 安全三层

```mermaid
flowchart LR
    L1[全局锁定路径] --> L2[路径校验]
    L2 --> L3[沙箱白名单]
    L3 --> W[安全写入]
```

## MEMORY.md 与 frontmatter 示例

见网页版代码块；知乎稿与本文同源。

## 各节摘要（对照 HTML）

### 写入

逐轮判定「值不值得记」→ 新建/更新文件 → 维护 `MEMORY.md` 单行索引。

### 整合

子 Agent 合并、去矛盾、修剪；用锁避免并发写乱。

### 删除

无简单按天过期；删除发生在整合时的显式判断。

### 检索

索引常载；正文由便宜模型筛 Top5；`description` 质量决定召回；旧记忆带验证提示。

### 安全

路径全局配置 + 校验 + 白名单，防借记忆越权写。

### 总结

写入格式锁死、检索独立、删除不静默、过时靠警告与验证——Harness 不信任无监督自管记忆。
