import { describe, expect, it } from 'vitest'
import { createRng, pickOne, shuffle } from './rng'

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(123)
    const b = createRng(123)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})

describe('pickOne', () => {
  it('returns the only item', () => {
    expect(pickOne(['solo'], () => 0.9)).toBe('solo')
  })

  it('throws on empty lists', () => {
    expect(() => pickOne([], () => 0)).toThrow(/empty/i)
  })
})

describe('shuffle', () => {
  it('returns a new array with the same members', () => {
    const input = [1, 2, 3, 4]
    const rng = createRng(5)
    const output = shuffle(input, rng)
    expect(output).not.toBe(input)
    expect([...output].sort()).toEqual([1, 2, 3, 4])
  })
})
