import { query } from "./_generated/server"
import { v } from "convex/values"
import { Id } from "./_generated/dataModel"

// Force rebuild
export const getAnnouncements = query({
    args: {},
    handler: async (ctx) => {
        const items = await ctx.db.query("announcements").collect()
        // Sort: pinned first, then by createdAt descending
        return items.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
            return b.createdAt.localeCompare(a.createdAt)
        })
    },
})

export const getDocuments = query({
    args: {
        category: v.optional(v.string()),
        section: v.optional(v.string()),
        userId: v.optional(v.id("users"))
    },
    handler: async (ctx, args) => {
        let docs
        if (args.category) {
            docs = await ctx.db
                .query("documents")
                .withIndex("by_category", (q) => q.eq("category", args.category as any))
                .collect()
        } else {
            docs = await ctx.db.query("documents").collect()
        }

        // Fetch user if userId provided
        let user: any = null
        if (args.userId) {
            user = await ctx.db.get(args.userId)
        }
        const isAdmin = user?.role === "admin"

        // Fetch tracking info for this user to check read status
        const readDocIds = new Set<string>()
        if (user && !isAdmin) {
            const tracking = await ctx.db
                .query("documentTracking")
                .withIndex("by_user", q => q.eq("userId", user._id))
                .collect()
            tracking.forEach(t => readDocIds.add(t.documentId))
        }

        // Filter by publishTo section and privacy
        docs = docs.filter((doc) => {
            // Admin sees everything
            if (isAdmin) return true

            // If user has read it, hide it from main list (optional: maybe only hide if filter says so?)
            // For now, let's keep it simple: if it's in the "Main" list, maybe we don't hide it yet, 
            // OR we rely on the frontend to filter "read" items. 
            // The prompt said "dina magpapakita sa dashboard", so we should filter it out here OR let frontend do it.
            // Let's filter it out here if it's a "dashboard" focused query. 
            // But wait, `getDocuments` is used in many places. 
            // Let's add an arg `excludeRead: boolean`.
            // For now, I'll return everything and let frontend allow "Mark as Read" to visualy remove it, 
            // or I can modify the query signature. 
            // Actually, the user requirement is "dina magpapakita sa dashboard". 
            // I'll return a `isRead` flag for each doc and let frontend filter.

            // Privacy/Targeting check
            if (doc.isPrivate) {
                if (!user) return false
                if (!doc.targetUsers?.includes(user._id)) return false
            }

            // Department Targeting
            if (doc.targetDepartments && doc.targetDepartments.length > 0) {
                if (!user) return false
                if (!doc.targetDepartments.includes(user.department)) return false
            }

            // Section check
            if (args.section) {
                if (args.section === "documents") {
                    return !doc.publishTo || doc.publishTo.includes("documents")
                }
                return doc.publishTo?.includes(args.section!)
            }
            return true
        })

        return await Promise.all(
            docs.map(async (doc) => ({
                ...doc,
                url: doc.storageId ? await ctx.storage.getUrl(doc.storageId) : null,
                isRead: readDocIds.has(doc._id)
            }))
        )
    },
})

export const getReadDocuments = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const tracking = await ctx.db
            .query("documentTracking")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .collect()

        const docs = await Promise.all(
            tracking.map(async (t) => {
                const doc = await ctx.db.get(t.documentId)
                if (!doc) return null
                return {
                    ...doc,
                    url: doc.storageId ? await ctx.storage.getUrl(doc.storageId) : null,
                    viewedAt: t.lastViewedAt
                }
            })
        )
        return docs.filter(d => d !== null)
    }
})

export const getAuditLogs = query({
    args: {},
    handler: async (ctx) => {
        const logs = await ctx.db.query("auditLogs").order("desc").take(50)
        return await Promise.all(logs.map(async (log) => {
            const user = await ctx.db.get(log.userId)
            return {
                ...log,
                userName: user?.name || "Unknown"
            }
        }))
    }
})

