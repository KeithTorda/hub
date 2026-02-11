"use client"

import React from "react"
import { useState, useRef } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Trash2, Download, X, Upload, FileText, Loader2, Pencil } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError } from "@/lib/swal"

export default function AdminFormsPage() {
  const items = useQuery(api.queries.getDownloadableForms) ?? []
  const createForm = useMutation(api.mutations.createForm)
  const updateForm = useMutation(api.mutations.updateForm)
  const deleteForm = useMutation(api.mutations.deleteForm)
  const generateUploadUrl = useMutation(api.mutations.generateUploadUrl)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<Id<"downloadableForms"> | null>(null)
  const [formData, setFormData] = useState({ title: "" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFormData({ title: "" })
    setEditingId(null)
    setSelectedFile(null)
    setShowForm(false)
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

        if (selectedFile.type === "application/pdf") format = "pdf"
        else if (selectedFile.type.startsWith("image/")) format = "image"
        else format = "other"
      }

      const submissionData = {
        title: formData.title,
        storageId,
        format,
      }

      if (editingId) {
        await updateForm({ id: editingId, ...submissionData })
        showSuccess("Updated!", "Form has been updated.")
      } else {
        await createForm(submissionData)
        showSuccess("Added!", "Form has been added.")
      }
      resetForm()
    } catch (err) {
      console.error(err)
      showError("Error", "Something went wrong.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (item: (typeof items)[0]) => {
    setFormData({ title: item.title })
    setEditingId(item._id)
    setSelectedFile(null)
    setShowForm(true)
  }

  const handleDelete = async (id: Id<"downloadableForms">, title: string) => {
    if (!(await confirmDelete(title))) return
    try {
      await deleteForm({ id })
      showSuccess("Deleted!", "Form removed.")
    } catch { showError("Error", "Failed to delete.") }
  }

  const maxD = Math.max(...items.map((f) => f.downloads), 1)

  return (
    <>
      <AdminHeader title="Manage Downloadable Forms" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{items.length} forms</p>
          <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Form
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-card-foreground">{editingId ? "Edit Form" : "Add New Form"}</h2>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="form-title" className="mb-1 block text-xs font-medium text-card-foreground">Form Title</label>
                <input id="form-title" type="text" required value={formData.title} onChange={(e) => setFormData({ title: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., Travel Request Form" />
              </div>

              {/* File Upload Section */}
              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground">Attachment (PDF, Word, Excel)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="form-upload"
                  />
                  <label htmlFor="form-upload" className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </label>
                  {selectedFile && (
                    <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {editingId && !selectedFile && (
                    <span className="text-xs text-muted-foreground italic ml-2">Upload new to replace.</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} disabled={isUploading} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isUploading} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isUploading ? "Uploading..." : (editingId ? "Update" : "Add")}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {items.map((form, i) => (
            <div key={form._id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-card-foreground">{form.title}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(form.downloads / maxD) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground p-1"><Download className="h-3 w-3" />{form.downloads.toLocaleString()}</div>
                  {form.storageId && <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-md"><FileText className="h-3 w-3" /> {form.format?.toUpperCase() || "FILE"}</div>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => handleEdit(form)}
                  className="rounded p-1.5 text-muted-foreground hover:text-foreground" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => handleDelete(form._id, form.title)}
                  className="rounded p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
