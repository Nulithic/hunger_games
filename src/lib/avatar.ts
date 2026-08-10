function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Build a data-URL SVG avatar with initials when no portrait is found. */
export function buildAvatarDataUrl(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .replace(/[^A-Z0-9]/g, '')

  const label = escapeXml(initials || '?')
  const hue = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <rect width="240" height="240" fill="hsl(${hue} 28% 22%)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    fill="hsl(40 30% 90%)" font-family="Arial, sans-serif" font-size="84" font-weight="700">${label}</text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function portraitUrl(imageUrl: string | null, name: string): string {
  return imageUrl ?? buildAvatarDataUrl(name)
}
