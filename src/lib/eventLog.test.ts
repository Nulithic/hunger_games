import { describe, expect, it } from 'vitest'
import type { GameEvent } from '../types'
import { groupEventsByPhase } from './eventLog'

describe('groupEventsByPhase', () => {
  it('groups consecutive events and inserts section breaks between phases', () => {
    const log: GameEvent[] = [
      {
        id: '1',
        day: 1,
        phase: 'cornucopia',
        text: 'Gong',
        kind: 'opening',
        actorIds: [],
        victimIds: [],
      },
      {
        id: '2',
        day: 1,
        phase: 'cornucopia',
        text: 'Fight',
        kind: 'kill',
        actorIds: ['a'],
        victimIds: ['b'],
      },
      {
        id: '3',
        day: 1,
        phase: 'day',
        text: 'Dawn',
        kind: 'opening',
        actorIds: [],
        victimIds: [],
      },
    ]

    const sections = groupEventsByPhase(log)
    expect(sections).toHaveLength(2)
    expect(sections[0]?.title).toBe('Cornucopia')
    expect(sections[0]?.events).toHaveLength(2)
    expect(sections[1]?.title).toBe('Day 1')
    expect(sections[1]?.events).toHaveLength(1)
  })
})
