import type { GameEvent, GameSettings, GameState, Phase, Tribute } from '../types'
import {
  CORNUCOPIA_FLEE,
  CORNUCOPIA_HESITATE,
  CORNUCOPIA_KILLS,
  CORNUCOPIA_LOOT,
  CORNUCOPIA_RUSH,
  FEAST_TEMPLATES,
  templatesForPhase,
  type EventTemplate,
  type KillTemplate,
} from './eventTemplates'
import { createRng, pickOne, shuffle } from './rng'
import { DEFAULT_SETTINGS, normalizeSettings, targetKillsForPhase } from './settings'

type PhaseResult = {
  tributes: Tribute[]
  events: GameEvent[]
}

function cloneTributes(tributes: readonly Tribute[]): Tribute[] {
  return tributes.map((t) => ({ ...t }))
}

export function livingTributes(game: GameState): Tribute[] {
  return game.tributes.filter((t) => t.alive)
}

export function createGame(
  tributes: Tribute[],
  seed: number,
  settings: Partial<GameSettings> = DEFAULT_SETTINGS,
): GameState {
  if (tributes.length < 2) {
    throw new Error('Need at least 2 tributes to start the games')
  }

  return {
    day: 1,
    phase: 'cornucopia',
    tributes: cloneTributes(tributes).map((t) => ({
      ...t,
      alive: true,
      kills: 0,
    })),
    log: [],
    status: 'running',
    winnerId: null,
    seed,
    settings: normalizeSettings(settings),
  }
}

function eventId(day: number, phase: Phase, index: number, seed: number): string {
  return `d${day}-${phase}-e${index}-s${seed}`
}

function pushEvent(
  events: GameEvent[],
  day: number,
  phase: Phase,
  seed: number,
  partial: Omit<GameEvent, 'id' | 'day' | 'phase'>,
): void {
  events.push({
    id: eventId(day, phase, events.length, seed),
    day,
    phase,
    ...partial,
  })
}

function applyKill(
  tributes: Tribute[],
  actorId: string,
  victimId: string,
): Tribute[] {
  return tributes.map((t) => {
    if (t.id === victimId) return { ...t, alive: false }
    if (t.id === actorId) return { ...t, kills: t.kills + 1 }
    return t
  })
}

function maybeFinish(game: GameState): GameState {
  const alive = livingTributes(game)
  if (alive.length !== 1) return game

  const winner = alive[0]!
  const victory: GameEvent = {
    id: eventId(game.day, game.phase, game.log.length, game.seed),
    day: game.day,
    phase: game.phase,
    text: `The cannons fall silent. ${winner.name} from District ${winner.district} is the Victor of the Hunger Games!`,
    kind: 'victory',
    actorIds: [winner.id],
    victimIds: [],
  }

  return {
    ...game,
    status: 'finished',
    winnerId: winner.id,
    log: [...game.log, victory],
  }
}

function nextPhaseState(day: number, phase: Phase): { day: number; phase: Phase } {
  if (phase === 'cornucopia') return { day: 1, phase: 'day' }
  if (phase === 'day') return { day, phase: 'night' }
  return { day: day + 1, phase: 'day' }
}

function applyTemplate(
  tributes: Tribute[],
  events: GameEvent[],
  day: number,
  phase: Phase,
  seed: number,
  template: EventTemplate,
  pool: Tribute[],
): Tribute[] {
  if (template.kind === 'kill' && pool.length >= 2) {
    const actor = pool[0]!
    const victim = pool[1]!
    pushEvent(events, day, phase, seed, {
      text: template.text(actor.name, victim.name),
      kind: 'kill',
      actorIds: [actor.id],
      victimIds: [victim.id],
    })
    return applyKill(tributes, actor.id, victim.id)
  }

  if (template.needs === 2 && pool.length >= 2) {
    const a = pool[0]!
    const b = pool[1]!
    pushEvent(events, day, phase, seed, {
      text: template.text(a.name, b.name),
      kind: template.kind,
      actorIds: [a.id, b.id],
      victimIds: [],
    })
    return tributes
  }

  if (template.needs === 1 && pool.length >= 1) {
    const solo = pool[0]!
    pushEvent(events, day, phase, seed, {
      text: template.text(solo.name),
      kind: template.kind,
      actorIds: [solo.id],
      victimIds: [],
    })
  }

  return tributes
}

