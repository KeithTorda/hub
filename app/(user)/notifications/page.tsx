"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle, Bell } from "lucide-react"
import { showSuccess, showError, confirmAction } from "@/lib/swal"

const typeConfig: Record<string, { icon: typeof Info; color: string; bg: string }> = {
    info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
    success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    urgent: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export default function NotificationsPage() {
    const notifications = useQuery(api.queries.getNotifications) || []
    const markRead = useMutation(api.mutations.markNotificationRead)
    const markAllRead = useMutation(api.mutations.markAllNotificationsRead)
    const deleteNotif = useMutation(api.mutations.deleteNotification)

    const handleMarkRead = async (id: any) => {
        try {
            await markRead({ id })
        } catch {
            showError("Error", "Failed to mark as read")
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllRead({})
            showSuccess("Success", "All notifications marked as read")
        } catch {
            showError("Error", "Failed to mark all as read")
        }
    }

    const handleDelete = async (id: any) => {
        if (await confirmAction("Delete Notification?", "This action cannot be undone.")) {
            try {
                await deleteNotif({ id })
                showSuccess("Deleted", "Notification removed")
            } catch {
                showError("Error", "Failed to delete notification")
            }
        }
    }

    return (
        <div className="container mx-auto max-w-4xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                    <p className="text-sm text-muted-foreground">Manage your alerts and updates</p>
                </div>
                <div className="flex gap-2">
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                            <Check className="h-4 w-4" />
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Bell className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-foreground">No notifications</h3>
                        <p className="text-sm text-muted-foreground">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((n) => {
                        const cfg = typeConfig[n.type] || typeConfig.info
                        const Icon = cfg.icon
                        return (
                            <div
                                key={n._id}
                                className={`group relative flex items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-md ${!n.read ? "border-primary/20 bg-primary/5" : "border-border bg-card"
                                    }`}
                            >
                                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className={`text-base font-semibold ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                                                {n.title}
                                            </h4>
                                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                                {n.message}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                                        {!n.read && (
                                            <button
                                                onClick={() => handleMarkRead(n._id)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                Mark as read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(n._id)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {!n.read && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary md:hidden" />
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
