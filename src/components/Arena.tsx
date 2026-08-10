import { useEffect, useRef } from 'react'
import { districtAccentStyle, groupTributesByDistrict } from '../lib/districts'
import { groupEventsByPhase } from '../lib/eventLog'
import {
  advanceActionLabel,
  livingTributes,
  phaseLabel,
} from '../lib/simulation'
import type { GameState } from '../types'
import { ColoredEventText } from './ColoredEventText'
import { TributeCard } from './TributeCard'

type ArenaProps = {
  game: GameState
  onAdvance: () => void
  onReset: () => void
}

export function Arena({ game, onAdvance, onReset }: ArenaProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  const alive = livingTributes(game)
  const fallen = game.tributes.filter((t) => !t.alive)
  const districts = groupTributesByDistrict(game.tributes)
  const sections = groupEventsByPhase(game.log)
  const latestKey =
    sections.length > 0 ? sections[sections.length - 1]!.key : null

  useEffect(() => {
    const feed = feedRef.current
    if (!feed || typeof feed.scrollTo !== 'function') return
    feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' })
  }, [game.log.length])

  const waitingLabel = phaseLabel(game.day, game.phase)
  const lastResolved =
    sections.length === 0
      ? 'Waiting for the first gong'
      : `Last resolved: ${sections[sections.length - 1]!.title}`

  return (
    <section className={`panel arena phase-${game.phase}`}>
      <div className="arena-shell">
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

        <section className="arena-feed" aria-live="polite">
          <h3 className="subhead">Event log</h3>
          <div className="feed" ref={feedRef}>
            {sections.length === 0 ? (
              <p className="feed-empty">
                Use the button below to begin the Cornucopia and each phase after.
              </p>
            ) : (
              sections.map((section, index) => (
                <div
                  key={section.key}
                  className={`feed-section phase-${section.phase}${section.key === latestKey ? ' is-latest' : ''}`}
                >
                  {index > 0 ? <div className="feed-separator" role="separator" /> : null}
                  <header className="feed-section-head">
                    <h4 className="feed-section-title">{section.title}</h4>
                    <span className="feed-section-tag">{section.tag}</span>
                  </header>
                  <div className="feed-section-events">
                    {section.events.map((event) => (
                      <p
                        key={event.id}
                        className={`feed-line kind-${event.kind} phase-${event.phase}${section.key === latestKey ? ' is-new' : ''}`}
                      >
                        <ColoredEventText text={event.text} tributes={game.tributes} />
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="feed-actions">
            <button
              type="button"
              className="btn primary feed-advance"
              onClick={onAdvance}
              disabled={game.status === 'finished'}
            >
              {advanceActionLabel(game)}
            </button>
          </div>
        </section>

        <aside className="arena-roster">
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
      </div>
    </section>
  )
}
