import type { GameSettings } from './lib/settings'

export type { GameSettings }

export type ImageSource = 'web' | 'wikipedia' | 'avatar'

export type Tribute = {
  id: string
  name: string
  district: number
  imageUrl: string | null
  imageSource: ImageSource
  alive: boolean
  kills: number
}

export type EventKind = 'kill' | 'survive' | 'flavor' | 'victory' | 'opening'

export type Phase = 'cornucopia' | 'day' | 'night'

export type GameEvent = {
  id: string
  day: number
  phase: Phase
  text: string
  kind: EventKind
  actorIds: string[]
  victimIds: string[]
}

export type GameStatus = 'setup' | 'tributes' | 'running' | 'finished'

/** In-progress finale revealed one event per click to avoid spoilers. */
export type FinaleProgress = {
  sequenceIndex: number
  step: number
  winnerId: string
  loserId: string
  /** Opening credit order — shuffled so the victor is not telegraphed. */
  introIds: readonly [string, string]
}

/** Precomputed phase revealed one event per click to avoid spoilers. */
export type PhaseProgress = {
  /** Index of the next event to reveal. */
  step: number
  events: readonly GameEvent[]
  /** Calendar to apply after the last event is revealed. */
  nextDay: number
  nextPhase: Phase
}

export type GameState = {
  day: number
  /** Next phase the player will resolve manually. */
  phase: Phase
  tributes: Tribute[]
  log: GameEvent[]
  status: GameStatus
  winnerId: string | null
  seed: number
  settings: GameSettings
  /** Set while a cornucopia/day/night phase is revealed beat-by-beat. */
  phaseProgress: PhaseProgress | null
  /** Set while the final two are revealed beat-by-beat. */
  finale: FinaleProgress | null
}

export type ImageCandidate = {
  url: string
  source: ImageSource
  label: string
}
