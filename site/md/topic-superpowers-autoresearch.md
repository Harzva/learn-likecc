# Superpowers 市场 vs Autoresearch（本站镜像）

> **在线页面**: https://harzva.github.io/learn-likecc/topic-superpowers-autoresearch.html  
> **本文件**: `site/md/topic-superpowers-autoresearch.md`  
> **知乎长文**: `wemedia/zhihu/articles/21-Superpowers市场与Autoresearch-Claude插件对比.md`

## 概要

基于本仓库 `reference/reference_agent/` 内 **vend 快照**（`superpowers-marketplace`、`autoresearch`）做结构对照：**市场目录多插件** vs **单一自主改进插件包**，避免把「Superpowers」与「Autoresearch」当成同类可替代产品。

## 证据路径（本仓库）

- `reference/reference_agent/superpowers-marketplace/.claude-plugin/marketplace.json`
- `reference/reference_agent/autoresearch/claude-plugin/.claude-plugin/plugin.json`
- `reference/reference_agent/autoresearch/claude-plugin/skills/autoresearch/SKILL.md`

## Mermaid（与网页同源 key）

### 货架 vs 单包

```mermaid
flowchart LR
    subgraph MP[Superpowers Marketplace]
        MJ[marketplace.json]
        MJ --> P1[superpowers 等]
        MJ --> P2[更多插件条目]
    end
    subgraph AR[autoresearch 单包]
        ONE[plugin + SKILL]
        ONE --> CMD[10 条斜杠命令]
    end
```

### Autoresearch 验证循环（简化）

```mermaid
flowchart TD
    A[读上下文与 git 与日志] --> B[一次一处改动]
    B --> C[commit]
    C --> D[Verify 得指标]
    D --> E{改进且 Guard?}
    E -->|是| F[保留]
    E -->|否| G[revert]
    F --> H[TSV 日志]
    G --> H
    H --> A
```

## 上游

- https://github.com/obra/superpowers-marketplace  
- https://github.com/uditgoenka/autoresearch  
