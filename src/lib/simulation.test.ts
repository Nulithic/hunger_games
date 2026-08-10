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

  it('combines tributes that take the same cornucopia action', () => {
    const tributes = createTributesFromNames(
      ['Ada', 'Grace', 'Alan', 'Katherine', 'Lin', 'Marie'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    // Force everyone into the rush bucket.
    const after = advancePhase(
      createGame(tributes, 3, {
        cornucopiaRushPercent: 100,
        cornucopiaKills: 0,
        earlyPhaseKills: 0,
        latePhaseKills: 0,
      }),
    )

    const combined = after.log.find(
      (event) =>
        event.kind === 'flavor' &&
        event.actorIds.length > 1 &&
        /run|sprint/i.test(event.text),
    )
    expect(combined).toBeTruthy()
    expect(combined!.actorIds.length).toBeGreaterThan(1)
    expect(combined!.text).toMatch(/ and /)
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

  it('never finishes while two tributes are still alive', () => {
    for (const preset of [
      { cornucopiaKills: 1, earlyPhaseKills: 0, latePhaseKills: 1, earlyDays: 2 },
      { cornucopiaKills: 4, earlyPhaseKills: 2, latePhaseKills: 1, earlyDays: 3 },
      { cornucopiaKills: 6, earlyPhaseKills: 3, latePhaseKills: 2, earlyDays: 2 },
    ]) {
      const tributes = createTributesFromNames(
        ['A', 'B', 'C', 'D', 'E', 'F'],
        (() => {
          let n = 0
          return () => `id-${n++}`
        })(),
      )
      let game = createGame(tributes, 44, preset)
      let guard = 0
      while (game.status !== 'finished' && guard < 80) {
        game = advancePhase(game)
        guard += 1
        if (game.status === 'finished') {
          expect(livingTributes(game)).toHaveLength(1)
        }
      }
      expect(game.status).toBe('finished')
      expect(livingTributes(game)).toHaveLength(1)
    }
  })

  it('shows the final duel before crowning when two tributes remain', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    // Leave exactly two after cornucopia.
    let game = createGame(tributes, 5, {
      cornucopiaKills: 2,
      earlyPhaseKills: 0,
      latePhaseKills: 0,
      earlyDays: 2,
    })
    game = advancePhase(game)
    expect(livingTributes(game)).toHaveLength(2)
    expect(game.status).toBe('running')

    game = advancePhase(game)
    expect(game.status).toBe('running')
    expect(livingTributes(game)).toHaveLength(1)
    expect(game.log.some((event) => event.kind === 'kill')).toBe(true)
    expect(game.log.some((event) => event.kind === 'victory')).toBe(false)

    game = advancePhase(game)
    expect(game.status).toBe('finished')
    expect(game.log.some((event) => event.kind === 'victory')).toBe(true)
  })

  it('does not crown a victor in the same phase that first reaches two living', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    let game = createGame(tributes, 12, {
      cornucopiaKills: 0,
      earlyPhaseKills: 1,
      latePhaseKills: 1,
      earlyDays: 2,
    })
    game = advancePhase(game) // cornucopia
    expect(livingTributes(game)).toHaveLength(3)
    game = advancePhase(game) // day 1: one kill → two left, not finished yet
    expect(game.status).toBe('running')
    expect(livingTributes(game)).toHaveLength(2)
  })

  it('never drops below two living until a phase that starts with two', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D', 'E', 'F'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    let game = createGame(tributes, 7, {
      cornucopiaKills: 6,
      earlyPhaseKills: 3,
      latePhaseKills: 2,
      earlyDays: 2,
    })

    for (let i = 0; i < 40 && livingTributes(game).length > 2; i += 1) {
      const before = livingTributes(game).length
      game = advancePhase(game)
      const after = livingTributes(game).length
      expect(after).toBeGreaterThanOrEqual(2)
      if (before > 2) expect(after).toBeGreaterThanOrEqual(2)
    }

    expect(livingTributes(game)).toHaveLength(2)
    expect(game.status).toBe('running')

    const beforeLog = game.log.length
    game = advancePhase(game)
    const finaleEvents = game.log.slice(beforeLog)
    expect(livingTributes(game)).toHaveLength(1)
    expect(game.status).toBe('running')
    expect(finaleEvents.length).toBeGreaterThanOrEqual(4)
    expect(finaleEvents.filter((event) => event.kind === 'opening').length).toBeGreaterThanOrEqual(1)
    expect(finaleEvents.some((event) => event.kind === 'flavor' || event.kind === 'survive')).toBe(
      true,
    )
    expect(
      finaleEvents.some(
        (event) => event.kind === 'kill' && /final|cannon|victor/i.test(event.text),
      ),
    ).toBe(true)
    expect(finaleEvents.some((event) => event.kind === 'victory')).toBe(false)
  })

  it('does not reuse tributes across day/night flavor events', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )
    let game = createGame(tributes, 21, {
      cornucopiaKills: 1,
      earlyPhaseKills: 1,
      latePhaseKills: 1,
      earlyDays: 4,
    })

    for (let i = 0; i < 20 && game.status !== 'finished'; i += 1) {
      const beforeAlive = livingTributes(game).length
      const beforeLog = game.log.length
      game = advancePhase(game)
      // Finale scripts intentionally feature both finalists across several beats.
      if (beforeAlive <= 2) continue
      const phaseEvents = game.log.slice(beforeLog)
      const flavorEvents = phaseEvents.filter(
        (event) =>
          (event.phase === 'day' || event.phase === 'night') &&
          (event.kind === 'flavor' || event.kind === 'survive'),
      )
      if (flavorEvents.length === 0) continue

      const seen = new Set<string>()
      for (const event of flavorEvents) {
        for (const id of [...event.actorIds, ...event.victimIds]) {
          expect(seen.has(id)).toBe(false)
          seen.add(id)
        }
      }
    }
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
