import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('loads image choices and lets the user pick one', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'Image',
      class {
        referrerPolicy = ''
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(_value: string) {
          queueMicrotask(() => this.onload?.())
        }
      },
    )
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { url: 'https://example.com/a1.jpg', label: 'A1' },
            { url: 'https://example.com/a2.jpg', label: 'A2' },
            { url: 'https://example.com/a3.jpg', label: 'A3' },
            { url: 'https://example.com/a4.jpg', label: 'A4' },
            { url: 'https://example.com/a5.jpg', label: 'A5' },
          ],
        }),
      }),
    )

    render(<App />)

    const textarea = screen.getByLabelText(/contestant names/i)
    await user.clear(textarea)
    await user.type(textarea, 'Ada Lovelace{Enter}Grace Hopper')
    await user.click(screen.getByRole('button', { name: /enter the arena/i }))

    expect(await screen.findByRole('heading', { name: /face check/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /begin the games/i })).toBeEnabled()
    })

    const firstChoices = await screen.findAllByRole('option', { name: /choice 1/i })
    expect(firstChoices[0]).toHaveAttribute('aria-selected', 'true')

    const secondChoices = await screen.findAllByRole('option', { name: /choice 2/i })
    await user.click(secondChoices[0]!)
    expect(secondChoices[0]).toHaveAttribute('aria-selected', 'true')
  })
})
