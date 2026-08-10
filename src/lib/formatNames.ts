/** Oxford-style list for event copy: "Ada", "Ada and Grace", "Ada, Grace, and Alan". */
export function formatNameList(names: readonly string[]): string {
  const cleaned = names.map((name) => name.trim()).filter(Boolean)
  if (cleaned.length === 0) return 'Someone'
  if (cleaned.length === 1) return cleaned[0]!
  if (cleaned.length === 2) return `${cleaned[0]} and ${cleaned[1]}`
  return `${cleaned.slice(0, -1).join(', ')}, and ${cleaned[cleaned.length - 1]}`
}
