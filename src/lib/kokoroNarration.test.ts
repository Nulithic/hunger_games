import { describe, expect, it, vi } from 'vitest'
import { createKokoroNarrationBackend } from './kokoroNarration'
import type { NarrationBackend } from './narration'

function mockAudio() {
  const listeners: {
    ended: Array<() => void>
    error: Array<() => void>
  } = { ended: [], error: [] }

  const el = {
    preload: '',
    src: '',
    playbackRate: 1,
    onended: null as (() => void) | null,
    onerror: null as (() => void) | null,
    pause: vi.fn(),
    play: vi.fn(async () => {
      // stay playing until test finishes
    }),
  }

  Object.defineProperty(el, 'onended', {
    get: () => listeners.ended[0] ?? null,
    set: (fn: (() => void) | null) => {
      listeners.ended = fn ? [fn] : []
    },
  })
  Object.defineProperty(el, 'onerror', {
    get: () => listeners.error[0] ?? null,
    set: (fn: (() => void) | null) => {
      listeners.error = fn ? [fn] : []
    },
  })

  return {
    el: el as unknown as HTMLAudioElement,
    finish: () => listeners.ended[0]?.(),
    fail: () => listeners.error[0]?.(),
  }
}

describe('createKokoroNarrationBackend', () => {
  it('fetches speech audio and plays it at the requested rate', async () => {
    const audio = mockAudio()
    const fetchImpl = vi.fn(async () =>
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      }),
    )
    const backend = createKokoroNarrationBackend({
      baseUrl: 'http://kokoro.test',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      createAudio: () => audio.el,
    })

    const onend = vi.fn()
    const onerror = vi.fn()
    backend.speak('Hello arena', { onend, onerror }, { rate: 1.5 })

    await vi.waitFor(() => {
      expect(fetchImpl).toHaveBeenCalled()
      expect(audio.el.play).toHaveBeenCalled()
    })

    expect(fetchImpl.mock.calls[0]?.[0]).toBe('http://kokoro.test/v1/audio/speech')
    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body)) as {
      voice: string
    }
    expect(body.voice).toBe('af_bella')
    expect(audio.el.playbackRate).toBe(1.5)

    audio.finish()
    expect(onend).toHaveBeenCalledTimes(1)
    expect(onerror).not.toHaveBeenCalled()
  })

  it('uses setVoice for subsequent speech requests', async () => {
    const audio = mockAudio()
    const fetchImpl = vi.fn(async () =>
      new Response(new Uint8Array([1]), { status: 200 }),
    )
    const backend = createKokoroNarrationBackend({
      baseUrl: 'http://kokoro.test',
      voice: 'af_bella',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      createAudio: () => audio.el,
    })

    expect(backend.getVoice()).toBe('af_bella')
    backend.setVoice('bm_george')
    expect(backend.getVoice()).toBe('bm_george')

    backend.speak('New voice', { onend: () => {}, onerror: () => {} })
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalled())

    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body)) as {
      voice: string
    }
    expect(body.voice).toBe('bm_george')
  })

  it('falls back when the Kokoro request fails', async () => {
    const fallbackSpeak = vi.fn(
      (
        text: string,
        handlers: { onend: () => void; onerror: () => void },
      ) => {
        handlers.onend()
      },
    )
    const fallback: NarrationBackend = {
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      speak: fallbackSpeak,
    }

    const backend = createKokoroNarrationBackend({
      baseUrl: 'http://kokoro.test',
      fetchImpl: vi.fn(async () => new Response('nope', { status: 503 })) as unknown as typeof fetch,
      fallback,
    })

    const onend = vi.fn()
    backend.speak('Fallback please', { onend, onerror: vi.fn() })

    await vi.waitFor(() => {
      expect(fallbackSpeak).toHaveBeenCalledWith(
        'Fallback please',
        expect.any(Object),
        undefined,
      )
      expect(onend).toHaveBeenCalledTimes(1)
    })
  })

  it('ignores stale audio end after cancel', async () => {
    const audio = mockAudio()
    const backend = createKokoroNarrationBackend({
      baseUrl: 'http://kokoro.test',
      fetchImpl: vi.fn(async () =>
        new Response(new Uint8Array([1]), { status: 200 }),
      ) as unknown as typeof fetch,
      createAudio: () => audio.el,
    })

    const onend = vi.fn()
    backend.speak('Cancel me', { onend, onerror: vi.fn() })
    await vi.waitFor(() => expect(audio.el.play).toHaveBeenCalled())

    backend.cancel()
    audio.finish()
    expect(onend).not.toHaveBeenCalled()
  })
})
