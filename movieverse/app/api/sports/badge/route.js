import { NextResponse } from "next/server"

export async function GET(request) {
  const encoded = new URL(request.url).searchParams.get("e")
  if (!encoded) return new NextResponse(null, { status: 400 })

  try {
    const res = await fetch(`https://ntvs.cx/api/images/proxy/${encoded}`, {
      headers: {
        Referer: "https://ntvs.cx/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })
    if (!res.ok) return new NextResponse(null, { status: res.status })

    const contentType = res.headers.get("content-type") || "image/png"
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}
