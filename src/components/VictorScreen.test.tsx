import { render, screen, within } from '@testing-library/react'
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
  finale: null,
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
    {
      id: 'c',
      name: 'Lin',
      district: 2,
      imageUrl: null,
      imageSource: 'avatar',
      alive: false,
      kills: 0,
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

    await user.click(screen.getByRole('button', { name: /run again/i }))
    expect(onReset).toHaveBeenCalled()
  })

  it('lists every tribute in a kill count table below the victor', () => {
    render(<VictorScreen game={game} winner={winner} onReset={vi.fn()} />)

    const table = screen.getByRole('table', { name: /kill count/i })
    const rows = within(table).getAllByRole('row')
    // header + 3 tributes
    expect(rows).toHaveLength(4)

    expect(within(table).getByText('Ada')).toBeInTheDocument()
    expect(within(table).getByText('Grace')).toBeInTheDocument()
    expect(within(table).getByText('Lin')).toBeInTheDocument()

    const bodyText = table.textContent ?? ''
    // Sorted by kills descending: Ada (2), Grace (1), Lin (0)
    expect(bodyText.indexOf('Ada')).toBeLessThan(bodyText.indexOf('Grace'))
    expect(bodyText.indexOf('Grace')).toBeLessThan(bodyText.indexOf('Lin'))
  })
})
