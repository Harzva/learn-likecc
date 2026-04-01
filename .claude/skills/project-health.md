# project-health

项目健康检查

## 使用方式

```
/project-health
```

## 检查项目

1. CLI 运行状态
   ```bash
   cd ccsource/claude-code-main && bun src/entrypoints/cli.tsx --version
   ```

2. 网站可用性
   - 访问 https://harzva.github.io/learn-likecc/

3. GitHub Actions 状态
   - 检查最近的部署

4. Git 状态
   - 未提交的更改
   - 当前分支

## 输出

- 各项检查结果
- 发现的问题
- 建议修复措施
