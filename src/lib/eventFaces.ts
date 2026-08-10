import type { GameEvent, Tribute } from '../types'

/** Unique tributes tied to an event, actors first, then victims. */
export function tributesForEvent(
  event: GameEvent,
  tributes: readonly Tribute[],
): Tribute[] {
  const byId = new Map(tributes.map((tribute) => [tribute.id, tribute]))
  const seen = new Set<string>()
  const ordered: Tribute[] = []

  for (const id of [...event.actorIds, ...event.victimIds]) {
    if (seen.has(id)) continue
    const tribute = byId.get(id)
    if (!tribute) continue
    seen.add(id)
    ordered.push(tribute)
  }

  return ordered
}
