"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Search, Mail, Building2, User } from "lucide-react"
import { useState } from "react"

export default function DirectoryPage() {
    const users = useQuery(api.queries.getUsers) ?? []
    const [search, setSearch] = useState("")

    const filtered = search
        ? users.filter((u: any) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.department.toLowerCase().includes(search.toLowerCase())
        )
        : users

    return (
        <div className="bg-background p-6">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Staff Directory</h1>
                        <p className="text-sm text-muted-foreground">Contact information for department personnel</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="Search directory..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-64 rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                </div>

                {/* Directory Grid */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-12">
                        <User className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No users found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {filtered.map((user: any) => (
                            <div key={user._id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${user.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                                        }`}>
                                        {user.status}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-card-foreground">{user.name}</h3>
                                    <p className="text-xs text-muted-foreground">{user.role.toUpperCase()}</p>
                                </div>
                                <div className="mt-auto space-y-1.5 pt-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Building2 className="h-3.5 w-3.5" />
                                        {user.department}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
