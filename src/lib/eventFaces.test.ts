import { describe, expect, it } from 'vitest'
import type { GameEvent, Tribute } from '../types'
import { tributesForEvent } from './eventFaces'

const tributes: Tribute[] = [
  {
    id: 'a',
    name: 'Ada',
    district: 1,
    imageUrl: 'https://example.com/a.jpg',
    imageSource: 'web',
    alive: true,
    kills: 1,
  },
  {
    id: 'b',
    name: 'Grace',
    district: 1,
    imageUrl: null,
    imageSource: 'avatar',
    alive: false,
    kills: 0,
  },
]

describe('tributesForEvent', () => {
  it('returns unique actors then victims', () => {
    const event: GameEvent = {
      id: 'e1',
      day: 1,
      phase: 'day',
      text: 'Ada kills Grace.',
      kind: 'kill',
      actorIds: ['a', 'a'],
      victimIds: ['b'],
    }

    expect(tributesForEvent(event, tributes).map((t) => t.id)).toEqual(['a', 'b'])
  })
})
