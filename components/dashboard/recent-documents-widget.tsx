"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FileText, Clock } from "lucide-react"
import Link from "next/link"

export function RecentDocumentsWidget() {
    const documents = useQuery(api.queries.getRecentDocuments, { limit: 5 }) || []

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-600">
                        <Clock className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-card-foreground">Recent Documents</h3>
                </div>
                <Link href="/documents" className="text-xs font-medium text-muted-foreground hover:text-primary">
                    View all
                </Link>
            </div>
            <div className="divide-y divide-border">
                {documents.map((doc) => (
                    <div key={doc._id} className="p-3 transition-colors hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <h4 className="truncate text-sm font-medium text-foreground">{doc.referenceNo}</h4>
                        </div>
                        <p className="ml-5 mt-0.5 text-[10px] text-muted-foreground">{doc.date}</p>
                    </div>
                ))}
                {documents.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                        No recent documents.
                    </div>
                )}
            </div>
        </div>
    )
}
