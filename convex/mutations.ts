import { mutation } from "./_generated/server"
import { v } from "convex/values"

// ── Helper: safe delete ─────────────────────────────────────────
async function safeDelete(ctx: any, id: any) {
    const doc = await ctx.db.get(id)
    if (!doc) return false

    // If it has a storageId, delete the file from storage too
    if (doc.storageId) {
        await ctx.storage.delete(doc.storageId)
    }

    await ctx.db.delete(id)
    return true
}

async function safePatch(ctx: any, id: any, data: any) {
    const doc = await ctx.db.get(id)
    if (!doc) return false

    // If updating storageId and the old doc had one, delete the old file
    if (data.storageId && doc.storageId && data.storageId !== doc.storageId) {
        await ctx.storage.delete(doc.storageId)
    }

    await ctx.db.patch(id, data)
    return true
}

// ── File Uploads ────────────────────────────────────────────────

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl()
})

// ── Announcements ───────────────────────────────────────────────

export const createAnnouncement = mutation({
    args: {
        title: v.string(),
        content: v.string(),
        category: v.union(
            v.literal("urgent"),
            v.literal("general"),
            v.literal("memo"),
            v.literal("event")
        ),
        author: v.string(),
        pinned: v.boolean(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("announcements", {
            ...args,
            createdAt: new Date().toISOString().split("T")[0],
        })

        // Notify all users about the new announcement
        const allUsers = await ctx.db.query("users").collect()
        for (const user of allUsers) {
            await ctx.db.insert("notifications", {
                title: "New Announcement",
                message: args.title,
                type: "urgent",
                read: false,
                createdAt: new Date().toISOString(),
                userId: user._id
            })
        }

        return id
    },
})

export const updateAnnouncement = mutation({
    args: {
        id: v.id("announcements"),
        title: v.string(),
        content: v.string(),
        category: v.union(
            v.literal("urgent"),
            v.literal("general"),
            v.literal("memo"),
            v.literal("event")
        ),
        author: v.string(),
        pinned: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        await safePatch(ctx, id, data)
    },
})

export const deleteAnnouncement = mutation({
    args: { id: v.id("announcements") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

export const toggleAnnouncementPin = mutation({
    args: { id: v.id("announcements") },
    handler: async (ctx, args) => {
        const item = await ctx.db.get(args.id)
        if (item) {
            await ctx.db.patch(args.id, { pinned: !item.pinned })
        }
    },
})

// ── Documents ───────────────────────────────────────────────────

export const createDocument = mutation({
    args: {
        referenceNo: v.string(),
        description: v.string(),
        category: v.string(), // Dynamic
        dateReleased: v.optional(v.string()),
        originator: v.optional(v.string()),
        officeConcerned: v.optional(v.string()), // Dynamic
        publishTo: v.optional(v.array(v.string())),
        targetUsers: v.optional(v.array(v.id("users"))),
        targetDepartments: v.optional(v.array(v.string())),
        isPrivate: v.optional(v.boolean()),
        storageId: v.optional(v.id("_storage")),
        format: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const docId = await ctx.db.insert("documents", {
            title: args.referenceNo,
            referenceNo: args.referenceNo,
            description: args.description,
            category: args.category,
            date: new Date().toISOString().split("T")[0],
            dateReleased: args.dateReleased,
            originator: args.originator,
            officeConcerned: args.officeConcerned,
            publishTo: args.publishTo,
            targetUsers: args.targetUsers,
            targetDepartments: args.targetDepartments,
            isPrivate: args.isPrivate,
            downloads: 0,
            storageId: args.storageId,
            format: args.format,
        })

        // Create Notification
        const notificationData = {
            title: "New Document Posted",
            message: `Document ${args.referenceNo} (${args.category}) is now available.`,
            type: "info" as const,
            read: false,
            createdAt: new Date().toISOString(),
        }

        if (args.targetUsers && args.targetUsers.length > 0) {
            // Notify specific users
            for (const userId of args.targetUsers) {
                await ctx.db.insert("notifications", { ...notificationData, userId })
            }
        } else if (args.targetDepartments && args.targetDepartments.length > 0) {
            // Notify users in specific departments
            const users = await ctx.db.query("users").collect()
            for (const user of users) {
                if (args.targetDepartments.includes(user.department)) {
                    await ctx.db.insert("notifications", { ...notificationData, userId: user._id })
                }
            }
        } else {
            // Global notification - Fan out to all users to support per-user read status
            const allUsers = await ctx.db.query("users").collect()
            for (const user of allUsers) {
                await ctx.db.insert("notifications", { ...notificationData, userId: user._id })
            }
        }

        // Notify Admin/Author that posting is complete
        const currentUser = await ctx.auth.getUserIdentity()
        if (currentUser) {
            // Find the user in our database to get their ID
            const adminUser = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", currentUser.email!)).first()
            if (adminUser) {
                await ctx.db.insert("notifications", {
                    title: "System Update",
                    message: `Successfully posted ${args.referenceNo} and notified users.`,
                    type: "success",
                    read: false,
                    createdAt: new Date().toISOString(),
                    userId: adminUser._id
                })

                // Audit Log
                await ctx.db.insert("auditLogs", {
                    action: "create_document",
                    details: `Posted document ${args.referenceNo} (${args.category})`,
                    userId: adminUser._id,
                    createdAt: new Date().toISOString()
                })
            }
        }

        return docId
    },
})

export const updateDocument = mutation({
    args: {
        id: v.id("documents"),
        referenceNo: v.string(),
        description: v.string(),
        category: v.string(),
        dateReleased: v.optional(v.string()),
        originator: v.optional(v.string()),
        officeConcerned: v.optional(v.string()),
        publishTo: v.optional(v.array(v.string())),
        targetUsers: v.optional(v.array(v.id("users"))),
        isPrivate: v.optional(v.boolean()),
        storageId: v.optional(v.id("_storage")),
        format: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        await safePatch(ctx, id, { title: data.referenceNo, ...data })
    },
})

export const deleteDocument = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

export const markAsViewed = mutation({
    args: { documentId: v.id("documents"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("documentTracking")
            .withIndex("by_document_user", (q) => q.eq("documentId", args.documentId).eq("userId", args.userId))
            .first()

        const now = new Date().toISOString()

        if (existing) {
            await ctx.db.patch(existing._id, {
                lastViewedAt: now,
                viewCount: existing.viewCount + 1,
            })
        } else {
            await ctx.db.insert("documentTracking", {
                documentId: args.documentId,
                userId: args.userId,
                firstViewedAt: now,
                lastViewedAt: now,
                viewCount: 1,
            })
        }
    },
})

// ── Categories ──────────────────────────────────────────────────

export const createCategory = mutation({
    args: {
        name: v.string(),
        code: v.string(),
        type: v.optional(v.string()),
        description: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // Check for duplicates
        const existing = await ctx.db.query("categories").withIndex("by_code", q => q.eq("code", args.code)).first()
        if (existing) throw new Error("Category code already exists")
        return await ctx.db.insert("categories", args)
    }
})

export const updateCategory = mutation({
    args: {
        id: v.id("categories"),
        name: v.string(),
        code: v.optional(v.string()),
        type: v.optional(v.string()),
        description: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        await safePatch(ctx, id, data)
    }
})

export const deleteCategory = mutation({
    args: { id: v.id("categories") },
    handler: async (ctx, args) => { await safeDelete(ctx, args.id) }
})

// ── Offices ─────────────────────────────────────────────────────

export const createOffice = mutation({
    args: { name: v.string(), code: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("offices").withIndex("by_name", q => q.eq("name", args.name)).first()
        if (existing) throw new Error("Office already exists")
        return await ctx.db.insert("offices", args)
    }
})

export const updateOffice = mutation({
    args: { id: v.id("offices"), name: v.string(), code: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        await safePatch(ctx, id, data)
    }
})

export const deleteOffice = mutation({
    args: { id: v.id("offices") },
    handler: async (ctx, args) => { await safeDelete(ctx, args.id) }
})

// ── Events ──────────────────────────────────────────────────────

export const createEvent = mutation({
    args: {
        title: v.string(),
        dateRange: v.string(),
        location: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("events", args)

        // Notify all users about the new event
        const allUsers = await ctx.db.query("users").collect()
        for (const user of allUsers) {
            await ctx.db.insert("notifications", {
                title: "New Event Scheduled",
                message: `${args.title} on ${args.dateRange}`,
                type: "info",
                read: false,
                createdAt: new Date().toISOString(),
                userId: user._id
            })
        }
        return id
    },
})

export const updateEvent = mutation({
    args: {
        id: v.id("events"),
        title: v.string(),
        dateRange: v.string(),
        location: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        await safePatch(ctx, id, data)
    },
})

export const deleteEvent = mutation({
    args: { id: v.id("events") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

// ── Trainings ───────────────────────────────────────────────────

export const createTraining = mutation({
    args: {
        title: v.string(),
        dateRange: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("trainings", args)

        // Notify all users about the new training
        const allUsers = await ctx.db.query("users").collect()
        for (const user of allUsers) {
            await ctx.db.insert("notifications", {
                title: "New Training Available",
                message: `${args.title}`,
                type: "info",
                read: false,
                createdAt: new Date().toISOString(),
                userId: user._id
            })
        }
        return id
    },
})

export const updateTraining = mutation({
    args: {
        id: v.id("trainings"),
        title: v.string(),
        dateRange: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        await safePatch(ctx, id, data)
    },
})

export const deleteTraining = mutation({
    args: { id: v.id("trainings") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

// ── Downloadable Forms ──────────────────────────────────────────

export const createForm = mutation({
    args: {
        title: v.string(),
        storageId: v.optional(v.id("_storage")),
        format: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("downloadableForms", {
            title: args.title,
            downloads: 0,
            storageId: args.storageId,
            format: args.format,
        })
    },
})

export const updateForm = mutation({
    args: {
        id: v.id("downloadableForms"),
        title: v.string(),
        storageId: v.optional(v.id("_storage")),
        format: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        await safePatch(ctx, id, data)
    },
})

export const deleteForm = mutation({
    args: { id: v.id("downloadableForms") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

// ── Slides ──────────────────────────────────────────────────────

// ── Slides ──────────────────────────────────────────────────────

export const createSlide = mutation({
    args: {
        title: v.string(),
        subtitle: v.string(),
        version: v.string(),
        caption: v.string(),
        order: v.number(),
        storageId: v.optional(v.id("_storage")),
        format: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("slides", args)
    },
})

export const updateSlide = mutation({
    args: {
        id: v.id("slides"),
        title: v.string(),
        subtitle: v.string(),
        version: v.string(),
        caption: v.string(),
        order: v.number(),
        storageId: v.optional(v.id("_storage")),
        format: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        await safePatch(ctx, id, data)
    },
})

export const deleteSlide = mutation({
    args: { id: v.id("slides") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

// ── Users ───────────────────────────────────────────────────────

export const createUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        department: v.string(),
        role: v.union(v.literal("admin"), v.literal("user")),
        status: v.union(v.literal("active"), v.literal("inactive")),
        password: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("users", {
            ...args,
            lastLogin: new Date().toISOString().split("T")[0],
        })
    },
})

export const updateUser = mutation({
    args: {
        id: v.id("users"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        department: v.optional(v.string()),
        role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
        status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
        password: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args
        const updates: Record<string, any> = {}
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) updates[key] = value
        }
        if (Object.keys(updates).length > 0) {
            await safePatch(ctx, id, updates)
        }
    },
})

export const deleteUser = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

// ── Must Reads ─────────────────────────────────────────────────

export const createMustRead = mutation({
    args: {
        title: v.string(),
        subtitle: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("mustReads", {
            ...args,
            date: new Date().toISOString().split("T")[0],
        })
    },
})

export const deleteMustRead = mutation({
    args: { id: v.id("mustReads") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

export const updateMustRead = mutation({
    args: {
        id: v.id("mustReads"),
        title: v.string(),
        subtitle: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args
        await safePatch(ctx, id, rest)
    },
})

// ── Settings ───────────────────────────────────────────────────

export const upsertSetting = mutation({
    args: { key: v.string(), value: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first()
        if (existing) {
            await ctx.db.patch(existing._id, { value: args.value })
        } else {
            await ctx.db.insert("settings", { key: args.key, value: args.value })
        }
    },
})

// ── Notifications ──────────────────────────────────────────────

export const createNotification = mutation({
    args: {
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("info"), v.literal("success"), v.literal("warning"), v.literal("urgent")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("notifications", {
            ...args,
            read: false,
            createdAt: new Date().toISOString(),
        })
    },
})

export const markNotificationRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        const doc = await ctx.db.get(args.id)
        if (doc) await ctx.db.patch(args.id, { read: true })
    },
})

export const markAllNotificationsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const unread = await ctx.db
            .query("notifications")
            .withIndex("by_read", (q) => q.eq("read", false))
            .collect()
        for (const n of unread) {
            await ctx.db.patch(n._id, { read: true })
        }
    },
})

export const deleteNotification = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        await safeDelete(ctx, args.id)
    },
})

// ── Authentication ─────────────────────────────────────────────

export const registerUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        department: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first()
        if (existing) throw new Error("Email already registered")

        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            password: args.password,
            department: args.department,
            role: "user",
            status: "active",
            lastLogin: new Date().toISOString(),
        })

        // Notify Admins about new user
        const admins = await ctx.db.query("users").filter(q => q.eq(q.field("role"), "admin")).collect()
        for (const admin of admins) {
            await ctx.db.insert("notifications", {
                title: "New User Registration",
                message: `${args.name} (${args.department}) has joined.`,
                type: "info",
                read: false,
                createdAt: new Date().toISOString(),
                userId: admin._id
            })
        }

        return userId
    },
})

export const loginUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        role: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first()

        if (!user || user.password !== args.password) {
            return null
        }

        if (args.role && user.role !== args.role) {
            return null // Role mismatch
        }

        // Update last login
        await ctx.db.patch(user._id, { lastLogin: new Date().toISOString() })

        return user
    },
})
