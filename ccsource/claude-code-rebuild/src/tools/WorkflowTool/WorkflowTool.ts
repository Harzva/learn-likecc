/**
 * WorkflowTool stub - not implemented
 */

import type { Tool } from '../../Tool.js'
import { WORKFLOW_TOOL_NAME } from './constants.js'

export const WorkflowTool: Tool = {
  name: WORKFLOW_TOOL_NAME,
  description: 'Workflow management tool (stub)',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  async call() {
    throw new Error('WorkflowTool not implemented in stub')
  },
}

export default WorkflowTool
