import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchPortraitCandidates } from './imageSearch'

function stubImagesAlwaysLoad() {
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
}

describe('searchPortraitCandidates', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns web image choices from the local search api', async () => {
    stubImagesAlwaysLoad()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { url: 'https://example.com/one.jpg', label: 'One' },
            { url: 'https://example.com/two.jpg', label: 'Two' },
          ],
        }),
      }),
    )

    const result = await searchPortraitCandidates('Katniss Everdeen')
    expect(result).toEqual([
      { url: 'https://example.com/one.jpg', source: 'web', label: 'One' },
      { url: 'https://example.com/two.jpg', source: 'web', label: 'Two' },
    ])
    expect(fetch).toHaveBeenCalledWith(
      '/api/image-search?q=Katniss%20Everdeen&limit=15',
    )
  })

  it('falls back to wikipedia when web search misses', async () => {
    stubImagesAlwaysLoad()
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'No image found', results: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            query: {
              pages: {
                '1': {
                  title: 'Katniss Everdeen',
                  thumbnail: { source: 'https://example.com/katniss.jpg' },
                },
              },
            },
          }),
        }),
    )

    await expect(searchPortraitCandidates('Katniss Everdeen')).resolves.toEqual([
      {
        url: 'https://example.com/katniss.jpg',
        source: 'wikipedia',
        label: 'Katniss Everdeen',
      },
    ])
  })

  it('returns an empty list when every source fails', async () => {
    stubImagesAlwaysLoad()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline')),
    )
    await expect(searchPortraitCandidates('Anyone')).resolves.toEqual([])
  })
})
