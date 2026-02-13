"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, Shield } from "lucide-react"
import Swal from "sweetalert2"

export default function UserLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const login = useMutation(api.mutations.loginUser)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const user = await login({ email, password, role: "user" })
            if (!user) {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: "Invalid email or password",
                    confirmButtonColor: "#16a34a", // Primary color match
                })
            } else {
                // Store user session
                localStorage.setItem("knowledgehub_user", JSON.stringify(user))

                Swal.fire({
                    icon: "success",
                    title: "Welcome back!",
                    text: `Signed in as ${user.name}`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    router.push("/")
                })
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Shield className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">KnowledgeHub</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="email"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="password"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="text-right">
                            <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Sign In
                    </button>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="font-semibold text-primary hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
