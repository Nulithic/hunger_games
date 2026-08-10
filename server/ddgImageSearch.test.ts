import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchDuckDuckGoImages } from './ddgImageSearch.ts'

describe('searchDuckDuckGoImages', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('prefers thumbnail urls for embedding and keeps unique results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<html>vqd="abc-123"></html>',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [
              {
                image: 'https://cdn.example.com/one.jpg',
                thumbnail: 'https://tse.example.com/one-thumb.jpg',
                title: 'One',
              },
              {
                image: 'https://cdn.example.com/one.jpg',
                thumbnail: 'https://tse.example.com/one-thumb.jpg',
                title: 'Dup',
              },
              {
                image: 'https://cdn.example.com/two.jpg',
                thumbnail: 'https://tse.example.com/two-thumb.jpg',
                title: 'Two',
              },
              { image: 'https://cdn.example.com/three.jpg', title: 'Three' },
            ],
          }),
        }),
    )

    await expect(searchDuckDuckGoImages('Ada Lovelace', 5)).resolves.toEqual([
      {
        url: 'https://tse.example.com/one-thumb.jpg',
        fullUrl: 'https://cdn.example.com/one.jpg',
        label: 'One',
      },
      {
        url: 'https://tse.example.com/two-thumb.jpg',
        fullUrl: 'https://cdn.example.com/two.jpg',
        label: 'Two',
      },
      {
        url: 'https://cdn.example.com/three.jpg',
        label: 'Three',
      },
    ])
  })

  it('returns an empty list when vqd cannot be extracted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '<html>no token</html>',
      }),
    )

    await expect(searchDuckDuckGoImages('Nobody')).resolves.toEqual([])
  })
})
