# 发布与需求跟踪规则

## 需求落盘规则

1. 用户提出的新需求，必须写进对应的 `.claude/plans/*.md`
2. 没有完成的需求，必须持续保留在 `README.md` 的 todo / roadmap 区
3. 做完的需求，必须在 plan 和 README 中同步打钩

## Git / Pages / Release 规则

1. 只要工作影响用户可见功能，就检查是否需要更新：
   - `README.md`
   - `CHANGELOG.md`
   - 版本号
   - Git tag
   - `site/` 或 Pages 对应文案

2. 提交 git 时：
   - 只提交与当前任务相关的文件
   - 不混入无关脏改动
   - 提交后说明本次 commit 的范围

3. Release 相关：
   - 版本号要与当前功能增量匹配
   - `CHANGELOG.md` 要能解释这次 release 做了什么
   - 若已创建 tag，要保证 tag 与版本号一致

## 本仓库传统

- 需求不只讨论，要进 plan
- 未完成不消失，要留在 todo
- 完成功能必须打钩
- Git / Pages / Release 属于默认工作流，不应每次都依赖用户重复提醒
