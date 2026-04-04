# long-term-check

检查并更新长期规划

## 使用方式

```
/long-term-check
```

## 任务

1. 读取 `.claude/plans/long-term-roadmap.md`
2. 检查 `reference/` 下三类参考：`reference_rag/`、`reference_agent/`、`reference_sourcemap/`（见 `reference/README.md`）
3. 对比当前项目状态与规划
4. 更新里程碑完成情况
5. 添加新的任务或方向

## 输出

- 更新后的 long-term-roadmap.md
- 列出需要关注的项目
