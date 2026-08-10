import { describe, expect, it } from 'vitest'
import { createTributesFromNames } from './names'
import {
  districtAccentColor,
  districtCountForNames,
  groupTributesByDistrict,
} from './districts'

describe('district helpers', () => {
  it('counts districts as pairs of tributes', () => {
    expect(districtCountForNames(0)).toBe(0)
    expect(districtCountForNames(1)).toBe(1)
    expect(districtCountForNames(2)).toBe(1)
    expect(districtCountForNames(3)).toBe(2)
    expect(districtCountForNames(4)).toBe(2)
  })

  it('groups tributes by district number', () => {
    const tributes = createTributesFromNames(
      ['A', 'B', 'C', 'D'],
      (() => {
        let n = 0
        return () => `id-${n++}`
      })(),
    )

    expect(groupTributesByDistrict(tributes)).toEqual([
      { district: 1, tributes: [tributes[0], tributes[1]] },
      { district: 2, tributes: [tributes[2], tributes[3]] },
    ])
  })

  it('assigns a stable accent color per district', () => {
    expect(districtAccentColor(1)).toBe(districtAccentColor(1))
    expect(districtAccentColor(1)).not.toBe(districtAccentColor(2))
    expect(districtAccentColor(1)).toMatch(/^hsl\(\d+ 72% 62%\)$/)
  })
})
