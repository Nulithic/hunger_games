import { describe, expect, it } from 'vitest'
import type { Tribute } from '../types'
import { splitTextByTributeNames } from './eventText'

const tributes: Tribute[] = [
  {
    id: '1',
    name: 'Katniss Everdeen',
    district: 12,
    imageUrl: null,
    imageSource: 'avatar',
    alive: true,
    kills: 0,
  },
  {
    id: '2',
    name: 'Katniss',
    district: 1,
    imageUrl: null,
    imageSource: 'avatar',
    alive: true,
    kills: 0,
  },
  {
    id: '3',
    name: 'Peeta Mellark',
    district: 12,
    imageUrl: null,
    imageSource: 'avatar',
    alive: true,
    kills: 0,
  },
]

describe('splitTextByTributeNames', () => {
  it('wraps tribute names and prefers the longest match', () => {
    expect(
      splitTextByTributeNames('Katniss Everdeen fights Peeta Mellark', tributes),
    ).toEqual([
      { type: 'name', value: 'Katniss Everdeen', district: 12 },
      { type: 'text', value: ' fights ' },
      { type: 'name', value: 'Peeta Mellark', district: 12 },
    ])
  })

  it('leaves plain text alone when no names match', () => {
    expect(splitTextByTributeNames('The gong sounds.', tributes)).toEqual([
      { type: 'text', value: 'The gong sounds.' },
    ])
  })

  it('skips coloring names that appear in multiple districts', () => {
    const twins: Tribute[] = [
      { ...tributes[1]!, id: 'x', name: 'Twin', district: 1 },
      { ...tributes[2]!, id: 'y', name: 'Twin', district: 2 },
    ]
    expect(splitTextByTributeNames('Twin finds shelter.', twins)).toEqual([
      { type: 'text', value: 'Twin finds shelter.' },
    ])
  })
})
