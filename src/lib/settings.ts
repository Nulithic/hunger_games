export type GameSettings = {
  /** Deaths during the Cornucopia bloodbath. */
  cornucopiaKills: number
  /** Chance (0–100) a tribute rushes the Cornucopia instead of hesitating/fleeing. */
  cornucopiaRushPercent: number
  /** First N calendar days use the early death rate. */
  earlyDays: number
  /** Target deaths per day/night phase during early days. */
  earlyPhaseKills: number
  /** Target deaths per day/night phase after the early period. */
  latePhaseKills: number
}

export const DEFAULT_SETTINGS: GameSettings = {
  cornucopiaKills: 2,
  cornucopiaRushPercent: 40,
  earlyDays: 2,
  earlyPhaseKills: 1,
  latePhaseKills: 1,
}

export type SettingsPresetId =
  | 'merciful'
  | 'classic'
  | 'career-gauntlet'
  | 'slow-bleed'
  | 'bloodbath'

export type SettingsPreset = {
  id: SettingsPresetId
  name: string
  blurb: string
  recommended?: boolean
  settings: GameSettings
}

/** Curated starting points — Classic is the default recommendation. */
export const SETTINGS_PRESETS: SettingsPreset[] = [
  {
    id: 'merciful',
    name: 'Merciful',
    blurb: 'Soft open, longer games, fewer cannons early.',
    settings: {
      cornucopiaKills: 1,
      cornucopiaRushPercent: 25,
      earlyDays: 2,
      earlyPhaseKills: 0,
      latePhaseKills: 1,
    },
  },
  {
    id: 'classic',
    name: 'Classic',
    blurb: 'Balanced bloodbath and a steady early cull — best default.',
    recommended: true,
    settings: { ...DEFAULT_SETTINGS },
  },
  {
    id: 'career-gauntlet',
    name: 'Career Gauntlet',
    blurb: 'Aggressive Cornucopia rush, sharp early days, then pressure.',
    settings: {
      cornucopiaKills: 4,
      cornucopiaRushPercent: 70,
      earlyDays: 3,
      earlyPhaseKills: 2,
      latePhaseKills: 1,
    },
  },
  {
    id: 'slow-bleed',
    name: 'Slow Bleed',
    blurb: 'Quiet open, then attrition stretches the middle game.',
    settings: {
      cornucopiaKills: 1,
      cornucopiaRushPercent: 30,
      earlyDays: 1,
      earlyPhaseKills: 1,
      latePhaseKills: 2,
    },
  },
  {
    id: 'bloodbath',
    name: 'Bloodbath',
    blurb: 'Brutal start. Expect a short, loud Games.',
    settings: {
      cornucopiaKills: 6,
      cornucopiaRushPercent: 85,
      earlyDays: 2,
      earlyPhaseKills: 3,
      latePhaseKills: 2,
    },
  },
]

export function settingsMatch(a: GameSettings, b: GameSettings): boolean {
  return (
    a.cornucopiaKills === b.cornucopiaKills &&
    a.cornucopiaRushPercent === b.cornucopiaRushPercent &&
    a.earlyDays === b.earlyDays &&
    a.earlyPhaseKills === b.earlyPhaseKills &&
    a.latePhaseKills === b.latePhaseKills
  )
}

export function findMatchingPreset(settings: GameSettings): SettingsPreset | null {
  return (
    SETTINGS_PRESETS.find((preset) => settingsMatch(settings, preset.settings)) ?? null
  )
}

export const SETTINGS_LIMITS = {
  cornucopiaKills: { min: 0, max: 12 },
  cornucopiaRushPercent: { min: 0, max: 100 },
  earlyDays: { min: 1, max: 6 },
  earlyPhaseKills: { min: 0, max: 6 },
  latePhaseKills: { min: 0, max: 4 },
} as const

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.trunc(value)))
}

export function normalizeSettings(input: Partial<GameSettings>): GameSettings {
  return {
    cornucopiaKills: clamp(
      input.cornucopiaKills ?? DEFAULT_SETTINGS.cornucopiaKills,
      SETTINGS_LIMITS.cornucopiaKills.min,
      SETTINGS_LIMITS.cornucopiaKills.max,
    ),
    cornucopiaRushPercent: clamp(
      input.cornucopiaRushPercent ?? DEFAULT_SETTINGS.cornucopiaRushPercent,
      SETTINGS_LIMITS.cornucopiaRushPercent.min,
      SETTINGS_LIMITS.cornucopiaRushPercent.max,
    ),
    earlyDays: clamp(
      input.earlyDays ?? DEFAULT_SETTINGS.earlyDays,
      SETTINGS_LIMITS.earlyDays.min,
      SETTINGS_LIMITS.earlyDays.max,
    ),
    earlyPhaseKills: clamp(
      input.earlyPhaseKills ?? DEFAULT_SETTINGS.earlyPhaseKills,
      SETTINGS_LIMITS.earlyPhaseKills.min,
      SETTINGS_LIMITS.earlyPhaseKills.max,
    ),
    latePhaseKills: clamp(
      input.latePhaseKills ?? DEFAULT_SETTINGS.latePhaseKills,
      SETTINGS_LIMITS.latePhaseKills.min,
      SETTINGS_LIMITS.latePhaseKills.max,
    ),
  }
}

export function targetKillsForPhase(settings: GameSettings, day: number): number {
  return day <= settings.earlyDays
    ? settings.earlyPhaseKills
    : settings.latePhaseKills
}
