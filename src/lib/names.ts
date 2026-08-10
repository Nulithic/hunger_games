import type { Tribute } from '../types'
import { TRIBUTES_PER_DISTRICT } from './districts'

export function parseNames(raw: string): string[] {
  const seen = new Set<string>()
  const names: string[] = []

  for (const part of raw.split(/[\n,]+/)) {
    const name = part.trim().replace(/\s+/g, ' ')
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    names.push(name)
  }

  return names
}

/** Works on localhost and on plain LAN http (where randomUUID is missing). */
export function createTributeId(): string {
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)
  if (randomUUID) return randomUUID()
  return `tribute-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createTributesFromNames(
  names: string[],
  createId: () => string = createTributeId,
): Tribute[] {
  return names.map((name, index) => ({
    id: createId(),
    name,
    district: Math.floor(index / TRIBUTES_PER_DISTRICT) + 1,
    imageUrl: null,
    imageSource: 'avatar' as const,
    alive: true,
    kills: 0,
  }))
}
