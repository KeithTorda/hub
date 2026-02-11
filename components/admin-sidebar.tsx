"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  CalendarDays,
  GraduationCap,
  Download,
  Users,
  Settings,
  Shield,
  ArrowLeft,
  Activity,
  Bell,
  BookOpen,
  Image,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/tracking", label: "Tracking", icon: Activity },
  { href: "/admin/slides", label: "Carousel Slides", icon: Image },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 border-b border-sidebar-border px-4 py-4",
        isCollapsed ? "justify-center" : "px-5"
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary">
          <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="leading-tight overflow-hidden whitespace-nowrap">
            <p className="text-sm font-bold text-sidebar-foreground">Knowledge Hub</p>
            <p className="text-xs text-sidebar-foreground/60">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border/50" aria-label="Admin navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70",
                    isCollapsed ? "justify-center px-0" : "px-3"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Actions */}
      <div className="border-t border-sidebar-border p-3 space-y-1">

        {/* Toggle Collapse */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            isCollapsed ? "justify-center px-0" : "px-3"
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
          {!isCollapsed && <span>Collapse Menu</span>}
        </button>

        {/* Back to portal */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            isCollapsed ? "justify-center px-0" : "px-3"
          )}
          title={isCollapsed ? "Back to Portal" : undefined}
        >
          <ArrowLeft className="h-4.5 w-4.5 shrink-0" />
          {!isCollapsed && <span>Back to Portal</span>}
        </Link>
      </div>
    </aside>
  )
}
