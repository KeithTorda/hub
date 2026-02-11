"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { BookOpen, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"

export function MustReadWidget() {
    const mustReads = useQuery(api.queries.getMustReads) || []

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm mb-6">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-card-foreground">Must Read</h3>
                </div>
                <Link href="/announcements" className="text-xs font-medium text-muted-foreground hover:text-primary">
                    View all
                </Link>
            </div>
            <div className="divide-y divide-border">
                {mustReads.slice(0, 3).map((item) => (
                    <div key={item._id} className="p-4 transition-colors hover:bg-muted/50">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                            {item.title}
                        </h4>
                        {item.subtitle && (
                            <p className="mt-1 text-xs font-medium text-primary uppercase tracking-wide">
                                {item.subtitle}
                            </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{item.date}</span>
                        </div>
                    </div>
                ))}
                {mustReads.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                        No items marked as must read.
                    </div>
                )}
            </div>
        </div>
    )
}
