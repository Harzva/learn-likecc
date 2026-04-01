/**
 * Context collapse operations stub - not implemented
 */

export interface CollapseOperation {
  type: 'summarize' | 'remove' | 'compress'
  target: string
}

export function createCollapseOperation(
  _type: CollapseOperation['type'],
  _target: string
): CollapseOperation {
  return { type: _type, target: _target }
}

export async function executeCollapseOperation(
  _op: CollapseOperation
): Promise<void> {
  throw new Error('Collapse operation not implemented in stub')
}
