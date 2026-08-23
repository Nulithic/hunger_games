import {
  clampNarrationRate,
  NARRATION_RATE_DEFAULT,
  type NarrationBackend,
  type SpeakOptions,
} from './narration'

export const DEFAULT_KOKORO_VOICE = 'af_bella'

export type KokoroNarrationBackend = NarrationBackend & {
  setVoice: (voice: string) => void
  getVoice: () => string
}

export type KokoroNarrationDeps = {
  baseUrl: string
  voice?: string
  fetchImpl?: typeof fetch
  /** Injected for tests — creates the element used to play returned audio. */
  createAudio?: () => HTMLAudioElement
  /** Optional backend used when a Kokoro request/play fails. */
  fallback?: NarrationBackend | null
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '')
}

/**
 * OpenAI-compatible Kokoro backend (Kokoro-FastAPI / docker-kokoro).
 * Speaks by fetching audio and playing it through HTMLAudioElement.
 */
export function createKokoroNarrationBackend(
  deps: KokoroNarrationDeps,
): KokoroNarrationBackend {
  const baseUrl = normalizeBaseUrl(deps.baseUrl)
  let voice = deps.voice ?? DEFAULT_KOKORO_VOICE
  const fetchImpl = deps.fetchImpl ?? fetch.bind(globalThis)
  const createAudio = deps.createAudio ?? (() => new Audio())
  const fallback = deps.fallback ?? null

  let audio: HTMLAudioElement | null = null
  let objectUrl: string | null = null
  let abort: AbortController | null = null
  let speakGeneration = 0

  const clearAudio = () => {
    if (audio) {
      audio.onended = null
      audio.onerror = null
      try {
        audio.pause()
      } catch {
        // ignore
      }
      audio.src = ''
      audio = null
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
  }

  const cancelInFlight = () => {
    speakGeneration += 1
    if (abort) {
      abort.abort()
      abort = null
    }
    clearAudio()
  }

  const speakWithFallback = (
    text: string,
    handlers: { onend: () => void; onerror: () => void },
    options?: SpeakOptions,
  ) => {
    if (!fallback) {
      handlers.onerror()
      return
    }
    fallback.speak(text, handlers, options)
  }

  return {
    getVoice: () => voice,
    setVoice(nextVoice) {
      const trimmed = nextVoice.trim()
      if (trimmed.length === 0) return
      voice = trimmed
    },
    cancel: () => {
      cancelInFlight()
      fallback?.cancel()
    },
    pause: () => {
      try {
        audio?.pause()
      } catch {
        // ignore
      }
      fallback?.pause()
    },
    resume: () => {
      void audio?.play().catch(() => {
        // Autoplay / resume failures are handled by the narrator queue.
      })
      fallback?.resume()
    },
    speak: (text, handlers, options) => {
      cancelInFlight()
      const generation = speakGeneration
      const controller = new AbortController()
      abort = controller
      const rate = clampNarrationRate(options?.rate ?? NARRATION_RATE_DEFAULT)
      const activeVoice = voice

      void (async () => {
        try {
          const response = await fetchImpl(`${baseUrl}/v1/audio/speech`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              model: 'kokoro',
              input: text,
              voice: activeVoice,
              response_format: 'mp3',
            }),
          })

          if (generation !== speakGeneration) return

          if (!response.ok) {
            speakWithFallback(text, handlers, options)
            return
          }

          const buffer = await response.arrayBuffer()
          if (generation !== speakGeneration) return

          const blob = new Blob([buffer], { type: 'audio/mpeg' })
          const url = URL.createObjectURL(blob)
          objectUrl = url
          const el = createAudio()
          audio = el
          el.preload = 'auto'
          el.src = url
          el.playbackRate = rate

          el.onended = () => {
            if (generation !== speakGeneration) return
            clearAudio()
            handlers.onend()
          }
          el.onerror = () => {
            if (generation !== speakGeneration) return
            clearAudio()
            speakWithFallback(text, handlers, options)
          }

          try {
            await el.play()
          } catch {
            if (generation !== speakGeneration) return
            clearAudio()
            speakWithFallback(text, handlers, options)
          }
        } catch (error) {
          if (generation !== speakGeneration) return
          if (error instanceof DOMException && error.name === 'AbortError') {
            return
          }
          speakWithFallback(text, handlers, options)
        }
      })()
    },
  }
}
