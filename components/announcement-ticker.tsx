"use client"

import { Rewind, Pause, Play, FastForward } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function AnnouncementTicker() {
  const announcements = useQuery(api.queries.getAnnouncements) ?? []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    if (announcements.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }, [announcements.length])

  const prev = useCallback(() => {
    if (announcements.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }, [announcements.length])

  useEffect(() => {
    if (isPaused || announcements.length === 0) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [isPaused, next, announcements.length])

  // Reset index if announcements change and index is out of bounds
  useEffect(() => {
    if (currentIndex >= announcements.length && announcements.length > 0) {
      setCurrentIndex(0)
    }
  }, [announcements.length, currentIndex])

  const current = announcements[currentIndex]

  return (
    <div className="flex items-center gap-3 bg-foreground px-6 py-2">
      <span className="shrink-0 rounded bg-accent px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
        Announcement
      </span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-sm text-primary-foreground">
          {current ? `${current.title} - ${current.content}` : "No available announcement."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={prev} className="rounded p-1 text-primary-foreground/70 transition-colors hover:text-primary-foreground" aria-label="Previous">
          <Rewind className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="rounded p-1 text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={next} className="rounded p-1 text-primary-foreground/70 transition-colors hover:text-primary-foreground" aria-label="Next">
          <FastForward className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
