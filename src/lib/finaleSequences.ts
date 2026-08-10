export type FinaleBeat = {
  kind: 'flavor' | 'survive'
  /** Which finalists appear in the beat. */
  focus: 'both' | 'winner' | 'loser'
  text: (winner: string, loser: string) => string
}

export type FinaleSequence = {
  opening: (a: string, b: string) => string
  beats: FinaleBeat[]
  kill: (winner: string, loser: string) => string
  aftermath: (winner: string, loser: string) => string
}

/** Multi-beat broadcast scripts for when only two tributes remain. */
export const FINALE_SEQUENCES: FinaleSequence[] = [
  {
    opening: (a, b) =>
      `The arena holds its breath. Only ${a} and ${b} remain — Capitol cameras swing in for the end.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} catch sight of each other across a ruined clearing. Neither blinks.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} circles wide through the brush, trying to steal the higher ground.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) => `${w} waits in the shadows, listening for every snapped twig.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${l} breaks cover too soon. ${w} is already moving — steel flashes between them.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} parries once, twice, then staggers as a cut opens along their ribs.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} presses without mercy, driving ${l} back through broken branches.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They lock blades. For a heartbeat the arena is only breath and grinding metal — then ${w} twists free.`,
      },
    ],
    kill: (w, l) =>
      `They collide at last. ${w} drives the blade home — ${l} falls. The final cannon cracks across the sky.`,
    aftermath: (w, l) =>
      `${w} stands over ${l} as the hovercraft descends. One tribute left. One Victor waiting.`,
  },
  {
    opening: (a, b) =>
      `Night presses in. ${a} and ${b} are the last two hearts still beating in the arena.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `A mutt howl splits the dark. ${w} and ${l} are driven toward the same lake shore.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} wades in first, knife reversed, eyes on the treeline behind.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} follows, water to the knees, every ripple a giveaway.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} spots ${l}'s reflection in the black water and steps in close.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They clash in the shallows — splash, gasp, a missed stab that skims ${w}'s arm.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} lunges first — desperate, loud, already committing too much.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} lets the rush carry ${l} off-balance into deeper water.`,
      },
    ],
    kill: (w, l) =>
      `${w} turns the strike aside and answers with a killing blow. ${l}'s cannon rolls like thunder.`,
    aftermath: (w) =>
      `Silence. Then cheers from the Capitol feeds. ${w} is alone beneath the stars.`,
  },
  {
    opening: (a, b) =>
      `The Gamemakers clear the field. Trees burn back. ${a} and ${b} have nowhere left to hide.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} walk into the open Cornucopia bowl, weapons ready, eyes locked.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `The first clash rings off golden metal. ${w} and ${l} break apart, already bleeding.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} feints left and nearly takes an ear — the crowd in the Capitol screams.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} answers with a brutal shoulder check that sends ${l} sprawling.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} rolls up, teeth bared, and comes on again like the Games owe them blood.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `They trade blows until both are bloodied — ${w} pressing, ${l} staggering but unbroken.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} finds one last reserve of strength and forces ${l} to the dirt.`,
      },
    ],
    kill: (w, l) =>
      `The finale ends in the dust of the Cornucopia. ${w} finishes ${l}. The last cannon fires.`,
    aftermath: (w, l) =>
      `${w} drops the weapon beside ${l} and looks up at the sky, waiting for the trumpets.`,
  },
  {
    opening: (a, b) =>
      `Two cannons already wrote the story down to this: ${a} versus ${b}. No alliances. No mercy.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'loser',
        text: (w, l) =>
          `${l} sets a snare on the trail, hoping ${w} will rush blind.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} spots the trap, cuts the cord, and follows ${l}'s tracks into the ravine.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `Loose shale slides underfoot. ${w} and ${l} scramble along the same narrow path.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (w, l) =>
          `${l} kicks a rock down at ${w} — it misses by inches and vanishes into the drop.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} closes the gap, knife scraping stone, forcing ${l} toward the ledge.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `Rocks clatter. ${w} and ${l} meet on the narrow ledge with nowhere to run.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `They grapple at the edge — fingers, teeth, desperation. One of them will fall.`,
      },
    ],
    kill: (w, l) =>
      `${w} shoves ${l} from the ledge — or drives steel before the fall. Either way, ${l} is gone. Final cannon.`,
    aftermath: (w) =>
      `${w} climbs back into the light, shaking, victorious, and terribly alone.`,
  },
  {
    opening: (a, b) =>
      `Thunderheads boil over the arena. The Gamemakers promise spectacle: ${a} and ${b}, alone in the storm.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `Lightning stitches the treeline. ${w} and ${l} sprint for cover that will not last.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} counts the seconds between flash and thunder, hunting safer ground.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} grabs a tall pine first. The air tastes like metal.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} almost collide in the rain — blades wet, footing gone.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} drives ${l} back toward the pine as another bolt whites out the sky.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} refuses to yield the trunk, hair lifting in the charged air.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} dives clear as the bolt finds ${l}'s tree.`,
      },
    ],
    kill: (w, l) =>
      `Fire races down the bark. ${l} never rises. ${w} watches the smoke until the final cannon answers.`,
    aftermath: (w) =>
      `Rain hisses on burning wood. ${w} walks into the open, soaked, crowned by the storm.`,
  },
  {
    opening: (a, b) =>
      `A supply drop blooms over the meadow — one pack, two hungry tributes. ${a}. ${b}.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} sprint from opposite tree lines. The parachute hits between them.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They reach the straps together and freeze, fingers on the same buckle.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (w, l) =>
          `${l} offers a truce: split the food, fight tomorrow. ${w} almost believes it.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} nods, voice soft, while the other hand finds the knife at their belt.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} turns to open the pack — relief lasts half a breath.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} twists the strap into a garrote and yanks ${l} backward into the grass.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${l} claws at the silk. ${w} holds on as the Capitol feed zooms in.`,
      },
    ],
    kill: (w, l) =>
      `The “alliance” lasts six seconds. ${w} leaves ${l} beside the half-opened drop. Final cannon.`,
    aftermath: (w) =>
      `${w} eats alone under the parachute silk while the Capitol howls approval.`,
  },
  {
    opening: (a, b) =>
      `A ring of fire closes like a noose. Inside it: only ${a} and ${b}.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} cough through the smoke, blades drawn, heat baking the clearing.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} tries to break through the flames and staggers back, singed and furious.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} uses the firelight — every move of ${l} is written in orange.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `Ash swirls as they clash. ${w}'s sleeve catches; ${l}'s hair smokes.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} screams and swings wild, trying to end it before the ring shrinks again.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} slips inside the arc and opens a cut across ${l}'s thigh.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${l} drops to a knee. The fire roars closer. There is nowhere left but through ${w}.`,
      },
    ],
    kill: (w, l) =>
      `${w} drives ${l} into the burning wall. The cannon fires over the crackle of the trees.`,
    aftermath: (w) =>
      `The ring dies down on cue. ${w} stands in ash that used to be a forest.`,
  },
  {
    opening: (a, b) =>
      `Wolf mutts pour from the tree line. They do not care who wins — only that ${a} and ${b} run.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} flee side by side, the pack’s screams wearing familiar voices.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They vault a fallen log together — for one second it almost looks like an alliance.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `Then ${w} cuts left. ${l} is forced right. The pack splits with them.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} slips on creek stones. Mutts close in, jaws clicking.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} turns back — not to save ${l}, but to finish what the mutts started.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `${l} fights upright again, cornered between teeth and ${w}'s spear.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} waits for the mutts to flinch on Gamemaker cue — then takes the throw.`,
      },
    ],
    kill: (w, l) =>
      `One clean spear throw ends it before the pack can. ${l} falls. The mutts vanish on Gamemaker command. Final cannon.`,
    aftermath: (w) =>
      `${w} does not celebrate. The mute forest feels worse than the chase.`,
  },
  {
    opening: (a, b) =>
      `The ground between ${a} and ${b} blooms with warning lights — a minefield, courtesy of the Capitol.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} freeze mid-step. One wrong foot ends the Games early.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} crouches, studying the pattern of lights like a puzzle with teeth.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (w, l) =>
          `${l} tosses a rock to test a path. The blast throws dirt over ${w}'s boots.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `Smoke clears. ${w} and ${l} are closer now — and more terrified.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} maps the safe stones while ${l} panics, hopping too fast.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} taunts across the field, voice cracking, trying to force a mistake.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} does not answer. Patience is a weapon ${l} never learned.`,
      },
    ],
    kill: (w, l) =>
      `${l} misjudges a gap. The mine answers. ${w} never has to swing. Final cannon.`,
    aftermath: (w) =>
      `${w} picks a careful path out as the lights wink off, one by one.`,
  },
  {
    opening: (a, b) =>
      `The lake freezes overnight. Morning finds ${a} and ${b} on opposite shores of black ice.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `They step out anyway. The ice complains under ${w} and ${l} like a held breath.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} slides low, weight spread, knife ready for a fight that cannot be loud.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} charges, boots skidding, knife raised for a fast end.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They collide mid-lake — a spinning, graceless scramble that spiderwebs the ice.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} sidesteps the next rush. Cracks race toward ${l}'s feet.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} tries to retreat and hears the lake open behind them.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} keeps ${l} on the weak ice with short, punishing jabs.`,
      },
    ],
    kill: (w, l) =>
      `${l} plunges through. ${w} holds the edge with a spear until the thrashing stops. Final cannon under the ice.`,
    aftermath: (w) =>
      `${w} crawls back to shore, lips blue, Victor of a silent lake.`,
  },
  {
    opening: (a, b) =>
      `Both ${a} and ${b} climb the Cornucopia’s golden horn — the only high ground left.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `They meet at the tip, wind tearing at their jackets, the arena spread out below.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `The first exchange nearly sends both of them sliding. Fingers find seams in the metal.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (w, l) =>
          `${l} lands a cut across ${w}'s forearm. Blood makes the slope shine.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} answers with a boot to the chest that knocks the wind from ${l}.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} trade cuts on the slope — no room for elegance, only staying up.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} lunges for a finishing stab and overcommits on the curve.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} hooks ${l}'s ankle and lets gravity finish the argument.`,
      },
    ],
    kill: (w, l) =>
      `${l} tumbles down the horn. The landing is final. Cannon. ${w} stays kneeling at the peak.`,
    aftermath: (w) =>
      `From above, ${w} looks small — and unbeatable. The trumpets find them there.`,
  },
  {
    opening: (a, b) =>
      `Fog floods the arena on Gamemaker cue. ${a} and ${b} can hear each other breathe — nothing else.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `Footsteps circle. ${w} and ${l} pass within arm’s reach without knowing.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} stops moving entirely — becomes another wet tree in the white.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} whispers a taunt into the fog. It gives away everything.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} follows the voice step by careful step, knife low.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${l} swings at a shape that isn’t there. ${w} is already behind them.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} spins, panicked, cutting mist instead of flesh.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} waits until ${l}'s outline hardens — then commits.`,
      },
    ],
    kill: (w, l) =>
      `One thrust from the fog. ${l} never sees the face that ends them. Final cannon in the white.`,
    aftermath: (w) =>
      `The fog lifts like a curtain. ${w} is revealed alone, blade still wet.`,
  },
  {
    opening: (a, b) =>
      `A tracker jacker nest hangs between ${a} and ${b} like a dare.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} circle the nest at spear length, neither willing to touch it first.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} chews smoke leaf and checks the wind with a wet finger.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (w, l) =>
          `${l} hurls a rock at the nest, hoping the swarm chooses ${w}.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} is already gone — circling downwind while ${l} stares at the buzzing cloud.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `The jackers boil out toward ${l}. ${w} watches from cover, patient as poison.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} runs, swatting, stumbling, venom already rewriting the world.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} steps into the clearing only when ${l} drops to their knees.`,
      },
    ],
    kill: (w, l) =>
      `${l} swats, screams, and collapses in hallucinations. ${w} ends it cleanly. Final cannon.`,
    aftermath: (w) =>
      `${w} burns the nest afterward. No encore for the Capitol’s insects.`,
  },
  {
    opening: (a, b) =>
      `The feast table still stands — empty plates, one knife left between ${a} and ${b}.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} approach from opposite ends of the long table, footsteps echoing.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They sit. They stare. Capitol commentators whisper about manners and murder.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} reaches first — not for the knife, but for a cracked goblet, buying time.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} mirrors the gesture, eyes never leaving ${l}'s hands.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `A plate tips. The sound is nothing — and somehow it starts the violence.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} lunges across the cloth; silverware screams against wood.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} is a heartbeat faster and pins ${l}'s wrist to the table.`,
      },
    ],
    kill: (w, l) =>
      `Silverware scatters. ${w} takes the last knife and the last life. Final cannon over the banquet.`,
    aftermath: (w, l) =>
      `${w} leaves ${l} seated at the empty feast, a grotesque place card for victory.`,
  },
  {
    opening: (a, b) =>
      `The tunnels under the arena become a maze. ${a} and ${b} are sealed inside with one exit.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `Torchlight doubles on wet stone as ${w} and ${l} hunt each other’s echoes.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} marks turns with scratches so the maze cannot swallow them twice.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} extinguishes their torch on purpose — darkness as a weapon.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They meet blind in a junction. A wild swing; a grunt; someone is cut.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} finds the exit ladder first and starts to climb.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} grabs ${l}'s ankle from below. The ladder becomes a battlefield.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `Boots slam rungs. ${l} kicks; ${w} climbs; neither will let go.`,
      },
    ],
    kill: (w, l) =>
      `${l} falls back into the dark. ${w} climbs into daylight alone. Final cannon from underground.`,
    aftermath: (w) =>
      `${w} seals the hatch. Whatever is left below can stay there.`,
  },
  {
    opening: (a, b) =>
      `Distance is the weapon now. ${a} has the last bow. ${b} has nowhere left to hide.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} climbs a dead tree and nocks an arrow while ${l} sprints between stumps.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} weaves, raising a dented shield scavenged from the bloodbath.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w}'s first arrow sparks off the shield. The second is already drawn.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} closes the distance in a suicidal sprint, shield up, screaming.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} drops from the tree and rolls, forcing ${l} to turn too late.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `Twenty paces. Fifteen. The shield tips for half a breath.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} waits for that gap — one breath, one release.`,
      },
    ],
    kill: (w, l) =>
      `The arrow finds the gap. ${l} drops mid-stride. Final cannon. ${w} lowers the bow with shaking hands.`,
    aftermath: (w) =>
      `${w} snaps the last arrow in half. The Games will not get an encore shot.`,
  },
  {
    opening: (a, b) =>
      `The arena floods. Hills become islands. ${a} and ${b} share the last patch of dry ground.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `Water climbs their calves. ${w} and ${l} shove for space as the island shrinks.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} tries to swim for a floating crate and gets dragged back by the current.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} claims the high mud and makes ${l} come through the water to reach them.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They clash in chest-deep water — no footing, only grabbing and gasping.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (w, l) =>
          `${l} gets a fistful of ${w}'s hair and almost forces them under.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} twists free, lungs burning, and hooks ${l}'s elbow.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `The island is gone. There is only water, and who can keep the other down.`,
      },
    ],
    kill: (w, l) =>
      `${w} holds ${l} under until the struggle ends. The final cannon booms across the flood.`,
    aftermath: (w) =>
      `${w} crawls onto the last mud spit as the waters begin, politely, to recede.`,
  },
  {
    opening: (a, b) =>
      `${a} and ${b} find each other — and for a moment, neither raises a weapon.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `They talk about home. About the Capitol. About refusing to play.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (_w, l) =>
          `${l} drops their knife in the dirt. A dare. A prayer.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} stares at the blade… then at the cameras that will never stop watching.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `For a long minute nobody moves. Even the wind seems to wait.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} almost smiles — believing, for one last second, that mercy is possible.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} picks up the knife. The choice is already made in their eyes.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${l} understands too late. ${w} steps in close, apologizing with silence.`,
      },
    ],
    kill: (w, l) =>
      `${w} picks up ${l}'s knife and uses it. Mercy was never on the broadcast schedule. Final cannon.`,
    aftermath: (w, l) =>
      `${w} sits beside ${l} until the hovercraft comes, eyes empty as the sky.`,
  },
  {
    opening: (a, b) =>
      `A hovercraft descends early — false hope for ${a} and ${b}. The ladder unrolls… then jerks away.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} leap for the ladder together. The Gamemakers laugh in private boxes.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `They hang side by side for a second — then the craft yaws and dumps them.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} hits hardest, wind knocked out, knife skittering away.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} lands better, rolls, and is already up while the craft climbs.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} crawls for the blade, coughing dust, refusing to die on a prank.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w, l) =>
          `${w} boots the knife farther and stands over ${l}.`,
      },
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `Above them the hovercraft circles once more, filming the kill it arranged.`,
      },
    ],
    kill: (w, l) =>
      `Cruelty was the point. ${w} finishes ${l} under the retreating craft. Final cannon.`,
    aftermath: (w) =>
      `When the real hovercraft returns, ${w} does not reach for the ladder right away.`,
  },
  {
    opening: (a, b) =>
      `The sky turns the color of old blood. Acid rain begins to fall on ${a} and ${b}.`,
    beats: [
      {
        kind: 'flavor',
        focus: 'both',
        text: (w, l) =>
          `${w} and ${l} sprint for the metal Cornucopia overhang as the drops start to burn.`,
      },
      {
        kind: 'survive',
        focus: 'winner',
        text: (w) =>
          `${w} reaches cover first and claims the dry center like a throne.`,
      },
      {
        kind: 'flavor',
        focus: 'loser',
        text: (_w, l) =>
          `${l} slips at the rim, shoulder smoking, and crawls the last yards.`,
      },
      {
        kind: 'survive',
        focus: 'both',
        text: (w, l) =>
          `${w} blocks the overhang. ${l} begs with their eyes for six inches of shelter.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} answers with a shove. There is only room for one Victor under the metal.`,
      },
      {
        kind: 'survive',
        focus: 'loser',
        text: (w, l) =>
          `${l} tries to drag ${w} out into the rain — a last, burning embrace.`,
      },
      {
        kind: 'flavor',
        focus: 'winner',
        text: (w, l) =>
          `${w} breaks free and leaves ${l} at the edge, where the sky is hungry.`,
      },
    ],
    kill: (w, l) =>
      `${l} is forced back into the rain. The acid does what blades could. Final cannon in the hiss.`,
    aftermath: (w) =>
      `The rain stops on schedule. ${w} steps out steaming, the last tribute the sky could not dissolve.`,
  },
]
