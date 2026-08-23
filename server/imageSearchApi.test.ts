import { describe, expect, it, vi } from 'vitest'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleImageSearchRequest } from './imageSearchApi.ts'

function mockReq(
  url: string,
  method = 'GET',
): IncomingMessage {
  return { url, method } as IncomingMessage
}

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    setHeader(name: string, value: string) {
      this.headers[name] = value
    },
    end(chunk?: string) {
      this.body = chunk ?? ''
    },
  }
  return res as typeof res & ServerResponse
}

describe('handleImageSearchRequest', () => {
  it('delegates unknown paths when next is provided', async () => {
    const next = vi.fn()
    const res = mockRes()
    await handleImageSearchRequest(mockReq('/other'), res, { next })
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.body).toBe('')
  })

  it('returns 404 for unknown paths without next', async () => {
    const res = mockRes()
    await handleImageSearchRequest(mockReq('/other'), res)
    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body)).toEqual({ error: 'Not found' })
  })

  it('rejects non-GET methods', async () => {
    const res = mockRes()
    await handleImageSearchRequest(mockReq('/api/image-search', 'POST'), res)
    expect(res.statusCode).toBe(405)
  })

  it('requires a query', async () => {
    const res = mockRes()
    await handleImageSearchRequest(mockReq('/api/image-search'), res)
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({ error: 'Missing q parameter' })
  })

  it('returns search hits', async () => {
    const res = mockRes()
    const search = vi.fn(async () => [
      { url: 'https://cdn.example.com/a.jpg', label: 'A' },
    ])
    await handleImageSearchRequest(
      mockReq('/api/image-search?q=Katniss&limit=5'),
      res,
      { search },
    )
    expect(search).toHaveBeenCalledWith('Katniss', 5)
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({
      results: [{ url: 'https://cdn.example.com/a.jpg', label: 'A' }],
    })
  })

  it('returns 404 when the search is empty', async () => {
    const res = mockRes()
    await handleImageSearchRequest(
      mockReq('/api/image-search?q=Nobody'),
      res,
      { search: async () => [] },
    )
    expect(res.statusCode).toBe(404)
    expect(JSON.parse(res.body).results).toEqual([])
  })
})
