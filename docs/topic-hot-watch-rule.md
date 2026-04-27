# topic-hot-watch-rule.md

针对页面：

- `/site/topic-hot-watch.html`
- `/site/md/topic-hot-watch.md`

这份文件只给维护者使用，不进入站点正文，不作为公开页面的一部分。

## 维护目标

- 把 `topic-hot-watch` 维持成站内的热点 intake 层
- 先聚合，再路由，再决定是否升级成长文
- 避免把页面写成开发日志、抓取日志或运维说明页

## 维护规则

1. 先改 `site/data/hot-topic-sources.json`，不要把新源只写进文案里。
2. 运行 `python3 tools/fetch_hot_topic_sources.py --write` 刷新本地快照。
3. 新增源后，先判断它属于 `discovery digest`、`independent RSS` 还是 `official blog RSS`，再决定默认 route hints，不要把所有 RSS 当成同一类。
4. 如果来源池或路由逻辑有明显变化，同步更新 `topic-hot-watch`、`topic-agent-hot`、`topic-rag-hot` 等对应热点页。
5. 如果某条热点足够重要，再交给 `keyword-site-topic` 做深一层的站内稿件。

## 页面边界

- 页面正文只保留：
  - 这页做什么
  - 来源池
  - 当前热点摘要
  - 路由规则
- 不把以下内容直接挂进 HTML：
  - 维护 checklist
  - 抓取命令流水
  - 调试说明
  - 开发日志口吻

## 文案要求

- 页面像专题入口，不像运维面板
- 页面像内容路由页，不像开发日志
- 少写“这轮新增了什么”“这次又修了什么”这类开发过程描述
- 对外只解释结构和用途，不展开维护细节

## 后续扩展

- 新增来源时，优先补 `site/data/hot-topic-sources.json`
- 新增稳定 lane 时，先在这里更新规则，再决定要不要改公开页面文案
- 如果未来把这条线做成更强的 dashboard，也保持“规则文件”和“公开页面”分离
