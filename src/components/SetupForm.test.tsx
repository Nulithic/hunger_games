import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '../lib/settings'
import { SetupForm } from './SetupForm'

describe('SetupForm', () => {
  it('submits paired names and settings when districts are complete', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    const initialValue = ['Ada', 'Grace'].join('\n')
    const { container } = render(
      <SetupForm initialValue={initialValue} onStart={onStart} />,
    )

    expect(screen.getByText(/2 tributes · 1 district/i)).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /arena settings/i })).toBeInTheDocument()
    await user.click(within(container).getByRole('button', { name: /enter the arena/i }))
    expect(onStart).toHaveBeenCalledWith(['Ada', 'Grace'], DEFAULT_SETTINGS)
  })

  it('disables start when names are not in pairs', () => {
    const onStart = vi.fn()
    const { container } = render(
      <SetupForm initialValue={['Ada', 'Grace', 'Alan'].join('\n')} onStart={onStart} />,
    )

    expect(
      within(container).getByRole('button', { name: /enter the arena/i }),
    ).toBeDisabled()
  })

  it('applies a recommended preset to the sliders', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(
      <SetupForm
        initialValue={['Ada', 'Grace'].join('\n')}
        initialSettings={{
          cornucopiaKills: 6,
          cornucopiaRushPercent: 85,
          earlyDays: 2,
          earlyPhaseKills: 3,
          latePhaseKills: 2,
        }}
        onStart={onStart}
      />,
    )

    const classic = screen.getByRole('button', { name: /classic \(recommended\)/i })
    await user.click(classic)
    expect(classic).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: /enter the arena/i }))
    expect(onStart).toHaveBeenCalledWith(['Ada', 'Grace'], DEFAULT_SETTINGS)
  })
})
