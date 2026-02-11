import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  announcements: defineTable({
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
    createdAt: v.string(),
  }).index("by_pinned", ["pinned"]),

  documents: defineTable({
    title: v.string(),
    referenceNo: v.string(),
    description: v.string(),
    category: v.string(), // Dynamic category
    date: v.string(),
    dateReleased: v.optional(v.string()),
    originator: v.optional(v.string()),
    officeConcerned: v.optional(v.string()), // Dynamic office
    publishTo: v.optional(v.array(v.string())),
    targetUsers: v.optional(v.array(v.id("users"))),
    targetDepartments: v.optional(v.array(v.string())),
    isPrivate: v.optional(v.boolean()),
    downloads: v.number(),
    storageId: v.optional(v.id("_storage")),
    format: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
  }).index("by_category", ["category"]).index("by_pinned", ["pinned"]),

  documentTracking: defineTable({
    documentId: v.id("documents"),
    userId: v.id("users"),
    firstViewedAt: v.string(),
    lastViewedAt: v.string(),
    viewCount: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_user", ["userId"])
    .index("by_document_user", ["documentId", "userId"]),

  categories: defineTable({
    name: v.string(),
    code: v.string(), // Unique identifier/slug
    type: v.optional(v.string()), // e.g., "document", "event"
    description: v.optional(v.string()),
  }).index("by_name", ["name"]).index("by_code", ["code"]),

  offices: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
  }).index("by_name", ["name"]),

  mustReads: defineTable({
    title: v.string(),
    subtitle: v.optional(v.string()),
    date: v.string(),
  }),

  events: defineTable({
    title: v.string(),
    dateRange: v.string(),
    location: v.string(),
  }),

  trainings: defineTable({
    title: v.string(),
    dateRange: v.string(),
    status: v.string(),
  }),

  downloadableForms: defineTable({
    title: v.string(),
    downloads: v.number(),
    storageId: v.optional(v.id("_storage")),
    format: v.optional(v.string()),
  }),

  slides: defineTable({
    title: v.string(),
    subtitle: v.string(),
    version: v.string(),
    caption: v.string(),
    order: v.number(),
    storageId: v.optional(v.id("_storage")),
    format: v.optional(v.string()),
  }).index("by_order", ["order"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    department: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    status: v.union(v.literal("active"), v.literal("inactive")),
    lastLogin: v.string(),
    password: v.optional(v.string()),
  }).index("by_email", ["email"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("urgent")
    ),
    read: v.boolean(),
    createdAt: v.string(),
    userId: v.optional(v.id("users")), // Targeted notification (optional)
  }).index("by_read", ["read"]),

  auditLogs: defineTable({
    action: v.string(), // e.g. "create_document", "delete_user"
    details: v.string(), // Description of the action
    userId: v.id("users"), // Who performed the action
    createdAt: v.string(),
  }).index("by_date", ["createdAt"]),
})
