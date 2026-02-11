"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Pin, ExternalLink } from "lucide-react"
import Link from "next/link"

export function PinnedDocumentsWidget() {
    const documents = useQuery(api.queries.getPinnedDocuments) || []

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
                        <Pin className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-card-foreground">Pinned</h3>
                </div>
                <Link href="/documents" className="text-xs font-medium text-muted-foreground hover:text-primary">
                    View all
                </Link>
            </div>
            <div className="divide-y divide-border">
                {documents.map((doc) => (
                    <div key={doc._id} className="p-4 transition-colors hover:bg-muted/50">
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">
                            {doc.referenceNo}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {doc.description}
                        </p>
                        <div className="mt-2 flex items-center justify-end">
                            <span className="flex items-center gap-1 text-[10px] text-primary">
                                {doc.downloads} downloads <ExternalLink className="h-3 w-3" />
                            </span>
                        </div>
                    </div>
                ))}
                {documents.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                        No pinned documents.
                    </div>
                )}
            </div>
        </div>
    )
}
