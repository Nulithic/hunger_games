import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SETTINGS,
  findMatchingPreset,
  normalizeSettings,
  SETTINGS_PRESETS,
  targetKillsForPhase,
} from './settings'

describe('normalizeSettings', () => {
  it('fills defaults and clamps out-of-range values', () => {
    expect(
      normalizeSettings({
        cornucopiaKills: 99,
        cornucopiaRushPercent: -5,
        earlyDays: 0,
        earlyPhaseKills: 3.8,
        latePhaseKills: 2,
      }),
    ).toEqual({
      cornucopiaKills: 12,
      cornucopiaRushPercent: 0,
      earlyDays: 1,
      earlyPhaseKills: 3,
      latePhaseKills: 2,
    })
  })

  it('returns defaults for empty input', () => {
    expect(normalizeSettings({})).toEqual(DEFAULT_SETTINGS)
  })
})

describe('targetKillsForPhase', () => {
  it('uses early rate inside early days and late rate after', () => {
    const settings = normalizeSettings({
      earlyDays: 2,
      earlyPhaseKills: 2,
      latePhaseKills: 0,
    })
    expect(targetKillsForPhase(settings, 1)).toBe(2)
    expect(targetKillsForPhase(settings, 2)).toBe(2)
    expect(targetKillsForPhase(settings, 3)).toBe(0)
  })
})

describe('SETTINGS_PRESETS', () => {
  it('includes a recommended classic preset matching defaults', () => {
    const classic = SETTINGS_PRESETS.find((preset) => preset.id === 'classic')
    expect(classic?.recommended).toBe(true)
    expect(classic?.settings).toEqual(DEFAULT_SETTINGS)
    expect(findMatchingPreset(DEFAULT_SETTINGS)?.id).toBe('classic')
  })

  it('normalizes every preset into valid bounds', () => {
    for (const preset of SETTINGS_PRESETS) {
      expect(normalizeSettings(preset.settings)).toEqual(preset.settings)
    }
  })
})
