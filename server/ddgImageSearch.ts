export type DdgImageHit = {
  /** Best URL for embedding in the browser (usually a search CDN thumbnail). */
  url: string
  /** Original full-size URL when different from `url`. */
  fullUrl?: string
  label: string
}

type DdgImageResult = {
  image?: string
  thumbnail?: string
  title?: string
}

type DdgImagesResponse = {
  results?: DdgImageResult[]
}

export const DEFAULT_IMAGE_LIMIT = 5

function extractVqd(html: string): string | null {
  const patterns = [
    /vqd=["']([^"']+)["']/,
    /vqd=([\d-]+)&/,
    /"vqd":"([^"]+)"/,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

function httpsUrl(value: string | undefined): string | null {
  if (!value || !value.startsWith('https://')) return null
  return value
}

/**
 * Prefer DuckDuckGo/Bing thumbnail hosts for embedding.
 * Direct hotlinks to random sites often break (hotlink protection / 403).
 */
function pickEmbedUrl(thumbnail: string | null, full: string | null): string | null {
  if (thumbnail) return thumbnail
  return full
}

export async function searchDuckDuckGoImages(
  query: string,
  limit: number = DEFAULT_IMAGE_LIMIT,
): Promise<DdgImageHit[]> {
  const trimmed = query.trim()
  if (!trimmed || limit <= 0) return []

  const homeResponse = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}&iax=images&ia=images`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html',
      },
    },
  )

  if (!homeResponse.ok) return []
  const html = await homeResponse.text()
  const vqd = extractVqd(html)
  if (!vqd) return []

  const params = new URLSearchParams({
    l: 'us-en',
    o: 'json',
    q: trimmed,
    vqd,
    f: ',,,,,',
    p: '1',
  })

  const imageResponse = await fetch(`https://duckduckgo.com/i.js?${params.toString()}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
      Referer: 'https://duckduckgo.com/',
    },
  })

  if (!imageResponse.ok) return []
  const data = (await imageResponse.json()) as DdgImagesResponse
  const seen = new Set<string>()
  const hits: DdgImageHit[] = []

  for (const item of data.results ?? []) {
    const thumbnail = httpsUrl(item.thumbnail)
    const full = httpsUrl(item.image)
    const url = pickEmbedUrl(thumbnail, full)
    if (!url || seen.has(url)) continue
    seen.add(url)

    const hit: DdgImageHit = {
      url,
      label: item.title?.trim() || trimmed,
    }
    if (full && full !== url) hit.fullUrl = full
    hits.push(hit)
    if (hits.length >= limit) break
  }

  return hits
}
