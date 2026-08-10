import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '../lib/settings'
import type { GameState, Tribute } from '../types'
import { VictorScreen } from './VictorScreen'

const winner: Tribute = {
  id: 'a',
  name: 'Ada',
  district: 1,
  imageUrl: null,
  imageSource: 'avatar',
  alive: true,
  kills: 2,
}

const game: GameState = {
  day: 3,
  phase: 'night',
  seed: 9,
  status: 'finished',
  winnerId: 'a',
  settings: DEFAULT_SETTINGS,
  tributes: [
    winner,
    {
      id: 'b',
      name: 'Grace',
      district: 1,
      imageUrl: null,
      imageSource: 'avatar',
      alive: false,
      kills: 1,
    },
  ],
  log: [],
}

describe('VictorScreen', () => {
  it('shows the victor summary and reset action', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(<VictorScreen game={game} winner={winner} onReset={onReset} />)

    expect(screen.getByRole('heading', { name: 'Victor' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ada' })).toBeInTheDocument()
    expect(screen.getByText(/survived 3 days/i)).toBeInTheDocument()
    expect(screen.getByText(/Bloodbath board:/i)).toHaveTextContent(/Ada \(2\)/)

    await user.click(screen.getByRole('button', { name: /run again/i }))
    expect(onReset).toHaveBeenCalled()
  })
})
