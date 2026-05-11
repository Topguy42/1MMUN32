export async function getNtvsEvents() {
  const res = await fetch("/tv/api/sports/live")
  if (!res.ok) throw new Error("API error")
  const data = await res.json()
  if (!data.success) throw new Error("API returned failure")

  const liveIds = new Set((data.live || []).map(e => e.id))
  const all = data.all || []

  const live = all.filter(e => liveIds.has(e.id))
  const nonLive = all.filter(e => !liveIds.has(e.id))

  return { live, nonLive }
}

export function buildEmbedUrls(event) {
  const results = []

  for (const s of event.sources || []) {
    if (s.source === "admin") {
      results.push({
        label: "Stream",
        type: "iframe",
        urls: [1, 2, 3].map(n => `https://embedsports.top/embed/admin/${s.id}/${n}`),
      })
    } else if (s.source === "echo") {
      // echo source IDs don't map predictably to pooembed slugs —
      // embed the ntvs.cx watch page directly instead (no X-Frame-Options)
      results.push({
        label: "Alt Stream",
        type: "iframe",
        urls: [`https://ntvs.cx/watch/kobra/${event.id}`],
      })
    }
  }

  return results
}

export function getBadgeUrl(encoded) {
  if (!encoded) return null
  return `/tv/api/sports/badge?e=${encodeURIComponent(encoded)}`
}

export function formatEventTime(dateMs) {
  return new Date(dateMs).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function formatEventDate(dateMs) {
  const d = new Date(dateMs)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isPast = d < now
  if (isPast) return "In Progress"
  if (isToday) return `Today · ${formatEventTime(dateMs)}`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + formatEventTime(dateMs)
}

export const CATEGORY_ORDER = [
  "fight", "mma", "boxing", "wrestling",
  "rugby", "afl",
  "football", "soccer",
  "basketball", "baseball", "hockey",
  "cricket", "tennis", "golf",
  "motor-sports", "cycling",
  "other",
]

export function sortedCategories(events) {
  const grouped = {}
  for (const e of events) {
    const cat = e.category || "other"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(e)
  }
  const ordered = CATEGORY_ORDER.filter(c => grouped[c])
  const rest = Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c)).sort()
  return [...ordered, ...rest].map(cat => ({ cat, events: grouped[cat] }))
}
