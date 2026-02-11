"use client"

import React, { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Pencil, Trash2, Loader2, Save, ArrowLeft } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError } from "@/lib/swal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

export default function AdminCategoriesPage() {
    const categories = useQuery(api.queries.getCategories) ?? []
    const createCategory = useMutation(api.mutations.createCategory)
    const updateCategory = useMutation(api.mutations.updateCategory)
    const deleteCategory = useMutation(api.mutations.deleteCategory)

    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<Id<"categories"> | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        type: "document",
        description: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
        setFormData({ name: "", code: "", type: "document", description: "" })
        setEditingId(null)
        setShowModal(false)
        setIsSubmitting(false)
    }

    const handleEdit = (cat: any) => {
        setFormData({
            name: cat.name,
            code: cat.code,
            type: cat.type || "document",
            description: cat.description || ""
        })
        setEditingId(cat._id)
        setShowModal(true)
    }

    const handleDelete = async (id: Id<"categories">, name: string) => {
        const confirmed = await confirmDelete(name)
        if (!confirmed) return
        try {
            await deleteCategory({ id })
            showSuccess("Deleted!", "Category removed.")
        } catch {
            showError("Error", "Failed to delete.")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editingId) {
                await updateCategory({ id: editingId, ...formData })
                showSuccess("Updated!", "Category updated.")
            } else {
                await createCategory(formData)
                showSuccess("Created!", "Category created.")
            }
            resetForm()
        } catch (err: any) {
            console.error(err)
            showError("Error", err.message || "Something went wrong.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"

    return (
        <>
            <AdminHeader title="Manage Categories" />
            <main className="flex-1 overflow-y-auto bg-background p-6">
                <div className="mb-4 flex items-center justify-between">
                    <Link href="/admin/settings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back to Settings
                    </Link>
                    <button type="button" onClick={() => { resetForm(); setShowModal(true) }}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Add Category
                    </button>
                </div>

                <Dialog open={showModal} onOpenChange={(open) => { if (!open) resetForm() }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold">Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="e.g. Department Memorandum" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold">Code (Unique)</label>
                                <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className={inputCls} placeholder="e.g. doh-dm" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold">Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className={inputCls}>
                                    <option value="document">Document</option>
                                    <option value="event">Event</option>
                                    <option value="training">Training</option>
                                    <option value="announcement">Announcement</option>
                                    <option value="legacy">Legacy</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold">Description</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputCls} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={resetForm} className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                                </button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="rounded-xl border border-border bg-card">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">Name</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">Code</th>
                                <th className="px-5 py-3 text-xs font-semibold uppercase text-muted-foreground">Type</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {categories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-muted/50">
                                    <td className="px-5 py-3 text-sm font-medium">{cat.name}</td>
                                    <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{cat.code}</td>
                                    <td className="px-5 py-3 text-xs"><span className="rounded bg-muted px-2 py-0.5 uppercase">{cat.type}</span></td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleEdit(cat)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No categories found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    )
}
