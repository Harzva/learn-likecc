// Prefetch stub
import type { Attachment } from '../../utils/attachments.js'

export interface SkillPrefetchOptions {
  messages?: unknown[]
  toolUseContext?: unknown
}

export async function startSkillDiscoveryPrefetch(
  _options: unknown,
  _messages?: unknown[],
  _context?: unknown
): Promise<void> {}

export interface PrefetchResult extends Iterable<Attachment> {
  cached: boolean
  data?: unknown
}

export function collectSkillDiscoveryPrefetch(_options?: unknown): PrefetchResult {
  return {
    cached: false,
    [Symbol.iterator]: () => [][Symbol.iterator]()
  }
}

// Make PrefetchResult iterable
export class PrefetchResultIterable implements Iterable<Attachment> {
  constructor(private result: PrefetchResult) {}
  [Symbol.iterator](): Iterator<Attachment> {
    return [this.result][Symbol.iterator]() as Iterator<Attachment>
  }
}

export function toIterable(result: PrefetchResult): Iterable<Attachment> {
  return new PrefetchResultIterable(result)
}

