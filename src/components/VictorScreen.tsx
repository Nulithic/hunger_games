import { portraitUrl } from '../lib/avatar'
import { districtAccentColor, districtAccentStyle } from '../lib/districts'
import type { GameState, Tribute } from '../types'

type VictorScreenProps = {
  game: GameState
  winner: Tribute
  onReset: () => void
}

function rankTributesByKills(tributes: readonly Tribute[]): Tribute[] {
  return [...tributes].sort((a, b) => {
    if (b.kills !== a.kills) return b.kills - a.kills
    return a.name.localeCompare(b.name)
  })
}

export function VictorScreen({ game, winner, onReset }: VictorScreenProps) {
  const killBoard = rankTributesByKills(game.tributes)

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
          <button type="button" className="btn primary" onClick={onReset}>
            Run again
          </button>
        </div>
      </div>

      <div className="kill-board">
        <h3 className="subhead" id="kill-count-heading">
          Kill count
        </h3>
        <table className="kill-board-table" aria-labelledby="kill-count-heading">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Tribute</th>
              <th scope="col">District</th>
              <th scope="col">Status</th>
              <th scope="col">Kills</th>
            </tr>
          </thead>
          <tbody>
            {killBoard.map((tribute, index) => {
              const isVictor = tribute.id === winner.id
              return (
                <tr
                  key={tribute.id}
                  className={isVictor ? 'is-victor' : tribute.alive ? undefined : 'is-fallen'}
                >
                  <td>{index + 1}</td>
                  <td>
                    <span
                      className="kill-board-name"
                      style={{ color: districtAccentColor(tribute.district) }}
                    >
                      {tribute.name}
                    </span>
                  </td>
                  <td>{tribute.district}</td>
                  <td>{isVictor ? 'Victor' : 'Fallen'}</td>
                  <td>{tribute.kills}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
