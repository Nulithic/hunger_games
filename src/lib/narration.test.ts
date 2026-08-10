import { describe, expect, it, vi } from 'vitest'
import type { GameEvent } from '../types'
import {
  createBrowserNarrationBackend,
  createEventNarrator,
  textsFromLogSlice,
  type NarrationBackend,
} from './narration'

function makeBackend() {
  const spoken: string[] = []
  const handlers: Array<{ onend: () => void; onerror: () => void }> = []
  let cancelled = 0
  let paused = false

  const backend: NarrationBackend = {
    cancel: () => {
      cancelled += 1
      paused = false
      handlers.length = 0
    },
    pause: () => {
      paused = true
    },
    resume: () => {
      paused = false
    },
    speak: (text, next) => {
      spoken.push(text)
      handlers.push(next)
    },
  }

  return {
    backend,
    spoken,
    finishCurrent: () => {
      const current = handlers.shift()
      current?.onend()
    },
    get cancelled() {
      return cancelled
    },
    get paused() {
      return paused
    },
  }
}

describe('textsFromLogSlice', () => {
  it('returns only new event texts after the previous length', () => {
    const log: GameEvent[] = [
      {
        id: '1',
        day: 1,
        phase: 'day',
        text: 'Day begins.',
        kind: 'opening',
        actorIds: [],
        victimIds: [],
      },
      {
        id: '2',
        day: 1,
        phase: 'day',
        text: 'Ada strikes.',
        kind: 'kill',
        actorIds: ['a'],
        victimIds: ['b'],
      },
    ]

    expect(textsFromLogSlice(log, 0)).toEqual(['Day begins.', 'Ada strikes.'])
    expect(textsFromLogSlice(log, 1)).toEqual(['Ada strikes.'])
    expect(textsFromLogSlice(log, 2)).toEqual([])
  })
})

describe('createEventNarrator', () => {
  it('speaks lines in order and stops when muted', () => {
    const mock = makeBackend()
    const narrator = createEventNarrator(mock.backend)

    narrator.speakAll(['One', 'Two', 'Three'])
    expect(mock.spoken).toEqual(['One'])

    mock.finishCurrent()
    expect(mock.spoken).toEqual(['One', 'Two'])

    narrator.setMuted(true)
    expect(mock.cancelled).toBeGreaterThan(0)

    mock.finishCurrent()
    expect(mock.spoken).toEqual(['One', 'Two'])
  })

  it('does not speak while muted and can resume after unmute on next queue', () => {
    const mock = makeBackend()
    const narrator = createEventNarrator(mock.backend)

    narrator.setMuted(true)
    narrator.speakAll(['Silent'])
    expect(mock.spoken).toEqual([])

    narrator.setMuted(false)
    narrator.speakAll(['Heard'])
    expect(mock.spoken).toEqual(['Heard'])
  })

  it('replaces an in-flight queue when a new phase is spoken', () => {
    const mock = makeBackend()
    const narrator = createEventNarrator(mock.backend)

    narrator.speakAll(['Old A', 'Old B'])
    expect(mock.spoken).toEqual(['Old A'])

    narrator.speakAll(['New A'])
    expect(mock.cancelled).toBeGreaterThan(0)
    expect(mock.spoken).toEqual(['Old A', 'New A'])
  })

  it('pause stops audio and resume restarts from the current line', () => {
    const mock = makeBackend()
    const narrator = createEventNarrator(mock.backend)

    narrator.speakAll(['One', 'Two', 'Three'])
    expect(mock.spoken).toEqual(['One'])

    narrator.pause()
    expect(narrator.isPaused()).toBe(true)
    expect(mock.cancelled).toBeGreaterThan(0)

    // Stale end/error from cancelled utterance must not drain the queue.
    mock.finishCurrent()
    expect(mock.spoken).toEqual(['One'])

    narrator.resume()
    expect(narrator.isPaused()).toBe(false)
    expect(mock.spoken).toEqual(['One', 'One'])

    mock.finishCurrent()
    expect(mock.spoken).toEqual(['One', 'One', 'Two'])
  })

  it('fires onComplete when the queue finishes', () => {
    const mock = makeBackend()
    const narrator = createEventNarrator(mock.backend)
    const onComplete = vi.fn()

    narrator.speakAll(['Only'], { onComplete })
    expect(onComplete).not.toHaveBeenCalled()
    mock.finishCurrent()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})

describe('createBrowserNarrationBackend', () => {
  it('delays speak after cancel so Chrome does not drop the utterance', () => {
    const spoken: string[] = []
    const timers: Array<{ id: number; fn: () => void; ms: number }> = []
    let nextId = 1

    const synth = {
      speaking: false,
      pending: false,
      paused: false,
      getVoices: () => [],
      addEventListener: vi.fn(),
      cancel: vi.fn(() => {
        synth.speaking = false
        synth.pending = false
      }),
      pause: vi.fn(() => {
        synth.paused = true
      }),
      resume: vi.fn(() => {
        synth.paused = false
      }),
      speak: vi.fn((utterance: { text: string; onend?: (() => void) | null }) => {
        spoken.push(utterance.text)
        synth.speaking = true
        utterance.onend?.()
        synth.speaking = false
      }),
    }

    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string
        rate = 1
        pitch = 1
        voice: unknown = null
        onend: (() => void) | null = null
        onerror: (() => void) | null = null
        constructor(text: string) {
          this.text = text
        }
      },
    )

    const backend = createBrowserNarrationBackend(
      synth as unknown as SpeechSynthesis,
      (fn, ms) => {
        const id = nextId++
        timers.push({ id, fn, ms })
        return id
      },
      (id) => {
        const index = timers.findIndex((timer) => timer.id === id)
        if (index >= 0) timers.splice(index, 1)
      },
    )

    expect(backend).toBeTruthy()
    backend!.cancel()
    backend!.speak('After cancel', {
      onend: () => {},
      onerror: () => {},
    })

    expect(spoken).toEqual([])
    expect(timers).toHaveLength(1)
    expect(timers[0]!.ms).toBe(80)
    timers[0]!.fn()
    expect(spoken).toEqual(['After cancel'])

    vi.unstubAllGlobals()
  })
})
