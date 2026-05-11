import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch(
      "https://ntvs.cx/api/get-matches?server=kobra&type=both",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://ntvs.cx/",
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) throw new Error(res.status)
    const data = await res.json()
    if (!data.success) throw new Error("API failure")
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 502 })
  }
}
