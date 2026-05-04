# Agent Trace Simulator

Interactive trace replay lab for Learn LikeCode.

It uses sanitized cc-route samples to show how Claude Code requests grow from system blocks, injected context, tool definitions, and user input.

## Commands

```bash
npm ci
npm run dev
npm run build
npm run lint
```

The Vite build uses relative asset paths, so `dist/` can be copied directly to `site/agent-trace-simulator/` for GitHub Pages.
