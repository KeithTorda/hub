"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FileText, Eye, CheckCircle } from "lucide-react"

export function LatestDocumentsList() {
    // We want documents after the first 4 (since those are in the grid)
    const user = useQuery(api.queries.getUserData)
    const documents = useQuery(api.queries.getDocuments, user ? { userId: user._id } : {}) || []

    const markAsRead = useMutation(api.mutations.markDocumentRead)

    // Sort by date (descending), filter out read, skip 4, take next 6
    const latestDocs = [...documents]
        .filter(d => !d.isRead)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(4, 10)

    const handleMarkAsRead = async (e: React.MouseEvent, id: any) => {
        e.preventDefault()
        e.stopPropagation()
        await markAsRead({ documentId: id })
    }

    const getFileIcon = (format: string = "PDF") => {
        if (format.toLowerCase().includes("pdf")) return { color: "text-red-500", bg: "bg-red-100", label: "PDF" }
        if (format.toLowerCase().includes("doc")) return { color: "text-blue-500", bg: "bg-blue-100", label: "DOC" }
        return { color: "text-gray-500", bg: "bg-gray-100", label: "FILE" }
    }

    if (latestDocs.length === 0) return null

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {latestDocs.map((doc) => {
                const { color, bg, label } = getFileIcon(doc.format || "PDF")
                return (
                    <div key={doc._id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:bg-muted/30">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
                            <span className="text-[10px] font-bold">{label}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold text-foreground" title={doc.referenceNo}>{doc.referenceNo}</h4>
                            <p className="truncate text-xs text-muted-foreground">{doc.originator || "Unknown"}</p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span>{doc.date}</span>
                                <span>•</span>
                                <span className="uppercase">{doc.format || "PDF"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{doc.downloads} views</span>
                        </div>
                        <button
                            onClick={(e) => handleMarkAsRead(e, doc._id)}
                            className="ml-2 rounded-full p-1 text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                            title="Mark as Read"
                        >
                            <CheckCircle className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
