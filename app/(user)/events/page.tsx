"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { CalendarDays, GraduationCap, MapPin, Clock } from "lucide-react"
import { useState, useEffect } from "react"

export default function EventsPage() {
    const events = useQuery(api.queries.getEvents) ?? []
    const trainings = useQuery(api.queries.getTrainings) ?? []
    const publishedEvents = useQuery(api.queries.getDocuments, { section: "events" }) ?? []
    const publishedTrainings = useQuery(api.queries.getDocuments, { section: "trainings" }) ?? []

    // User & Tracking
    const [currentUser, setCurrentUser] = useState<any>(null)
    const markAsViewed = useMutation(api.mutations.markAsViewed)

    useEffect(() => {
        const stored = localStorage.getItem("knowledgehub_user")
        if (stored) {
            setCurrentUser(JSON.parse(stored))
        }
    }, [])

    const handleViewFile = async (e: React.MouseEvent, doc: any) => {
        // Track view if it's a document and user is logged in
        if (doc.isDocument && currentUser?._id) {
            try {
                // Fire and forget - don't block navigation
                markAsViewed({ documentId: doc._id, userId: currentUser._id })
            } catch (err) {
                console.error("Failed to track view", err)
            }
        }
        // Allow default behavior (navigation) to proceed? 
        // Actually, if I use onClick on <a> tag, it proceeds unless I preventDefault.
        // I want it to proceed.
    }

    // Merge and map stats
    const allEvents = [
        ...events,
        ...publishedEvents.map((d: any) => ({
            _id: d._id,
            title: d.title || d.description, // some docs prefer description
            dateRange: d.dateReleased || d.date,
            location: d.officeConcerned || "N/A",
            isDocument: true,
            url: d.url
        }))
    ]

    const allTrainings = [
        ...trainings,
        ...publishedTrainings.map((d: any) => ({
            _id: d._id,
            title: d.title || d.description,
            dateRange: d.dateReleased || d.date,
            status: "Document", // Distinct status for docs
            isDocument: true,
            url: d.url
        }))
    ]

    return (
        <div className="bg-background p-6">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-foreground">Events & Trainings</h1>
                    <p className="text-sm text-muted-foreground">Stay updated on upcoming events and training programs</p>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Total Events</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{allEvents.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Total Trainings</p>
                        <p className="mt-1 text-2xl font-bold text-primary">{allTrainings.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Open Trainings</p>
                        <p className="mt-1 text-2xl font-bold text-green-600">{allTrainings.filter((t: any) => t.status === "Open for Registration").length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Ongoing</p>
                        <p className="mt-1 text-2xl font-bold text-accent-foreground">{allTrainings.filter((t: any) => t.status === "Ongoing").length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Events */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-bold text-card-foreground">Events</h2>
                            <span className="ml-auto text-xs text-muted-foreground">{allEvents.length} total</span>
                        </div>
                        {allEvents.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-12">
                                <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">No events scheduled</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {allEvents.map((event: any) => (
                                    <div key={event._id} className="px-5 py-4 transition-colors hover:bg-muted/50">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-card-foreground">{event.title}</h3>
                                            {(event as any).isDocument && (
                                                <span className="shrink-0 text-[10px] font-medium text-muted-foreground border border-border px-1.5 py-0.5 rounded">Doc</span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.dateRange}</span>
                                            {event.location !== "N/A" && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
                                            {(event as any).url && (
                                                <a
                                                    href={(event as any).url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-auto text-primary hover:underline"
                                                    onClick={(e) => handleViewFile(e, event)}
                                                >
                                                    View File
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trainings */}
                    <div className="rounded-xl border border-border bg-card">
                        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                            <GraduationCap className="h-4 w-4 text-accent-foreground" />
                            <h2 className="text-sm font-bold text-card-foreground">Training Programs</h2>
                            <span className="ml-auto text-xs text-muted-foreground">{allTrainings.length} total</span>
                        </div>
                        {allTrainings.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-12">
                                <GraduationCap className="h-10 w-10 text-muted-foreground/30" />
                                <p className="text-sm text-muted-foreground">No training programs</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {allTrainings.map((training: any) => (
                                    <div key={training._id} className="px-5 py-4 transition-colors hover:bg-muted/50">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-semibold text-card-foreground">{training.title}</h3>
                                            {(training as any).isDocument && (
                                                <span className="shrink-0 text-[10px] font-medium text-muted-foreground border border-border px-1.5 py-0.5 rounded">Doc</span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{training.dateRange}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${training.status === "Open for Registration" ? "bg-green-500/10 text-green-600" :
                                                training.status === "Ongoing" ? "bg-primary/10 text-primary" :
                                                    training.status === "Document" ? "bg-muted text-muted-foreground" :
                                                        "bg-muted text-muted-foreground"
                                                }`}>{training.status}</span>
                                            {(training as any).url && (
                                                <a href={(training as any).url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-auto">View File</a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
