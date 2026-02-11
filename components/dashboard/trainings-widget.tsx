"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export function TrainingsWidget() {
    const trainings = useQuery(api.queries.getTrainings) || []

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm mb-6">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
                        <GraduationCap className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-card-foreground">Trainings</h3>
                </div>
                <Link href="/events" className="text-xs font-medium text-muted-foreground hover:text-primary">
                    View all
                </Link>
            </div>
            <div className="p-4">
                {trainings.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No training programs.</p>
                ) : (
                    <div className="space-y-3">
                        {trainings.slice(0, 3).map((t) => (
                            <div key={t._id} className="rounded-lg border border-border bg-muted/30 p-3">
                                <h4 className="text-sm font-semibold text-foreground line-clamp-1">{t.title}</h4>
                                <p className="mt-1 text-xs text-muted-foreground">{t.dateRange}</p>
                                <span className="mt-2 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                                    {t.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
