import { useCallback, useEffect, useState } from 'react'
import { Arena } from './components/Arena'
import { SetupForm } from './components/SetupForm'
import { TributeGrid } from './components/TributeGrid'
import { VictorScreen } from './components/VictorScreen'
import { createTributesFromNames } from './lib/names'
import { searchPortraitCandidates } from './lib/imageSearch'
import { DEFAULT_SETTINGS, type GameSettings } from './lib/settings'
import { advancePhase, createGame } from './lib/simulation'
import type { GameState, ImageCandidate, Tribute } from './types'

type Screen = 'setup' | 'tributes' | 'arena' | 'victor'

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [tributes, setTributes] = useState<Tribute[]>([])
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [candidatesById, setCandidatesById] = useState<Record<string, ImageCandidate[]>>({})
  const [game, setGame] = useState<GameState | null>(null)
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS)
  const [draftNames, setDraftNames] = useState(
    'Katniss Everdeen\nPeeta Mellark\nGale Hawthorne\nFinnick Odair\nJohanna Mason\nAnnie Cresta',
  )

  const loadCandidates = useCallback(async (tribute: Tribute) => {
    setLoadingIds((prev) => new Set(prev).add(tribute.id))
    setCandidatesById((prev) => {
      const next = { ...prev }
      delete next[tribute.id]
      return next
    })
    setTributes((prev) =>
      prev.map((t) =>
        t.id === tribute.id ? { ...t, imageUrl: null, imageSource: 'avatar' } : t,
      ),
    )

    const candidates = await searchPortraitCandidates(tribute.name)
    setCandidatesById((prev) => ({ ...prev, [tribute.id]: candidates }))
    const first = candidates[0]
    if (first) {
      setTributes((prev) =>
        prev.map((t) =>
          t.id === tribute.id
            ? { ...t, imageUrl: first.url, imageSource: first.source }
            : t,
        ),
      )
    }
    setLoadingIds((prev) => {
      const next = new Set(prev)
      next.delete(tribute.id)
      return next
    })
  }, [])

  async function handleStart(names: string[], nextSettings: GameSettings) {
    setDraftNames(names.join('\n'))
    setSettings(nextSettings)
    const next = createTributesFromNames(names)
    setTributes(next)
    setCandidatesById({})
    setGame(null)
    setScreen('tributes')
    setLoadingIds(new Set(next.map((t) => t.id)))
    await Promise.all(next.map((t) => loadCandidates(t)))
  }

  function handleSelectCandidate(id: string, candidate: ImageCandidate) {
    setTributes((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, imageUrl: candidate.url, imageSource: candidate.source }
          : t,
      ),
    )
  }

  function handleUseAvatar(id: string) {
    setTributes((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, imageUrl: null, imageSource: 'avatar' } : t,
      ),
    )
  }

  function handleRefresh(id: string) {
    const tribute = tributes.find((t) => t.id === id)
    if (tribute) void loadCandidates(tribute)
  }

  function handleBegin() {
    const seed = Math.floor(Math.random() * 1_000_000_000)
    const started = createGame(tributes, seed, settings)
    setGame(started)
    setScreen('arena')
  }

  const handleAdvance = useCallback(() => {
    setGame((prev) => (prev ? advancePhase(prev) : prev))
  }, [])

  useEffect(() => {
    if (game?.status === 'finished') {
      setScreen('victor')
    }
  }, [game?.status])

  function handleReset() {
    setGame(null)
    setScreen('setup')
  }

  const winner =
    game?.winnerId != null
      ? (game.tributes.find((t) => t.id === game.winnerId) ?? null)
      : null

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden="true" />
      <main className="app-main">
        {screen === 'setup' ? (
          <SetupForm
            initialValue={draftNames}
            initialSettings={settings}
            onStart={handleStart}
          />
        ) : null}

        {screen === 'tributes' ? (
          <TributeGrid
            tributes={tributes}
            loadingIds={loadingIds}
            candidatesById={candidatesById}
            onSelectCandidate={handleSelectCandidate}
            onRefresh={handleRefresh}
            onUseAvatar={handleUseAvatar}
            onBegin={handleBegin}
            onBack={() => {
              setScreen('setup')
              setTributes([])
              setCandidatesById({})
            }}
          />
        ) : null}

        {screen === 'arena' && game ? (
          <Arena game={game} onAdvance={handleAdvance} onReset={handleReset} />
        ) : null}

        {screen === 'victor' && game && winner ? (
          <VictorScreen game={game} winner={winner} onReset={handleReset} />
        ) : null}

        {screen === 'victor' && game && !winner ? (
          <section className="panel">
            <p className="lede">Something went wrong crowning a victor.</p>
            <button type="button" className="btn primary" onClick={handleReset}>
              Start over
            </button>
          </section>
        ) : null}
      </main>
    </div>
  )
}
