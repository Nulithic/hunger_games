import type { Phase } from '../types'

export type KillTemplate = {
  kind: 'kill'
  needs: 2
  text: (a: string, b: string) => string
}

export type SoloTemplate = {
  kind: 'survive' | 'flavor' | 'opening'
  needs: 1
  text: (a: string) => string
}

export type PairFlavorTemplate = {
  kind: 'flavor'
  needs: 2
  text: (a: string, b: string) => string
}

export type EventTemplate = KillTemplate | SoloTemplate | PairFlavorTemplate

export const CORNUCOPIA_RUSH: SoloTemplate[] = [
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `${a} bolts straight for the Cornucopia the instant the gong sounds, eyes locked on a pack near the mouth of the horn.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `${a} sprints through the dust, shoving past slower tributes for a shot at the nearest weapon crate.`,
  },
]

export const CORNUCOPIA_HESITATE: SoloTemplate[] = [
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `${a} freezes for a heartbeat on the metal plate, watching the scramble, then edges toward a lonely backpack at the rim.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `${a} takes three careful steps, reading the chaos, and snatches a canteen before anyone claims it.`,
  },
]

export const CORNUCOPIA_FLEE: SoloTemplate[] = [
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} turns and runs for the tree line without looking back, vanishing into cover while steel rings behind them.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} abandons the Cornucopia entirely, crashing through brush until the roar of the bloodbath fades.`,
  },
]

export const CORNUCOPIA_KILLS: KillTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} collide over the same knife. ${a} comes up with it; ${b} does not get back up. A cannon fires.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} reaches the cornucopia mouth first, but ${a} is faster with a thrown spear from the outer ring. ${b} falls among the scattered grain.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} wrestles a machete free and swings wildly. ${b}, still empty-handed, never makes it to the woods.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `In the crush of bodies, ${a} drives ${b} into the metal wall of the Cornucopia. The Capitol cameras linger. Another face fades from the sky.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} tries to drag a net of supplies clear; ${a} cuts them down from behind and claims the prize.`,
  },
]

export const CORNUCOPIA_LOOT: SoloTemplate[] = [
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} escapes the horn with a backpack, a coil of wire, and blood that is not their own drying on their sleeve.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} limps away clutching a loaf of bread and a short sword, already scanning for a place to disappear.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} grabs a med kit and a length of rope, then melts into the tall grass before the next fight finds them.`,
  },
]

export const DAY_TEMPLATES: EventTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} tracks ${b} to a shallow creek. After a short, vicious fight in the mud, only ${a} walks back into the trees.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} tries to bargain for a share of ${a}'s food. ${a} pretends to agree, then ends it when ${b}'s guard drops.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `A Career-style chase ends at a cliff edge: ${a} forces ${b} over. The cannon confirms it.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} springs from cover with a wire garrote. ${b}'s struggle is brief; the woods go quiet again.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} meet in a ruined orchard. Knives flash. When the dust settles, ${a} is still standing among the fallen fruit.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} finds a sponsor parachute snagged in a pine — burn salve, dried meat, and a note that simply says keep moving.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} narrowly escapes a tracker jacker nest, diving into a cold stream until the buzzing fades.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} digs up a forgotten supply pack half-buried near an old fence line and restocks water and bandages.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} climbs high and maps the arena from above: lake to the west, smoke to the south, danger everywhere.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `${a} spends hours setting snares along a game trail, whispering strategies to keep fear from taking hold.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `Hovercraft shadows pass over ${a}. The anthem feels closer somehow, even in daylight.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `${a} treats a shallow cut with boiled water and strips of shirt, forcing their hands to stop shaking.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} form a temporary alliance, agreeing to share a campsite until the next feast — trust optional.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} nearly fight over a single canteen, then split the water and go opposite ways without another word.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} spots ${b} across a clearing. They stare each other down for a long minute, then both fade back into cover.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} warns ${b} about mutts near the lake. Whether kindness or strategy, ${b} listens and changes course.`,
  },
]

export const NIGHT_TEMPLATES: EventTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} trusts the wrong silhouette in the dark. ${a} was waiting by the dying coals. Another cannon rolls across the arena.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a}'s snare finally pays off — ${b} steps into it at moonrise and never climbs free.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `Mutts drive ${b} toward ${a}'s camp. ${a} finishes what the arena started, then stamps out the fire.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} slips into ${b}'s shelter while they sleep. By dawn, only one sleeping bag is still warm.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `A storm floods the low ground. ${a} claims the high ridge; ${b} is caught in the surge and does not surface.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} spends the night wedged in a tree crotch, knife in hand, counting cannons until the sky lightens.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} keeps a cold camp — no smoke, no light — and makes it to dawn with rations untouched.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} outruns a pack of mutts through thornbrush, collapsing only when the howling finally dies away.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `The anthem blooms across the sky. ${a} watches a fallen face appear and whispers a promise to still be there tomorrow.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `${a} listens to distant fighting and sharpens a stake until the wood is needle-fine.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `Rain drums the canopy above ${a}. Every snap of a twig becomes a possible ending.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} share a tense night watch, taking turns sleeping with one eye half open.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} hear the same mutt pack and silently agree to move camp together before it circles back.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} nearly ambushes ${b} in the dark, realizes who it is too late to strike cleanly, and both vanish in opposite directions.`,
  },
]

export const FEAST_TEMPLATES: EventTemplate[] = [
  {
    kind: 'flavor',
    needs: 1,
    text: (a) =>
      `A feast table appears at the Cornucopia. ${a} studies it from cover, weighing hunger against the risk of another bloodbath.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `At the feast, ${a} and ${b} go for the same backpack. Only ${a} leaves the clearing alive.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (a) =>
      `${a} darts in during a distraction, snatches a small satchel from the feast, and is gone before the next spear flies.`,
  },
]

export function templatesForPhase(phase: Phase): EventTemplate[] {
  if (phase === 'day') return DAY_TEMPLATES
  if (phase === 'night') return NIGHT_TEMPLATES
  return DAY_TEMPLATES
}
