import type { CSSProperties } from 'react'
import type { Tribute } from '../types'

export const TRIBUTES_PER_DISTRICT = 2

/** Distinct accent for a district number (stable across the session). */
export function districtAccentColor(district: number): string {
  const n = Math.max(1, Math.floor(district))
  const hue = ((n - 1) * 47) % 360
  return `hsl(${hue} 72% 62%)`
}

export function districtAccentStyle(district: number): CSSProperties {
  return { ['--district-accent']: districtAccentColor(district) } as CSSProperties
}

export function districtCountForNames(nameCount: number): number {
  return Math.ceil(nameCount / TRIBUTES_PER_DISTRICT)
}

export function groupTributesByDistrict(tributes: readonly Tribute[]): Array<{
  district: number
  tributes: Tribute[]
}> {
  const map = new Map<number, Tribute[]>()

  for (const tribute of tributes) {
    const existing = map.get(tribute.district) ?? []
    map.set(tribute.district, [...existing, tribute])
  }

  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([district, members]) => ({ district, tributes: members }))
}
