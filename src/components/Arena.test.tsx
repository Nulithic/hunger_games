import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '../lib/settings'
import type { GameState } from '../types'
import { Arena } from './Arena'

const baseGame: GameState = {
  day: 1,
  phase: 'night',
  seed: 1,
  status: 'running',
  winnerId: null,
  settings: DEFAULT_SETTINGS,
  tributes: [
    {
      id: 'a',
      name: 'Ada',
      district: 1,
      imageUrl: null,
      imageSource: 'avatar',
      alive: true,
      kills: 1,
    },
    {
      id: 'b',
      name: 'Grace',
      district: 1,
      imageUrl: null,
      imageSource: 'avatar',
      alive: false,
      kills: 0,
    },
  ],
  log: [
    {
      id: 'e1',
      day: 1,
      phase: 'cornucopia',
      text: 'The gong sounds.',
      kind: 'opening',
      actorIds: ['a', 'b'],
      victimIds: [],
    },
    {
      id: 'e2',
      day: 1,
      phase: 'day',
      text: 'Ada ends Grace before dusk.',
      kind: 'kill',
      actorIds: ['a'],
      victimIds: ['b'],
    },
  ],
}

describe('Arena', () => {
  it('keeps fallen tributes visible, prioritizes the log, and separates phases', async () => {
    const user = userEvent.setup()
    const onAdvance = vi.fn()
    const { container } = render(
      <Arena game={baseGame} onAdvance={onAdvance} onReset={vi.fn()} />,
    )

    expect(screen.getByRole('heading', { name: /night 1/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /event log/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^cornucopia$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^day 1$/i })).toBeInTheDocument()
    expect(container.querySelector('.feed-separator')).toBeTruthy()
    expect(screen.getAllByText('Ada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Grace').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.feed-face').length).toBeGreaterThan(0)
    expect(container.querySelector('.feed-face-frame .fallen-mark')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /show tributes/i }))
    expect(container.querySelector('.tribute-card.is-fallen')).toBeTruthy()
    expect(container.querySelector('.fallen-mark')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /crown the victor/i }))
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('starts with tributes hidden and toggles from the event log edge', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Arena game={baseGame} onAdvance={vi.fn()} onReset={vi.fn()} />,
    )

    const toggle = screen.getByRole('button', { name: /show tributes/i })
    expect(screen.queryByRole('heading', { name: /^tributes$/i })).not.toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(container.querySelector('.arena-shell.is-roster-hidden')).toBeTruthy()

    await user.click(toggle)
    expect(screen.getByRole('heading', { name: /^tributes$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide tributes/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(container.querySelector('.arena-shell.is-roster-hidden')).toBeNull()

    await user.click(screen.getByRole('button', { name: /hide tributes/i }))
    expect(screen.queryByRole('heading', { name: /^tributes$/i })).not.toBeInTheDocument()
  })
})
