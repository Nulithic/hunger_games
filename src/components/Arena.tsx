import { useEffect, useRef, useState } from 'react'
import { districtAccentStyle, groupTributesByDistrict } from '../lib/districts'
import { groupEventsByPhase } from '../lib/eventLog'
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
}

export function Arena({ game, onAdvance, onReset }: ArenaProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  const latestSectionRef = useRef<HTMLDivElement>(null)
  const advanceLockRef = useRef(false)
  const [showTributes, setShowTributes] = useState(false)
  const alive = livingTributes(game)
  const fallen = game.tributes.filter((t) => !t.alive)
  const districts = groupTributesByDistrict(game.tributes)
  const sections = groupEventsByPhase(game.log)
  const latestKey =
    sections.length > 0 ? sections[sections.length - 1]!.key : null

  function handleAdvanceClick() {
    if (advanceLockRef.current || game.status === 'finished') return
    advanceLockRef.current = true
    onAdvance()
    window.setTimeout(() => {
      advanceLockRef.current = false
    }, 400)
  }

  useEffect(() => {
    if (!latestKey) return
    const feed = feedRef.current
    const section = latestSectionRef.current
    if (!feed || !section || typeof feed.scrollTo !== 'function') return

    const scrollToPhaseTop = () => {
      const feedRect = feed.getBoundingClientRect()
      const sectionRect = section.getBoundingClientRect()
      const top = feed.scrollTop + (sectionRect.top - feedRect.top)
      feed.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }

    // Wait for the new section (and portraits) to lay out before measuring.
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToPhaseTop)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [latestKey, game.log.length])

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
                  return (
                    <div key={section.key} className="feed-section-wrap">
                      {index > 0 ? <div className="feed-separator" role="separator" /> : null}
                      <div
                        ref={isLatest ? latestSectionRef : undefined}
                        className={`feed-section phase-${section.phase}${isLatest ? ' is-latest' : ''}`}
                      >
                        <header className="feed-section-head">
                          <h4 className="feed-section-title">{section.title}</h4>
                          <span className="feed-section-tag">{section.tag}</span>
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
