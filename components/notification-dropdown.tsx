"use client"

import { Bell, X, Check, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

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

export function NotificationDropdown({ variant = "portal" }: { variant?: "portal" | "admin" }) {
    const notifications = useQuery(api.queries.getNotifications) ?? []
    const unreadCount = useQuery(api.queries.getUnreadNotificationCount) ?? 0
    const markRead = useMutation(api.mutations.markNotificationRead)
    const markAllRead = useMutation(api.mutations.markAllNotificationsRead)
    const deleteNotif = useMutation(api.mutations.deleteNotification)

    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const isPortal = variant === "portal"
    const bellColor = isPortal ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
    const badgeBg = isPortal ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground"

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => setOpen(!open)} className={`relative transition-colors ${bellColor}`} aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${badgeBg}`}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h3 className="text-sm font-bold text-card-foreground">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button type="button" onClick={() => markAllRead({})} className="text-xs font-medium text-primary hover:text-primary/80" title="Mark all as read">
                                    <Check className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</div>
                        ) : (
                            notifications.slice(0, 10).map((n) => {
                                const cfg = typeConfig[n.type] || typeConfig.info
                                const Icon = cfg.icon
                                return (
                                    <div
                                        key={n._id}
                                        className={`flex items-start gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}
                                    >
                                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-xs font-semibold ${!n.read ? "text-card-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                            <p className="mt-1 text-[10px] text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            {!n.read && (
                                                <button type="button" onClick={() => markRead({ id: n._id })} className="rounded p-0.5 text-muted-foreground hover:text-primary" title="Mark read">
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                            <button type="button" onClick={() => deleteNotif({ id: n._id })} className="rounded p-0.5 text-muted-foreground hover:text-destructive" title="Dismiss">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border bg-muted/20">
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 text-center text-[10px] text-muted-foreground">
                                {notifications.length} notifications total
                            </div>
                        )}
                        <a
                            href="/notifications"
                            className="block w-full border-t border-border p-3 text-center text-xs font-medium text-primary hover:bg-muted/50 hover:underline"
                        >
                            See all notifications
                        </a>
                    </div>
                </div>
            )}
        </div>
    )
}
