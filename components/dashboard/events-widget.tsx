"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CalendarDays } from "lucide-react"
import Link from "next/link"

export function EventsWidget() {
    const events = useQuery(api.queries.getEvents) || []

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm mb-6">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10 text-orange-600">
                        <CalendarDays className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-card-foreground">Events</h3>
                </div>
                <Link href="/events" className="text-xs font-medium text-muted-foreground hover:text-primary">
                    View all
                </Link>
            </div>
            <div className="p-4">
                {events.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No upcoming events.</p>
                ) : (
                    <div className="space-y-4">
                        {events.slice(0, 3).map((e) => (
                            <div key={e._id} className="flex gap-3">
                                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-muted/50 p-1 text-center">
                                    <span className="text-[8px] font-bold uppercase text-muted-foreground">
                                        {e.dateRange.split(" ")[0] || "DATE"}
                                    </span>
                                    <span className="text-sm font-bold text-foreground">
                                        {e.dateRange.match(/\d+/)?.[0] || "01"}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-semibold text-foreground line-clamp-1">{e.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{e.location}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{e.dateRange}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
