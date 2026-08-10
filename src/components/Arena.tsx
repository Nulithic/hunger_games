import { useEffect, useRef, useState } from 'react'
import { districtAccentStyle, groupTributesByDistrict } from '../lib/districts'
import { groupEventsByPhase, type EventLogSection } from '../lib/eventLog'
import {
  createEventNarrator,
  type EventNarrator,
} from '../lib/narration'
import {
  advanceActionLabel,
  livingTributes,
  phaseLabel,
} from '../lib/simulation'
import type { GameState } from '../types'
import { EventLogLine } from './EventLogLine'
import { TributeCard } from './TributeCard'

type ArenaProps = {
  game: GameState
  onAdvance: () => void
  onReset: () => void
  /** Optional seam for tests. */
  narrator?: EventNarrator
}

export function Arena({ game, onAdvance, onReset, narrator }: ArenaProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  const latestSectionRef = useRef<HTMLDivElement>(null)
  const advanceLockRef = useRef(false)
  const narratorRef = useRef<EventNarrator>(narrator ?? createEventNarrator())
  const gameRef = useRef(game)
  const onAdvanceRef = useRef(onAdvance)
  /** While true, finishing a spoken line advances the next finale beat. */
  const finaleAutoplayRef = useRef(false)
  /** Speak only log entries at/after this index after an auto-advance. */
  const speakFromRef = useRef(0)
  const [showTributes, setShowTributes] = useState(false)
  const [playingKey, setPlayingKey] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const alive = livingTributes(game)
  const fallen = game.tributes.filter((t) => !t.alive)
  const districts = groupTributesByDistrict(game.tributes)
  const sections = groupEventsByPhase(game.log)
  const latestKey =
    sections.length > 0 ? sections[sections.length - 1]!.key : null

  gameRef.current = game
  onAdvanceRef.current = onAdvance

  useEffect(() => {
    if (narrator) narratorRef.current = narrator
  }, [narrator])

  useEffect(() => {
    const active = narratorRef.current
    // Per-phase buttons opt in; keep the engine ready to speak on click.
    active.setMuted(false)
    return () => {
      finaleAutoplayRef.current = false
      active.stop()
    }
  }, [])

  function stopFinaleAutoplay() {
    finaleAutoplayRef.current = false
  }

  function clearPlaying(sectionKey: string) {
    setPlayingKey((current) => (current === sectionKey ? null : current))
    setPaused(false)
  }

  function shouldContinueFinaleAutoplay(state: GameState): boolean {
    // Stop once the aftermath is on the log (finale progress clears).
    return state.status !== 'finished' && state.finale != null
  }

  function speakSectionTexts(sectionKey: string, texts: string[]) {
    const lines = texts.map((text) => text.trim()).filter((text) => text.length > 0)
    if (lines.length === 0) return

    setPlayingKey(sectionKey)
    setPaused(false)
    narratorRef.current.setMuted(false)
    narratorRef.current.speakAll(lines, {
      onComplete: () => {
        if (!finaleAutoplayRef.current) {
          clearPlaying(sectionKey)
          return
        }

        const state = gameRef.current
        if (!shouldContinueFinaleAutoplay(state)) {
          stopFinaleAutoplay()
          clearPlaying(sectionKey)
          return
        }

        speakFromRef.current = state.log.length
        onAdvanceRef.current()
      },
    })
  }

  function handleAdvanceClick() {
    if (advanceLockRef.current || game.status === 'finished') return
    stopFinaleAutoplay()
    narratorRef.current.stop()
    setPlayingKey(null)
    setPaused(false)
    advanceLockRef.current = true
    onAdvance()
    window.setTimeout(() => {
      advanceLockRef.current = false
    }, 400)
  }

  function handleNarrateSection(section: EventLogSection) {
    const isLatest = section.key === latestKey
    const autoplay = isLatest && game.finale != null
    finaleAutoplayRef.current = autoplay

    // Finale shares the phase section — speak only revealed finale beats, not the whole night.
    const texts =
      autoplay && game.finale != null
        ? section.events.slice(-game.finale.step).map((event) => event.text)
        : section.events.map((event) => event.text)

    if (texts.length === 0) return
    speakFromRef.current = game.log.length
    speakSectionTexts(section.key, texts)
  }

  function handleTogglePause(sectionKey: string) {
    if (playingKey !== sectionKey) return
    if (paused) {
      narratorRef.current.resume()
      setPaused(false)
      return
    }
    narratorRef.current.pause()
    setPaused(true)
  }

  // After finale autoplay advances, narrate the newly revealed beat(s).
  useEffect(() => {
    if (!finaleAutoplayRef.current) return
    if (paused) return

    const from = speakFromRef.current
    const fresh = game.log.slice(from).map((event) => event.text)
    if (fresh.length === 0) {
      if (!shouldContinueFinaleAutoplay(game)) {
        stopFinaleAutoplay()
        setPlayingKey(null)
        setPaused(false)
      }
      return
    }

    speakFromRef.current = game.log.length
    const sectionKey = latestKey ?? `${game.day}-${game.phase}`
    speakSectionTexts(sectionKey, fresh)
    // speakSectionTexts closes over the latest autoplay/narrator refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- drive only from log/finale progress
  }, [game.log.length, game.finale, game.status, paused, latestKey])

  const previousLatestKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!latestKey) return
    const feed = feedRef.current
    const section = latestSectionRef.current
    if (!feed || !section || typeof feed.scrollTo !== 'function') return

    // New phase → jump to section top. Finale beats (same section) → follow the new line.
    const sameSection = previousLatestKeyRef.current === latestKey
    previousLatestKeyRef.current = latestKey
    const followEvent = sameSection || game.finale != null

    const scrollIntoView = () => {
      const target = followEvent
        ? (section.querySelector('.feed-line:last-child') ?? section)
        : section
      const feedRect = feed.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const top = feed.scrollTop + (targetRect.top - feedRect.top)
      feed.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }

    // Wait for the new section/event (and portraits) to lay out before measuring.
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollIntoView)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [latestKey, game.log.length, game.finale])

  const waitingLabel = phaseLabel(game.day, game.phase)
  const lastResolved =
    sections.length === 0
      ? 'Waiting for the first gong'
      : `Last resolved: ${sections[sections.length - 1]!.title}`

  return (
    <section className={`panel arena phase-${game.phase}`}>
      <div className={`arena-shell${showTributes ? '' : ' is-roster-hidden'}`}>
        <header className="arena-title">
          <p className="kicker">Live broadcast</p>
          <h2>{waitingLabel}</h2>
          <p className="lede tight">
            {alive.length} living · {fallen.length} fallen · {lastResolved}
          </p>
        </header>

        <div className="arena-head-actions">
          <button type="button" className="btn ghost" onClick={onReset}>
            New Game
          </button>
        </div>

        <div className="arena-main">
          <section className="arena-feed" aria-live="polite">
            <h3 className="subhead">Event log</h3>
            <div className="feed" ref={feedRef}>
              {sections.length === 0 ? (
                <p className="feed-empty">
                  Use the button below to begin the Cornucopia and each phase after.
                </p>
              ) : (
                sections.map((section, index) => {
                  const isLatest = section.key === latestKey
                  const isPlaying = playingKey === section.key
                  return (
                    <div key={section.key} className="feed-section-wrap">
                      {index > 0 ? <div className="feed-separator" role="separator" /> : null}
                      <div
                        ref={isLatest ? latestSectionRef : undefined}
                        className={`feed-section phase-${section.phase}${isLatest ? ' is-latest' : ''}`}
                      >
                        <header className="feed-section-head">
                          <div className="feed-section-heading">
                            <h4 className="feed-section-title">{section.title}</h4>
                            <span className="feed-section-tag">{section.tag}</span>
                          </div>
                          <button
                            type="button"
                            className="btn ghost feed-narrate"
                            onClick={() =>
                              isPlaying
                                ? handleTogglePause(section.key)
                                : handleNarrateSection(section)
                            }
                            aria-pressed={isPlaying ? !paused : false}
                            title={
                              isPlaying
                                ? paused
                                  ? `Resume narration for ${section.title}`
                                  : `Pause narration for ${section.title}`
                                : `Narrate ${section.title}`
                            }
                          >
                            {isPlaying
                              ? paused
                                ? 'Unpause'
                                : 'Pause'
                              : 'Narrate'}
                          </button>
                        </header>
                        <div className="feed-section-events">
                          {section.events.map((event) => (
                            <EventLogLine
                              key={event.id}
                              event={event}
                              tributes={game.tributes}
                              isNew={isLatest}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="feed-actions">
              <button
                type="button"
                className="btn primary feed-advance"
                onClick={handleAdvanceClick}
                disabled={game.status === 'finished'}
              >
                {advanceActionLabel(game)}
              </button>
            </div>
          </section>
          <button
            type="button"
            className="roster-edge-toggle"
            onClick={() => setShowTributes((prev) => !prev)}
            aria-expanded={showTributes}
            aria-controls="arena-roster"
            title={showTributes ? 'Hide tributes' : 'Show tributes'}
          >
            <span className="sr-only">
              {showTributes ? 'Hide tributes' : 'Show tributes'}
            </span>
            <span aria-hidden="true">{showTributes ? '›' : '‹'}</span>
          </button>
        </div>

        {showTributes ? (
          <aside className="arena-roster" id="arena-roster">
            <h3 className="subhead">Tributes</h3>
            <div className="district-list arena-districts">
              {districts.map(({ district, tributes }) => (
                <section
                  key={district}
                  className="district-block arena-district-row"
                  style={districtAccentStyle(district)}
                >
                  <h4 className="district-heading">District {district}</h4>
                  <div className="tribute-grid compact district-row">
                    {tributes.map((tribute) => (
                      <TributeCard
                        key={tribute.id}
                        tribute={tribute}
                        dimmed={!tribute.alive}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  )
}
