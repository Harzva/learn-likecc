/**
 * Monitor tool stub - not implemented
 */

import type { Tool } from '../../Tool.js'

export const MonitorTool: Tool = {
  name: 'Monitor',
  description: 'Monitor tool (stub)',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async call() {
    throw new Error('Monitor tool not implemented in stub')
  },
}

export default MonitorTool
