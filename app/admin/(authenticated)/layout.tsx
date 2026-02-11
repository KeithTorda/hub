import React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

import { AuthGuard } from "@/components/auth-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
