import { NextResponse } from "next/server"

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" }

async function fetchFromRelay(relay) {
  const url = relay.startsWith("http") ? relay : `https://${relay}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) return null
  const data = await res.json()
  return data.success ? data : null
}

async function fetchDirect() {
  const res = await fetch("https://ntvs.cx/api/get-matches?server=kobra&type=both", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Referer: "https://ntvs.cx/",
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`ntvs ${res.status}`)
  const data = await res.json()
  if (!data.success) throw new Error("API failure")
  return data
}

export async function GET() {
  try {
    const relay = process.env.SPORTS_RELAY || process.env.NEXT_PUBLIC_SPORTS_RELAY
    if (relay) {
      const data = await fetchFromRelay(relay).catch(() => null)
      if (data) return NextResponse.json(data, { headers: CACHE_HEADERS })
    }
    const data = await fetchDirect()
    return NextResponse.json(data, { headers: CACHE_HEADERS })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 502 })
  }
}
