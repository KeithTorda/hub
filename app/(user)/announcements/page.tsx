"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Megaphone, Pin, Clock, Search, FileText } from "lucide-react"
import { useState } from "react"

const categoryColors: Record<string, string> = {
    urgent: "bg-destructive/10 text-destructive",
    general: "bg-primary/10 text-primary",
    memo: "bg-accent/20 text-accent-foreground",
    event: "bg-chart-3/10 text-chart-3",
}

export default function AnnouncementsPage() {
    const announcements = useQuery(api.queries.getAnnouncements) ?? []
    const publishedDocs = useQuery(api.queries.getDocuments, { section: "announcements" }) ?? []
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState("all")

    // Merge announcements and published docs
    const allItems = [
        ...announcements.map((a: any) => ({ ...a, type: "announcement" })),
        ...publishedDocs.map((d: any) => ({
            _id: d._id,
            title: d.title,
            content: d.description,
            author: d.originator || "Admin",
            category: "memo", // Default category for docs in announcements
            createdAt: d.dateReleased || d.date,
            pinned: false,
            type: "document",
            url: d.url
        }))
    ]

    let filtered = allItems
    if (filter !== "all") {
        filtered = filtered.filter((a: any) => a.category === filter)
    }
    if (search) {
        filtered = filtered.filter((a: any) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.content.toLowerCase().includes(search.toLowerCase()) ||
            a.author.toLowerCase().includes(search.toLowerCase())
        )
    }

    // Sort by date desc
    filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const pinnedCount = announcements.filter((a: any) => a.pinned).length
    const urgentCount = announcements.filter((a: any) => a.category === "urgent").length

    return (
        <div className="bg-background p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Announcements</h1>
                        <p className="text-sm text-muted-foreground">Official announcements and updates</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-64 rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Total</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{announcements.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Pinned</p>
                        <p className="mt-1 text-2xl font-bold text-primary">{pinnedCount}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Urgent</p>
                        <p className="mt-1 text-2xl font-bold text-destructive">{urgentCount}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Showing</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{filtered.length}</p>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-4 flex gap-2">
                    {["all", "urgent", "general", "memo", "event"].map((cat) => (
                        <button key={cat} type="button" onClick={() => setFilter(cat)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Announcement List */}
                <div className="space-y-3">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-12">
                            <Megaphone className="h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No announcements found</p>
                        </div>
                    ) : (
                        filtered.map((ann: any) => (
                            <div key={ann._id} className={`rounded-xl border bg-card px-5 py-4 transition-colors hover:bg-muted/50 ${ann.pinned ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${categoryColors[ann.category] || categoryColors.general}`}>
                                        <Megaphone className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-card-foreground">{ann.title}</h3>
                                            {ann.pinned && <Pin className="h-3 w-3 text-primary" />}
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColors[ann.category] || categoryColors.general}`}>
                                                {ann.category}
                                            </span>
                                            {ann.type === "document" && (
                                                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                                    <FileText className="h-3 w-3" /> Document
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{ann.content}</p>
                                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>By {ann.author}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ann.createdAt}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
