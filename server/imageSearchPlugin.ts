import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { handleImageSearchRequest } from './imageSearchApi.ts'

function attachImageSearchApi(middlewares: Connect.Server): void {
  middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
    void handleImageSearchRequest(req, res, { next })
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
