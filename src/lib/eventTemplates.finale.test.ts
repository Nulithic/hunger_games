import { describe, expect, it } from 'vitest'
import { FINALE_SEQUENCES } from './eventTemplates'

describe('FINALE_SEQUENCES', () => {
  it('provides twenty unique finale scripts', () => {
    expect(FINALE_SEQUENCES).toHaveLength(20)

    const openings = FINALE_SEQUENCES.map((sequence) => sequence.opening('A', 'B'))
    const kills = FINALE_SEQUENCES.map((sequence) => sequence.kill('A', 'B'))
    expect(new Set(openings).size).toBe(20)
    expect(new Set(kills).size).toBe(20)

    for (const sequence of FINALE_SEQUENCES) {
      expect(sequence.beats.length).toBeGreaterThanOrEqual(6)
      expect(sequence.aftermath('A', 'B').length).toBeGreaterThan(0)
    }
  })
})
