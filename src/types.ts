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
}

export type ImageCandidate = {
  url: string
  source: ImageSource
  label: string
}
