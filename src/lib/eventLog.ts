import { feedPhaseLabel, phaseLabel } from './simulation'
import type { GameEvent, Phase } from '../types'

export type EventLogSection = {
  key: string
  day: number
  phase: Phase
  title: string
  tag: string
  events: GameEvent[]
}

export function groupEventsByPhase(log: readonly GameEvent[]): EventLogSection[] {
  const sections: EventLogSection[] = []

  for (const event of log) {
    const key = `${event.day}-${event.phase}`
    const current = sections[sections.length - 1]
    if (current && current.key === key) {
      sections[sections.length - 1] = {
        ...current,
        events: [...current.events, event],
      }
      continue
    }

    sections.push({
      key,
      day: event.day,
      phase: event.phase,
      title: phaseLabel(event.day, event.phase),
      tag: feedPhaseLabel(event.day, event.phase),
      events: [event],
    })
  }

  return sections
}
