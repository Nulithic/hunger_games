import { describe, expect, it, vi } from 'vitest'
import type { NarrationBackend } from './narration'
import {
  createDelegatingNarrationBackend,
  defaultKokoroBaseUrl,
  probeKokoroAvailable,
  resolveNarrationBackend,
} from './resolveNarrationBackend'

function stubBrowser(): NarrationBackend {
  return {
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    speak: vi.fn(),
  }
}

describe('resolveNarrationBackend', () => {
  it('defaults the Kokoro URL to the Vite proxy path', () => {
    expect(defaultKokoroBaseUrl()).toBe('/api/kokoro')
  })

  it('probes health and returns browser when Kokoro is down', async () => {
    const browser = stubBrowser()
    const resolved = await resolveNarrationBackend({
      kokoroBaseUrl: 'http://kokoro.test',
      createBrowser: () => browser,
      fetchImpl: vi.fn(async () => {
        throw new Error('offline')
      }) as unknown as typeof fetch,
      timeoutMs: 50,
    })

    expect(resolved.engine).toBe('browser')
    expect(resolved.backend).toBe(browser)
    expect(resolved.kokoro).toBeNull()
  })

  it('returns a Kokoro-backed engine when health is ok', async () => {
    const browser = stubBrowser()
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/health')) {
        return new Response('ok', { status: 200 })
      }
      return new Response(new Uint8Array([1]), { status: 200 })
    }) as unknown as typeof fetch

    const resolved = await resolveNarrationBackend({
      kokoroBaseUrl: 'http://kokoro.test',
      voice: 'am_michael',
      createBrowser: () => browser,
      fetchImpl,
      timeoutMs: 200,
    })

    expect(resolved.engine).toBe('kokoro')
    expect(resolved.backend).not.toBe(browser)
    expect(resolved.kokoro?.getVoice()).toBe('am_michael')
  })

  it('treats health probe timeout as unavailable', async () => {
    const ok = await probeKokoroAvailable('http://kokoro.test', {
      timeoutMs: 20,
      fetchImpl: vi.fn(
        () =>
          new Promise(() => {
            // never resolves
          }),
      ) as unknown as typeof fetch,
    })
    expect(ok).toBe(false)
  })

  it('delegates speak to the active backend and can swap', () => {
    const first = stubBrowser()
    const second = stubBrowser()
    const delegating = createDelegatingNarrationBackend(first)

    delegating.speak('A', { onend: () => {}, onerror: () => {} })
    expect(first.speak).toHaveBeenCalled()

    delegating.setDelegate(second)
    expect(first.cancel).toHaveBeenCalled()

    delegating.speak('B', { onend: () => {}, onerror: () => {} })
    expect(second.speak).toHaveBeenCalled()
  })
})
