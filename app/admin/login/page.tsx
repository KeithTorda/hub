"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, LayoutDashboard } from "lucide-react"
import Swal from "sweetalert2"

export default function AdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const login = useMutation(api.mutations.loginUser)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Enforce role check for admin
            const user = await login({ email, password, role: "admin" })
            if (!user) {
                Swal.fire({
                    icon: "error",
                    title: "Access Denied",
                    text: "Invalid credentials or insufficient permissions",
                    confirmButtonColor: "#ef4444", // Destructive red for admin fail
                })
            } else {
                // Store admin session
                localStorage.setItem("knowledgehub_user", JSON.stringify(user))

                Swal.fire({
                    icon: "success",
                    title: "Admin Verified",
                    text: "Redirection to dashboard...",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    router.push("/admin")
                })
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "System error during login",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans text-white">
            {/* Dark theme for admin login to distinguish it */}
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">Admin Portal</h1>
                    <p className="mt-2 text-sm text-zinc-400">Restricted access area</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-zinc-500">Admin Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="email"
                                required
                                className="flex h-10 w-full rounded-md border border-zinc-800 bg-black/50 px-3 py-2 pl-10 text-sm text-white ring-offset-zinc-950 placeholder:text-zinc-600 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-zinc-500">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="password"
                                required
                                className="flex h-10 w-full rounded-md border border-zinc-800 bg-black/50 px-3 py-2 pl-10 text-sm text-white ring-offset-zinc-950 placeholder:text-zinc-600 focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Access Dashboard
                    </button>
                </form>

                <div className="text-center text-xs text-zinc-600">
                    Authorized personnel only. All activities are logged.
                </div>
            </div>
        </div>
    )
}
