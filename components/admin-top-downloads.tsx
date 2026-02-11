"use client"

import { Download } from "lucide-react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function AdminTopDownloads() {
  const downloadableForms = useQuery(api.queries.getDownloadableForms) ?? []
  const maxDownloads = Math.max(...downloadableForms.map((f) => f.downloads), 1)

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold text-card-foreground">Top Downloaded Forms</h2>
        <Link href="/admin/forms" className="text-xs text-primary hover:underline">Manage</Link>
      </div>
      <ul className="divide-y divide-border">
        {downloadableForms.map((form, index) => (
          <li key={form._id} className="flex items-center gap-3 px-5 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-card-foreground">{form.title}</p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{ width: `${(form.downloads / maxDownloads) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Download className="h-3 w-3" />
              {form.downloads.toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
