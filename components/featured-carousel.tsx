"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function FeaturedCarousel() {
  const slides = useQuery(api.queries.getSlides) ?? []
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    if (slides.length === 0) return
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    if (slides.length === 0) return
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length === 0) return
    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [next, slides.length])

  useEffect(() => {
    if (current >= slides.length && slides.length > 0) {
      setCurrent(0)
    }
  }, [slides.length, current])

  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-foreground">
        <div className="flex h-52 items-center justify-center">
          <p className="text-sm text-primary-foreground/60">Loading slides...</p>
        </div>
      </div>
    )
  }

  const slide = slides[current]

  return (
    <div className="relative overflow-hidden rounded-lg bg-foreground">
      <div className="relative flex h-52 flex-col items-center justify-center px-8 text-center text-primary-foreground">
        {slide.url && (
          <div className="absolute inset-0 z-0">
            <img src={slide.url} alt={slide.title} className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-black/40" /> {/* Overlay for text readability */}
          </div>
        )}
        <div className="relative z-10">
          <h2 className="text-2xl font-black tracking-tight">{slide.title}</h2>
          <p className="mt-1 text-sm opacity-90">{slide.subtitle}</p>
          <p className="mt-2 text-xs font-semibold text-accent">{slide.version}</p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-black/60 px-4 py-2.5 backdrop-blur-sm">
          <p className="text-sm font-medium">{slide.caption}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/20 p-1 text-primary-foreground transition-colors hover:bg-card/40"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/20 p-1 text-primary-foreground transition-colors hover:bg-card/40"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s._id}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-accent" : "w-1.5 bg-primary-foreground/40"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
