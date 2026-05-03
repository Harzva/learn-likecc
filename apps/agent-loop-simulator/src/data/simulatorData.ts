export interface SequenceMessage {
  step: number;
  type: 'STDIN' | 'REQUEST' | 'ASSISTANT' | 'LOOP' | 'TOOL_RESULT';
  text: string;
  source: 'llm-api' | 'agent-runtime' | 'tools';
  target: 'llm-api' | 'agent-runtime' | 'tools' | 'self';
}

export const sequenceMessages: SequenceMessage[] = [
  { step: 1, type: 'STDIN', text: 'Agent Runtime 收到用户输入', source: 'agent-runtime', target: 'self' },
  { step: 2, type: 'REQUEST', text: 'Agent Runtime 向模型发起 API 请求（一次调用）', source: 'agent-runtime', target: 'llm-api' },
  { step: 3, type: 'ASSISTANT', text: '模型返回首轮响应（text + tool_use × 2）', source: 'llm-api', target: 'agent-runtime' },
  { step: 3, type: 'LOOP', text: 'Agent Runtime 切入工具执行循环', source: 'agent-runtime', target: 'self' },
  { step: 4, type: 'TOOL_RESULT', text: '工具结果 → 新的 user turn', source: 'tools', target: 'agent-runtime' },
  { step: 5, type: 'REQUEST', text: 'Agent Runtime 发起第二轮 API 请求（携带工具结果）', source: 'agent-runtime', target: 'llm-api' },
  { step: 6, type: 'ASSISTANT', text: '模型返回第二轮响应（Read 工具调用）', source: 'llm-api', target: 'agent-runtime' },
  { step: 7, type: 'TOOL_RESULT', text: 'Read 结果返回 Agent Runtime', source: 'tools', target: 'agent-runtime' },
  { step: 8, type: 'REQUEST', text: 'Agent Runtime 发起第三轮 API 请求（携带 Read 结果）', source: 'agent-runtime', target: 'llm-api' },
  { step: 9, type: 'ASSISTANT', text: '模型返回第三轮响应（Edit 工具调用）', source: 'llm-api', target: 'agent-runtime' },
  { step: 10, type: 'TOOL_RESULT', text: 'Edit 结果返回 Agent Runtime', source: 'tools', target: 'agent-runtime' },
  { step: 11, type: 'REQUEST', text: 'Agent Runtime 发起第四轮 API 请求（携带 Edit 结果）', source: 'agent-runtime', target: 'llm-api' },
  { step: 12, type: 'ASSISTANT', text: '模型生成最终文本回答（end_turn）', source: 'llm-api', target: 'agent-runtime' },
];

export const messageColors: Record<SequenceMessage['type'], { bg: string; border: string; tag: string; arrow: string }> = {
  STDIN: { bg: '#fff7ed', border: '#fdba74', tag: '#c2410c', arrow: '#fb923c' },
  REQUEST: { bg: '#ffedd5', border: '#ea580c', tag: '#c2410c', arrow: '#ea580c' },
  ASSISTANT: { bg: '#eef2ff', border: '#6366f1', tag: '#4f46e5', arrow: '#6366f1' },
  LOOP: { bg: '#fef3c7', border: '#f59e0b', tag: '#b45309', arrow: '#f59e0b' },
  TOOL_RESULT: { bg: '#ecfdf5', border: '#22c55e', tag: '#15803d', arrow: '#22c55e' },
};

export interface TerminalItem {
  step: number;
  type: string;
  content: unknown;
}

export const stepLabels = [
  '准备就绪',
  '用户输入提示词',
  '组装系统提示词并发起请求',
  '模型响应：并行调用 Glob + Grep 搜索文件',
  '工具执行：Glob + Grep 返回搜索结果',
  '第二轮请求：工具结果打包发给模型',
  '模型返回第二轮响应（调用 Read 读取文件）',
  '工具执行：Read 返回 UserAvatar.tsx 内容',
  '第三轮请求：携带 Read 结果发给模型',
  '模型返回第三轮响应（调用 Edit 修改文件）',
  '工具执行：Edit 成功修改 className',
  '第四轮请求：携带 Edit 结果发给模型',
  '模型生成最终回答（end_turn）· Loop 退出',
];

