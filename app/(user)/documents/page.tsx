"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FileText, Download, Search, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { FilePreviewModal } from "@/components/file-preview-modal"

const categories = [
    { key: "all", label: "All Documents" },
    { key: "doh-dm", label: "DOH – DM" },
    { key: "doh-dc", label: "DOH – DC" },
    { key: "doh-advisory", label: "DOH – Advisory" },
    { key: "hospital-memo", label: "Hospital – Memo" },
    { key: "hospital-hfo", label: "Hospital – HFO" },
]

export default function DocumentsPage() {
    const [activeCategory, setActiveCategory] = useState("all")
    const [search, setSearch] = useState("")
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Fetch user from local storage
    useEffect(() => {
        const stored = localStorage.getItem("knowledgehub_user")
        if (stored) {
            setCurrentUser(JSON.parse(stored))
        }
    }, [])

    // Assuming 'debouncedSearch' would be defined elsewhere if this were a complete change.
    // For now, we'll use 'search' directly for the searchResults query as 'debouncedSearch' is not present.
    // If the intent was to introduce debouncing, that would require an additional hook (e.g., useDebounce).
    const debouncedSearch = search // Placeholder for actual debounced search if needed

    const allDocuments = useQuery(api.queries.getDocuments, {
        category: activeCategory === "all" ? undefined : activeCategory,
        section: "documents",
        userId: currentUser?._id
    }) ?? []

    const markAsViewed = useMutation(api.mutations.markAsViewed)

    // Preview State
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewTitle, setPreviewTitle] = useState("")
    const [previewFormat, setPreviewFormat] = useState("")
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    // The original 'documents' filtering logic is preserved, but now filters 'allDocuments'
    // and 'searchResults' is added as a separate query.
    // If the intent was to replace the client-side filter with the searchResults query,
    // further modification would be needed.
    const documents = search
        ? allDocuments.filter((d: any) =>
            d.title.toLowerCase().includes(search.toLowerCase()) ||
            d.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
            d.description.toLowerCase().includes(search.toLowerCase())
        )
        : allDocuments

    const handlePreview = async (doc: any) => {
        if (!doc.url) return
        setPreviewUrl(doc.url)
        setPreviewTitle(doc.title)
        setPreviewFormat(doc.format || "")
        setIsPreviewOpen(true)

        if (currentUser?._id) {
            try {
                await markAsViewed({ documentId: doc._id, userId: currentUser._id })
            } catch (err) {
                console.error("Failed to mark as viewed", err)
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

            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Documents</h1>
                        <p className="text-sm text-muted-foreground">Browse official issuances, orders, and circulars</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-64 rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border pb-2">
                    {categories.map((cat) => (
                        <button key={cat.key} type="button" onClick={() => setActiveCategory(cat.key)}
                            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Total Documents</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{allDocuments.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Total Downloads</p>
                        <p className="mt-1 text-2xl font-bold text-primary">{allDocuments.reduce((s: number, d: any) => s + (d.downloads || 0), 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs uppercase text-muted-foreground">Showing</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{documents.length}</p>
                    </div>
                </div>

                {/* Document List */}
                <div className="rounded-xl border border-border bg-card">
                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <FileText className="h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No documents found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {documents.map((doc: any) => (
                                <div key={doc._id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
                                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-primary">{doc.referenceNo}</h3>
                                        <p className="mt-0.5 text-sm text-card-foreground">{doc.description}</p>
                                        {doc.originator && (
                                            <p className="mt-0.5 text-xs text-muted-foreground">Source: {doc.originator}</p>
                                        )}
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span>Date: {doc.dateReleased || doc.date}</span>
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{doc.category.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</span>
                                            {doc.officeConcerned && (
                                                <span className="rounded-full bg-muted px-2 py-0.5">{doc.officeConcerned}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Download className="h-3.5 w-3.5" />
                                            {doc.downloads.toLocaleString()}
                                        </div>
                                        {doc.url && (
                                            <button
                                                onClick={() => handlePreview(doc)}
                                                className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> Preview
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
