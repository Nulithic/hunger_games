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
    text: (names) =>
      solo(
        names,
        'sprints for the Cornucopia mouth and does not look at who they shove down.',
        'sprint for the Cornucopia mouth and do not look at who they shove down.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'runs straight into the bloodbath for a weapon that might buy another day.',
        'run straight into the bloodbath for weapons that might buy another day.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'sprints for the nearest crate, already choosing who not to help.',
        'sprint for the nearest crates, already choosing who not to help.',
      ),
  },
]

export const CORNUCOPIA_HESITATE: SoloTemplate[] = [
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'waits one heartbeat too long, then takes a pack from someone who no longer needs it.',
        'wait one heartbeat too long, then take packs from tributes who no longer need them.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'hangs back until the first scream, then snatches a canteen and runs.',
        'hang back until the first scream, then snatch canteens and run.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'counts the Careers before moving — and still goes in for a knife.',
        'count the Careers before moving — and still go in for knives.',
      ),
  },
]

export const CORNUCOPIA_FLEE: SoloTemplate[] = [
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'runs for the trees with a jacket, no weapon, and a head start.',
        'run for the trees with jackets, no weapons, and a head start.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'skips the scramble and vanishes into cover before the first cannon.',
        'skip the scramble and vanish into cover before the first cannon.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'turns their back on the Cornucopia and chooses distance over loot.',
        'turn their backs on the Cornucopia and choose distance over loot.',
      ),
  },
]

export const CORNUCOPIA_KILLS: KillTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} tear at the same knife. ${a} keeps the blade — and ${b}'s blood. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} spears ${b} at the Cornucopia mouth before ${b} can lift a pack. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} reaches the machete first and cuts ${b} down mid-grab. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} slams ${b}'s head into the Cornucopia wall until the cannon answers.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} kills ${b} from behind for a backpack that still smells like home. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} freezes on the plates. ${a} does not. One throw ends it. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} collide over a bow. ${a} turns the arrow around. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} uses a net from the pile to pin ${b}, then finishes it without looking at the cameras. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} tries to flee with nothing. ${a} runs them down anyway — supplies can wait. Cannon.`,
  },
]

export const CORNUCOPIA_LOOT: SoloTemplate[] = [
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'gets out with a backpack, wire, and a clear look at whoever saw them take it.',
        'get out with backpacks, wire, and clear looks at whoever saw them take it.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'escapes with bread and a short sword — already counting every bite.',
        'escape with bread and short swords — already counting every bite.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'grabs a med kit and rope, then vanishes before gratitude can become a debt.',
        'grab med kits and rope, then vanish before gratitude can become a debt.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'leaves with a bow and three arrows, knowing the next fight will spend them.',
        'leave with bows and a handful of arrows, knowing the next fight will spend them.',
      ),
  },
]

export const DAY_TEMPLATES: EventTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} tracks ${b} to a creek by the wet footprints, and finishes it where the water hides the blood.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} offers half their food for mercy. ${a} takes all of it. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} forces ${b} off a cliff after a long chase. The cannon arrives before the echo dies.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} drops a wire garrote over ${b} from a low branch. Cannon — before ${b} can scream.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} duel in an orchard until ${a} walks away with the only knife left. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} waits at ${b}'s snare until the owner comes to check it — then ends the lesson. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} climbs for a sponsor parachute. ${a}'s arrow finds them first. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} drives ${b} into a tracker jacker nest. The swarm finishes what ${a} started. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} agree to share a kill on a Career. ${a} keeps the Career — and adds ${b}. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} begs for water at a dry creek. ${a} gives them a blade instead. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} collapses a dead tree onto ${b}'s camp and makes sure with a spear. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} recognizes ${b} from training and decides the Capitol will not get a rematch. Cannon.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'catches a sponsor parachute — bread, salve, and a debt to the Capitol.',
        'catch sponsor parachutes — bread, salve, and debts to the Capitol.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'drinks from a stagnant pool and spends the next hour wondering if that was a mistake.',
        'drink from a stagnant pool and spend the next hour wondering if that was a mistake.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'takes two tracker jacker stings getting clear. The hallucinations start by noon.',
        'take two tracker jacker stings getting clear. The hallucinations start by noon.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        "digs up someone else's buried cache and leaves the empty hole as a message.",
        'dig up buried caches and leave the empty holes as a message.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'risks a cooking fire: hot food now, a smoke column anyone can follow.',
        'risk cooking fires: hot food now, smoke columns anyone can follow.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'digs a broken arrowhead out of their own shoulder and does not make a sound.',
        'dig broken arrowheads out of their own shoulders and do not make a sound.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'is herded away from the water by a thorn wall the Gamemakers grew overnight.',
        'are herded away from the water by a thorn wall the Gamemakers grew overnight.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'counts what is left: three arrows, two matches, no water.',
        'count what is left: a few arrows, fewer matches, no water.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'freezes while a hovercraft lifts a body from the next clearing. Whoever did that is still close.',
        'freeze while a hovercraft lifts a body from the next clearing. Whoever did that is still close.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'smiles for a camera drone, because sponsors do not fund the sullen.',
        'smile for camera drones, because sponsors do not fund the sullen.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'sets snares along a game trail and does not pretend they are only for rabbits.',
        'set snares along a game trail and do not pretend they are only for rabbits.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'finds fresh boot prints in the mud and follows them instead of the water.',
        'find fresh boot prints in the mud and follow them instead of the water.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'watches the arena boundary crawl closer. The safe ground is half what it was at dawn.',
        'watch the arena boundary crawl closer. The safe ground is half what it was at dawn.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'hears a cannon and cannot decide whether the relief is worse than the fear.',
        'hear a cannon and cannot decide whether the relief is worse than the fear.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'chews bark to quiet a stomach that stopped asking politely.',
        'chew bark to quiet stomachs that stopped asking politely.',
      ),
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} split the last strip of dried meat and pretend it is enough for two.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} offers ${b} a truce until the Careers are dead. Neither of them believes the other.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} sight each other across a ravine and both back off. Today, distance is worth more than a kill.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} shouts a warning about the mutts by the lake. ${b} lives because of it, and both of them know it.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} reach the same stream from opposite banks and drink in shifts, weapons on the stones.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} gets the drop on ${b} and lowers the knife. The Capitol feed cuts away, bored.`,
  },
]