export const thinkingWords = [
  'Brewing...',
  'Contemplating...',
  'Vibing...',
  'Meditating...',
  'Noodling...',
  'Pondering...',
  'Thinking...',
];

export const agentLoopSteps = [
  { label: 'Input', title: '用户输入', desc: '用户在终端输入提示词，Agent Runtime 通过 stdin 读取输入。', file: 'src/commands/start.ts', code: 'const userInput = await readInput();' },
  { label: 'Message', title: '构建消息', desc: '将用户输入封装为 Message 对象，标记角色为 user。', file: 'src/messages.ts', code: 'const message: Message = { role: "user", content: input };' },
  { label: 'History', title: '加载历史', desc: '从会话存储中加载之前的对话历史，构建完整上下文。', file: 'src/history.ts', code: 'const history = await loadHistory(sessionId);' },
  { label: 'System', title: '系统提示词', desc: '读取并组装系统提示词，包含工具定义和行为规范。', file: 'src/system-prompt.ts', code: 'const systemPrompt = buildSystemPrompt(tools);' },
  { label: 'API', title: 'API 请求', desc: '使用组装好的提示词和历史记录，向模型 API 发起请求。', file: 'src/api/client.ts', code: 'const response = await modelApi.call({ messages, system });' },
  { label: 'Tokens', title: 'Token 处理', desc: '流式接收响应 token，实时解析内容块。', file: 'src/streaming.ts', code: 'for await (const chunk of response.stream) { ... }' },
  { label: 'Tools?', title: '工具判断', desc: '检测响应中是否包含 tool_use 块，决定进入工具循环。', file: 'src/tool-detector.ts', code: 'if (hasToolCalls(response)) { enterToolLoop(); }' },
  { label: 'Loop', title: '工具循环', desc: '执行工具调用，将结果打包为新的 user turn，重新发起请求。', file: 'src/loop.ts', code: 'while (hasToolCalls()) { executeTools(); reRequest(); }' },
  { label: 'Render', title: '渲染输出', desc: '将模型的文本响应渲染到终端，支持流式输出。', file: 'src/render.ts', code: 'await renderStreamingText(response.text);' },
  { label: 'Hooks', title: 'Hook 执行', desc: '触发 after_request hook，记录日志和更新状态。', file: 'src/hooks.ts', code: 'await runHooks("after_request", context);' },
  { label: 'Await', title: '等待输入', desc: '一轮交互完成，等待用户下一次输入。', file: 'src/main.ts', code: 'await waitForNextInput();' },
];

export const toolCategories = [
  { name: '文件操作', tools: ['FileRead', 'FileEdit', 'FileWrite', 'Glob', 'Grep', 'NotebookEdit'] },
  { name: '代码执行', tools: ['Bash', 'PowerShell', 'REPL'] },
  { name: '搜索 & 抓取', tools: ['WebBrowser', 'WebFetch', 'WebSearch', 'ToolSearch'] },
  { name: 'Agent & 任务', tools: ['Agent', 'SendMessage', 'TaskCreate', 'TaskGet', 'TaskList', 'TaskUpdate', 'TaskStop', 'TaskOutput', 'TeamCreate', 'TeamDelete', 'ListPeers'] },
  { name: '规划模式', tools: ['EnterPlanMode', 'ExitPlanMode', 'EnterWorktree', 'ExitWorktree', 'VerifyPlanExecution'] },
  { name: 'MCP', tools: ['mcp', 'ListMcpResources', 'ReadMcpResource', 'McpAuth'] },
  { name: '系统', tools: ['AskUserQuestion', 'TodoWrite', 'Skill', 'Config', 'RemoteTrigger', 'CronCreate', 'CronDelete', 'CronList', 'Snip', 'Workflow', 'TerminalCapture'] },
  { name: '实验性', tools: ['Sleep', 'SendUserMessage', 'StructuredOutput', 'LSP', 'SendUserFile', 'PushNotification', 'Monitor', 'SubscribePR'] },
];

