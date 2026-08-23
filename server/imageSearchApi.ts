import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  DEFAULT_IMAGE_LIMIT,
  searchDuckDuckGoImages,
  type DdgImageHit,
} from './ddgImageSearch.ts'

export type ImageSearchFn = (
  query: string,
  limit: number,
) => Promise<DdgImageHit[]>

export type ImageSearchRequestOptions = {
  search?: ImageSearchFn
  next?: () => void
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export async function handleImageSearchRequest(
  req: IncomingMessage,
  res: ServerResponse,
  options: ImageSearchRequestOptions = {},
): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (url.pathname !== '/api/image-search') {
    if (options.next) {
      options.next()
      return
    }
    sendJson(res, 404, { error: 'Not found' })
    return
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const query = url.searchParams.get('q')?.trim() ?? ''
  if (!query) {
    sendJson(res, 400, { error: 'Missing q parameter' })
    return
  }

  const limitRaw = Number(url.searchParams.get('limit') ?? DEFAULT_IMAGE_LIMIT)
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 20)
    : DEFAULT_IMAGE_LIMIT

  const search = options.search ?? searchDuckDuckGoImages

  try {
    const results = await search(query, limit)
    if (results.length === 0) {
      sendJson(res, 404, { error: 'No image found', results: [] })
      return
    }
    sendJson(res, 200, { results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image search failed'
    sendJson(res, 502, { error: message, results: [] })
  }
}
