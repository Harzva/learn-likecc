/**
 * c02: Tool System 示例代码
 *
 * 最小化的工具系统实现
 * 基于 Claude Code 源码分析
 */

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ============================================
// 1. 工具构建器
// ============================================

type PermissionResult = 'allow' | 'ask' | 'deny'

interface ToolResult {
  output: string
  isError?: boolean
}

interface MinimalTool<TInput> {
  name: string
  description: string
  input_schema: Anthropic.Tool.InputSchema
  _inputSchema: z.ZodSchema<TInput>
  _execute: (params: TInput) => Promise<ToolResult>
  _hasPermission?: (params: TInput) => Promise<PermissionResult>
}

/**
 * 工具构建函数
 * 将 Zod Schema 转换为 Anthropic API 格式
 */
function buildTool<TInput>(def: {
  name: string
  description: string
  inputSchema: z.ZodSchema<TInput>
  execute: (params: TInput) => Promise<ToolResult>
  hasPermission?: (params: TInput) => Promise<PermissionResult>
}): MinimalTool<TInput> {
  return {
    name: def.name,
    description: def.description,
    input_schema: zodToJsonSchema(def.inputSchema),
    _inputSchema: def.inputSchema,
    _execute: def.execute,
    _hasPermission: def.hasPermission,
  }
}

/**
 * Zod Schema → JSON Schema 转换
 * (简化版，实际使用 zod-to-json-schema 库)
 */
function zodToJsonSchema(schema: z.ZodSchema): Anthropic.Tool.InputSchema {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    const properties: Record<string, any> = {}
    const required: string[] = []

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodTypeToJsonType(value as z.ZodTypeAny)
      if (!(value instanceof z.ZodOptional)) {
        required.push(key)
      }
    }

    return {
      type: 'object',
      properties,
      required,
    }
  }
  return { type: 'object', properties: {} }
}

function zodTypeToJsonType(zodType: z.ZodTypeAny): any {
  if (zodType instanceof z.ZodString) {
    return { type: 'string' }
  }
  if (zodType instanceof z.ZodNumber) {
    return { type: 'number' }
  }
  if (zodType instanceof z.ZodBoolean) {
    return { type: 'boolean' }
  }
  if (zodType instanceof z.ZodOptional) {
    return zodTypeToJsonType(zodType.unwrap())
  }
  return { type: 'string' }
}

// ============================================
// 2. 工具定义
// ============================================

// Echo 工具 - 无限制
const EchoTool = buildTool({
  name: 'echo',
  description: 'Echo the input text back',
  inputSchema: z.object({
    text: z.string().describe('Text to echo'),
  }),
  execute: async (params) => {
    return { output: params.text }
  },
  hasPermission: async () => 'allow',
})

// Bash 工具 - 需权限检查
const BashTool = buildTool({
  name: 'bash',
  description: 'Execute a bash command',
  inputSchema: z.object({
    command: z.string().describe('The bash command'),
  }),
  execute: async (params) => {
    const { execSync } = require('child_process')
    try {
      const output = execSync(params.command, {
        encoding: 'utf-8',
        timeout: 30000,
      })
      return { output: output || '(no output)' }
    } catch (error: any) {
      return { output: error.message, isError: true }
    }
  },
  hasPermission: async (params) => {
    // 简单的风险判断
    const dangerousCommands = ['rm', 'sudo', 'chmod', 'chown']
    const isDangerous = dangerousCommands.some(cmd =>
      params.command.startsWith(cmd)
    )
    return isDangerous ? 'ask' : 'allow'
  },
})

// Read 工具 - 只读操作
const ReadTool = buildTool({
  name: 'read',
  description: 'Read a file',
  inputSchema: z.object({
    file_path: z.string().describe('File path to read'),
  }),
  execute: async (params) => {
    try {
      const fs = require('fs')
      const content = fs.readFileSync(params.file_path, 'utf-8')
      return { output: content }
    } catch (error: any) {
      return { output: error.message, isError: true }
    }
  },
  hasPermission: async () => 'allow', // 读文件通常无限制
})

// ============================================
// 3. 工具注册表
// ============================================

class ToolRegistry {
  private tools: Map<string, MinimalTool<any>> = new Map()

  register(tool: MinimalTool<any>) {
    this.tools.set(tool.name, tool)
  }

  find(name: string): MinimalTool<any> | undefined {
    return this.tools.get(name)
  }

  list(): MinimalTool<any>[] {
    return Array.from(this.tools.values())
  }

  // 获取 Anthropic API 格式的工具列表
  getAnthropicTools(): Anthropic.Tool[] {
    return this.list().map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema,
    }))
  }
}

// ============================================
// 4. 工具执行器
// ============================================

interface ExecutionContext {
  autoApprove: boolean  // 是否自动批准
}

async function executeTool(
  tool: MinimalTool<any>,
  input: any,
  context: ExecutionContext
): Promise<Anthropic.ToolResultBlockParam> {
  // 1. Schema 验证
  const params = tool._inputSchema.parse(input)

  // 2. 权限检查
  if (tool._hasPermission) {
    const permission = await tool._hasPermission(params)
    if (permission === 'deny') {
      return {
        type: 'tool_result',
        tool_use_id: 'unknown',
        content: 'Permission denied',
        is_error: true,
      }
    }
    if (permission === 'ask' && !context.autoApprove) {
      console.log(`[Permission] Tool '${tool.name}' needs approval`)
      // 实际实现会等待用户输入
      // 这里简化为拒绝
      return {
        type: 'tool_result',
        tool_use_id: 'unknown',
        content: 'User approval required (auto-approve disabled)',
        is_error: true,
      }
    }
  }

  // 3. 执行
  console.log(`[Tool] ${tool.name}: ${JSON.stringify(params)}`)
  const result = await tool._execute(params)

  return {
    type: 'tool_result',
    tool_use_id: 'unknown',
    content: result.output,
    is_error: result.isError,
  }
}

// ============================================
// 5. Agent Loop with Tools
// ============================================

async function agentLoopWithTools(
  query: string,
  registry: ToolRegistry,
  context: ExecutionContext
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: query },
  ]

  const tools = registry.getAnthropicTools()

  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: tools,
      messages: messages,
      system: 'You have access to tools. Use them when needed.',
    })

    messages.push({
      role: 'assistant',
      content: response.content,
    })

    if (response.stop_reason !== 'tool_use') {
      const textBlock = response.content.find(b => b.type === 'text')
      return (textBlock as any)?.text || '(no response)'
    }

    // 执行所有工具调用
    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        const tool = registry.find(block.name)
        if (tool) {
          const result = await executeTool(tool, block.input, context)
          result.tool_use_id = block.id
          toolResults.push(result)
        } else {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: `Unknown tool: ${block.name}`,
            is_error: true,
          })
        }
      }
    }

    messages.push({
      role: 'user',
      content: toolResults,
    })
  }
}

// ============================================
// 6. 主程序
// ============================================

async function main() {
  // 创建工具注册表
  const registry = new ToolRegistry()
  registry.register(EchoTool)
  registry.register(BashTool)
  registry.register(ReadTool)

  // 执行上下文
  const context: ExecutionContext = {
    autoApprove: false, // 需要手动批准危险操作
  }

  // 测试查询
  const query = process.argv[2] || 'Echo "Hello, World!"'
  console.log(`[User] ${query}\n`)

  const result = await agentLoopWithTools(query, registry, context)
  console.log(`\n[Assistant] ${result}`)
}

main().catch(console.error)