import { portraitUrl } from '../lib/avatar'
import { districtAccentColor, districtAccentStyle } from '../lib/districts'
import type { GameState, Tribute } from '../types'

type VictorScreenProps = {
  game: GameState
  winner: Tribute
  onReset: () => void
}

export function VictorScreen({ game, winner, onReset }: VictorScreenProps) {
  const killLeaders = [...game.tributes]
    .sort((a, b) => b.kills - a.kills)
    .slice(0, 3)
    .filter((t) => t.kills > 0)

  return (
    <section className="panel victor">
      <p className="kicker">The Capitol crowns</p>
      <h2 className="victor-title">Victor</h2>
      <div className="victor-hero" style={districtAccentStyle(winner.district)}>
        <img
          src={portraitUrl(winner.imageUrl, winner.name)}
          alt={winner.name}
          width={220}
          height={220}
          referrerPolicy="no-referrer"
        />
        <div>
          <h3 className="tribute-name">{winner.name}</h3>
          <p className="lede tight">
            District {winner.district} · Survived {game.day} day{game.day === 1 ? '' : 's'} with{' '}
            {winner.kills} confirmed kill{winner.kills === 1 ? '' : 's'}.
          </p>
          {killLeaders.length > 0 ? (
            <p className="victor-stats">
              Bloodbath board:{' '}
              {killLeaders.map((t, index) => (
                <span key={t.id}>
                  {index > 0 ? ' · ' : null}
                  <span style={{ color: districtAccentColor(t.district) }}>{t.name}</span>
                  {` (${t.kills})`}
                </span>
              ))}
            </p>
          ) : null}
          <button type="button" className="btn primary" onClick={onReset}>
            Run again
          </button>
        </div>
      </div>
    </section>
  )
}
