"use client"

import React from "react"
import { useState, useRef } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Pencil, Trash2, Download, X, Upload, FileText, Loader2 } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError } from "@/lib/swal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// ── Publish-to sections ──────────────────────────────────────────
const publishSections = [
  { key: "announcements", label: "Announcements" },
  { key: "documents", label: "Documents" },
  { key: "downloads", label: "Downloadable Forms" },
  { key: "must-reads", label: "Must Reads" },
  { key: "events", label: "Events" },
  { key: "trainings", label: "Trainings" },
]

export default function AdminDocumentsPage() {
  const allDocuments = useQuery(api.queries.getDocuments, {}) ?? []
  const users = useQuery(api.queries.getUsers) ?? []
  const categories = useQuery(api.queries.getCategories) ?? [] // Dynamic Categories
  const offices = useQuery(api.queries.getOffices) ?? [] // Dynamic Offices

  const createDocument = useMutation(api.mutations.createDocument)
  const updateDocument = useMutation(api.mutations.updateDocument)
  const deleteDocument = useMutation(api.mutations.deleteDocument)
  const generateUploadUrl = useMutation(api.mutations.generateUploadUrl)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<Id<"documents"> | null>(null)
  const [filterCategory, setFilterCategory] = useState("all")

  // Form state
  const [formData, setFormData] = useState({
    referenceNo: "",
    description: "",
    category: "",
    dateReleased: "",
    originator: "",
    officeConcerned: "",
  })
  const [publishTo, setPublishTo] = useState<string[]>(["documents"])
  const [targetUsers, setTargetUsers] = useState<string[]>([])
  const [targetDepartments, setTargetDepartments] = useState<string[]>([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = filterCategory === "all" ? allDocuments : allDocuments.filter((d) => d.category === filterCategory)

  const togglePublishTo = (key: string) => {
    setPublishTo((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  const toggleTargetUser = (userId: string) => {
    setTargetUsers((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId])
  }

  const toggleTargetDepartment = (dept: string) => {
    setTargetDepartments((prev) => prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept])
  }

  const resetForm = () => {
    setFormData({
      referenceNo: "",
      description: "",
      category: "",
      dateReleased: "",
      originator: "",
      officeConcerned: "",
    })
    setPublishTo(["documents"])
    setTargetUsers([])
    setTargetDepartments([])
    setIsPrivate(false)
    setEditingId(null)
    setSelectedFile(null)
    setShowModal(false)
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

      const docData = {
        referenceNo: formData.referenceNo,
        description: formData.description,
        category: formData.category,
        dateReleased: formData.dateReleased || undefined,
        originator: formData.originator || undefined,
        officeConcerned: formData.officeConcerned || undefined,
        publishTo: publishTo.length > 0 ? publishTo : undefined,
        targetUsers: targetUsers.length > 0 ? (targetUsers as Id<"users">[]) : undefined,
        targetDepartments: targetDepartments.length > 0 ? targetDepartments : undefined,
        isPrivate: isPrivate,
        storageId,
        format,
      }

      if (editingId) {
        await updateDocument({ id: editingId, ...docData })
        showSuccess("Updated!", "Document has been updated.")
      } else {
        await createDocument(docData)
        showSuccess("Published!", "Document has been added.")
      }
      resetForm()
    } catch (err) {
      console.error(err)
      showError("Error", "Something went wrong. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleEdit = (item: any) => {
    setFormData({
      referenceNo: item.referenceNo,
      description: item.description,
      category: item.category,
      dateReleased: item.dateReleased || "",
      originator: item.originator || "",
      officeConcerned: item.officeConcerned || "",
    })
    setPublishTo(item.publishTo || ["documents"])
    setTargetDepartments(item.targetDepartments || [])
    setTargetUsers(item.targetUsers || [])
    setEditingId(item._id)
    setSelectedFile(null)
    setShowModal(true)
  }

  const handleDelete = async (id: Id<"documents">, title: string) => {
    const confirmed = await confirmDelete(title)
    if (!confirmed) return
    try {
      await deleteDocument({ id })
      showSuccess("Deleted!", "Document removed.")
    } catch {
      showError("Error", "Failed to delete. Item may no longer exist.")
    }
  }

  const getCategoryLabel = (code: string) => categories.find((c) => c.code === code)?.name ?? code

  // shared input class
  const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <>
      <AdminHeader title="Manage Documents" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={inputCls + " w-48"}>
              <option value="all">All Categories</option>
              {categories.map((cat) => (<option key={cat._id} value={cat.code}>{cat.name}</option>))}
            </select>
            <p className="text-sm text-muted-foreground">{filtered.length} documents</p>
          </div>
          <button type="button" onClick={() => { resetForm(); setShowModal(true) }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Document
          </button>
        </div>

        {/* ── Document Modal ────────────────────────────────────── */}
        <Dialog open={showModal} onOpenChange={(open) => { if (!open) resetForm() }}>
          <DialogContent className="max-w-2xl w-full p-0 gap-0">
            <DialogHeader className="px-6 py-4 border-b border-border">
              <DialogTitle className="text-lg font-bold">{editingId ? "Edit Document" : "Add New Document"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Reference # + Date Released */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doc-ref" className="mb-1 block text-xs font-semibold text-card-foreground">Reference #</label>
                  <input id="doc-ref" type="text" required value={formData.referenceNo} onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    className={inputCls} placeholder="e.g., 2026-0012" />
                </div>
                <div>
                  <label htmlFor="doc-date" className="mb-1 block text-xs font-semibold text-card-foreground">Date Released</label>
                  <input id="doc-date" type="date" value={formData.dateReleased} onChange={(e) => setFormData({ ...formData, dateReleased: e.target.value })}
                    className={inputCls} />
                </div>
              </div>

              {/* Row 2: Originator/Source */}
              <div>
                <label htmlFor="doc-orig" className="mb-1 block text-xs font-semibold text-card-foreground">Originator / Source</label>
                <input id="doc-orig" type="text" value={formData.originator} onChange={(e) => setFormData({ ...formData, originator: e.target.value })}
                  className={inputCls} placeholder="e.g., DOH-CAR Regional Director" />
              </div>

              {/* Row 3: Category */}
              <div>
                <label htmlFor="doc-category" className="mb-1 block text-xs font-semibold text-card-foreground">Category</label>
                <select id="doc-category" required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputCls}>
                  <option value="">Select category...</option>
                  {categories.filter(c => c.type === "document" || !c.type).map((c) => (
                    <option key={c._id} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Row 4: Description */}
              <div>
                <label htmlFor="doc-desc" className="mb-1 block text-xs font-semibold text-card-foreground">Description</label>
                <textarea id="doc-desc" required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls + " resize-none"} placeholder="Document description..." />
              </div>

              {/* Row 5: Office/Personnel Concerned */}
              <div>
                <label htmlFor="doc-office" className="mb-1 block text-xs font-semibold text-card-foreground">Department / Personnel Concerned</label>
                <select id="doc-office" value={formData.officeConcerned} onChange={(e) => setFormData({ ...formData, officeConcerned: e.target.value })} className={inputCls}>
                  <option value="">Select department...</option>
                  {offices.map((o) => (<option key={o._id} value={o.name}>{o.name}</option>))}
                </select>
              </div>

              {/* Publish To Checkboxes */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Publish To</label>
                <div className="grid grid-cols-2 gap-2">
                  {publishSections.map((sec) => (
                    <label key={sec.key} className="flex items-center gap-2 rounded-md border border-border p-2 hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={publishTo.includes(sec.key)}
                        onChange={() => togglePublishTo(sec.key)}
                        className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Users & Privacy (New) */}
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">Target Audience</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-muted-foreground">Private (Restricted)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Target Users */}
                  <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-background p-2">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Specific Users</p>
                    {users.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No users found.</p>
                    ) : (
                      users.map((user: any) => (
                        <label key={user._id} className="flex items-center gap-2 py-1 hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={targetUsers.includes(user._id)}
                            onChange={() => toggleTargetUser(user._id)}
                            className="h-3.5 w-3.5 rounded border-muted-foreground"
                          />
                          <span className="text-sm">{user.name} <span className="text-xs text-muted-foreground">({user.department})</span></span>
                        </label>
                      ))
                    )}
                  </div>

                  {/* Target Departments */}
                  <div className="max-h-32 overflow-y-auto rounded-md border border-border bg-background p-2">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">Specific Departments</p>
                    {offices.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No offices found.</p>
                    ) : (
                      offices.map((office: any) => (
                        <label key={office._id} className="flex items-center gap-2 py-1 hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={targetDepartments.includes(office.name)}
                            onChange={() => toggleTargetDepartment(office.name)}
                            className="h-3.5 w-3.5 rounded border-muted-foreground"
                          />
                          <span className="text-sm">{office.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <p className="mt-1 text-[10px] text-muted-foreground">
                  {isPrivate ? "Only selected users/departments will see this document." : "Selected users/departments will be notified and tracked, but document is visible to everyone."}
                </p>
              </div>

              {/* Row 7: File Upload */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-card-foreground">Attachments (PDF, Image)</label>
                <div className="flex items-center gap-2">
                  <input type="file" accept=".pdf,image/*" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </label>
                  {selectedFile && (
                    <button type="button" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {editingId && !selectedFile && (
                    <span className="text-xs text-muted-foreground italic ml-2">Upload new file to replace existing one.</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button type="button" onClick={resetForm} disabled={isUploading} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isUploading} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isUploading ? "Uploading..." : (editingId ? "Update" : "Publish")}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Table ─────────────────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reference</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">File</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Downloads</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((doc) => (
                <tr key={doc._id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3.5 text-sm font-bold text-primary">{doc.referenceNo}</td>
                  <td className="max-w-xs px-5 py-3.5 text-sm text-muted-foreground"><p className="line-clamp-2">{doc.description}</p></td>
                  <td className="px-5 py-3.5"><span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{getCategoryLabel(doc.category)}</span></td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{(doc as any).dateReleased || doc.date}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{(doc as any).officeConcerned || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">
                    {doc.storageId ? (
                      <span className="flex items-center gap-1 text-xs text-primary"><FileText className="h-3 w-3" /> {doc.format?.toUpperCase() || "FILE"}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">No file</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><Download className="h-3.5 w-3.5" />{doc.downloads.toLocaleString()}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => handleEdit(doc)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleDelete(doc._id, doc.referenceNo)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
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
