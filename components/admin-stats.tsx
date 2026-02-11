"use client"

import { Megaphone, FileText, CalendarDays, Eye, Users, TrendingUp, Bell } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"

export function AdminStats() {
  const announcements = useQuery(api.queries.getAnnouncements) ?? []
  const documents = useQuery(api.queries.getDocuments, {}) ?? []
  const events = useQuery(api.queries.getEvents) ?? []
  const trainings = useQuery(api.queries.getTrainings) ?? []
  const users = useQuery(api.queries.getUsers) ?? []
  const forms = useQuery(api.queries.getDownloadableForms) ?? []
  const unreadNotifs = useQuery(api.queries.getUnreadNotificationCount) ?? 0
  const notifications = useQuery(api.queries.getNotifications) ?? []

  // Fetched from backend now
  const totalDownloads = useQuery(api.queries.getTotalDownloads) ?? 0
  const activeUsers = users.filter((u: any) => u.status === "active").length

  const stats = [
    {
      label: "Total Announcements",
      value: announcements.length.toString(),
      change: `${announcements.filter((a: any) => a.pinned).length} pinned`,
      icon: Megaphone,
      color: "bg-primary/10 text-primary",
      href: "/admin/announcements",
    },
    {
      label: "Active Documents",
      value: documents.length.toString(),
      change: `${totalDownloads.toLocaleString()} total downloads`,
      icon: FileText,
      color: "bg-accent/20 text-accent-foreground",
      href: "/admin/documents",
    },
    {
      label: "Upcoming Events",
      value: events.length.toString(),
      change: `${trainings.length} training programs`,
      icon: CalendarDays,
      color: "bg-chart-3/10 text-chart-3",
      href: "/admin/events",
    },
    {
      label: "Active Users",
      value: activeUsers.toString(),
      change: `${users.length} total registered`,
      icon: Users,
      color: "bg-chart-4/10 text-chart-4",
      href: "/admin/users",
    },
    {
      label: "Downloadable Forms",
      value: forms.length.toString(),
      change: `${forms.reduce((s: number, f: any) => s + (f.downloads || 0), 0).toLocaleString()} total downloads`,
      icon: Eye,
      color: "bg-chart-5/10 text-chart-5",
      href: "/admin/forms",
    },
    {
      label: "Notifications",
      value: notifications.length.toString(),
      change: `${unreadNotifs} unread`,
      icon: Bell,
      color: "bg-destructive/10 text-destructive",
      href: "/admin/notifications",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Link key={stat.label} href={stat.href} className="block transition-transform hover:scale-[1.02]">
          <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-card-foreground">{stat.value}</p>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.change}</span>
                </div>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
