import type { GameEvent } from '../types'

/** SpeechSynthesisUtterance-friendly range; 1 is natural pace. */
export const NARRATION_RATE_MIN = 0.5
export const NARRATION_RATE_MAX = 2
export const NARRATION_RATE_DEFAULT = 1

export function clampNarrationRate(rate: number): number {
  if (!Number.isFinite(rate)) return NARRATION_RATE_DEFAULT
  return Math.min(NARRATION_RATE_MAX, Math.max(NARRATION_RATE_MIN, rate))
}

export type SpeakOptions = {
  rate?: number
}

export type NarrationBackend = {
  cancel: () => void
  pause: () => void
  resume: () => void
  speak: (
    text: string,
    handlers: { onend: () => void; onerror: () => void },
    options?: SpeakOptions,
  ) => void
}

export type SpeakAllOptions = {
  /** Fired when the queue finishes naturally (not on stop/replace). */
  onComplete?: () => void
}

export type EventNarrator = {
  speakAll: (texts: readonly string[], options?: SpeakAllOptions) => void
  /** Clears the queue and cancels speech (cleanup / disable). */
  stop: () => void
  pause: () => void
  resume: () => void
  setMuted: (muted: boolean) => void
  isMuted: () => boolean
  isPaused: () => boolean
  setRate: (rate: number) => void
  getRate: () => number
}

export function textsFromLogSlice(
  log: readonly GameEvent[],
  fromIndex: number,
): string[] {
  return log
    .slice(Math.max(0, fromIndex))
    .map((event) => event.text.trim())
    .filter((text) => text.length > 0)
}

function pickEnglishVoice(
  voices: readonly SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  return (
    voices.find((voice) => voice.lang === 'en-US' && voice.localService) ??
    voices.find((voice) => voice.lang.startsWith('en') && voice.localService) ??
    voices.find((voice) => voice.lang.startsWith('en')) ??
    null
  )
}

/** Browser TTS with Chrome cancel/speak race workarounds. */
export function createBrowserNarrationBackend(
  synth: SpeechSynthesis = window.speechSynthesis,
  schedule: (fn: () => void, ms: number) => number = (fn, ms) =>
    window.setTimeout(fn, ms),
  clearSchedule: (id: number) => void = (id) => window.clearTimeout(id),
): NarrationBackend | null {
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return null

  // Warm the voice list; Chrome often returns [] until voiceschanged.
  void synth.getVoices()
  if (typeof synth.addEventListener === 'function') {
    synth.addEventListener('voiceschanged', () => {
      void synth.getVoices()
    })
  }

  let speakTimer: number | null = null
  /** After cancel(), Chrome drops same-turn speak() calls. */
  let coolDown = false

  const clearSpeakTimer = () => {
    if (speakTimer == null) return
    clearSchedule(speakTimer)
    speakTimer = null
  }

  const resumeSafely = () => {
    try {
      if (synth.paused) synth.resume()
    } catch {
      // Some engines throw if resume is unavailable.
    }
  }

  return {
    cancel: () => {
      clearSpeakTimer()
      synth.cancel()
      resumeSafely()
      coolDown = true
    },
    // Native pause/resume are unreliable in Chrome; the narrator uses software pause.
    pause: () => {
      try {
        synth.pause()
      } catch {
        // ignore
      }
    },
    resume: () => {
      resumeSafely()
    },
    speak: (text, handlers, options) => {
      const run = () => {
        speakTimer = null
        coolDown = false
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = clampNarrationRate(options?.rate ?? NARRATION_RATE_DEFAULT)
        utterance.pitch = 0.95
        const voice = pickEnglishVoice(synth.getVoices())
        if (voice) utterance.voice = voice
        utterance.onend = () => handlers.onend()
        utterance.onerror = () => handlers.onerror()
        resumeSafely()
        synth.speak(utterance)
      }

      clearSpeakTimer()
      if (coolDown || synth.speaking || synth.pending) {
        if (synth.speaking || synth.pending) {
          synth.cancel()
          resumeSafely()
        }
        coolDown = true
        speakTimer = schedule(run, 80)
        return
      }

      run()
    },
  }
}

export function createEventNarrator(
  backend: NarrationBackend | null = typeof window !== 'undefined'
    ? createBrowserNarrationBackend()
    : null,
): EventNarrator {
  let muted = false
  let paused = false
  let rate = NARRATION_RATE_DEFAULT
  let queue: string[] = []
  let token = 0
  /**
   * Bumped when a speak attempt is intentionally cancelled (rate change).
   * Stale onend/onerror handlers must not advance the queue or fire onComplete.
   */
  let speakEpoch = 0
  /** Line currently being spoken (for software pause / rate restart). */
  let currentLine: string | null = null
  let onComplete: (() => void) | null = null

  const activeBackend: NarrationBackend = backend ?? {
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    speak: () => {},
  }

  function clearCompletion(): void {
    onComplete = null
  }

  function finishIfIdle(activeToken: number): void {
    if (activeToken !== token) return
    const done = onComplete
    clearCompletion()
    done?.()
  }

  function speakNext(activeToken: number): void {
    if (muted || paused || activeToken !== token) return

    const text = queue.shift()
    if (!text) {
      currentLine = null
      finishIfIdle(activeToken)
      return
    }

    currentLine = text
    const epoch = speakEpoch
    activeBackend.speak(
      text,
      {
        onend: () => {
          if (paused || activeToken !== token || epoch !== speakEpoch) return
          currentLine = null
          speakNext(activeToken)
        },
        onerror: () => {
          // cancel() from pause/stop/rate-restart — ignore while paused/stale.
          if (paused || activeToken !== token || epoch !== speakEpoch) return
          currentLine = null
          speakNext(activeToken)
        },
      },
      { rate },
    )
  }

  return {
    isMuted: () => muted,
    isPaused: () => paused,
    getRate: () => rate,
    setRate(nextRate) {
      rate = clampNarrationRate(nextRate)
      if (muted || paused || !currentLine) return

      // Restart the current beat at the new pace without treating cancel as "done".
      speakEpoch += 1
      queue = [currentLine, ...queue]
      currentLine = null
      activeBackend.cancel()
      speakNext(token)
    },
    setMuted(nextMuted) {
      muted = nextMuted
      if (nextMuted) {
        paused = false
        currentLine = null
        token += 1
        speakEpoch += 1
        queue = []
        clearCompletion()
        activeBackend.cancel()
      }
    },
    stop() {
      paused = false
      currentLine = null
      token += 1
      speakEpoch += 1
      queue = []
      clearCompletion()
      activeBackend.cancel()
    },
    pause() {
      if (muted || paused) return
      paused = true
      speakEpoch += 1
      // Chrome pause() is flaky — stop audio and keep the remaining lines.
      if (currentLine) {
        queue = [currentLine, ...queue]
        currentLine = null
      }
      activeBackend.cancel()
    },
    resume() {
      if (muted || !paused) return
      paused = false
      // Clear any stuck paused engine state, then continue the queue.
      activeBackend.resume()
      speakNext(token)
    },
    speakAll(texts, options) {
      if (muted || !backend) return
      const lines = texts.map((text) => text.trim()).filter((text) => text.length > 0)
      if (lines.length === 0) return

      paused = false
      currentLine = null
      token += 1
      speakEpoch += 1
      const activeToken = token
      queue = [...lines]
      onComplete = options?.onComplete ?? null
      activeBackend.cancel()
      speakNext(activeToken)
    },
  }
}
