"use client"

import { Search, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { ModeToggle } from "@/components/mode-toggle"


export function AdminHeader({ title }: { title: string }) {
  const [showMenu, setShowMenu] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("knowledgehub_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse user", e)
      }
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("knowledgehub_user")
    window.location.href = "/auth/login"
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <h1 className="text-lg font-bold text-card-foreground">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <ModeToggle />
        <NotificationDropdown variant="admin" />


        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user?.name?.charAt(0) || "A"}
            </div>
            <span className="text-sm font-medium text-card-foreground">{user?.name || "Admin"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-card py-1 shadow-lg border border-border">
              <button type="button" className="block w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-muted" onClick={() => setShowMenu(false)}>
                Profile
              </button>
              <button type="button" className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
