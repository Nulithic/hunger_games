/** Probe whether a URL can be loaded as an <img> in this browser. */
export function probeImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(true)
      return
    }

    const image = new Image()
    let settled = false

    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      resolve(ok)
    }

    const timer = window.setTimeout(() => finish(false), 5000)
    image.onload = () => {
      window.clearTimeout(timer)
      finish(true)
    }
    image.onerror = () => {
      window.clearTimeout(timer)
      finish(false)
    }
    image.referrerPolicy = 'no-referrer'
    image.src = url
  })
}

export async function filterLoadableUrls(
  urls: readonly string[],
  limit: number,
): Promise<string[]> {
  const kept: string[] = []

  for (const url of urls) {
    if (kept.length >= limit) break
    if (await probeImageUrl(url)) kept.push(url)
  }

  return kept
}
