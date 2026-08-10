import type { Phase } from '../types'
import { formatNameList } from './formatNames'

export type KillTemplate = {
  kind: 'kill'
  needs: 2
  text: (a: string, b: string) => string
}

export type SoloTemplate = {
  kind: 'survive' | 'flavor' | 'opening'
  needs: 1
  text: (names: readonly string[]) => string
}

export type PairFlavorTemplate = {
  kind: 'flavor'
  needs: 2
  text: (a: string, b: string) => string
}

export type EventTemplate = KillTemplate | SoloTemplate | PairFlavorTemplate

function solo(
  names: readonly string[],
  singular: string,
  plural: string,
): string {
  const who = formatNameList(names)
  return `${who} ${names.length === 1 ? singular : plural}`
}

export const CORNUCOPIA_RUSH: SoloTemplate[] = [
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'runs straight for the Cornucopia.', 'run straight for the Cornucopia.'),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'sprints for the nearest weapon crate.', 'sprint for the nearest weapon crate.'),
  },
]

export const CORNUCOPIA_HESITATE: SoloTemplate[] = [
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'waits a beat, then grabs a pack at the rim.', 'wait a beat, then grab packs at the rim.'),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'hangs back and snatches a canteen.', 'hang back and snatch canteens.'),
  },
]

export const CORNUCOPIA_FLEE: SoloTemplate[] = [
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'runs for the trees without looking back.', 'run for the trees without looking back.'),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'skips the scramble and heads into cover.', 'skip the scramble and head into cover.'),
  },
]

export const CORNUCOPIA_KILLS: KillTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} and ${b} fight over a knife. ${a} wins. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} spears ${b} near the Cornucopia mouth.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} gets a machete first and cuts down ${b}.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} slams ${b} into the Cornucopia wall. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} kills ${b} from behind and takes their supplies.`,
  },
]

export const CORNUCOPIA_LOOT: SoloTemplate[] = [
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'gets out with a backpack and some wire.', 'get out with backpacks and wire.'),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'escapes with bread and a short sword.', 'escape with bread and short swords.'),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'grabs a med kit and rope, then vanishes.', 'grab med kits and rope, then vanish.'),
  },
]

export const DAY_TEMPLATES: EventTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} tracks ${b} to a creek and finishes it.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${b} tries to bargain for food. ${a} kills them anyway.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} forces ${b} off a cliff. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} ambushes ${b} with a wire garrote.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} and ${b} duel in an orchard. ${a} walks away.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'finds a sponsor drop with food and salve.', 'find a sponsor drop with food and salve.'),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'escapes a tracker jacker nest.', 'escape a tracker jacker nest.'),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'digs up a buried supply pack.', 'dig up a buried supply pack.'),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'climbs high and scouts the arena.', 'climb high and scout the arena.'),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'sets snares along a game trail.', 'set snares along a game trail.'),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => `A hovercraft passes over ${formatNameList(names)}.`,
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'cleans and wraps a shallow cut.', 'clean and wrap shallow cuts.'),
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) => `${a} and ${b} team up for now.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) => `${a} and ${b} split a canteen, then part ways.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) => `${a} and ${b} spot each other and both back off.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) => `${a} warns ${b} about mutts near the lake.`,
  },
]

export const NIGHT_TEMPLATES: EventTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} ambushes ${b} at a dying campfire.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${b} walks into ${a}'s snare. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `Mutts drive ${b} to ${a}, who finishes it.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `${a} kills ${b} in their sleep.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `A flood takes ${b}. ${a} holds the high ground.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'spends the night in a tree with a knife ready.', 'spend the night in trees with knives ready.'),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'keeps a cold camp and makes it to dawn.', 'keep cold camps and make it to dawn.'),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'outruns a mutt pack.', 'outrun a mutt pack.'),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'watches the fallen faces in the sky.', 'watch the fallen faces in the sky.'),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'sharpens a stake while fights echo nearby.', 'sharpen stakes while fights echo nearby.'),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      names.length === 1
        ? `Rain falls. ${formatNameList(names)} stays still and listens.`
        : `Rain falls. ${formatNameList(names)} stay still and listen.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) => `${a} and ${b} take turns on night watch.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) => `${a} and ${b} move camp after hearing mutts.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) => `${a} nearly ambushes ${b}, then both slip away.`,
  },
]

export const FEAST_TEMPLATES: EventTemplate[] = [
  {
    kind: 'flavor',
    needs: 1,
    text: (names) => solo(names, 'watches the feast table from cover.', 'watch the feast table from cover.'),
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) => `At the feast, ${a} kills ${b} over a backpack.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) => solo(names, 'snatches a satchel from the feast and runs.', 'snatch satchels from the feast and run.'),
  },
]

export type { FinaleBeat, FinaleSequence } from './finaleSequences'
export { FINALE_SEQUENCES } from './finaleSequences'

export function templatesForPhase(phase: Phase): EventTemplate[] {
  if (phase === 'day') return DAY_TEMPLATES
  if (phase === 'night') return NIGHT_TEMPLATES
  return DAY_TEMPLATES
}