export const getDocumentStats = query({
    args: { documentId: v.id("documents") },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.documentId)
        if (!doc) return null

        const targetUsers = doc.targetUsers || []
        const tracking = await ctx.db
            .query("documentTracking")
            .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
            .collect()

        const userIds = new Set(targetUsers)
        const trackingMap = new Map()
        tracking.forEach(t => {
            userIds.add(t.userId)
            trackingMap.set(t.userId, t)
        })

        const users = await Promise.all(
            Array.from(userIds).map(async (id) => {
                const u: any = await ctx.db.get(id as any)
                return {
                    _id: id,
                    name: u?.name || "Unknown",
                    department: u?.department || "N/A",
                    hasViewed: trackingMap.has(id),
                    viewedAt: trackingMap.get(id)?.lastViewedAt,
                    viewCount: trackingMap.get(id)?.viewCount || 0
                }
            })
        )

        return {
            totalViews: tracking.reduce((s, t) => s + t.viewCount, 0),
            uniqueViews: tracking.length,
            targetUserStats: users.filter(u => targetUsers.includes(u._id as any)),
            otherUserStats: users.filter(u => !targetUsers.includes(u._id as any))
        }
    },
})

export const getMustReads = query({
    args: {},
    handler: async (ctx) => {
        const items = await ctx.db.query("mustReads").collect()
        return items.sort((a, b) => b.date.localeCompare(a.date))
    },
})

export const getEvents = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("events").collect()
    },
})

export const getTrainings = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("trainings").collect()
    },
})

export const getDownloadableForms = query({
    args: {},
    handler: async (ctx) => {
        const items = await ctx.db.query("downloadableForms").collect()
        const withUrls = await Promise.all(
            items.map(async (item) => ({
                ...item,
                url: item.storageId ? await ctx.storage.getUrl(item.storageId) : null,
            }))
        )
        return withUrls.sort((a, b) => b.downloads - a.downloads)
    },
})

export const getSlides = query({
    args: {},
    handler: async (ctx) => {
        const slides = await ctx.db
            .query("slides")
            .withIndex("by_order")
            .collect()

        return await Promise.all(
            slides.map(async (slide) => ({
                ...slide,
                url: slide.storageId ? await ctx.storage.getUrl(slide.storageId) : null,
            }))
        )
    },
})

export const getUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect()
    },
})

export const getUserData = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return null
        return await ctx.db.query("users").withIndex("by_email", q => q.eq("email", identity.email!)).first()
    }
})

export const getUser = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id)
    },
})

export const getSettings = query({
    args: {},
    handler: async (ctx) => {
        const items = await ctx.db.query("settings").collect()
        const map: Record<string, string> = {}
        for (const item of items) {
            map[item.key] = item.value
        }
        return map
    },
})



// ── Dashboard Stats ──────────────────────────────────────────

export const getTotalDownloads = query({
    args: {},
    handler: async (ctx) => {
        const docs = await ctx.db.query("documents").collect()
        const forms = await ctx.db.query("downloadableForms").collect()

        const docDownloads = docs.reduce((sum, d) => sum + (d.downloads || 0), 0)
        const formDownloads = forms.reduce((sum, f) => sum + (f.downloads || 0), 0)

        return docDownloads + formDownloads
    },
})

// ── Categories & Offices ──────────────────────────────────────

export const getCategories = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("categories").collect()
    }
})

export const getOffices = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("offices").collect()
    }
})

// ── Recent Widgets ─────────────────────────────────────────────

export const getRecentDocuments = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 5
        const docs = await ctx.db.query("documents").order("desc").take(limit)
        return await Promise.all(docs.map(async (doc) => ({
            ...doc,
            url: doc.storageId ? await ctx.storage.getUrl(doc.storageId) : null
        })))
    }
})

export const getPinnedDocuments = query({
    args: {},
    handler: async (ctx) => {
        const docs = await ctx.db
            .query("documents")
            .withIndex("by_pinned", (q) => q.eq("pinned", true))
            .collect()

        return await Promise.all(docs.map(async (doc) => ({
            ...doc,
            url: doc.storageId ? await ctx.storage.getUrl(doc.storageId) : null
        })))
    }
})

// ── Notification Enhancements ──────────────────────────────────

export const getNotifications = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const all = await ctx.db.query("notifications").collect()

        let filtered = all
        if (args.userId) {
            // Show global notifications (no userId) + specific user notifications
            filtered = all.filter(n => !n.userId || n.userId === args.userId)
        } else {
            // If no user specified, maybe show internal system notifications or all?
            // For backward compatibility, return all if no userId is passed (Admin view)
            filtered = all
        }

        return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }
})

export const getUnreadNotificationCount = query({
    args: { userId: v.optional(v.id("users")) },
    handler: async (ctx, args) => {
        const all = await ctx.db.query("notifications").withIndex("by_read", q => q.eq("read", false)).collect()
        if (args.userId) {
            return all.filter(n => !n.userId || n.userId === args.userId).length
        }
        return all.length
    },
})
