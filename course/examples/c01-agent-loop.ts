/**
 * c01: Agent Loop 示例代码
 *
 * 这是一个最小化的 Agent Loop 实现
 * 基于 Claude Code 源码分析
 */

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// 工具定义
const TOOLS: Anthropic.Tool[] = [
  {
    name: 'bash',
    description: 'Execute a bash command',
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The bash command to execute',
        },
      },
      required: ['command'],
    },
  },
]

// 工具执行函数
async function executeBash(command: string): Promise<string> {
  const { execSync } = require('child_process')
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    })
    return output || '(no output)'
  } catch (error: any) {
    return `Error: ${error.message}`
  }
}

/**
 * 最小化 Agent Loop 实现
 */
async function agentLoop(query: string): Promise<string> {
  // 1. 初始化消息
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: query },
  ]

  // 2. Agent Loop
  while (true) {
    // 调用 LLM
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: TOOLS,
      messages: messages,
      system: 'You are a helpful assistant that can execute bash commands.',
    })

    // 追加助手响应
    messages.push({
      role: 'assistant',
      content: response.content,
    })

    // 检查退出条件
    if (response.stop_reason !== 'tool_use') {
      // 提取文本响应
      const textBlock = response.content.find(
        (block) => block.type === 'text'
      )
      return (textBlock as any)?.text || '(no response)'
    }

    // 执行工具调用
    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        console.log(`[Tool] ${block.name}: ${(block.input as any).command}`)

        let output: string
        if (block.name === 'bash') {
          output = await executeBash((block.input as any).command)
        } else {
          output = `Unknown tool: ${block.name}`
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: output,
        })
      }
    }

    // 追加工具结果
    messages.push({
      role: 'user',
      content: toolResults,
    })
  }
}

// 主函数
async function main() {
  const query = process.argv[2] || 'List all files in current directory'
  console.log(`[User] ${query}\n`)

  const result = await agentLoop(query)
  console.log(`\n[Assistant] ${result}`)
}

main().catch(console.error)