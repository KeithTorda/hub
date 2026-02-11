"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FileText, Eye, Calendar, File, CheckCircle } from "lucide-react"
import Link from "next/link"

export function LatestDocumentsGrid() {
    // We want the absolute latest documents
    const user = useQuery(api.queries.getUserData)
    const documents = useQuery(api.queries.getDocuments, user ? { userId: user._id } : {}) || []

    // Sort by date (descending), filter out read, and take top 4
    const latestDocs = [...documents]
        .filter(d => !d.isRead)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4)

    const markAsRead = useMutation(api.mutations.markDocumentRead)

    const handleMarkAsRead = async (e: React.MouseEvent, id: any, title: string) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await markAsRead({ documentId: id })
            // info toast?
        } catch (err) {
            console.error(err)
        }
    }

    const getFileIcon = (format: string = "PDF") => {
        // Simple logic for icon/color based on format
        if (format.toLowerCase().includes("pdf")) return { icon: FileText, color: "text-red-600", bg: "bg-red-100" }
        if (format.toLowerCase().includes("doc")) return { icon: FileText, color: "text-blue-600", bg: "bg-blue-100" }
        return { icon: File, color: "text-gray-600", bg: "bg-gray-100" }
    }

    return (
        <div className="mb-6">
            <div className="mb-4 flex items-center justify-between px-1">
                <h3 className="text-lg font-bold text-foreground">Latest Documents</h3>
                <Link href="/documents" className="text-xs font-medium text-primary hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {latestDocs.map((doc) => {
                    const { icon: Icon, color, bg } = getFileIcon(doc.format || "PDF")
                    return (
                        <div key={doc._id} className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className={`rounded-lg ${bg} p-2 ${color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="rounded bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                                    {doc.format || "PDF"}
                                </span>
                            </div>
                            <div className="mt-4">
                                <h4 className="line-clamp-1 text-base font-bold text-foreground" title={doc.referenceNo}>{doc.referenceNo}</h4>
                                <p className="line-clamp-1 text-xs text-muted-foreground">{doc.originator || "Unknown Originator"}</p>
                                <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{doc.date}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{doc.format || "PDF"}</span>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Eye className="h-3 w-3" />
                                        <span>{doc.downloads || 0} views</span>
                                    </div>
                                    <button
                                        onClick={(e) => handleMarkAsRead(e, doc._id, doc.referenceNo)}
                                        className="rounded-full bg-muted/80 p-1.5 text-xs font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                                        title="Mark as Read (Hide)"
                                    >
                                        <Eye className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {latestDocs.length === 0 && (
                    <div className="col-span-2 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                        No documents found.
                    </div>
                )}
            </div>
        </div>
    )
}
