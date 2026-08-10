/** Mulberry32 — small seeded PRNG returning [0, 1). */
export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickOne<T>(items: readonly T[], rng: () => number): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty list')
  }
  return items[Math.floor(rng() * items.length)]!
}

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = next[i]!
    next[i] = next[j]!
    next[j] = tmp
  }
  return next
}
