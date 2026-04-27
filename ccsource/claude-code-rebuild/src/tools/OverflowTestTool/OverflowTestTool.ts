/**
 * Overflow test tool stub - not implemented
 */

import type { Tool } from '../../Tool.js'

export const OverflowTestTool: Tool = {
  name: 'OverflowTest',
  description: 'Overflow test tool (stub)',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async call() {
    throw new Error('Overflow test tool not implemented in stub')
  },
}

export default OverflowTestTool
