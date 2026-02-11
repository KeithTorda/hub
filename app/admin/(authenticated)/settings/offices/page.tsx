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

export default function AdminDepartmentsPage() {
    const offices = useQuery(api.queries.getOffices) ?? []
    const createOffice = useMutation(api.mutations.createOffice)
    const updateOffice = useMutation(api.mutations.updateOffice)
    const deleteOffice = useMutation(api.mutations.deleteOffice)

    const [showModal, setShowModal] = useState(false)
    const [editingId, setEditingId] = useState<Id<"offices"> | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        code: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
        setFormData({ name: "", code: "" })
        setEditingId(null)
        setShowModal(false)
        setIsSubmitting(false)
    }

    const handleEdit = (office: any) => {
        setFormData({
            name: office.name,
            code: office.code
        })
        setEditingId(office._id)
        setShowModal(true)
    }

    const handleDelete = async (id: Id<"offices">, name: string) => {
        const confirmed = await confirmDelete(name)
        if (!confirmed) return
        try {
            await deleteOffice({ id })
            showSuccess("Deleted!", "Department removed.")
        } catch {
            showError("Error", "Failed to delete.")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editingId) {
                await updateOffice({ id: editingId, ...formData })
                showSuccess("Updated!", "Department updated.")
            } else {
                await createOffice(formData)
                showSuccess("Created!", "Department created.")
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
            <AdminHeader title="Manage Departments" />
            <main className="flex-1 overflow-y-auto bg-background p-6">
                <div className="mb-4 flex items-center justify-between">
                    <Link href="/admin/settings" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back to Settings
                    </Link>
                    <button type="button" onClick={() => { resetForm(); setShowModal(true) }}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Add Department
                    </button>
                </div>

                <Dialog open={showModal} onOpenChange={(open) => { if (!open) resetForm() }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Department" : "Add Department"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold">Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="e.g. Office of the Director" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold">Code (Unique)</label>
                                <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className={inputCls} placeholder="e.g. OOD" />
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
                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {offices.map((office) => (
                                <tr key={office._id} className="hover:bg-muted/50">
                                    <td className="px-5 py-3 text-sm font-medium">{office.name}</td>
                                    <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{office.code}</td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => handleEdit(office)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => handleDelete(office._id, office.name)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {offices.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">No departments found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    )
}
