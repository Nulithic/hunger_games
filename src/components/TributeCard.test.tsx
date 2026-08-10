import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Tribute } from '../types'
import { TributeCard } from './TributeCard'

const tribute: Tribute = {
  id: 'a',
  name: 'Ada',
  district: 1,
  imageUrl: null,
  imageSource: 'avatar',
  alive: true,
  kills: 0,
}

describe('TributeCard', () => {
  it('lets the user pick among candidate images', async () => {
    const user = userEvent.setup()
    const onSelectCandidate = vi.fn()
    render(
      <TributeCard
        tribute={tribute}
        candidates={[
          { url: 'https://example.com/1.jpg', source: 'web', label: 'One' },
          { url: 'https://example.com/2.jpg', source: 'web', label: 'Two' },
        ]}
        onSelectCandidate={onSelectCandidate}
      />,
    )

    await user.click(screen.getByRole('option', { name: /choice 2/i }))
    expect(onSelectCandidate).toHaveBeenCalledWith({
      url: 'https://example.com/2.jpg',
      source: 'web',
      label: 'Two',
    })
  })

  it('applies a district accent color to the card', () => {
    const { container } = render(<TributeCard tribute={tribute} />)
    const card = container.querySelector('.tribute-card') as HTMLElement
    expect(card.style.getPropertyValue('--district-accent')).toBe('hsl(0 72% 62%)')
  })
})
