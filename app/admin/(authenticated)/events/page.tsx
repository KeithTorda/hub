"use client"

import React from "react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Pencil, Trash2, MapPin, Calendar, X } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError } from "@/lib/swal"

export default function AdminEventsPage() {
  const items = useQuery(api.queries.getEvents) ?? []
  const createEvent = useMutation(api.mutations.createEvent)
  const updateEvent = useMutation(api.mutations.updateEvent)
  const deleteEvent = useMutation(api.mutations.deleteEvent)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<Id<"events"> | null>(null)
  const [formData, setFormData] = useState({ title: "", dateRange: "", location: "" })

  const resetForm = () => {
    setFormData({ title: "", dateRange: "", location: "" })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateEvent({ id: editingId, ...formData })
        showSuccess("Updated!", "Event has been updated.")
      } else {
        await createEvent(formData)
        showSuccess("Created!", "Event has been created.")
      }
      resetForm()
    } catch {
      showError("Error", "Something went wrong. Please try again.")
    }
  }

  const handleEdit = (item: (typeof items)[0]) => {
    setFormData({ title: item.title, dateRange: item.dateRange, location: item.location })
    setEditingId(item._id)
    setShowForm(true)
  }

  const handleDelete = async (id: Id<"events">, title: string) => {
    const confirmed = await confirmDelete(title)
    if (!confirmed) return
    try {
      await deleteEvent({ id })
      showSuccess("Deleted!", "Event removed.")
    } catch {
      showError("Error", "Failed to delete.")
    }
  }

  return (
    <>
      <AdminHeader title="Manage Events" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{items.length} events</p>
          <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-card-foreground">{editingId ? "Edit Event" : "Create Event"}</h2>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="event-title" className="mb-1 block text-xs font-medium text-card-foreground">Event Title</label>
                <input id="event-title" type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-date" className="mb-1 block text-xs font-medium text-card-foreground">Date Range</label>
                  <input id="event-date" type="text" required value={formData.dateRange} onChange={(e) => setFormData({ ...formData, dateRange: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., Jan 01 - Jun 30, 2026" />
                </div>
                <div>
                  <label htmlFor="event-loc" className="mb-1 block text-xs font-medium text-card-foreground">Location</label>
                  <input id="event-loc" type="text" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., Online, Conference Room A" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">{editingId ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {items.map((event) => (
            <div key={event._id} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-sm font-bold leading-tight text-card-foreground">{event.title}</h3>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => handleEdit(event)} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => handleDelete(event._id, event.title)} className="rounded p-1 text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{event.dateRange}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.location}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
