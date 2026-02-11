"use client"

import React from "react"
import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Save, ChevronRight } from "lucide-react"
import { showSuccess, showError } from "@/lib/swal"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function AdminSettingsPage() {
  const settings = useQuery(api.queries.getSettings)
  const upsertSetting = useMutation(api.mutations.upsertSetting)

  const [portalName, setPortalName] = useState("Knowledge Hub")
  const [tickerEnabled, setTickerEnabled] = useState(true)
  const [tickerSpeed, setTickerSpeed] = useState("5")
  const [maxFeatured, setMaxFeatured] = useState("5")
  const [autoArchive, setAutoArchive] = useState("30")

  // Load settings from Convex when available
  useEffect(() => {
    if (settings) {
      if (settings.portalName) setPortalName(settings.portalName)
      if (settings.tickerEnabled) setTickerEnabled(settings.tickerEnabled === "true")
      if (settings.tickerSpeed) setTickerSpeed(settings.tickerSpeed)
      if (settings.maxFeatured) setMaxFeatured(settings.maxFeatured)
      if (settings.autoArchive) setAutoArchive(settings.autoArchive)
    }
  }, [settings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await Promise.all([
        upsertSetting({ key: "portalName", value: portalName }),
        upsertSetting({ key: "tickerEnabled", value: tickerEnabled.toString() }),
        upsertSetting({ key: "tickerSpeed", value: tickerSpeed }),
        upsertSetting({ key: "maxFeatured", value: maxFeatured }),
        upsertSetting({ key: "autoArchive", value: autoArchive }),
      ])
      showSuccess("Saved!", "Settings saved successfully.")
    } catch {
      showError("Error", "Failed to save settings.")
    }
  }

  return (
    <>
      <AdminHeader title="Portal Settings" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          {/* General */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-bold text-card-foreground">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="portal-name" className="mb-1 block text-xs font-medium text-card-foreground">Portal Name</label>
                <input
                  id="portal-name"
                  type="text"
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Announcement Ticker */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-bold text-card-foreground">Announcement Ticker</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={tickerEnabled}
                  onChange={(e) => setTickerEnabled(e.target.checked)}
                  className="rounded accent-primary"
                />
                <span className="text-sm text-card-foreground">Enable announcement ticker on portal</span>
              </label>
              <div>
                <label htmlFor="ticker-speed" className="mb-1 block text-xs font-medium text-card-foreground">
                  Rotation Speed (seconds)
                </label>
                <input
                  id="ticker-speed"
                  type="number"
                  min="2"
                  max="30"
                  value={tickerSpeed}
                  onChange={(e) => setTickerSpeed(e.target.value)}
                  className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Master Data */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-bold text-card-foreground">Master Data Management</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a href="/admin/settings/categories" className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-sm">Categories</p>
                  <p className="text-xs text-muted-foreground">Manage document categories</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
              <a href="/admin/settings/offices" className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-sm">Departments</p>
                  <p className="text-xs text-muted-foreground">Manage departments and units</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </section>

          {/* Content */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-bold text-card-foreground">Content Management</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="max-featured" className="mb-1 block text-xs font-medium text-card-foreground">Max Featured Items in Carousel</label>
                <input
                  id="max-featured"
                  type="number"
                  min="1"
                  max="10"
                  value={maxFeatured}
                  onChange={(e) => setMaxFeatured(e.target.value)}
                  className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="auto-archive" className="mb-1 block text-xs font-medium text-card-foreground">Auto-Archive Announcements After (days)</label>
                <input
                  id="auto-archive"
                  type="number"
                  min="7"
                  max="365"
                  value={autoArchive}
                  onChange={(e) => setAutoArchive(e.target.value)}
                  className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </form>
      </main>
    </>
  )
}
