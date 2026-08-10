import type { ImageCandidate } from '../types'
import { filterLoadableUrls } from './imageLoad'
import { shuffle } from './rng'

export const IMAGE_CANDIDATE_LIMIT = 5
/** Top search hits to pull before shuffling a display set. */
export const IMAGE_SEARCH_FETCH_LIMIT = 20

type WikiPage = {
  title?: string
  thumbnail?: { source?: string }
}

type WikiQueryResponse = {
  query?: {
    pages?: Record<string, WikiPage>
  }
}

type LocalImageSearchResponse = {
  results?: Array<{ url?: string; fullUrl?: string; label?: string }>
  error?: string
}

async function searchWebImages(name: string): Promise<ImageCandidate[]> {
  try {
    const response = await fetch(
      `/api/image-search?q=${encodeURIComponent(name)}&limit=${IMAGE_SEARCH_FETCH_LIMIT}`,
    )
    if (!response.ok) return []

    const data = (await response.json()) as LocalImageSearchResponse
    const seen = new Set<string>()
    const raw: ImageCandidate[] = []

    for (const item of data.results ?? []) {
      // Prefer the embed-friendly URL from the API (usually a DDG/Bing thumbnail).
      const url = item.url?.startsWith('https://')
        ? item.url
        : item.fullUrl?.startsWith('https://')
          ? item.fullUrl
          : null
      if (!url || seen.has(url)) continue
      seen.add(url)
      raw.push({
        url,
        source: 'web',
        label: item.label?.trim() || name,
      })
    }

    // Re-search reshuffles the top hits so the picker shows a fresh set.
    const shuffled = shuffle(raw, Math.random)
    const loadable = await filterLoadableUrls(
      shuffled.map((item) => item.url),
      IMAGE_CANDIDATE_LIMIT,
    )
    const allowed = new Set(loadable)
    return shuffled.filter((item) => allowed.has(item.url)).slice(0, IMAGE_CANDIDATE_LIMIT)
  } catch {
    return []
  }
}

async function searchWikipediaImage(name: string): Promise<ImageCandidate | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: name,
    gsrlimit: '1',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '400',
    format: 'json',
    origin: '*',
  })

  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`)
    if (!response.ok) return null

    const data = (await response.json()) as WikiQueryResponse
    const pages = data.query?.pages
    if (!pages) return null

    const page = Object.values(pages)[0]
    const url = page?.thumbnail?.source
    if (!url || !url.startsWith('https://')) return null

    if (!(await filterLoadableUrls([url], 1)).length) return null

    return {
      url,
      source: 'wikipedia',
      label: page?.title ?? name,
    }
  } catch {
    return null
  }
}

/** Up to 5 open web image results that actually load; Wikipedia fills gaps. */
export async function searchPortraitCandidates(name: string): Promise<ImageCandidate[]> {
  const trimmed = name.trim()
  if (!trimmed) return []

  const web = await searchWebImages(trimmed)
  if (web.length > 0) return web

  const wiki = await searchWikipediaImage(trimmed)
  return wiki ? [wiki] : []
}