function forceElimination(
  tributes: Tribute[],
  events: GameEvent[],
  day: number,
  phase: Phase,
  seed: number,
  rng: () => number,
  text: (actor: string, victim: string) => string,
): Tribute[] {
  const alive = tributes.filter((t) => t.alive)
  if (alive.length < 2) return tributes
  const ordered = shuffle(alive, rng)
  const actor = ordered[0]!
  const victim = ordered[1]!
  pushEvent(events, day, phase, seed, {
    text: text(actor.name, victim.name),
    kind: 'kill',
    actorIds: [actor.id],
    victimIds: [victim.id],
  })
  return applyKill(tributes, actor.id, victim.id)
}

function applyKillQuota(
  tributes: Tribute[],
  events: GameEvent[],
  day: number,
  phase: Phase,
  seed: number,
  rng: () => number,
  killTemplates: KillTemplate[],
  desiredKills: number,
): Tribute[] {
  let next = tributes
  const maxKills = Math.min(
    Math.max(0, desiredKills),
    Math.max(0, next.filter((t) => t.alive).length - 1),
  )

  for (let i = 0; i < maxKills; i += 1) {
    const alive = next.filter((t) => t.alive)
    if (alive.length <= 1) break
    const pool = shuffle(alive, rng)
    next = applyTemplate(
      next,
      events,
      day,
      phase,
      seed,
      pickOne(killTemplates, rng),
      pool,
    )
  }

  return next
}

function resolveCornucopia(game: GameState, rng: () => number): PhaseResult {
  const day = game.day
  const phase: Phase = 'cornucopia'
  const { settings } = game
  let tributes = cloneTributes(game.tributes)
  const events: GameEvent[] = []
  const roster = shuffle(tributes.filter((t) => t.alive), rng)
  const rushChance = settings.cornucopiaRushPercent / 100

  pushEvent(events, day, phase, game.seed, {
    text: `The gong sounds. ${roster.length} tributes explode off their plates toward the Cornucopia — backpacks, blades, and blood waiting in the dust.`,
    kind: 'opening',
    actorIds: roster.map((t) => t.id),
    victimIds: [],
  })

  for (const tribute of roster) {
    const roll = rng()
    const template =
      roll < rushChance
        ? pickOne(CORNUCOPIA_RUSH, rng)
        : roll < rushChance + (1 - rushChance) * 0.5
          ? pickOne(CORNUCOPIA_HESITATE, rng)
          : pickOne(CORNUCOPIA_FLEE, rng)
    tributes = applyTemplate(
      tributes,
      events,
      day,
      phase,
      game.seed,
      template,
      [tribute],
    )
  }

  tributes = applyKillQuota(
    tributes,
    events,
    day,
    phase,
    game.seed,
    rng,
    CORNUCOPIA_KILLS,
    settings.cornucopiaKills,
  )

  const survivors = shuffle(
    tributes.filter((t) => t.alive),
    rng,
  )
  const lootCount = Math.min(survivors.length, 2 + Math.floor(rng() * 2))
  for (let i = 0; i < lootCount; i += 1) {
    const survivor = survivors[i]
    if (!survivor) break
    tributes = applyTemplate(
      tributes,
      events,
      day,
      phase,
      game.seed,
      pickOne(CORNUCOPIA_LOOT, rng),
      [survivor],
    )
  }

  const remaining = tributes.filter((t) => t.alive).length
  const fallen = tributes.length - remaining
  pushEvent(events, day, phase, game.seed, {
    text:
      fallen === 0
        ? `Against the odds, no cannons fire in the opening scramble. ${remaining} tributes scatter into the arena as the Cornucopia falls quiet.`
        : `The bloodbath ends. ${fallen} tribute${fallen === 1 ? '' : 's'} down. ${remaining} still breathe as the arena swallows them.`,
    kind: 'opening',
    actorIds: tributes.filter((t) => t.alive).map((t) => t.id),
    victimIds: [],
  })

  return { tributes, events }
}

