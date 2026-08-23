import { describe, expect, it, vi } from 'vitest'
import {
  fetchKokoroVoiceIds,
  formatKokoroVoiceLabel,
  isKnownKokoroVoice,
  KOKORO_VOICES,
  mergeKokoroVoiceOptions,
  readStoredKokoroVoice,
  writeStoredKokoroVoice,
} from './kokoroVoices'

describe('kokoroVoices', () => {
  it('formats curated voice labels', () => {
    expect(formatKokoroVoiceLabel(KOKORO_VOICES[0]!)).toBe(
      'Bella (American female)',
    )
  })

  it('reads and writes known voices from storage', () => {
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
    }

    expect(readStoredKokoroVoice(storage)).toBeNull()
    writeStoredKokoroVoice('am_adam', storage)
    expect(readStoredKokoroVoice(storage)).toBe('am_adam')
    writeStoredKokoroVoice('af_custom', storage)
    expect(readStoredKokoroVoice(storage)).toBe('af_custom')
    writeStoredKokoroVoice('not_a_voice', storage)
    expect(readStoredKokoroVoice(storage)).toBe('af_custom')
    expect(isKnownKokoroVoice('bf_emma')).toBe(true)
  })

  it('merges API ids with curated labels and keeps English voices', () => {
    const merged = mergeKokoroVoiceOptions([
      'af_bella',
      'zf_xiaoxiao',
      'bm_george',
      'af_custom',
    ])

    expect(merged.map((voice) => voice.id)).toEqual([
      'af_bella',
      'bm_george',
      'af_custom',
    ])
    expect(merged[0]?.label).toBe('Bella')
    expect(merged[2]?.label).toBe('custom')
    expect(merged[2]?.accent).toBe('American')
  })

  it('falls back to curated list when API returns nothing usable', () => {
    expect(mergeKokoroVoiceOptions([])).toEqual([...KOKORO_VOICES])
    expect(mergeKokoroVoiceOptions(['zf_xiaoxiao'])).toEqual([...KOKORO_VOICES])
  })

  it('parses voice ids from array or voices envelope', async () => {
    const fetchArray = vi.fn(async () =>
      Response.json(['af_bella', 'am_adam']),
    ) as unknown as typeof fetch
    expect(await fetchKokoroVoiceIds('http://kokoro.test', fetchArray)).toEqual([
      'af_bella',
      'am_adam',
    ])

    const fetchEnvelope = vi.fn(async () =>
      Response.json({ voices: ['bf_emma'] }),
    ) as unknown as typeof fetch
    expect(
      await fetchKokoroVoiceIds('http://kokoro.test/', fetchEnvelope),
    ).toEqual(['bf_emma'])

    const fetchFail = vi.fn(async () => new Response('nope', { status: 500 }))
    expect(
      await fetchKokoroVoiceIds(
        'http://kokoro.test',
        fetchFail as unknown as typeof fetch,
      ),
    ).toEqual([])
  })
})
