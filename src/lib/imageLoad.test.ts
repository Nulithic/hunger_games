import { afterEach, describe, expect, it, vi } from 'vitest'
import { filterLoadableUrls, probeImageUrl } from './imageLoad'

describe('probeImageUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('resolves true when the image loads', async () => {
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

    await expect(probeImageUrl('https://example.com/ok.jpg')).resolves.toBe(true)
  })

  it('resolves false when the image errors', async () => {
    vi.stubGlobal(
      'Image',
      class {
        referrerPolicy = ''
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(_value: string) {
          queueMicrotask(() => this.onerror?.())
        }
      },
    )

    await expect(probeImageUrl('https://example.com/bad.jpg')).resolves.toBe(false)
  })
})

describe('filterLoadableUrls', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('keeps only urls that load, up to the limit', async () => {
    vi.stubGlobal(
      'Image',
      class {
        referrerPolicy = ''
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(value: string) {
          queueMicrotask(() => {
            if (value.includes('bad')) this.onerror?.()
            else this.onload?.()
          })
        }
      },
    )

    await expect(
      filterLoadableUrls(
        [
          'https://example.com/a.jpg',
          'https://example.com/bad.jpg',
          'https://example.com/b.jpg',
          'https://example.com/c.jpg',
        ],
        2,
      ),
    ).resolves.toEqual([
      'https://example.com/a.jpg',
      'https://example.com/b.jpg',
    ])
  })
})
