"use client"

import { Plus, Upload, CalendarPlus, Send } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    label: "New Announcement",
    description: "Create and publish a new announcement",
    icon: Plus,
    href: "/admin/announcements",
    color: "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700",
  },
  {
    label: "Upload Document",
    description: "Add administrative orders or memos",
    icon: Upload,
    href: "/admin/documents",
    color: "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  },
  {
    label: "Schedule Event",
    description: "Create a new event or training",
    icon: CalendarPlus,
    href: "/admin/events",
    color: "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700",
  },
  {
    label: "Send Notification",
    description: "Broadcast a message to all users",
    icon: Send,
    href: "/admin/notifications",
    color: "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600", // Adjusted for visibility
  },
]

export function AdminQuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-base font-bold text-card-foreground">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 p-6">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`group relative flex flex-col items-start justify-between overflow-hidden rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-md ${action.color}`}
          >
            <div className="mb-4 rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
              <action.icon className="h-6 w-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold leading-tight">{action.label}</h3>
              <p className="text-xs font-medium opacity-80 leading-snug">
                {action.description}
              </p>
            </div>

            {/* Decorative background icon */}
            <action.icon className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 -rotate-12" />
          </Link>
        ))}
      </div>
    </div>
  )
}
