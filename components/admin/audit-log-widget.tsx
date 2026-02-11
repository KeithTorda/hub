"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, User } from "lucide-react"

export function AuditLogWidget() {
    const logs = useQuery(api.queries.getAuditLogs) ?? []

    return (
        <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">System Activity</h3>
            </div>

            <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 py-6">
                    {logs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No activity logs found.</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log._id} className="relative pl-6 pb-6 last:pb-0">
                                {/* Timeline Line */}
                                <div className="absolute left-0 top-2 h-full w-px bg-border last:hidden" />
                                <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary" />

                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-foreground">{log.details}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {log.userName}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
