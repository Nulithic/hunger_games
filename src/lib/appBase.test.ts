import { describe, expect, it } from 'vitest'
import {
  DEFAULT_APP_BASE,
  normalizeAppBase,
  redirectLocationForRequest,
} from './appBase'

describe('normalizeAppBase', () => {
  it('defaults to the taenae.app Hunger Games subpath', () => {
    expect(DEFAULT_APP_BASE).toBe('/hunger_games/')
    expect(normalizeAppBase(undefined)).toBe('/hunger_games/')
    expect(normalizeAppBase(null)).toBe('/hunger_games/')
    expect(normalizeAppBase('')).toBe('/hunger_games/')
    expect(normalizeAppBase('   ')).toBe('/hunger_games/')
  })

  it('keeps a root path for local hosting', () => {
    expect(normalizeAppBase('/')).toBe('/')
  })

  it('adds leading and trailing slashes', () => {
    expect(normalizeAppBase('hunger_games')).toBe('/hunger_games/')
    expect(normalizeAppBase('/hunger_games')).toBe('/hunger_games/')
    expect(normalizeAppBase('/hunger_games/')).toBe('/hunger_games/')
  })

  it('rejects traversal and absolute URLs', () => {
    expect(normalizeAppBase('../secret')).toBe('/hunger_games/')
    expect(normalizeAppBase('https://evil.example/')).toBe('/hunger_games/')
    expect(normalizeAppBase('//evil.example/')).toBe('/hunger_games/')
  })
})

describe('redirectLocationForRequest', () => {
  it('redirects the host root to the app base', () => {
    expect(redirectLocationForRequest('/', '/hunger_games/')).toBe(
      '/hunger_games/',
    )
    expect(redirectLocationForRequest('', '/hunger_games/')).toBe(
      '/hunger_games/',
    )
    expect(redirectLocationForRequest(undefined, '/hunger_games/')).toBe(
      '/hunger_games/',
    )
  })

  it('does not redirect APIs or the app itself', () => {
    expect(redirectLocationForRequest('/api/kokoro/health', '/hunger_games/')).toBeNull()
    expect(redirectLocationForRequest('/hunger_games/', '/hunger_games/')).toBeNull()
    expect(redirectLocationForRequest('/', '/')).toBeNull()
  })
})
