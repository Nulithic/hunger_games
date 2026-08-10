import { districtAccentStyle, groupTributesByDistrict } from '../lib/districts'
import type { ImageCandidate, Tribute } from '../types'
import { TributeCard } from './TributeCard'

type TributeGridProps = {
  tributes: Tribute[]
  loadingIds: Set<string>
  candidatesById: Record<string, ImageCandidate[]>
  onSelectCandidate: (id: string, candidate: ImageCandidate) => void
  onRefresh: (id: string) => void
  onUseAvatar: (id: string) => void
  onBegin: () => void
  onBack: () => void
}

export function TributeGrid({
  tributes,
  loadingIds,
  candidatesById,
  onSelectCandidate,
  onRefresh,
  onUseAvatar,
  onBegin,
  onBack,
}: TributeGridProps) {
  const stillLoading = loadingIds.size > 0
  const districts = groupTributesByDistrict(tributes)

  return (
    <section className="panel tributes">
      <header className="section-head">
        <div>
          <p className="kicker">Tribute parade</p>
          <h2>Face check</h2>
          <p className="lede tight">
            Pick one of up to five web image results for each tribute (Wikipedia backup if needed).
            Two tributes per district.
          </p>
        </div>
        <div className="section-actions">
          <button type="button" className="btn ghost" onClick={onBack}>
            Edit names
          </button>
          <button type="button" className="btn primary" onClick={onBegin} disabled={stillLoading}>
            {stillLoading ? 'Fetching faces…' : 'Begin the Games'}
          </button>
        </div>
      </header>

      <div className="district-list">
        {districts.map(({ district, tributes: members }) => (
          <section
            key={district}
            className="district-block"
            style={districtAccentStyle(district)}
          >
            <h3 className="district-heading">District {district}</h3>
            <div className="tribute-grid">
              {members.map((tribute) => (
                <TributeCard
                  key={tribute.id}
                  tribute={tribute}
                  loading={loadingIds.has(tribute.id)}
                  candidates={candidatesById[tribute.id] ?? []}
                  onSelectCandidate={(candidate) => onSelectCandidate(tribute.id, candidate)}
                  onRefresh={() => onRefresh(tribute.id)}
                  onUseAvatar={() => onUseAvatar(tribute.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
