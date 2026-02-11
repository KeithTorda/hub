"use client"

import React from "react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Pencil, Trash2, Clock, X } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError } from "@/lib/swal"

const statusColors: Record<string, string> = {
  Open: "bg-primary/10 text-primary",
  Closed: "bg-destructive/10 text-destructive",
  "N/A": "bg-muted text-muted-foreground",
}

export default function AdminTrainingsPage() {
  const items = useQuery(api.queries.getTrainings) ?? []
  const createTraining = useMutation(api.mutations.createTraining)
  const updateTraining = useMutation(api.mutations.updateTraining)
  const deleteTraining = useMutation(api.mutations.deleteTraining)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<Id<"trainings"> | null>(null)
  const [formData, setFormData] = useState({ title: "", dateRange: "", status: "Open" })

  const resetForm = () => {
    setFormData({ title: "", dateRange: "", status: "Open" })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateTraining({ id: editingId, ...formData })
        showSuccess("Updated!", "Training has been updated.")
      } else {
        await createTraining(formData)
        showSuccess("Created!", "Training has been added.")
      }
      resetForm()
    } catch {
      showError("Error", "Something went wrong. Please try again.")
    }
  }

  const handleEdit = (item: (typeof items)[0]) => {
    setFormData({ title: item.title, dateRange: item.dateRange, status: item.status })
    setEditingId(item._id)
    setShowForm(true)
  }

  const handleDelete = async (id: Id<"trainings">, title: string) => {
    const confirmed = await confirmDelete(title)
    if (!confirmed) return
    try {
      await deleteTraining({ id })
      showSuccess("Deleted!", "Training removed.")
    } catch {
      showError("Error", "Failed to delete.")
    }
  }

  return (
    <>
      <AdminHeader title="Manage Trainings" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{items.length} training programs</p>
          <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Training
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-card-foreground">{editingId ? "Edit Training" : "Add Training"}</h2>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tr-title" className="mb-1 block text-xs font-medium text-card-foreground">Title</label>
                <input id="tr-title" type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tr-date" className="mb-1 block text-xs font-medium text-card-foreground">Date Range</label>
                  <input id="tr-date" type="text" required value={formData.dateRange} onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., Jan 01 - Jun 30, 2026" />
                </div>
                <div>
                  <label htmlFor="tr-status" className="mb-1 block text-xs font-medium text-card-foreground">Status</label>
                  <select id="tr-status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">{editingId ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Training Program</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date Range</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item._id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">{item.title}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />{item.dateRange}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status] || statusColors["N/A"]}`}>{item.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => handleEdit(item)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleDelete(item._id, item.title)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
