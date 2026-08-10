import { describe, expect, it } from 'vitest'
import { createTributesFromNames } from './names'
import { createGame, advancePhase, livingTributes } from './simulation'

describe('simulation', () => {
  it('starts waiting for the cornucopia bloodbath', () => {
    const tributes = createTributesFromNames(['A', 'B', 'C', 'D'], (() => {
      let n = 0
      return () => `id-${n++}`
    })())
    const game = createGame(tributes, 42)
    expect(game.day).toBe(1)
    expect(game.phase).toBe('cornucopia')
    expect(game.status).toBe('running')
    expect(livingTributes(game)).toHaveLength(4)
    expect(game.winnerId).toBeNull()
    expect(game.settings.cornucopiaKills).toBe(2)
  })

  it('honors cornucopia kill settings', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D', 'E', 'F'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    const start = createGame(tributes, 11, {
      cornucopiaKills: 3,
      earlyPhaseKills: 0,
      latePhaseKills: 0,
    })
    const after = advancePhase(start)
    const fallen = after.tributes.filter((t) => !t.alive).length
    expect(fallen).toBe(3)
  })

  it('resolves cornucopia with opening detail, then day, then night', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D', 'E', 'F'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    const start = createGame(tributes, 3)
    const afterCornucopia = advancePhase(start)

    expect(start.phase).toBe('cornucopia')
    expect(afterCornucopia.log.some((e) => e.kind === 'opening')).toBe(true)
    expect(afterCornucopia.log.some((e) => /cornucopia/i.test(e.text))).toBe(true)
    expect(afterCornucopia.log.every((e) => e.phase === 'cornucopia')).toBe(true)

    if (afterCornucopia.status === 'finished') return

    expect(afterCornucopia.phase).toBe('day')
    expect(afterCornucopia.day).toBe(1)

    const afterDay = advancePhase(afterCornucopia)
    if (afterDay.status === 'finished') return
    expect(afterDay.phase).toBe('night')
    expect(afterDay.log.some((e) => e.phase === 'day')).toBe(true)

    const afterNight = advancePhase(afterDay)
    if (afterNight.status === 'finished') return
    expect(afterNight.day).toBe(2)
    expect(afterNight.phase).toBe('day')
  })

  it('reduces living tributes over phases until one winner', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    let game = createGame(tributes, 7)
    let guard = 0
    while (game.status !== 'finished' && guard < 100) {
      game = advancePhase(game)
      guard += 1
    }
    expect(game.status).toBe('finished')
    expect(livingTributes(game)).toHaveLength(1)
    expect(game.winnerId).toBe(livingTributes(game)[0]?.id ?? null)
    expect(game.log.some((e) => e.kind === 'victory')).toBe(true)
  })

  it('is deterministic for the same seed', () => {
    const make = () =>
      createTributesFromNames(
        ['A', 'B', 'C', 'D', 'E', 'F'],
        (() => {
          let n = 0
          return () => `id-${n++}`
        })(),
      )

    let a = createGame(make(), 99)
    let b = createGame(make(), 99)
    for (let i = 0; i < 12; i += 1) {
      a = advancePhase(a)
      b = advancePhase(b)
    }
    expect(a.log.map((e) => e.text)).toEqual(b.log.map((e) => e.text))
    expect(a.tributes.map((t) => t.alive)).toEqual(b.tributes.map((t) => t.alive))
  })

  it('does not mutate prior game state when advancing', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    const start = createGame(tributes, 3)
    const next = advancePhase(start)
    expect(start.day).toBe(1)
    expect(start.phase).toBe('cornucopia')
    expect(next).not.toBe(start)
    expect(next.tributes).not.toBe(start.tributes)
  })
})
