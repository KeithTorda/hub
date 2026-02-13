"use client"

import { PortalHeader } from "@/components/portal-header"
import { AnnouncementTicker } from "@/components/announcement-ticker"
import { PortalSidebar } from "@/components/portal-sidebar"
import { PortalFooter } from "@/components/portal-footer"
import { AuthGuard } from "@/components/auth-guard"

import { GlobalRightSidebar } from "@/components/global-right-sidebar"
import ParticlesBackground from "@/components/ui/particles-background"


export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen flex-col bg-background relative">
                <ParticlesBackground />

                <PortalHeader />
                <AnnouncementTicker />
                <div className="flex flex-1 overflow-hidden">
                    <PortalSidebar />

                    {/* Main Content Area - Centered */}
                    <main className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-5xl">
                            {children}
                        </div>
                    </main>

                    {/* Global Right Sidebar - Fixed width, hidden on mobile */}
                    <GlobalRightSidebar />
                </div>
                <PortalFooter />
            </div>
        </AuthGuard>
    )
}
