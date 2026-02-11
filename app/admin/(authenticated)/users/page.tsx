"use client"

import React from "react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Search, Plus, Shield, User, Pencil, Trash2, X } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, confirmAction, showSuccess, showError } from "@/lib/swal"

type UserRole = "admin" | "user"
type UserStatus = "active" | "inactive"

export default function AdminUsersPage() {
  const users = useQuery(api.queries.getUsers) ?? []
  const offices = useQuery(api.queries.getOffices) ?? []
  const createUser = useMutation(api.mutations.createUser)
  const updateUser = useMutation(api.mutations.updateUser)
  const deleteUser = useMutation(api.mutations.deleteUser)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<Id<"users"> | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "", department: "", role: "user" as UserRole, status: "active" as UserStatus })

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && (roleFilter === "all" || u.role === roleFilter)
  })

  const resetForm = () => { setFormData({ name: "", email: "", department: "", role: "user", status: "active" }); setEditingId(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) { await updateUser({ id: editingId, ...formData }); showSuccess("Updated!", "User updated.") }
      else { await createUser(formData); showSuccess("Created!", "User added.") }
      resetForm()
    } catch { showError("Error", "Something went wrong.") }
  }

  const handleEdit = (user: (typeof users)[0]) => {
    setFormData({ name: user.name, email: user.email, department: user.department, role: user.role, status: user.status })
    setEditingId(user._id); setShowForm(true)
  }

  const handleDelete = async (id: Id<"users">, name: string) => {
    if (!(await confirmDelete(name))) return
    try { await deleteUser({ id }); showSuccess("Deleted!", "User removed.") }
    catch { showError("Error", "Failed to delete.") }
  }

  const handleToggleStatus = async (user: (typeof users)[0]) => {
    const next = user.status === "active" ? "inactive" : "active"
    if (!(await confirmAction(`${next === "inactive" ? "Deactivate" : "Activate"} User?`, `This will set ${user.name} as ${next}.`))) return
    try { await updateUser({ id: user._id, status: next }); showSuccess("Done!", `User is now ${next}.`) }
    catch { showError("Error", "Something went wrong.") }
  }

  return (
    <>
      <AdminHeader title="User Management" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Total Users", val: users.length, cls: "text-card-foreground" },
            { label: "Active", val: users.filter((u) => u.status === "active").length, cls: "text-primary" },
            { label: "Admins", val: users.filter((u) => u.role === "admin").length, cls: "text-accent-foreground" },
            { label: "Inactive", val: users.filter((u) => u.status === "inactive").length, cls: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.cls}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">All Roles</option><option value="admin">Admin</option><option value="user">User</option>
          </select>
          <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-card-foreground">{editingId ? "Edit User" : "Add New User"}</h2>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="u-name" className="mb-1 block text-xs font-medium text-card-foreground">Full Name</label>
                  <input id="u-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label htmlFor="u-email" className="mb-1 block text-xs font-medium text-card-foreground">Email</label>
                  <input id="u-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="u-dept" className="mb-1 block text-xs font-medium text-card-foreground">Department / Office</label>
                  <select
                    id="u-dept"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Office</option>
                    {offices.map((office) => (
                      <option key={office._id} value={office.name}>
                        {office.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="u-role" className="mb-1 block text-xs font-medium text-card-foreground">Role</label>
                  <select id="u-role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="user">User</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="u-status" className="mb-1 block text-xs font-medium text-card-foreground">Status</label>
                  <select id="u-status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
                <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">{editingId ? "Update" : "Add User"}</button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Login</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user._id} className="transition-colors hover:bg-muted/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{user.name.split(" ").map((n) => n[0]).join("")}</div>
                      <div><p className="text-sm font-medium text-card-foreground">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{user.department}</td>
                  <td className="px-5 py-3.5"><div className="flex items-center gap-1.5">{user.role === "admin" ? <Shield className="h-3.5 w-3.5 text-accent" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}<span className="text-sm capitalize text-card-foreground">{user.role}</span></div></td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{user.lastLogin}</td>
                  <td className="px-5 py-3.5">
                    <button type="button" onClick={() => handleToggleStatus(user)}
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === "active" ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      title={`Click to ${user.status === "active" ? "deactivate" : "activate"}`}>{user.status}</button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => handleEdit(user)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleDelete(user._id, user.name)} className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
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