export const NIGHT_TEMPLATES: EventTemplate[] = [
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} reads ${b}'s fire from the ridge and ambushes them as the last log dies. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} walks into ${a}'s snare in the dark. The cannon is the first thing anyone hears.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `Mutts drive ${b} straight to ${a}'s spear. ${a} finishes what the pack started.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} finds ${b} asleep in a tree fork and ends it before the knife can wake them. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `A Gamemaker flood takes ${b}'s low ground. ${a} holds the ridge and does not offer a hand. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} follows ${b}'s coughing through the fog and cuts the throat that gave them away.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} lights a fire against the cold. ${a} uses the glow like a beacon. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} share first watch. Only ${a} is still breathing at the second. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} drops from a branch onto ${b}'s night trail and drives them into the mud for good. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} goes to the stream alone after midnight. ${a} has been waiting in the reeds. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} uses a lit torch as a lure, then puts ${b} out with the dark end. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} hears ${b} whispering a prayer and answers it with steel. Cannon.`,
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'keeps a cold camp: no fire, no sleep, and every sound is someone coming.',
        'keep cold camps: no fire, no sleep, and every sound is someone coming.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'straps into a tree fork with a belt and sleeps in ten-minute pieces.',
        'strap into tree forks with belts and sleep in ten-minute pieces.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'outruns a mutt pack and loses their supply pack doing it.',
        'outrun a mutt pack and lose their supply packs doing it.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'buries into leaf litter as the Gamemakers pull the temperature down, and wakes with fingers that will not close.',
        'bury into leaf litter as the Gamemakers pull the temperature down, and wake with fingers that will not close.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'gets a parachute at midnight: burn cream, no note. Someone in the Capitol is still betting on them.',
        'get parachutes at midnight: burn cream, no notes. Someone in the Capitol is still betting.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'boils creek water in a tin and drinks it too hot rather than wait in the dark.',
        'boil creek water and drink it too hot rather than wait in the dark.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'lies still under a deadfall while boots pass close enough to count.',
        'lie still under deadfalls while boots pass close enough to count.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'watches the faces in the sky and does the math on who is left to fear.',
        'watch the faces in the sky and do the math on who is left to fear.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'hears a familiar name in the anthem and puts their own fire out.',
        'hear familiar names in the anthem and put their own fires out.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'sharpens a stake by feel and rehearses the swing they hope not to need.',
        'sharpen stakes by feel and rehearse the swings they hope not to need.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'loses the fire to rain and trades warmth for the chance to hear footsteps.',
        'lose their fires to rain and trade warmth for the chance to hear footsteps.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'spots a camera lens glinting in the branches and stares into it until the Capitol looks away.',
        'spot camera lenses in the branches and stare into them until the Capitol looks away.',
      ),
  },
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        "goes hunting instead of hiding. Other tributes' fires are easy to read from the ridge.",
        "go hunting instead of hiding. Other tributes' fires are easy to read from the ridge.",
      ),
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} takes first watch. ${b} sleeps with a hand on a knife, in case ${a} has other plans.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} break camp at the sound of mutts and leave the fire burning as bait.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} has ${b} in the dark for three full seconds, and lets the moment pass.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} share a blanket against the cold and agree out loud that this ends tomorrow.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} counts the supplies twice, then asks ${b} where the rest of the bread went.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} decide the alliance costs more than it pays and split the camp without a word.`,
  },
]

export const FEAST_TEMPLATES: EventTemplate[] = [
  {
    kind: 'flavor',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'watches the feast table from cover and times the Careers like a hunt.',
        'watch the feast table from cover and time the Careers like a hunt.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'snatches a satchel from the feast and runs without checking what is inside.',
        'snatch satchels from the feast and run without checking what is inside.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'takes the pack marked with their own district number and does not open it until the call is gone.',
        'take packs marked with their own districts and do not open them until the call is gone.',
      ),
  },
  {
    kind: 'survive',
    needs: 1,
    text: (names) =>
      solo(
        names,
        'grabs medicine from the table and leaves food behind — the wound matters more than hunger.',
        'grab medicine from the table and leave food behind — the wounds matter more than hunger.',
      ),
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `At the feast, ${a} and ${b} reach the same backpack. ${a} keeps it. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} lets ${b} reach the table first, then takes the pack and the life.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${b} freezes at their district's crate. ${a} does not wait for courage. Cannon.`,
  },
  {
    kind: 'kill',
    needs: 2,
    text: (a, b) =>
      `${a} uses the feast horn as cover, cuts ${b} down in the rush, and is gone before the next scream. Cannon.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} and ${b} agree to grab and go together. Only the first half of that plan is honest.`,
  },
  {
    kind: 'flavor',
    needs: 2,
    text: (a, b) =>
      `${a} covers ${b} at the feast long enough for both to leave — and starts planning the betrayal for later.`,
  },
]

export type { FinaleBeat, FinaleSequence } from './finaleSequences'
export { FINALE_SEQUENCES } from './finaleSequences'

export function templatesForPhase(phase: Phase): EventTemplate[] {
  if (phase === 'day') return DAY_TEMPLATES
  if (phase === 'night') return NIGHT_TEMPLATES
  return DAY_TEMPLATES
}
