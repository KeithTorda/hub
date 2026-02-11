"use client"

import React, { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Pencil, Trash2, Pin, Loader2 } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError, confirmAction } from "@/lib/swal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const categoryBadge: Record<string, string> = {
  urgent: "bg-destructive/10 text-destructive",
  general: "bg-primary/10 text-primary",
  memo: "bg-accent/20 text-accent-foreground",
  event: "bg-chart-3/10 text-chart-3",
}

type AnnouncementCategory = "urgent" | "general" | "memo" | "event"

export default function AdminAnnouncementsPage() {
  const items = useQuery(api.queries.getAnnouncements) ?? []
  const createAnnouncement = useMutation(api.mutations.createAnnouncement)
  const updateAnnouncement = useMutation(api.mutations.updateAnnouncement)
  const deleteAnnouncement = useMutation(api.mutations.deleteAnnouncement)
  const togglePin = useMutation(api.mutations.toggleAnnouncementPin)

  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<Id<"announcements"> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general" as AnnouncementCategory,
    author: "",
    pinned: false,
  })

  const resetForm = () => {
    setFormData({ title: "", content: "", category: "general", author: "", pinned: false })
    setEditingId(null)
    setIsSubmitting(false)
  }

  const handleOpenCreate = () => {
    resetForm()
    setShowDialog(true)
  }

  const handleEdit = (item: (typeof items)[0]) => {
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category,
      author: item.author,
      pinned: item.pinned,
    })
    setEditingId(item._id)
    setShowDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await updateAnnouncement({ id: editingId, ...formData })
        showSuccess("Updated!", "Announcement has been updated.")
      } else {
        await createAnnouncement(formData)
        showSuccess("Published!", "Announcement has been published.")
      }
      setShowDialog(false)
    } catch (e) {
      showError("Error", "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: Id<"announcements">, title: string) => {
    const confirmed = await confirmDelete(title)
    if (!confirmed) return
    try {
      await deleteAnnouncement({ id })
      showSuccess("Deleted!", "Announcement removed.")
    } catch {
      showError("Error", "Failed to delete. Item may no longer exist.")
    }
  }

  const handleTogglePin = async (id: Id<"announcements">, isPinned: boolean) => {
    // Optional: Asking for confirmation for pin toggle might be too much friction, but user request implies strict controls.
    // Let's keep it quick for pin toggle unless user complains. 
    // Actually, user said "remove this data" in request, not specifics about pins. keeping as is.
    try {
      await togglePin({ id })
      // showSuccess(isPinned ? "Unpinned!" : "Pinned!", "") // Toast serves better here
    } catch {
      showError("Error", "Something went wrong.")
    }
  }

  return (
    <>
      <AdminHeader title="Manage Announcements" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{items.length} announcements total</p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </button>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Author</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item._id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {item.pinned && <Pin className="h-3.5 w-3.5 text-accent" />}
                      <span className="text-sm font-medium text-card-foreground">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${categoryBadge[item.category]}`}>{item.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.author}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.createdAt}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Published</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => handleTogglePin(item._id, item.pinned)}
                        className={`rounded-lg p-1.5 transition-colors ${item.pinned ? "text-accent hover:text-accent/80" : "text-muted-foreground hover:text-foreground"}`}
                        title={item.pinned ? "Unpin" : "Pin"}>
                        <Pin className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleEdit(item)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(item._id, item.title)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ann-title" className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
                <input id="ann-title" type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Announcement title" />
              </div>
              <div>
                <label htmlFor="ann-author" className="mb-1 block text-xs font-medium text-muted-foreground">Author / Department</label>
                <input id="ann-author" type="text" required value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., IT Department" />
              </div>
            </div>
            <div>
              <label htmlFor="ann-content" className="mb-1 block text-xs font-medium text-muted-foreground">Content</label>
              <textarea id="ann-content" required rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Announcement content..." />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="ann-category" className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                <select id="ann-category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="urgent">Urgent</option>
                  <option value="general">General</option>
                  <option value="memo">Memorandum</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })} className="rounded accent-primary h-4 w-4" />
                  Pin to top
                </label>
              </div>
            </div>
            <DialogFooter>
              <button type="button" onClick={() => setShowDialog(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Publish Announcement"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
