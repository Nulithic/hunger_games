import type { GameEvent, GameSettings, GameState, Phase, Tribute } from '../types'
import {
  CORNUCOPIA_FLEE,
  CORNUCOPIA_HESITATE,
  CORNUCOPIA_KILLS,
  CORNUCOPIA_LOOT,
  CORNUCOPIA_RUSH,
  FEAST_TEMPLATES,
  FINALE_SEQUENCES,
  templatesForPhase,
  type EventTemplate,
  type KillTemplate,
  type SoloTemplate,
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
    text: `${winner.name} from District ${winner.district} wins the Hunger Games.`,
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

function isSoloTemplate(template: EventTemplate): template is SoloTemplate {
  return template.needs === 1
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

  if (isSoloTemplate(template) && pool.length >= 1) {
    const actors = pool
    pushEvent(events, day, phase, seed, {
      text: template.text(actors.map((tribute) => tribute.name)),
      kind: template.kind,
      actorIds: actors.map((tribute) => tribute.id),
      victimIds: [],
    })
  }

  return tributes
}

function markBusy(busy: Set<string>, tributes: readonly Tribute[]): void {
  for (const tribute of tributes) busy.add(tribute.id)
}

function availableAlive(tributes: readonly Tribute[], busy: ReadonlySet<string>): Tribute[] {
  return tributes.filter((tribute) => tribute.alive && !busy.has(tribute.id))
}

/**
 * How many deaths a phase may take.
 * Non-finale phases always leave at least two living so the final duel is its own beat.
 * Finale phases (already two living) may take the last kill.
 */
function maxKillsForPhase(aliveCount: number, desiredKills: number, finale: boolean): number {
  const floor = finale ? 1 : 2
  return Math.min(
    Math.max(0, desiredKills),
    Math.max(0, aliveCount - floor),
  )
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
  busy: Set<string> = new Set(),
  options: { finale?: boolean } = {},
): Tribute[] {
  let next = tributes
  const aliveCount = next.filter((t) => t.alive).length
  const maxKills = maxKillsForPhase(aliveCount, desiredKills, options.finale === true)

  for (let i = 0; i < maxKills; i += 1) {
    const pool = shuffle(availableAlive(next, busy), rng)
    if (pool.length < 2) break
    const pair = pool.slice(0, 2)
    next = applyTemplate(
      next,
      events,
      day,
      phase,
      seed,
      pickOne(killTemplates, rng),
      pair,
    )
    // Only the fallen is spent — killers can strike again so presets can hit their quota.
    markBusy(busy, pair.slice(1))
  }

  return next
}

function resolveFinale(
  game: GameState,
  tributes: Tribute[],
  events: GameEvent[],
  rng: () => number,
): PhaseResult {
  const { day, phase } = game
  const living = tributes.filter((t) => t.alive)
  if (living.length !== 2) {
    return { tributes, events }
  }

  const ordered = shuffle(living, rng)
  const winner = ordered[0]!
  const loser = ordered[1]!
  const sequence = pickOne(FINALE_SEQUENCES, rng)

  // Display order for the opening — keep names shuffled so the victor isn't telegraphed.
  const intro = shuffle([winner, loser], rng)
  pushEvent(events, day, phase, game.seed, {
    text: sequence.opening(intro[0]!.name, intro[1]!.name),
    kind: 'opening',
    actorIds: intro.map((t) => t.id),
    victimIds: [],
  })

  for (const beat of sequence.beats) {
    const actors =
      beat.focus === 'both'
        ? [winner, loser]
        : beat.focus === 'winner'
          ? [winner]
          : [loser]
    pushEvent(events, day, phase, game.seed, {
      text: beat.text(winner.name, loser.name),
      kind: beat.kind,
      actorIds: actors.map((t) => t.id),
      victimIds: [],
    })
  }

  pushEvent(events, day, phase, game.seed, {
    text: sequence.kill(winner.name, loser.name),
    kind: 'kill',
    actorIds: [winner.id],
    victimIds: [loser.id],
  })

  pushEvent(events, day, phase, game.seed, {
    text: sequence.aftermath(winner.name, loser.name),
    kind: 'opening',
    actorIds: [winner.id],
    victimIds: [],
  })

  return {
    tributes: applyKill(tributes, winner.id, loser.id),
    events,
  }
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
    text: `The gong sounds. ${roster.length} tributes leave the plates.`,
    kind: 'opening',
    actorIds: roster.map((t) => t.id),
    victimIds: [],
  })

  const rushers: Tribute[] = []
  const hesitators: Tribute[] = []
  const fleers: Tribute[] = []
  for (const tribute of roster) {
    const roll = rng()
    if (roll < rushChance) rushers.push(tribute)
    else if (roll < rushChance + (1 - rushChance) * 0.5) hesitators.push(tribute)
    else fleers.push(tribute)
  }

  if (rushers.length > 0) {
    tributes = applyTemplate(
      tributes,
      events,
      day,
      phase,
      game.seed,
      pickOne(CORNUCOPIA_RUSH, rng),
      rushers,
    )
  }
  if (hesitators.length > 0) {
    tributes = applyTemplate(
      tributes,
      events,
      day,
      phase,
      game.seed,
      pickOne(CORNUCOPIA_HESITATE, rng),
      hesitators,
    )
  }
  if (fleers.length > 0) {
    tributes = applyTemplate(
      tributes,
      events,
      day,
      phase,
      game.seed,
      pickOne(CORNUCOPIA_FLEE, rng),
      fleers,
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
    new Set(),
    { finale: false },
  )

  const survivors = shuffle(
    tributes.filter((t) => t.alive),
    rng,
  )
  const lootCount = Math.min(survivors.length, 2 + Math.floor(rng() * 2))
  const lootGroups = new Map<(typeof CORNUCOPIA_LOOT)[number], Tribute[]>()
  for (let i = 0; i < lootCount; i += 1) {
    const survivor = survivors[i]
    if (!survivor) break
    const template = pickOne(CORNUCOPIA_LOOT, rng)
    lootGroups.set(template, [...(lootGroups.get(template) ?? []), survivor])
  }
  for (const [template, group] of lootGroups) {
    tributes = applyTemplate(
      tributes,
      events,
      day,
      phase,
      game.seed,
      template,
      group,
    )
  }

  const remaining = tributes.filter((t) => t.alive).length
  const fallen = tributes.length - remaining
  pushEvent(events, day, phase, game.seed, {
    text:
      fallen === 0
        ? `No cannons in the opening. ${remaining} tributes head into the arena.`
        : `Bloodbath over. ${fallen} down, ${remaining} left.`,
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
  /** Flavor/feast participants — kills use their own pool so presets can still cull. */
  const busy = new Set<string>()
  const templates = templatesForPhase(phase)
  const killTemplates = templates.filter((t): t is KillTemplate => t.kind === 'kill')
  const nonKillTemplates = templates.filter((t) => t.kind !== 'kill')
  const livingCount = livingTributes(game).length
  const targetKills = targetKillsForPhase(settings, day)

  // Final two get their own broadcast beat — never bury the duel in a normal day/night.
  if (livingCount === 2) {
    return resolveFinale(game, tributes, events, rng)
  }

  pushEvent(events, day, phase, game.seed, {
    text:
      phase === 'day'
        ? `Day ${day}. ${livingCount} tributes still alive.`
        : `Night ${day}. ${livingCount} tributes still alive.`,
    kind: 'opening',
    actorIds: livingTributes(game).map((t) => t.id),
    victimIds: [],
  })

  const includeFeast = phase === 'day' && day >= 3 && livingCount >= 4 && rng() < 0.35
  if (includeFeast) {
    const feastPool = shuffle(availableAlive(tributes, busy), rng)
    const feastTemplate = pickOne(FEAST_TEMPLATES, rng)
    const participants =
      feastTemplate.needs === 2 ? feastPool.slice(0, 2) : feastPool.slice(0, 1)
    if (participants.length >= feastTemplate.needs) {
      tributes = applyTemplate(
        tributes,
        events,
        day,
        phase,
        game.seed,
        feastTemplate,
        participants,
      )
      markBusy(busy, participants)
    }
  }

  // Kill quota is independent of flavor busy so early/late death presets can land.
  // Floor of 2 living — the last cannon waits for the finale phase.
  tributes = applyKillQuota(
    tributes,
    events,
    day,
    phase,
    game.seed,
    rng,
    killTemplates,
    targetKills,
    new Set(),
    { finale: false },
  )
  for (const event of events) {
    if (event.kind !== 'kill') continue
    for (const id of event.victimIds) busy.add(id)
  }

  if (tributes.filter((t) => t.alive).length >= 2) {
    const flavorCount = Math.min(
      3 + Math.floor(rng() * 3),
      Math.max(0, availableAlive(tributes, busy).length),
    )

    const soloGroups = new Map<EventTemplate, Tribute[]>()
    for (let i = 0; i < flavorCount; i += 1) {
      const pool = shuffle(availableAlive(tributes, busy), rng)
      if (pool.length === 0) break
      const template = pickOne(nonKillTemplates, rng)
      if (template.needs === 2) {
        if (pool.length < 2) continue
        const pair = pool.slice(0, 2)
        tributes = applyTemplate(
          tributes,
          events,
          day,
          phase,
          game.seed,
          template,
          pair,
        )
        markBusy(busy, pair)
        continue
      }

      const actor = pool[0]
      if (!actor) continue
      soloGroups.set(template, [...(soloGroups.get(template) ?? []), actor])
      markBusy(busy, [actor])
    }
    for (const [template, group] of soloGroups) {
      tributes = applyTemplate(
        tributes,
        events,
        day,
        phase,
        game.seed,
        template,
        group,
      )
    }
  }

  const left = tributes.filter((t) => t.alive).length
  if (left > 1) {
    pushEvent(events, day, phase, game.seed, {
      text:
        left === 2
          ? phase === 'day'
            ? `Two left as night comes on.`
            : `Two make it through Night ${day}. The finale waits.`
          : phase === 'day'
            ? `${left} left as night comes on.`
            : `${left} make it through Night ${day}.`,
      kind: 'opening',
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

  // Leave crowning for the next click so the final kill stays visible in the log.
  if (livingTributes(resolved).length <= 1) {
    return resolved
  }

  const upcoming = nextPhaseState(game.day, game.phase)
  return {
    ...resolved,
    day: upcoming.day,
    phase: upcoming.phase,
  }
}

/** Resolve the current cornucopia, day, or night phase. Manual only — one phase per call. */
export function advancePhase(game: GameState): GameState {
  if (game.status === 'finished') return game
  if (livingTributes(game).length === 1) {
    return maybeFinish(game)
  }
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
  if (game.status === 'finished') return 'Games complete'
  if (livingTributes(game).length === 1) return 'Crown the Victor'
  if (game.phase === 'cornucopia') return 'Begin the Cornucopia'
  if (livingTributes(game).length === 2) {
    return `Resolve the Finale (${phaseLabel(game.day, game.phase)})`
  }
  return `Resolve ${phaseLabel(game.day, game.phase)}`
}

export function feedPhaseLabel(day: number, phase: Phase): string {
  if (phase === 'cornucopia') return 'Cornucopia'
  return `D${day} ${phase === 'day' ? 'Day' : 'Night'}`
}
