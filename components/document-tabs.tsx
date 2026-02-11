"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { DocumentViewModal } from "./document-view-modal"
import type { Doc } from "@/convex/_generated/dataModel"

interface DocumentTabsProps {
  title?: string
  filter?: (category: Doc<"categories">) => boolean
}

export function DocumentTabs({ title = "Documents", filter }: DocumentTabsProps) {
  const categories = useQuery(api.queries.getCategories)
  const [activeTab, setActiveTab] = useState<string>("")
  const [selectedDoc, setSelectedDoc] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const docCategories = categories?.filter(c => (c.type === "document" || !c.type) && (!filter || filter(c))) || []

  useEffect(() => {
    if (docCategories.length > 0 && (!activeTab || !docCategories.find(c => c.code === activeTab))) {
      setActiveTab(docCategories[0].code)
    }
  }, [categories, activeTab, docCategories])

  const documents = useQuery(api.queries.getDocuments, { category: activeTab || undefined }) ?? []

  if (!categories) return <div className="text-xs text-muted-foreground">Loading categories...</div>

  if (docCategories.length === 0) return null

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
        <Link href="/documents" className="text-xs font-medium text-primary hover:underline">
          View All
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {docCategories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => setActiveTab(cat.code)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${activeTab === cat.code
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {documents.length > 0 ? (
          documents.slice(0, 5).map((doc) => (
            <div
              key={doc._id}
              role="button"
              tabIndex={0}
              onClick={() => { setSelectedDoc(doc); setModalOpen(true) }}
              onKeyDown={(e) => e.key === "Enter" && setSelectedDoc(doc)}
              className="group flex cursor-pointer items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
            >
              <div className="flex-1">
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary">
                  {doc.referenceNo}
                </h4>
                <p className="font-medium text-sm text-muted-foreground">{doc.title}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {doc.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/70">
                  <span>{doc.dateReleased || doc.date}</span>
                  <span>•</span>
                  <span>{doc.downloads} downloads</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">No documents found in this category.</p>
        )}
      </div>

      <DocumentViewModal
        document={selectedDoc}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
