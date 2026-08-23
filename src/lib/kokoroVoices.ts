export type KokoroVoiceOption = {
  id: string
  label: string
  accent: 'American' | 'British'
  gender: 'female' | 'male'
}

/** Curated English voices that ship with Kokoro-FastAPI. */
export const KOKORO_VOICES: readonly KokoroVoiceOption[] = [
  { id: 'af_bella', label: 'Bella', accent: 'American', gender: 'female' },
  { id: 'af_sarah', label: 'Sarah', accent: 'American', gender: 'female' },
  { id: 'af_nicole', label: 'Nicole', accent: 'American', gender: 'female' },
  { id: 'af_sky', label: 'Sky', accent: 'American', gender: 'female' },
  { id: 'af_heart', label: 'Heart', accent: 'American', gender: 'female' },
  { id: 'am_adam', label: 'Adam', accent: 'American', gender: 'male' },
  { id: 'am_michael', label: 'Michael', accent: 'American', gender: 'male' },
  { id: 'bf_emma', label: 'Emma', accent: 'British', gender: 'female' },
  { id: 'bf_isabella', label: 'Isabella', accent: 'British', gender: 'female' },
  { id: 'bm_george', label: 'George', accent: 'British', gender: 'male' },
  { id: 'bm_lewis', label: 'Lewis', accent: 'British', gender: 'male' },
]

export const KOKORO_VOICE_STORAGE_KEY = 'hunger-games.kokoro-voice'

export function formatKokoroVoiceLabel(voice: KokoroVoiceOption): string {
  return `${voice.label} (${voice.accent} ${voice.gender})`
}

export function isKnownKokoroVoice(id: string): boolean {
  return KOKORO_VOICES.some((voice) => voice.id === id)
}

/** Curated ids plus English packs (af/am/bf/bm) returned by the Kokoro voices API. */
export function isPersistableKokoroVoice(id: string): boolean {
  return isKnownKokoroVoice(id) || /^[ab][fm]_[a-z0-9_]+$/i.test(id)
}

export function readStoredKokoroVoice(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage !== 'undefined'
    ? localStorage
    : null,
): string | null {
  if (!storage) return null
  try {
    const value = storage.getItem(KOKORO_VOICE_STORAGE_KEY)
    if (!value || !isPersistableKokoroVoice(value)) return null
    return value
  } catch {
    return null
  }
}

export function writeStoredKokoroVoice(
  voiceId: string,
  storage: Pick<Storage, 'setItem'> | null = typeof localStorage !== 'undefined'
    ? localStorage
    : null,
): void {
  if (!storage || !isPersistableKokoroVoice(voiceId)) return
  try {
    storage.setItem(KOKORO_VOICE_STORAGE_KEY, voiceId)
  } catch {
    // ignore quota / private mode
  }
}

/** Merge API voice ids with curated labels; unknown ids get a readable fallback name. */
export function mergeKokoroVoiceOptions(
  apiVoiceIds: readonly string[],
): KokoroVoiceOption[] {
  const byId = new Map(KOKORO_VOICES.map((voice) => [voice.id, voice]))
  const merged: KokoroVoiceOption[] = []
  const seen = new Set<string>()

  for (const id of apiVoiceIds) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    const known = byId.get(id)
    if (known) {
      merged.push(known)
      continue
    }
    // Prefer English packs (a*/b*) in the picker; skip other languages for v1.
    if (!/^[ab][fm]_/i.test(id)) continue
    merged.push({
      id,
      label: id.replace(/^[ab][fm]_/i, '').replace(/_/g, ' '),
      accent: id.startsWith('b') ? 'British' : 'American',
      gender: id.charAt(1) === 'm' ? 'male' : 'female',
    })
  }

  if (merged.length === 0) return [...KOKORO_VOICES]
  return merged
}

export async function fetchKokoroVoiceIds(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch.bind(globalThis),
): Promise<string[]> {
  try {
    const response = await fetchImpl(`${baseUrl.replace(/\/+$/, '')}/v1/audio/voices`)
    if (!response.ok) return []
    const data: unknown = await response.json()
    if (Array.isArray(data)) {
      return data.filter((item): item is string => typeof item === 'string')
    }
    if (
      data &&
      typeof data === 'object' &&
      Array.isArray((data as { voices?: unknown }).voices)
    ) {
      return ((data as { voices: unknown[] }).voices).filter(
        (item): item is string => typeof item === 'string',
      )
    }
    return []
  } catch {
    return []
  }
}
