"use client"

import { Bell, Search, Link2, ChevronDown, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { ModeToggle } from "@/components/mode-toggle"


export function PortalHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
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

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <Shield className="h-6 w-6 text-accent-foreground" />
          </div>
          <div className="leading-tight">
            <span className="text-xl font-bold tracking-tight text-primary-foreground">Knowledge</span>
            <span className="text-xl font-light text-accent">Hub</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-full bg-primary-foreground/90 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <NotificationDropdown variant="portal" />


          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3"
            >
              <Link href="/profile" className="flex items-center gap-3 border-l border-primary-foreground/20 pl-4 transition-opacity hover:opacity-80">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-primary-foreground">{user?.name || "Guest"}</p>
                  <p className="text-xs text-primary-foreground/80">{user?.department || "Visitor"}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <span className="font-bold">{user?.name?.charAt(0) || "G"}</span>
                </div>
              </Link>
              <ChevronDown className="h-4 w-4 text-primary-foreground/70" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg bg-card py-1 shadow-lg border border-border">
                {user?.role === "admin" && (
                  <Link href="/admin" className="block px-4 py-2 text-sm text-card-foreground hover:bg-muted" onClick={() => setShowUserMenu(false)}>
                    Admin Dashboard
                  </Link>
                )}
                <button type="button" className="block w-full px-4 py-2 text-left text-sm text-card-foreground hover:bg-muted">
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("knowledgehub_user")
                    window.location.href = "/auth/login"
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
