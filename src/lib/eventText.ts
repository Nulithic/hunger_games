import type { Tribute } from '../types'

export type EventTextPart =
  | { type: 'text'; value: string }
  | { type: 'name'; value: string; district: number }

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Split event copy so tribute names can be colored by district. */
export function splitTextByTributeNames(
  text: string,
  tributes: readonly Tribute[],
): EventTextPart[] {
  const districtByName = new Map<string, number>()
  const seenNames = new Set<string>()
  for (const tribute of tributes) {
    const name = tribute.name.trim()
    if (!name) continue
    if (seenNames.has(name)) {
      // Ambiguous across districts — leave uncolored in the log.
      districtByName.delete(name)
      continue
    }
    seenNames.add(name)
    districtByName.set(name, tribute.district)
  }

  const names = [...districtByName.entries()].sort((a, b) => b[0].length - a[0].length)

  if (names.length === 0 || text.length === 0) {
    return text.length > 0 ? [{ type: 'text', value: text }] : []
  }

  const pattern = new RegExp(names.map(([name]) => escapeRegExp(name)).join('|'), 'g')
  const parts: EventTextPart[] = []
  let cursor = 0

  for (const match of text.matchAll(pattern)) {
    const value = match[0]
    const index = match.index ?? 0
    if (index > cursor) {
      parts.push({ type: 'text', value: text.slice(cursor, index) })
    }
    parts.push({
      type: 'name',
      value,
      district: districtByName.get(value) ?? 1,
    })
    cursor = index + value.length
  }

  if (cursor < text.length) {
    parts.push({ type: 'text', value: text.slice(cursor) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }]
}
