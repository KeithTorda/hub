"use client"

import React from "react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Plus, Trash2, Bell, Info, AlertTriangle, CheckCircle, AlertCircle, X } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { confirmDelete, showSuccess, showError } from "@/lib/swal"

type NotifType = "info" | "success" | "warning" | "urgent"

const typeConfig: Record<string, { icon: typeof Info; color: string; bg: string; label: string }> = {
    info: { icon: Info, color: "text-primary", bg: "bg-primary/10", label: "Info" },
    success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Success" },
    warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Warning" },
    urgent: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Urgent" },
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export default function AdminNotificationsPage() {
    const notifications = useQuery(api.queries.getNotifications) ?? []
    const createNotif = useMutation(api.mutations.createNotification)
    const markRead = useMutation(api.mutations.markNotificationRead)
    const markAllRead = useMutation(api.mutations.markAllNotificationsRead)
    const deleteNotif = useMutation(api.mutations.deleteNotification)

    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ title: "", message: "", type: "info" as NotifType })

    const unreadCount = notifications.filter((n) => !n.read).length

    const resetForm = () => { setFormData({ title: "", message: "", type: "info" }); setShowForm(false) }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createNotif(formData)
            showSuccess("Sent!", "Notification broadcast to all users.")
            resetForm()
        } catch { showError("Error", "Failed to send.") }
    }

    const handleDelete = async (id: Id<"notifications">, title: string) => {
        if (!(await confirmDelete(title))) return
        try { await deleteNotif({ id }); showSuccess("Deleted!", "") }
        catch { showError("Error", "Failed to delete.") }
    }

    return (
        <>
            <AdminHeader title="Notifications" />
            <main className="flex-1 overflow-y-auto bg-background p-6">
                {/* Stats */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Total</p>
                        <p className="mt-1 text-2xl font-bold text-card-foreground">{notifications.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Unread</p>
                        <p className="mt-1 text-2xl font-bold text-primary">{unreadCount}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Read</p>
                        <p className="mt-1 text-2xl font-bold text-muted-foreground">{notifications.length - unreadCount}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button type="button" onClick={() => markAllRead({})}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                                Mark All Read
                            </button>
                        )}
                    </div>
                    <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Send Notification
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-6 rounded-xl border border-border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-card-foreground">Broadcast Notification</h2>
                            <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground" aria-label="Close"><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label htmlFor="notif-title" className="mb-1 block text-xs font-medium text-card-foreground">Title</label>
                                    <input id="notif-title" type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g., System Maintenance" />
                                </div>
                                <div>
                                    <label htmlFor="notif-type" className="mb-1 block text-xs font-medium text-card-foreground">Type</label>
                                    <select id="notif-type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as NotifType })}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                        <option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="notif-msg" className="mb-1 block text-xs font-medium text-card-foreground">Message</label>
                                <textarea id="notif-msg" required rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Notification message..." />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
                                <button type="submit" className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Send</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List */}
                <div className="rounded-xl border border-border bg-card">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12">
                            <Bell className="h-10 w-10 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((n) => {
                                const cfg = typeConfig[n.type] || typeConfig.info
                                const Icon = cfg.icon
                                return (
                                    <div key={n._id} className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}>
                                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                                            <Icon className={`h-4 w-4 ${cfg.color}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-semibold ${!n.read ? "text-card-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                                {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                                            <p className="mt-1.5 text-xs text-muted-foreground/60">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            {!n.read && (
                                                <button type="button" onClick={() => markRead({ id: n._id })}
                                                    className="rounded-lg px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10">Mark Read</button>
                                            )}
                                            <button type="button" onClick={() => handleDelete(n._id, n.title)}
                                                className="rounded p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
