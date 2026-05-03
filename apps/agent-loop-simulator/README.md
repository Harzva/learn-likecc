# Agent Loop 动态模拟器

面向 Learn LikeCode 站点的交互式前端演示，用 12 个步骤回放一次 Agent 从用户输入到最终回答的完整循环。

## 内容

- 左侧序列图：展示 LLM API、Agent Runtime、Tools 之间的消息流转。
- 右侧终端：同步回放输入、模型思考、工具调用、工具结果和最终回答。
- 底部控制栏：支持上一步、下一步、重播和任意步骤跳转。
- 消息详情弹窗：点击序列图消息可查看 mock prompt / JSON payload。
- 延伸章节：补充 Agent 循环、工具系统、命令目录和扩展能力说明。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Radix UI / shadcn 风格组件

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物会输出到 `dist/`。

## 部署到 learn-likecc GitHub Pages

推荐放入 `Harzva/learn-likecc` 仓库：

```text
learn-likecc/
├── apps/
│   └── agent-simulator/
└── site/
    └── simulator/
```

短期可以先手动构建并复制产物：

```bash
cd apps/agent-simulator
npm install
npm run build
```

然后把 `dist/` 目录里的内容复制到 `site/simulator/`，发布后访问：

```text
https://harzva.github.io/learn-likecc/simulator/
```

当前 `vite.config.ts` 使用 `base: './'`，适合 GitHub Pages 子目录部署。
