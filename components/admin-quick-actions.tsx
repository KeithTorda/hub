"use client"

import { Plus, Upload, CalendarPlus, Send } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    label: "New Announcement",
    description: "Create and publish a new announcement",
    icon: Plus,
    href: "/admin/announcements",
    color: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    label: "Upload Document",
    description: "Add administrative orders or memos",
    icon: Upload,
    href: "/admin/documents",
    color: "bg-foreground text-background hover:bg-foreground/90",
  },
  {
    label: "Schedule Event",
    description: "Create a new event or training",
    icon: CalendarPlus,
    href: "/admin/events",
    color: "bg-chart-3 text-primary-foreground hover:bg-chart-3/90",
  },
  {
    label: "Send Notification",
    description: "Broadcast a message to all users",
    icon: Send,
    href: "/admin/notifications",
    color: "bg-accent text-accent-foreground hover:bg-accent/90",
  },
]

export function AdminQuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold text-card-foreground">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 p-5">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex items-center gap-3 rounded-lg p-3.5 transition-colors ${action.color}`}
          >
            <action.icon className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{action.label}</p>
              <p className="text-xs opacity-80">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
