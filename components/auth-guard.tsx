"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
    children: React.ReactNode
    requiredRole?: "admin" | "user"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = () => {
            // Don't check on public auth pages
            if (pathname.startsWith("/auth") || pathname.startsWith("/admin/login")) {
                setIsAuthorized(true)
                setIsLoading(false)
                return
            }

            const stored = localStorage.getItem("knowledgehub_user")

            if (!stored) {
                // No session found -> Redirect logic
                // If trying to access admin, go to admin login
                if (pathname.startsWith("/admin")) {
                    router.replace("/admin/login")
                } else {
                    // Default to user login
                    router.replace("/auth/login")
                }
                setIsLoading(false)
                return
            }

            try {
                const user = JSON.parse(stored)

                // Check role requirements
                if (requiredRole) {
                    if (requiredRole === "admin" && user.role !== "admin") {
                        // User trying to access Admin -> Kick out
                        router.replace("/") // or 403
                        return
                    }
                    // If requiring "user", admin is also usually fine, but lets stick to role
                }

                setIsAuthorized(true)
            } catch (e) {
                localStorage.removeItem("knowledgehub_user")
                router.replace("/auth/login")
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [pathname, requiredRole, router])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Verifying access...</span>
            </div>
        )
    }

    if (!isAuthorized) return null

    return <>{children}</>
}
