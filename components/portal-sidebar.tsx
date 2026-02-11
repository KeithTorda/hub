"use client"

import {
  Home,
  FileText,
  Megaphone,
  CalendarDays,
  Download,
  BookOpen,
  ClipboardList,
  Users,
  User,
  History,
  Type,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

const navIcons = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Megaphone, label: "Announcements", href: "/announcements" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: ClipboardList, label: "Issuances", href: "/documents" }, // Alias for Doc
  { icon: CalendarDays, label: "Events", href: "/events" },
  { icon: Download, label: "Downloads", href: "/downloads" },
  { icon: Type, label: "Templates", href: "/downloads" }, // Alias for Downloads
  { icon: Users, label: "Directory", href: "/directory" },
  { icon: History, label: "History", href: "/history" },
  { icon: User, label: "My Profile", href: "/profile" },
]

export function PortalSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex shrink-0 flex-col border-r border-border bg-card">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        <nav className="flex flex-col gap-2" aria-label="Main navigation">
          {navIcons.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                title={item.label}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium hidden lg:block">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
