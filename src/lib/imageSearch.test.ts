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

  it('fetches the top 20 web results and returns loadable choices', async () => {
    stubImagesAlwaysLoad()
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
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
    expect(result).toEqual(
      expect.arrayContaining([
        { url: 'https://example.com/one.jpg', source: 'web', label: 'One' },
        { url: 'https://example.com/two.jpg', source: 'web', label: 'Two' },
      ]),
    )
    expect(result).toHaveLength(2)
    expect(fetch).toHaveBeenCalledWith(
      '/api/image-search?q=Katniss%20Everdeen&limit=20',
    )
  })

  it('shuffles top hits so re-search can surface different choices', async () => {
    stubImagesAlwaysLoad()
    const urls = Array.from({ length: 8 }, (_, i) => ({
      url: `https://example.com/${i}.jpg`,
      label: `Image ${i}`,
    }))
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: urls }),
      }),
    )

    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const first = await searchPortraitCandidates('Katniss')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const second = await searchPortraitCandidates('Katniss')

    expect(first).toHaveLength(5)
    expect(second).toHaveLength(5)
    expect(first.map((item) => item.url)).not.toEqual(second.map((item) => item.url))
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
