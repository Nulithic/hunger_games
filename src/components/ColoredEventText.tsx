import { districtAccentColor } from '../lib/districts'
import { splitTextByTributeNames } from '../lib/eventText'
import type { Tribute } from '../types'

type ColoredEventTextProps = {
  text: string
  tributes: readonly Tribute[]
}

export function ColoredEventText({ text, tributes }: ColoredEventTextProps) {
  const parts = splitTextByTributeNames(text, tributes)

  return (
    <>
      {parts.map((part, index) =>
        part.type === 'name' ? (
          <span
            key={`${part.value}-${index}`}
            className="tribute-name-chip"
            style={{ color: districtAccentColor(part.district) }}
          >
            {part.value}
          </span>
        ) : (
          <span key={`text-${index}`}>{part.value}</span>
        ),
      )}
    </>
  )
}
