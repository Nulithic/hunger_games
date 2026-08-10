import { useState, type FormEvent } from 'react'
import { districtCountForNames, TRIBUTES_PER_DISTRICT } from '../lib/districts'
import { parseNames } from '../lib/names'
import {
  DEFAULT_SETTINGS,
  findMatchingPreset,
  normalizeSettings,
  SETTINGS_LIMITS,
  SETTINGS_PRESETS,
  type GameSettings,
} from '../lib/settings'

type SetupFormProps = {
  initialValue: string
  initialSettings?: GameSettings
  onStart: (names: string[], settings: GameSettings) => void
}

type SettingField = {
  key: keyof GameSettings
  label: string
  hint: string
}

const SETTING_FIELDS: SettingField[] = [
  {
    key: 'cornucopiaKills',
    label: 'Cornucopia deaths',
    hint: 'How many fall in the opening bloodbath',
  },
  {
    key: 'cornucopiaRushPercent',
    label: 'Cornucopia rush %',
    hint: 'Share of tributes who sprint for supplies',
  },
  {
    key: 'earlyDays',
    label: 'Early days',
    hint: 'First N days use the early death rate',
  },
  {
    key: 'earlyPhaseKills',
    label: 'Early phase deaths',
    hint: 'Target deaths each day/night in the early period',
  },
  {
    key: 'latePhaseKills',
    label: 'Later phase deaths',
    hint: 'Target deaths each day/night after early days',
  },
]

export function SetupForm({
  initialValue,
  initialSettings = DEFAULT_SETTINGS,
  onStart,
}: SetupFormProps) {
  const [raw, setRaw] = useState(initialValue)
  const [settings, setSettings] = useState<GameSettings>(() =>
    normalizeSettings(initialSettings),
  )
  const [error, setError] = useState<string | null>(null)
  const names = parseNames(raw)
  const districts = districtCountForNames(names.length)
  const evenPairs = names.length >= 2 && names.length % TRIBUTES_PER_DISTRICT === 0
  const activePreset = findMatchingPreset(settings)

  function updateSetting(key: keyof GameSettings, value: number) {
    setSettings((prev) => normalizeSettings({ ...prev, [key]: value }))
  }

  function applyPreset(next: GameSettings) {
    setSettings(normalizeSettings(next))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (names.length < 2) {
      setError('Enter at least two names to begin.')
      return
    }
    if (names.length % TRIBUTES_PER_DISTRICT !== 0) {
      setError(`Add names in pairs — ${TRIBUTES_PER_DISTRICT} tributes per district.`)
      return
    }
    setError(null)
    onStart(names, normalizeSettings(settings))
  }

  return (
    <section className="panel setup">
      <p className="kicker">District roster</p>
      <h1 className="brand">Hunger Games</h1>
      <p className="lede">
        Drop in names in pairs — two tributes per district. Tune how bloody the opening stretch
        should be, then the arena decides who walks out.
      </p>

      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="setup-layout">
          <fieldset className="setup-panel setup-roster">
            <legend>Contestant names</legend>
            <p className="hint settings-intro">
              One per line, or comma-separated · {TRIBUTES_PER_DISTRICT} per district
            </p>
            <label className="sr-only" htmlFor="names">
              Contestant names
            </label>
            <textarea
              id="names"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={12}
              spellCheck={false}
              placeholder={'Alice\nBob\nCharlie\nDana'}
            />

            <div className="setup-meta">
              <span>
                {names.length} tribute{names.length === 1 ? '' : 's'}
                {names.length > 0 ? ` · ${districts} district${districts === 1 ? '' : 's'}` : ''}
              </span>
              {error ? (
                <span className="error" role="alert">
                  {error}
                </span>
              ) : null}
            </div>
            <button type="submit" className="btn primary" disabled={!evenPairs}>
              Enter the arena
            </button>
          </fieldset>

          <fieldset className="setup-panel">
            <legend>Arena settings</legend>
            <p className="hint settings-intro">
              Pick a preset, or fine-tune Cornucopia bloodbath size and early-day lethality.
            </p>

            <div className="preset-grid" role="group" aria-label="Settings presets">
              {SETTINGS_PRESETS.map((preset) => {
                const selected = activePreset?.id === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`preset-card${selected ? ' is-selected' : ''}${preset.recommended ? ' is-recommended' : ''}`}
                    onClick={() => applyPreset(preset.settings)}
                    aria-pressed={selected}
                    aria-label={`${preset.name}${preset.recommended ? ' (recommended)' : ''}: ${preset.blurb}`}
                  >
                    <span className="preset-name">
                      {preset.name}
                      {preset.recommended ? (
                        <span className="preset-badge">Recommended</span>
                      ) : null}
                    </span>
                    <span className="preset-blurb">{preset.blurb}</span>
                  </button>
                )
              })}
            </div>

            <div className="settings-grid">
              {SETTING_FIELDS.map((field) => {
                const limits = SETTINGS_LIMITS[field.key]
                const value = settings[field.key]
                return (
                  <label key={field.key} className="setting-field" htmlFor={field.key}>
                    <span className="setting-label">
                      {field.label}
                      <span className="setting-value">{value}</span>
                    </span>
                    <span className="hint">{field.hint}</span>
                    <input
                      id={field.key}
                      type="range"
                      min={limits.min}
                      max={limits.max}
                      step={1}
                      value={value}
                      onChange={(e) => updateSetting(field.key, Number(e.target.value))}
                    />
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>
      </form>
    </section>
  )
}
