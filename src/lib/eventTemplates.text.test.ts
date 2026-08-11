import { describe, expect, it } from 'vitest'
import {
  CORNUCOPIA_FLEE,
  CORNUCOPIA_HESITATE,
  CORNUCOPIA_KILLS,
  CORNUCOPIA_LOOT,
  CORNUCOPIA_RUSH,
  DAY_TEMPLATES,
  FEAST_TEMPLATES,
  NIGHT_TEMPLATES,
  type EventTemplate,
} from './eventTemplates'

function nonKill(templates: readonly EventTemplate[]): EventTemplate[] {
  return templates.filter((template) => template.kind !== 'kill')
}

function render(template: EventTemplate, names: readonly string[]): string {
  if (template.needs === 2) {
    return template.text(names[0] ?? 'A', names[1] ?? 'B')
  }
  return template.text(names)
}

describe('eventTemplates meaningful non-kill beats', () => {
  it('keeps expanded kill pools and day/night non-kill volume', () => {
    const dayKills = DAY_TEMPLATES.filter((t) => t.kind === 'kill')
    const nightKills = NIGHT_TEMPLATES.filter((t) => t.kind === 'kill')
    const feastKills = FEAST_TEMPLATES.filter((t) => t.kind === 'kill')

    expect(dayKills.length).toBeGreaterThanOrEqual(12)
    expect(nightKills.length).toBeGreaterThanOrEqual(12)
    expect(CORNUCOPIA_KILLS.length).toBeGreaterThanOrEqual(8)
    expect(feastKills.length).toBeGreaterThanOrEqual(3)

    const allKillText = [
      ...dayKills,
      ...nightKills,
      ...CORNUCOPIA_KILLS,
      ...feastKills,
    ].map((template) => render(template, ['Ada', 'Grace']))
    expect(new Set(allKillText).size).toBe(allKillText.length)
    expect(allKillText.length).toBeGreaterThanOrEqual(35)

    expect(nonKill(DAY_TEMPLATES).length).toBeGreaterThanOrEqual(15)
    expect(nonKill(NIGHT_TEMPLATES).length).toBeGreaterThanOrEqual(15)
    expect(FEAST_TEMPLATES.length).toBeGreaterThanOrEqual(6)
  })

  it('makes every kill name both tributes and end the fight clearly', () => {
    const kills = [
      ...DAY_TEMPLATES.filter((t) => t.kind === 'kill'),
      ...NIGHT_TEMPLATES.filter((t) => t.kind === 'kill'),
      ...CORNUCOPIA_KILLS,
      ...FEAST_TEMPLATES.filter((t) => t.kind === 'kill'),
    ]

    for (const template of kills) {
      const text = render(template, ['Ada', 'Grace'])
      expect(text).toContain('Ada')
      expect(text).toContain('Grace')
      expect(text).toMatch(
        /cannon|\bkill|\bdead|\bdie|finish|fall|\bend|body|life|throat|blood|cut /i,
      )
      expect(text.length).toBeLessThanOrEqual(160)
    }
  })

  it('keeps pair templates as a meaningful share of non-kill day/night beats', () => {
    for (const list of [DAY_TEMPLATES, NIGHT_TEMPLATES]) {
      const flavor = nonKill(list)
      const pairs = flavor.filter((template) => template.needs === 2)
      const share = pairs.length / flavor.length
      expect(share).toBeGreaterThanOrEqual(0.25)
      expect(share).toBeLessThanOrEqual(0.4)
    }
  })

  it('renders unique, plural-safe, narration-sized lines without fake deaths', () => {
    const lists: Array<{ name: string; templates: readonly EventTemplate[] }> = [
      { name: 'day', templates: DAY_TEMPLATES },
      { name: 'night', templates: NIGHT_TEMPLATES },
      { name: 'feast', templates: FEAST_TEMPLATES },
      {
        name: 'cornucopia',
        templates: [
          ...CORNUCOPIA_RUSH,
          ...CORNUCOPIA_HESITATE,
          ...CORNUCOPIA_FLEE,
          ...CORNUCOPIA_LOOT,
          ...CORNUCOPIA_KILLS,
        ],
      },
    ]

    for (const { name, templates } of lists) {
      const rendered = templates.map((template) => render(template, ['Ada', 'Grace']))
      expect(new Set(rendered).size, `${name} duplicates`).toBe(rendered.length)

      for (const template of templates) {
        const single = render(template, ['Ada'])
        expect(single.length, `${name} line too long`).toBeLessThanOrEqual(160)

        if (template.kind === 'kill') continue

        expect(single).not.toMatch(/\b(dies|is dead|kills)\b/i)

        if (template.needs === 2) {
          const pair = render(template, ['Ada', 'Grace'])
          expect(pair).toContain('Ada')
          expect(pair).toContain('Grace')
          continue
        }

        const many = render(template, ['Ada', 'Grace', 'Alan'])
        expect(many).not.toBe(single)
        expect(many).toContain('Ada')
        expect(many).toContain('Grace')
        expect(many).toContain('Alan')
      }
    }
  })

  it('keeps cornucopia rush verbs and the Cornucopia keyword for broadcast tests', () => {
    const rush = CORNUCOPIA_RUSH.map((template) => render(template, ['Ada', 'Grace']))
    expect(rush.some((text) => /run|sprint/i.test(text))).toBe(true)
    expect(rush.some((text) => /cornucopia/i.test(text))).toBe(true)
  })
})
