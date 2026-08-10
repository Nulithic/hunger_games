import { describe, expect, it } from 'vitest'
import { buildAvatarDataUrl, portraitUrl } from './avatar'

describe('buildAvatarDataUrl', () => {
  it('uses alphanumeric initials from the name', () => {
    const url = buildAvatarDataUrl('Ada Lovelace')
    const decoded = decodeURIComponent(url.replace('data:image/svg+xml;charset=utf-8,', ''))
    expect(decoded).toContain('>AL<')
  })

  it('falls back to a safe mark when initials are non-alphanumeric', () => {
    const url = buildAvatarDataUrl('&Eve <Ace>')
    const decoded = decodeURIComponent(url.replace('data:image/svg+xml;charset=utf-8,', ''))
    expect(decoded).toContain('>?<')
    expect(decoded).not.toContain('&E')
    expect(decoded).not.toContain('<A')
  })
})

describe('portraitUrl', () => {
  it('prefers provided image urls', () => {
    expect(portraitUrl('https://example.com/a.jpg', 'Ada')).toBe(
      'https://example.com/a.jpg',
    )
  })

  it('builds an avatar when image is missing', () => {
    expect(portraitUrl(null, 'Ada Lovelace')).toMatch(/^data:image\/svg\+xml/)
  })
})
