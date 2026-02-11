"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AdminHeader } from "@/components/admin-header"
import { Eye, Users, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Id } from "@/convex/_generated/dataModel"

export default function TrackingPage() {
    const allDocuments = useQuery(api.queries.getDocuments, {}) ?? []

    // Filter documents that have target users
    const trackedDocuments = allDocuments.filter(doc => doc.targetUsers && doc.targetUsers.length > 0)

    const [selectedDocId, setSelectedDocId] = useState<Id<"documents"> | null>(null)
    const [isStatsOpen, setIsStatsOpen] = useState(false)

    const openStats = (docId: Id<"documents">) => {
        setSelectedDocId(docId)
        setIsStatsOpen(true)
    }

    return (
        <div className="flex h-screen flex-col bg-background">
            <AdminHeader title="Document Tracking" subtitle="Monitor document views and acknowledgement" />

            <main className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-6">
                    {trackedDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
                            <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
                            <h3 className="text-lg font-semibold">No Tracked Documents</h3>
                            <p className="text-sm text-muted-foreground">
                                Documents with "Target Users" will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-border bg-card">
                            <div className="border-b border-border px-6 py-4">
                                <h2 className="font-semibold">Tracked Documents ({trackedDocuments.length})</h2>
                            </div>
                            <div className="divide-y divide-border">
                                {trackedDocuments.map((doc) => (
                                    <div key={doc._id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{doc.title || doc.referenceNo}</h3>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{(doc.targetUsers?.length || 0)} Recipients</span>
                                                    <span>•</span>
                                                    <span>{doc.isPrivate ? "Private" : "Public"}</span>
                                                    <span>•</span>
                                                    <span>{new Date(doc.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openStats(doc._id)}
                                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                                        >
                                            <Eye className="h-4 w-4" /> View Stats
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <StatsModal
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                documentId={selectedDocId}
            />
        </div>
    )
}

function StatsModal({ isOpen, onClose, documentId }: { isOpen: boolean, onClose: () => void, documentId: Id<"documents"> | null }) {
    const stats = useQuery(api.queries.getDocumentStats, documentId ? { documentId } : "skip")

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Document Statistics</DialogTitle>
                    <DialogDescription>Tracking views for selected recipients.</DialogDescription>
                </DialogHeader>

                {!stats ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border border-border bg-muted/40 p-4">
                                <p className="text-xs font-medium uppercase text-muted-foreground">Completion Rate</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-foreground">
                                        {Math.round((stats.uniqueViews / (stats.targetUserStats.length || 1)) * 100)}%
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        ({stats.uniqueViews}/{stats.targetUserStats.length} users)
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/40 p-4">
                                <p className="text-xs font-medium uppercase text-muted-foreground">Total Views</p>
                                <p className="mt-2 text-3xl font-bold text-foreground">{stats.totalViews}</p>
                            </div>
                        </div>

                        {/* Recipient List */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold">Recipient Status</h4>
                            <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted text-xs font-semibold uppercase text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-2">User</th>
                                            <th className="px-4 py-2">Department</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Last Viewed</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {stats.targetUserStats.map((user: any) => (
                                            <tr key={user._id} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 font-medium">{user.name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{user.department}</td>
                                                <td className="px-4 py-3">
                                                    {user.hasViewed ? (
                                                        <span className="inline-flex items-center gap-1 text-green-600">
                                                            <CheckCircle className="h-3.5 w-3.5" /> Viewed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                            <XCircle className="h-3.5 w-3.5" /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.viewedAt ? new Date(user.viewedAt).toLocaleString() : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
