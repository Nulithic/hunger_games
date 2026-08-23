import {
  createKokoroNarrationBackend,
  DEFAULT_KOKORO_VOICE,
  type KokoroNarrationBackend,
} from './kokoroNarration'
import {
  createBrowserNarrationBackend,
  type NarrationBackend,
} from './narration'

export type NarrationEngine = 'kokoro' | 'browser'

export type ResolvedNarration = {
  backend: NarrationBackend
  engine: NarrationEngine
  kokoro: KokoroNarrationBackend | null
}

/** Dev default goes through the Vite proxy to local Docker Kokoro. */
export function defaultKokoroBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_KOKORO_URL
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim().replace(/\/+$/, '')
  }
  return '/api/kokoro'
}

export async function probeKokoroAvailable(
  baseUrl: string,
  options: {
    fetchImpl?: typeof fetch
    timeoutMs?: number
  } = {},
): Promise<boolean> {
  const fetchImpl = options.fetchImpl ?? fetch.bind(globalThis)
  const timeoutMs = options.timeoutMs ?? 1200
  const controller = new AbortController()

  const timeout = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      controller.abort()
      resolve(false)
    }, timeoutMs)
  })

  const request = (async () => {
    try {
      const response = await fetchImpl(`${baseUrl.replace(/\/+$/, '')}/health`, {
        method: 'GET',
        signal: controller.signal,
      })
      return response.ok
    } catch {
      return false
    }
  })()

  return Promise.race([request, timeout])
}

/**
 * Prefer local Kokoro when healthy; otherwise browser TTS.
 * Kokoro backend keeps browser as per-utterance fallback.
 */
export async function resolveNarrationBackend(
  options: {
    kokoroBaseUrl?: string
    voice?: string
    fetchImpl?: typeof fetch
    createBrowser?: () => NarrationBackend | null
    timeoutMs?: number
  } = {},
): Promise<ResolvedNarration> {
  const browser =
    (options.createBrowser?.() ?? createBrowserNarrationBackend()) ?? {
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      speak: (_text, handlers) => handlers.onerror(),
    }

  const baseUrl = options.kokoroBaseUrl ?? defaultKokoroBaseUrl()
  const available = await probeKokoroAvailable(baseUrl, {
    fetchImpl: options.fetchImpl,
    timeoutMs: options.timeoutMs,
  })

  if (!available) {
    return { backend: browser, engine: 'browser', kokoro: null }
  }

  const voice = options.voice?.trim() || DEFAULT_KOKORO_VOICE

  // Warm the model so the first Narrate click is less likely to stall.
  const fetchFn = options.fetchImpl ?? fetch.bind(globalThis)
  void fetchFn(`${baseUrl.replace(/\/+$/, '')}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'kokoro',
      input: 'Ready.',
      voice,
      response_format: 'mp3',
    }),
  }).catch(() => {
    // Warmup is best-effort.
  })

  const kokoro = createKokoroNarrationBackend({
    baseUrl,
    voice,
    fetchImpl: options.fetchImpl,
    fallback: browser,
  })

  return {
    backend: kokoro,
    engine: 'kokoro',
    kokoro,
  }
}

/** Mutable delegate so Arena can start on browser and upgrade to Kokoro. */
export function createDelegatingNarrationBackend(
  initial: NarrationBackend,
): NarrationBackend & { setDelegate: (next: NarrationBackend) => void } {
  let delegate = initial
  return {
    setDelegate(next) {
      try {
        delegate.cancel()
      } catch {
        // ignore
      }
      delegate = next
    },
    cancel: () => delegate.cancel(),
    pause: () => delegate.pause(),
    resume: () => delegate.resume(),
    speak: (text, handlers, options) => delegate.speak(text, handlers, options),
  }
}
