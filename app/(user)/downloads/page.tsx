"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Download, FileDown, Search, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { FilePreviewModal } from "@/components/file-preview-modal"

export default function DownloadsPage() {
    const forms = useQuery(api.queries.getDownloadableForms) ?? []
    const publishedDocs = useQuery(api.queries.getDocuments, { section: "downloads" }) ?? []
    const [search, setSearch] = useState("")

    // User & Tracking
    const [currentUser, setCurrentUser] = useState<any>(null)
    const markAsViewed = useMutation(api.mutations.markAsViewed)

    useEffect(() => {
        const stored = localStorage.getItem("knowledgehub_user")
        if (stored) {
            setCurrentUser(JSON.parse(stored))
        }
    }, [])

    // Preview State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewTitle, setPreviewTitle] = useState("")
    const [previewFormat, setPreviewFormat] = useState("")
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    // Merge legacy forms and published documents
    const allItems = [
        ...forms,
        ...publishedDocs.map((d: any) => ({
            ...d,
            // Map document fields to form fields if needed, mostly they match or are supersets
            title: d.description || d.title, // Use description as title if available for better context
            downloads: d.downloads || 0,
            isDocument: true // Flag to identify source
        }))
    ]

    const filtered = search
        ? allItems.filter((f: any) => f.title.toLowerCase().includes(search.toLowerCase()))
        : allItems

    const totalDownloads = allItems.reduce((s: number, f: any) => s + (f.downloads || 0), 0)
    const maxDownloads = Math.max(...allItems.map((f: any) => f.downloads || 0), 1)

    const handlePreview = async (form: any) => {
        if (!form.url) return
        setPreviewUrl(form.url)
        setPreviewTitle(form.title)
        setPreviewFormat(form.format || "")
        setIsPreviewOpen(true)

        // Track only if it's a document and user is logged in
        if (form.isDocument && currentUser?._id) {
            try {
                await markAsViewed({ documentId: form._id, userId: currentUser._id })
            } catch (err) {
                console.error("Failed to track view", err)
            }
        }
    }

    return (
        <div className="bg-background p-6">
            <FilePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                url={previewUrl}
                title={previewTitle}
                format={previewFormat}
            />

            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Downloadable Forms</h1>
                        <p className="text-sm text-muted-foreground">Access commonly used forms and templates</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="Search forms..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-56 rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Available Forms</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{forms.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Total Downloads</p>
                        <p className="mt-1 text-2xl font-bold text-primary">{totalDownloads.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Most Popular</p>
                        <p className="mt-1 truncate text-sm font-bold text-card-foreground">{forms[0]?.title || "None"}</p>
                    </div>
                </div>

                {/* Forms List */}
                <div className="rounded-xl border border-border bg-card">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <FileDown className="h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No forms found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filtered.map((form: any, index: number) => (
                                <div key={form._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-card-foreground">{form.title}</p>
                                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                                            <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(form.downloads / maxDownloads) * 100}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{form.downloads.toLocaleString()} downloads</span>
                                        {form.url ? (
                                            <button
                                                onClick={() => handlePreview(form)}
                                                className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Preview/Download
                                            </button>
                                        ) : (
                                            <button type="button" className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20">
                                                <Download className="h-3.5 w-3.5" /> Download
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
