import { describe, expect, it } from 'vitest'
import { parseNames, createTributesFromNames } from './names'

describe('parseNames', () => {
  it('splits by commas and newlines, trims, and drops empties', () => {
    expect(parseNames('Katniss, Peeta\nHaymitch,,  ')).toEqual([
      'Katniss',
      'Peeta',
      'Haymitch',
    ])
  })

  it('dedupes case-insensitively and keeps first spelling', () => {
    expect(parseNames('Finnick\nfinnick\nFINNICK')).toEqual(['Finnick'])
  })

  it('returns empty array for blank input', () => {
    expect(parseNames('  \n , ')).toEqual([])
  })
})

describe('createTributesFromNames', () => {
  it('creates tributes paired into districts of two', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )

    expect(tributes).toEqual([
      {
        id: 'id-0',
        name: 'A',
        district: 1,
        imageUrl: null,
        imageSource: 'avatar',
        alive: true,
        kills: 0,
      },
      {
        id: 'id-1',
        name: 'B',
        district: 1,
        imageUrl: null,
        imageSource: 'avatar',
        alive: true,
        kills: 0,
      },
      {
        id: 'id-2',
        name: 'C',
        district: 2,
        imageUrl: null,
        imageSource: 'avatar',
        alive: true,
        kills: 0,
      },
      {
        id: 'id-3',
        name: 'D',
        district: 2,
        imageUrl: null,
        imageSource: 'avatar',
        alive: true,
        kills: 0,
      },
    ])
  })

  it('still creates ids when crypto.randomUUID is unavailable (LAN http)', () => {
    const original = globalThis.crypto
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {},
    })

    try {
      const tributes = createTributesFromNames(['Ada', 'Grace'])
      expect(tributes).toHaveLength(2)
      expect(tributes[0]!.id).toMatch(/^tribute-/)
      expect(tributes[1]!.id).toMatch(/^tribute-/)
      expect(tributes[0]!.id).not.toBe(tributes[1]!.id)
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        configurable: true,
        value: original,
      })
    }
  })
})
