import React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import ParticlesBackground from "@/components/ui/particles-background"


import { AuthGuard } from "@/components/auth-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      <div className="flex h-screen overflow-hidden bg-background relative">
        <ParticlesBackground />
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto relative z-10">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
