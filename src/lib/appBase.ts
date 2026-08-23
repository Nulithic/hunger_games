/** Production mount on taenae.app. Override with VITE_BASE if needed. */
export const DEFAULT_APP_BASE = '/hunger_games/'

/**
 * Normalize a Vite `base` so assets resolve under a subpath.
 * Empty / unsafe values fall back to the production default.
 */
export function normalizeAppBase(value: string | undefined | null): string {
  const raw = value?.trim() ?? ''
  if (raw.length === 0) return DEFAULT_APP_BASE
  if (raw === '/') return '/'
  if (
    raw.includes('..') ||
    raw.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)
  ) {
    return DEFAULT_APP_BASE
  }
  const withLead = raw.startsWith('/') ? raw : `/${raw}`
  return withLead.endsWith('/') ? withLead : `${withLead}/`
}

/** Dev/preview: send `/` to the app base so opening the host still works. */
export function redirectLocationForRequest(
  url: string | undefined,
  base: string,
): string | null {
  if (base === '/') return null
  const path = (url ?? '/').split('?')[0]
  if (path === '/' || path === '') return base
  return null
}
