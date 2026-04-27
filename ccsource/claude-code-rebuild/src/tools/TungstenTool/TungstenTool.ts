/**
 * Tungsten tool stub - not implemented
 */

import type { Tool } from '../../Tool.js'

export const TungstenTool: Tool = {
  name: 'Tungsten',
  description: 'Tungsten tool (stub)',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async call() {
    throw new Error('Tungsten tool not implemented in stub')
  },
}

export default TungstenTool