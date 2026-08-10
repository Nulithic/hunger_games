import { useState } from 'react'
import { portraitUrl } from '../lib/avatar'
import { districtAccentStyle } from '../lib/districts'
import type { ImageCandidate, Tribute } from '../types'

type TributeCardProps = {
  tribute: Tribute
  loading?: boolean
  candidates?: ImageCandidate[]
  onSelectCandidate?: (candidate: ImageCandidate) => void
  onRefresh?: () => void
  onUseAvatar?: () => void
  dimmed?: boolean
}

function imageLabel(source: Tribute['imageSource']): string {
  if (source === 'web') return 'Web image'
  if (source === 'wikipedia') return 'Wikipedia'
  return 'Avatar fallback'
}

export function TributeCard({
  tribute,
  loading = false,
  candidates = [],
  onSelectCandidate,
  onRefresh,
  onUseAvatar,
  dimmed = false,
}: TributeCardProps) {
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set())
  const [mainBroken, setMainBroken] = useState(false)

  const src = mainBroken
    ? portraitUrl(null, tribute.name)
    : portraitUrl(tribute.imageUrl, tribute.name)
  const visibleCandidates = candidates.filter((candidate) => !brokenUrls.has(candidate.url))
  const showPicker = Boolean(onSelectCandidate) && (loading || candidates.length > 0)

  function markBroken(url: string) {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev
      const next = new Set(prev)
      next.add(url)
      return next
    })
  }

  return (
    <article
      className={`tribute-card${dimmed ? ' is-fallen' : ''}${loading ? ' is-loading' : ''}`}
      style={districtAccentStyle(tribute.district)}
    >
      <div className="tribute-photo">
        <img
          key={src}
          src={src}
          alt={tribute.name}
          width={160}
          height={160}
          referrerPolicy="no-referrer"
          onError={() => {
            if (tribute.imageUrl) setMainBroken(true)
          }}
          onLoad={() => setMainBroken(false)}
        />
        {dimmed ? <span className="fallen-mark" aria-hidden="true" /> : null}
        {loading ? <span className="photo-status">Searching…</span> : null}
      </div>
      <div className="tribute-body">
        <p className="tribute-district">District {tribute.district}</p>
        <h3 className="tribute-name">{tribute.name}</h3>
        <p className="tribute-meta">
          {mainBroken ? 'Avatar fallback' : imageLabel(tribute.imageSource)}
          {tribute.kills > 0 ? ` · ${tribute.kills} kill${tribute.kills === 1 ? '' : 's'}` : ''}
        </p>

        {showPicker ? (
          <div className="image-picker" role="listbox" aria-label={`Image choices for ${tribute.name}`}>
            {loading && visibleCandidates.length === 0 ? (
              <p className="image-picker-empty">Loading choices…</p>
            ) : null}
            {!loading && candidates.length > 0 && visibleCandidates.length === 0 ? (
              <p className="image-picker-empty">No embeddable images — try Re-search or Use avatar.</p>
            ) : null}
            {visibleCandidates.map((candidate, index) => {
              const selected = tribute.imageUrl === candidate.url && !mainBroken
              return (
                <button
                  key={`${candidate.url}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`image-choice${selected ? ' is-selected' : ''}`}
                  onClick={() => {
                    setMainBroken(false)
                    onSelectCandidate?.(candidate)
                  }}
                  disabled={loading}
                  title={candidate.label}
                >
                  <img
                    src={candidate.url}
                    alt=""
                    width={56}
                    height={56}
                    referrerPolicy="no-referrer"
                    onError={() => markBroken(candidate.url)}
                  />
                  <span className="sr-only">
                    Choice {index + 1}
                    {selected ? ' (selected)' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}

        {(onRefresh || onUseAvatar) && (
          <div className="tribute-actions">
            {onRefresh ? (
              <button type="button" className="btn ghost" onClick={onRefresh} disabled={loading}>
                Re-search
              </button>
            ) : null}
            {onUseAvatar ? (
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setMainBroken(false)
                  onUseAvatar()
                }}
                disabled={loading}
              >
                Use avatar
              </button>
            ) : null}
          </div>
        )}
      </div>
    </article>
  )
}