export const commandCategories = [
  { name: '设置 & 配置', commands: ['/init', '/login', '/logout', '/config', '/permissions', '/model', '/theme', '/terminal-setup', '/doctor', '/onboarding', '/mcp', '/hooks'] },
  { name: '日常工作流', commands: ['/compact', '/memory', '/context', '/plan', '/resume', '/session', '/files', '/add-dir', '/copy', '/export', '/summary', '/clear', '/brief', '/output-style', '/color', '/vim', '/keybindings', '/skills', '/tasks', '/agents', '/fast', '/effort', '/extra-usage', '/rate-limit-options'] },
  { name: '代码审查 & Git', commands: ['/review', '/commit', '/commit-push-pr', '/diff', '/pr_comments', '/branch', '/issue', '/security-review', '/autofix-pr', '/share', '/install-github-app', '/install-slack-app', '/tag'] },
  { name: '调试 & 诊断', commands: ['/status', '/stats', '/cost', '/usage', '/version', '/feedback', '/think-back', '/thinkback-play', '/rewind', '/ctx_viz', '/debug-tool-call', '/perf-issue', '/heapdump', '/ant-trace', '/backfill-sessions', '/break-cache', '/bridge-kick', '/mock-limits', '/oauth-refresh', '/reset-limits', '/env', '/bughunter', '/passes'] },
  { name: '高级 & 实验性', commands: ['/advisor', '/ultraplan', '/remote-control', '/teleport', '/voice', '/desktop', '/chrome', '/mobile', '/sandbox', '/plugin', '/reload-plugins', '/web-setup', '/remote-env', '/ide', '/stickers', '/good-agent', '/btw', '/upgrade', '/release-notes', '/rename', '/privacy-settings', '/help', '/exit'] },
];

export const hiddenFeatures = [
  { title: 'Session Memory', desc: '在会话之间保留摘要、偏好和工作区上下文，减少重复说明。' },
  { title: 'Background Run', desc: '将长任务放到后台执行，并通过状态面板持续观察进度。' },
  { title: 'Planning Mode', desc: '把复杂需求拆成可验证的阶段计划，再逐步执行和回放。' },
  { title: 'Coordinator Mode', desc: '主 Agent 将任务拆解，在独立 worktree 中并行派遣工作 Agent，汇总结果。' },
  { title: 'Remote Bridge', desc: '从手机或浏览器远程观察会话，并保留关键权限确认节点。' },
  { title: 'Tool Timeline', desc: '按时间线展示每个 tool_use、progress 和 tool_result 的对应关系。' },
  { title: 'Multi-Session Inbox', desc: '多个 Agent 会话之间传递消息、交接上下文和任务状态。' },
  { title: 'Auto Review', desc: '会话结束后自动回顾做过的操作，整理变更、风险和下一步。' },
];

// Mock payload data for modal
export const mockPayloads: Record<string, string> = {
  STDIN: `{
  "type": "message",
  "role": "user",
  "content": "请调整个人中心用户头像为圆形",
  "timestamp": "2024-01-15T10:30:00Z"
}`,
  REQUEST: `{
  "model": "configured-model",
  "max_tokens": 20000,
  "system": "You are an agent runtime with tool access...",
  "messages": [
    { "role": "user", "content": "请调整个人中心用户头像为圆形" }
  ],
  "tools": ["Glob", "Grep", "Read", "Edit"],
  "stream": true
}`,
  ASSISTANT: `{
  "type": "message",
  "role": "assistant",
  "content": [
    { "type": "text", "text": "我来帮你调整头像为圆形..." },
    {
      "type": "tool_use",
      "id": "glob_01",
      "name": "Glob",
      "input": { "pattern": "**/{avatar,Avatar,profile,Profile}*.tsx" }
    },
    {
      "type": "tool_use",
      "id": "grep_01",
      "name": "Grep",
      "input": {
        "pattern": "avatar|头像",
        "glob": "**/*.tsx",
        "output_mode": "files_with_matches"
      }
    }
  ]
}`,
  LOOP: `{
  "state": "tool_loop",
  "pending_tools": ["glob_01", "grep_01"],
  "tool_results": [],
  "iteration": 1,
  "max_iterations": 20
}`,
  TOOL_RESULT: `{
  "tool_results": [
    {
      "tool_use_id": "glob_01",
      "content": [
        "app/components/profile/UserAvatar.tsx",
        "app/components/profile/ProfileCard.tsx",
        "app/components/profile/ProfileHeader.tsx"
      ]
    },
    {
      "tool_use_id": "grep_01",
      "content": [
        "app/components/profile/UserAvatar.tsx",
        "app/components/profile/ProfileCard.tsx",
        "app/profile/page.tsx"
      ]
    }
  ]
}`,
};
