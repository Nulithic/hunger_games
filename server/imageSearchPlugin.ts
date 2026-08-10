import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { DEFAULT_IMAGE_LIMIT, searchDuckDuckGoImages } from './ddgImageSearch.ts'

function sendJson(
  res: ServerResponse,
  status: number,
  body: Record<string, unknown>,
): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function handleImageSearch(
  req: IncomingMessage,
  res: ServerResponse,
  next: Connect.NextFunction,
): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (url.pathname !== '/api/image-search') {
    next()
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

  try {
    const results = await searchDuckDuckGoImages(query, limit)
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

function attachImageSearchApi(middlewares: Connect.Server): void {
  middlewares.use((req, res, next) => {
    void handleImageSearch(req, res, next)
  })
}

export function imageSearchPlugin(): Plugin {
  return {
    name: 'hunger-games-image-search',
    configureServer(server) {
      attachImageSearchApi(server.middlewares)
    },
    configurePreviewServer(server) {
      attachImageSearchApi(server.middlewares)
    },
  }
}
