import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Tribute } from '../types'
import { TributeGrid } from './TributeGrid'

function tribute(partial: Partial<Tribute> & Pick<Tribute, 'id' | 'name' | 'district'>): Tribute {
  return {
    imageUrl: null,
    imageSource: 'avatar',
    alive: true,
    kills: 0,
    ...partial,
  }
}

const tributes: Tribute[] = [
  tribute({ id: '1', name: 'Ada', district: 1 }),
  tribute({ id: '2', name: 'Grace', district: 1 }),
  tribute({ id: '3', name: 'Alan', district: 2 }),
  tribute({ id: '4', name: 'Katherine', district: 2 }),
]

describe('TributeGrid', () => {
  it('shows every district on one page', () => {
    render(
      <TributeGrid
        tributes={tributes}
        loadingIds={new Set()}
        candidatesById={{}}
        onSelectCandidate={vi.fn()}
        onRefresh={vi.fn()}
        onUseAvatar={vi.fn()}
        onBegin={vi.fn()}
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: /district 1/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /district 2/i })).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Alan')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next district/i })).not.toBeInTheDocument()
  })
})
