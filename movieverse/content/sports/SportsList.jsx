"use client"

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { getNtvsEvents, formatEventDate, sortedCategories } from "@/lib/ntvsApi"

const CATEGORY_COLORS = {
  rugby: "#34d399", afl: "#facc15", football: "#4ade80", basketball: "#fb923c",
  baseball: "#60a5fa", hockey: "#a78bfa", cricket: "#f472b6", tennis: "#fbbf24",
  "motor-sports": "#f87171", mma: "#f87171", other: "#94a3b8",
}

function color(cat) { return CATEGORY_COLORS[cat?.toLowerCase()] || "#94a3b8" }

const SkeletonCard = () => (
  <div className="bg-[#22212c] rounded-2xl overflow-hidden border border-[#2e2d3a] animate-pulse">
    <div className="h-[3px] w-full bg-[#3a3848]" />
    <div className="p-5 flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="h-5 w-16 bg-[#3a3848] rounded-full" />
        <div className="h-4 w-20 bg-[#3a3848] rounded" />
      </div>
      <div className="h-5 w-full bg-[#3a3848] rounded" />
      <div className="h-8 w-full bg-[#3a3848] rounded-lg mt-1" />
    </div>
  </div>
)

const EventCard = ({ event, isLive }) => {
  const c = color(event.category)

  return (
    <Link
      href={`/sports/watch/${event.id}`}
      className="group block bg-[#22212c] rounded-2xl overflow-hidden border border-[#2e2d3a] hover:border-[#5b5682] transition-all duration-200 hover:shadow-[0_0_24px_0_#4a446c55]"
    >
      <div className="h-[3px] w-full" style={{ background: c }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold px-2 py-[2px] rounded-full capitalize" style={{ background: c + "22", color: c }}>
            {event.category?.replace(/-/g, " ") || "Sport"}
          </span>
          <div className="flex items-center gap-1">
            {isLive && <span className="w-[6px] h-[6px] rounded-full bg-red-400 animate-pulse" />}
            <span className={`text-[11px] font-semibold ${isLive ? "text-red-400" : "text-slate-500"}`}>
              {isLive ? "LIVE" : formatEventDate(event.date)}
            </span>
          </div>
        </div>

        <div className="text-[14px] font-medium font-['poppins'] text-[#ffffffd1] text-center truncate group-hover:text-white transition-colors">
          {event.title}
        </div>

        <div className="text-center py-2 rounded-lg text-[13px] font-medium" style={{ background: c + "18", color: c }}>
          Watch Stream →
        </div>
      </div>
    </Link>
  )
}

const SportsList = () => {
  const [live, setLive] = useState([])
  const [nonLive, setNonLive] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const data = await getNtvsEvents()
      setLive(data.live)
      setNonLive(data.nonLive)
      setLastUpdated(Date.now())
      setError(false)
    } catch (e) {
      setError(e?.message || "unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [refresh])

  if (loading) return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
      <span className="text-5xl">⚠️</span>
      <span className="text-lg font-medium">Couldn't load events</span>
      <span className="text-xs text-slate-600 font-mono">{error}</span>
      <button onClick={refresh} className="mt-2 px-4 py-2 bg-[#413d57] border border-[#5b5682] rounded-md text-sm text-slate-300 hover:bg-[#4a446c] transition-colors">
        Try again
      </button>
    </div>
  )

  const empty = live.length === 0 && nonLive.length === 0

  return (
    <div className="flex flex-col gap-8">
      {lastUpdated && (
        <div className="text-xs text-[#5c5c6e] text-right font-['poppins']">
          Auto-refreshes · last updated {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}

      {empty && (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
          <span className="text-5xl">📡</span>
          <span className="text-lg font-medium">No events right now</span>
          <span className="text-sm">Updates every 60 seconds.</span>
        </div>
      )}

      {live.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-[#ffffffbd] font-medium text-xl font-['poppins'] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
            Live Now
          </h2>
          {sortedCategories(live).map(({ cat, events }) => (
            <div key={cat}>
              <div className="text-xs font-['poppins'] uppercase tracking-widest text-[#5c5c6e] mb-3">
                {cat.replace(/-/g, " ")}
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {events.map(e => <EventCard key={e.id} event={e} isLive={true} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {nonLive.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-[#ffffffbd] font-medium text-xl font-['poppins']">Upcoming</h2>
          {sortedCategories(nonLive).map(({ cat, events }) => (
            <div key={cat}>
              <div className="text-xs font-['poppins'] uppercase tracking-widest text-[#5c5c6e] mb-3">
                {cat.replace(/-/g, " ")}
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {events.map(e => <EventCard key={e.id} event={e} isLive={false} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SportsList
