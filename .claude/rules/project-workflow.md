# 项目工作流程规则

## Git 提交规范

每次完成阶段性工作后提交：

```bash
git add .
git commit -m "阶段描述: 具体内容"
```

## 阶段划分

1. **init** - 项目初始化
2. **analyze** - 源码分析
3. **config** - 配置创建
4. **fix** - 问题修复
5. **learn** - 学习文档

## 文件组织

```
.claude/
├── plans/          # 计划和分析文档
│   ├── main.md     # 主计划
│   └── *.md        # 其他分析
├── rules/          # 项目规则
│   ├── reverse-engineering.md
│   ├── dependencies.md
│   └── workflow.md
└── memory/         # 持久记忆
    └── *.md
```

## 分析工作流程

1. 识别问题
2. 记录到 `.claude/plans/`
3. 创建规则到 `.claude/rules/`
4. 提交 git
5. 继续下一步

## 持续约束

1. 用户提出的新需求，必须同步更新到 plan
2. 没完成的事项，必须继续保留在 README 的 todo / roadmap
3. 只要影响用户可见功能，就检查 git、Pages、Release、CHANGELOG、版本号是否需要同步更新