function resolveStandardPhase(game: GameState, rng: () => number): PhaseResult {
  const { day, phase, settings } = game
  let tributes = cloneTributes(game.tributes)
  const events: GameEvent[] = []
  const templates = templatesForPhase(phase)
  const killTemplates = templates.filter((t): t is KillTemplate => t.kind === 'kill')
  const nonKillTemplates = templates.filter((t) => t.kind !== 'kill')
  const livingCount = livingTributes(game).length
  const targetKills = targetKillsForPhase(settings, day)

  pushEvent(events, day, phase, game.seed, {
    text:
      phase === 'day'
        ? `Day ${day} breaks over the arena. Smoke drifts from last night's fights; ${livingCount} tributes are still unmarked by a final cannon.`
        : `Night ${day} settles in. The anthem waits overhead while ${livingCount} tributes try to survive until morning.`,
    kind: 'opening',
    actorIds: livingTributes(game).map((t) => t.id),
    victimIds: [],
  })

  const includeFeast = phase === 'day' && day >= 3 && livingCount >= 4 && rng() < 0.35
  if (includeFeast) {
    const feastPool = shuffle(
      tributes.filter((t) => t.alive),
      rng,
    )
    tributes = applyTemplate(
      tributes,
      events,
      day,
      phase,
      game.seed,
      pickOne(FEAST_TEMPLATES, rng),
      feastPool,
    )
  }

  tributes = applyKillQuota(
    tributes,
    events,
    day,
    phase,
    game.seed,
    rng,
    killTemplates,
    targetKills,
  )

  const flavorCount = Math.min(
    3 + Math.floor(rng() * 3),
    Math.max(1, tributes.filter((t) => t.alive).length),
  )

  for (let i = 0; i < flavorCount; i += 1) {
    const alive = tributes.filter((t) => t.alive)
    if (alive.length === 0) break
    const template = pickOne(nonKillTemplates, rng)
    const pool = shuffle(alive, rng)
    tributes = applyTemplate(
      tributes,
      events,
      day,
      phase,
      game.seed,
      template,
      pool,
    )
  }

  const stillAlive = tributes.filter((t) => t.alive)
  if (stillAlive.length === 2 && !events.some((e) => e.kind === 'kill')) {
    tributes = forceElimination(
      tributes,
      events,
      day,
      phase,
      game.seed,
      rng,
      (actor, victim) =>
        `Only two remain. In a final clash among the ruins, ${actor} defeats ${victim} and waits for the hovercraft.`,
    )
  }

  const left = tributes.filter((t) => t.alive).length
  if (left > 1) {
    pushEvent(events, day, phase, game.seed, {
      text:
        phase === 'day'
          ? `As the light softens, ${left} tributes are still alive. Night is coming.`
          : `Dawn threatens the horizon. ${left} tributes made it through Night ${day}.`,
      kind: 'flavor',
      actorIds: tributes.filter((t) => t.alive).map((t) => t.id),
      victimIds: [],
    })
  }

  return { tributes, events }
}

function resolvePhase(game: GameState): GameState {
  const phaseKey =
    game.phase === 'cornucopia' ? 0 : game.phase === 'day' ? 1 : 2
  const rng = createRng(game.seed + game.day * 9973 + phaseKey * 131)

  const result =
    game.phase === 'cornucopia'
      ? resolveCornucopia(game, rng)
      : resolveStandardPhase(game, rng)

  const resolved: GameState = {
    ...game,
    tributes: result.tributes,
    log: [...game.log, ...result.events],
  }

  const finished = maybeFinish(resolved)
  if (finished.status === 'finished') return finished

  const upcoming = nextPhaseState(game.day, game.phase)
  return {
    ...finished,
    day: upcoming.day,
    phase: upcoming.phase,
  }
}

/** Resolve the current cornucopia, day, or night phase. Manual only — one phase per call. */
export function advancePhase(game: GameState): GameState {
  if (game.status === 'finished') return game
  return resolvePhase(game)
}

/** @deprecated Use advancePhase — kept as an alias for clarity in older tests. */
export function advanceDay(game: GameState): GameState {
  return advancePhase(game)
}

export function phaseLabel(day: number, phase: Phase): string {
  if (phase === 'cornucopia') return 'Cornucopia'
  return `${phase === 'day' ? 'Day' : 'Night'} ${day}`
}

export function advanceActionLabel(game: GameState): string {
  if (game.phase === 'cornucopia') return 'Begin the Cornucopia'
  return `Resolve ${phaseLabel(game.day, game.phase)}`
}

export function feedPhaseLabel(day: number, phase: Phase): string {
  if (phase === 'cornucopia') return 'Cornucopia'
  return `D${day} ${phase === 'day' ? 'Day' : 'Night'}`
}
