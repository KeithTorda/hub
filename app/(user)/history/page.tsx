"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { PortalHeader } from "@/components/portal-header"
import { FileText, Eye, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
    const user = useQuery(api.queries.getUserData)
    const readDocs = useQuery(api.queries.getReadDocuments, user ? { userId: user._id } : "skip") || []

    return (
        <>
            <PortalHeader title="Read History" />
            <main className="flex-1 overflow-y-auto bg-background p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Document History</h2>
                    <p className="text-muted-foreground">Archive of documents you have marked as read.</p>
                </div>

                {readDocs.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No history yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">Documents you mark as read will appear here.</p>
                        <Link href="/" className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {readDocs.map((doc: any) => (
                            <div key={doc._id} className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs text-muted-foreground ml-2 text-right">
                                        Read on <br />
                                        <span className="font-medium text-foreground">{new Date(doc.viewedAt).toLocaleDateString()}</span>
                                    </span>
                                </div>
                                <h4 className="line-clamp-1 text-lg font-bold text-foreground" title={doc.referenceNo}>{doc.referenceNo}</h4>
                                <p className="line-clamp-2 mt-1 text-sm text-muted-foreground">{doc.description}</p>

                                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                                        {doc.category}
                                    </span>
                                    {doc.url && (
                                        <a href={doc.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                            <FileText className="h-3.5 w-3.5" /> View File
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    )
}
