import { describe, expect, it } from 'vitest'
import { formatNameList } from './formatNames'

describe('formatNameList', () => {
  it('formats one, two, and many names', () => {
    expect(formatNameList(['Ada'])).toBe('Ada')
    expect(formatNameList(['Ada', 'Grace'])).toBe('Ada and Grace')
    expect(formatNameList(['Ada', 'Grace', 'Alan'])).toBe('Ada, Grace, and Alan')
  })
})
