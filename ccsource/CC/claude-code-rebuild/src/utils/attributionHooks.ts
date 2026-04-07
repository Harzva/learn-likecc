/**
 * Attribution hooks stub - not implemented
 */

export interface AttributionHook {
  name: string
  enabled: boolean
}

export function getAttributionHooks(): AttributionHook[] {
  return []
}

export function enableAttributionHook(_name: string): void {
  // Stub - no-op
}

export function disableAttributionHook(_name: string): void {
  // Stub - no-op
}