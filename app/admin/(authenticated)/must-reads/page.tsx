"use client"

import React from "react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Trash2, Pencil, BookOpen, X } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError } from "@/lib/swal"

export default function AdminMustReadsPage() {
    const mustReads = useQuery(api.queries.getMustReads) ?? []
    const createMustRead = useMutation(api.mutations.createMustRead)
    const updateMustRead = useMutation(api.mutations.updateMustRead)
    const deleteMustRead = useMutation(api.mutations.deleteMustRead)

    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<string | null>(null)
    const [formData, setFormData] = useState({ title: "", subtitle: "" })

    const resetForm = () => { setFormData({ title: "", subtitle: "" }); setShowForm(false); setEditing(null) }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editing) {
                await updateMustRead({ id: editing as Id<"mustReads">, title: formData.title, subtitle: formData.subtitle || undefined })
                showSuccess("Updated!", "Must Read item updated successfully.")
            } else {
                await createMustRead({ title: formData.title, subtitle: formData.subtitle || undefined })
                showSuccess("Created!", "Must Read item added successfully.")
            }
            resetForm()
        } catch { showError("Error", "Failed to save.") }
    }

    const handleEdit = (item: any) => {
        setFormData({ title: item.title, subtitle: item.subtitle || "" })
        setEditing(item._id)
        setShowForm(true)
    }

    const handleDelete = async (id: Id<"mustReads">, title: string) => {
        if (!(await confirmDelete(title))) return
        try { await deleteMustRead({ id }); showSuccess("Deleted!", "") }
        catch { showError("Error", "Failed to delete.") }
    }

    return (
        <>
            <AdminHeader title="Must Reads" />
            <main className="flex-1 overflow-y-auto bg-background p-6">
                {/* Stats */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Total Items</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{mustReads.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Latest Added</p>
                        <p className="mt-1 text-sm font-bold text-card-foreground">{mustReads[0]?.title || "None"}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground">All Must Reads</h2>
                    <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Add Must Read
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-6 rounded-xl border border-border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-card-foreground">{editing ? "Edit Must Read" : "New Must Read"}</h2>
                            <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="mr-title" className="mb-1 block text-xs font-medium text-card-foreground">Title *</label>
                                <input id="mr-title" type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., Updated Data Privacy Policy" />
                            </div>
                            <div>
                                <label htmlFor="mr-sub" className="mb-1 block text-xs font-medium text-card-foreground">Subtitle</label>
                                <input id="mr-sub" type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Optional subtitle or description" />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{editing ? "Update" : "Create"}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                <div className="rounded-xl border border-border bg-card">
                    {mustReads.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No must-read items yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {mustReads.map((item: any) => (
                                <div key={item._id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                                        {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                                        <p className="mt-0.5 text-[10px] text-muted-foreground/60">Added: {item.date}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button type="button" onClick={() => handleEdit(item)} className="rounded p-1.5 text-muted-foreground hover:text-primary" title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(item._id, item.title)} className="rounded p-1.5 text-muted-foreground hover:text-destructive" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
