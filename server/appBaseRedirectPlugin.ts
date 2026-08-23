import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { redirectLocationForRequest } from '../src/lib/appBase.ts'

function attachRedirect(middlewares: Connect.Server, base: string): void {
  middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
    const location = redirectLocationForRequest(req.url, base)
    if (!location) {
      next()
      return
    }
    res.statusCode = 302
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Location', location)
    res.end()
  })
}

/** In dev/preview, `/` redirects to the Vite base (e.g. `/hunger_games/`). */
export function appBaseRedirectPlugin(base: string): Plugin {
  return {
    name: 'hunger-games-app-base-redirect',
    configureServer(server) {
      attachRedirect(server.middlewares, base)
    },
    configurePreviewServer(server) {
      attachRedirect(server.middlewares, base)
    },
  }
}
