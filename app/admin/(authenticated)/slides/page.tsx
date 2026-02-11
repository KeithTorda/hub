"use client"

import React from "react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Trash2, Pencil, Image, X, GripVertical } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError } from "@/lib/swal"

export default function AdminSlidesPage() {
    const slides = useQuery(api.queries.getSlides) ?? []
    const createSlide = useMutation(api.mutations.createSlide)
    const updateSlide = useMutation(api.mutations.updateSlide)
    const deleteSlide = useMutation(api.mutations.deleteSlide)
    const generateUploadUrl = useMutation(api.mutations.generateUploadUrl)

    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<string | null>(null)
    const [formData, setFormData] = useState({ title: "", subtitle: "", version: "", caption: "", order: 0 })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const resetForm = () => {
        setFormData({ title: "", subtitle: "", version: "", caption: "", order: slides.length + 1 })
        setSelectedFile(null)
        setShowForm(false)
        setEditing(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUploading(true)
        try {
            let storageId: Id<"_storage"> | undefined = undefined
            let format: string | undefined = undefined

            if (selectedFile) {
                const postUrl = await generateUploadUrl()
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                })
                if (!result.ok) throw new Error("Upload failed")
                const { storageId: uploadedStorageId } = await result.json()
                storageId = uploadedStorageId as Id<"_storage">
                format = selectedFile.type.startsWith("image/") ? "image" : "other"
            }

            const slideData = {
                ...formData,
                order: formData.order || slides.length + 1,
                storageId,
                format,
            }

            if (editing) {
                await updateSlide({ id: editing as Id<"slides">, ...slideData })
                showSuccess("Updated!", "Slide updated successfully.")
            } else {
                await createSlide(slideData)
                showSuccess("Created!", "Slide added to carousel.")
            }
            resetForm()
        } catch (err) {
            console.error(err)
            showError("Error", "Failed to save.")
        } finally {
            setIsUploading(false)
        }
    }

    const handleEdit = (slide: any) => {
        setFormData({ title: slide.title, subtitle: slide.subtitle, version: slide.version, caption: slide.caption, order: slide.order })
        setEditing(slide._id)
        setSelectedFile(null)
        setShowForm(true)
    }

    const handleDelete = async (id: Id<"slides">, title: string) => {
        if (!(await confirmDelete(title))) return
        try { await deleteSlide({ id }); showSuccess("Deleted!", "") }
        catch { showError("Error", "Failed to delete.") }
    }

    // Sort slides by order
    const sortedSlides = [...slides].sort((a, b) => a.order - b.order)

    return (
        <>
            <AdminHeader title="Carousel Slides" />
            <main className="flex-1 overflow-y-auto bg-background p-6">
                {/* Stats */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Total Slides</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{slides.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Displayed On</p>
                        <p className="mt-1 text-sm font-bold text-primary">Portal Homepage Carousel</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground">All Slides</h2>
                    <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Add Slide
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-card-foreground">{editing ? "Edit Slide" : "New Slide"}</h2>
                            <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="sl-title" className="mb-1 block text-xs font-medium text-card-foreground">Title *</label>
                                    <input id="sl-title" type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., KnowledgeHub v2.0" />
                                </div>
                                <div>
                                    <label htmlFor="sl-sub" className="mb-1 block text-xs font-medium text-card-foreground">Subtitle *</label>
                                    <input id="sl-sub" type="text" required value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Department of Health" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="sl-ver" className="mb-1 block text-xs font-medium text-card-foreground">Version *</label>
                                    <input id="sl-ver" type="text" required value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Version 2.0.0" />
                                </div>
                                <div>
                                    <label htmlFor="sl-order" className="mb-1 block text-xs font-medium text-card-foreground">Display Order</label>
                                    <input id="sl-order" type="number" min={1} value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="sl-cap" className="mb-1 block text-xs font-medium text-card-foreground">Caption *</label>
                                <textarea id="sl-cap" required rows={2} value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Slide description text..." />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-card-foreground">Background Image</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="slide-upload"
                                    />
                                    <label htmlFor="slide-upload" className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-muted">
                                        <Image className="h-4 w-4" />
                                        {selectedFile ? selectedFile.name : "Choose Image"}
                                    </label>
                                    {selectedFile && (
                                        <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }} className="text-muted-foreground hover:text-destructive">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    {editing && !selectedFile && (
                                        <span className="text-xs text-muted-foreground italic ml-2">Upload new to replace existing image.</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={resetForm} disabled={isUploading} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50">Cancel</button>
                                <button type="submit" disabled={isUploading} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                    {isUploading ? "Saving..." : (editing ? "Update" : "Create")}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                <div className="rounded-xl border border-border bg-card">
                    {sortedSlides.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <Image className="h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No carousel slides yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {sortedSlides.map((slide: any) => (
                                <div key={slide._id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20 overflow-hidden">
                                        {slide.url ? (
                                            <img src={slide.url} alt={slide.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{slide.order}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-card-foreground">{slide.title}</p>
                                        <p className="text-xs text-muted-foreground">{slide.subtitle} — {slide.version}</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground/70 truncate">{slide.caption}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button type="button" onClick={() => handleEdit(slide)} className="rounded p-1.5 text-muted-foreground hover:text-primary" title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(slide._id, slide.title)} className="rounded p-1.5 text-muted-foreground hover:text-destructive" title="Delete">
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
