# GitHub Actions 完全指南
> **更新时间**: 2026-04-29

## 30 秒上手

在项目根目录创建 `.github/workflows/your-workflow.yml`：

```yaml
name: CI
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Run a script
      run: echo "Hello, GitHub Actions!"
```

## 免费资源

- 2 核 CPU
- 7GB 内存
- 14GB SSD
- 2000 分钟/月（免费账户）

## 工作流结构

| 层级 | 说明 |
|---|---|
| Workflow | 顶层自动化流程 |
| Job | 同一运行器内的步骤组 |
| Step | 单个命令或 Action |
| Action | 可复用代码模块 |
| Runner | 执行作业的虚拟机 |

## 生命周期

1. 初始化：读取 YAML，创建运行实例
2. DAG 执行：根据 needs 构建依赖图
3. 顺序执行：Job 内 Step 串行
4. 产物与缓存：跨 Job 共享
5. 完成通知：Success / Failure / Cancelled

## 性能优化

- 并行化：删除多余 needs 依赖
- 缓存依赖：`actions/cache@v4`
- 构建产物复用：`upload-artifact` / `download-artifact`
- 矩阵策略：`strategy.matrix`
- 并发控制：`concurrency`

## CI Vitals 指标

| 指标 | 含义 |
|---|---|
| WET | Workflow Execution Time |
| NFR | Noise-to-Fix Ratio |
| POT | Pipeline Overhead Time |

## Docker 实战

每次推送到 main 分支，自动构建并推送带 commit hash 标签的 Docker 镜像。

## 进阶

- 密钥管理：GitHub Secrets
- 工作流复用：`workflow_call`
- 定时触发：`schedule.cron`
- 条件执行：`if` 表达式
