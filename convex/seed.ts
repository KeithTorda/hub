import { mutation } from "./_generated/server"

export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if already seeded
        const existing = await ctx.db.query("announcements").first()
        if (existing) {
            throw new Error("Database already seeded! Clear tables first if you want to re-seed.")
        }

        // ── Announcements ─────────────────────────────────────────
        await ctx.db.insert("announcements", {
            title: "System Maintenance Scheduled",
            content: "The portal will undergo scheduled maintenance on February 15, 2026 from 10PM to 2AM.",
            category: "urgent",
            createdAt: "2026-02-10",
            author: "IT Department",
            pinned: true,
        })
        await ctx.db.insert("announcements", {
            title: "New Employee Onboarding Guidelines Released",
            content: "Updated onboarding procedures are now available. All department heads must review.",
            category: "general",
            createdAt: "2026-02-08",
            author: "HR Department",
            pinned: false,
        })
        await ctx.db.insert("announcements", {
            title: "Q1 2026 Budget Allocation Approved",
            content: "The quarterly budget allocation has been approved by management. Details attached.",
            category: "memo",
            createdAt: "2026-02-05",
            author: "Finance Department",
            pinned: false,
        })
        await ctx.db.insert("announcements", {
            title: "Office Renovation Schedule",
            content: "Building A 3rd floor will be under renovation starting March 1, 2026. Temporary workspace assignments will be emailed.",
            category: "general",
            createdAt: "2026-02-03",
            author: "Admin Services",
            pinned: false,
        })
        await ctx.db.insert("announcements", {
            title: "Updated Leave Policy Effective March 2026",
            content: "A revised leave policy document has been circulated. Please check your email for the full memorandum.",
            category: "memo",
            createdAt: "2026-02-01",
            author: "HR Department",
            pinned: false,
        })

        // ── Documents ─────────────────────────────────────────────
        await ctx.db.insert("documents", {
            title: "2026-0011",
            referenceNo: "2026-0011",
            description: "Revised Implementing Guidelines for the Medical Assistance to Indigent and Financially Incapacitated Patients (MAIFIP) Program",
            category: "doh-advisory",
            date: "2026-02-01",
            downloads: 1240,
        })
        await ctx.db.insert("documents", {
            title: "2026-0009",
            referenceNo: "2026-0009",
            description: "Implementing Rules and Regulations of RA No. 12063 for Hospital Upgrading in Regional Medical Centers",
            category: "doh-advisory",
            date: "2026-01-28",
            downloads: 890,
        })
        await ctx.db.insert("documents", {
            title: "DM-2026-0045",
            referenceNo: "DM-2026-0045",
            description: "Guidelines on the Conduct of Year-End Performance Review for All Employees",
            category: "doh-dm",
            date: "2026-01-25",
            downloads: 2100,
        })
        await ctx.db.insert("documents", {
            title: "DM-2026-0038",
            referenceNo: "DM-2026-0038",
            description: "Updated Protocol for Document Routing and Approval Process",
            category: "doh-dm",
            date: "2026-01-20",
            downloads: 1560,
        })
        await ctx.db.insert("documents", {
            title: "DC-2026-0012",
            referenceNo: "DC-2026-0012",
            description: "Revised Schedule of Fees and Charges for Administrative Services",
            category: "doh-dc",
            date: "2026-01-15",
            downloads: 780,
        })
        await ctx.db.insert("documents", {
            title: "MC-2026-0003",
            referenceNo: "MC-2026-0003",
            description: "Compliance Requirements for the Updated Data Privacy Act Implementation",
            category: "hospital-memo",
            date: "2026-01-10",
            downloads: 650,
        })

        // ── Must Reads ────────────────────────────────────────────
        await ctx.db.insert("mustReads", { title: "Workplace Guidelines: a Handbook", date: "2026-02-01" })
        await ctx.db.insert("mustReads", { title: "Advisory No. 2 - 6th NHSM", subtitle: "nhsm, ADVISORY", date: "2026-01-28" })
        await ctx.db.insert("mustReads", { title: "Advisory No. 1 - 6th NHSM", subtitle: "nhsm, ADVISORY", date: "2026-01-25" })
        await ctx.db.insert("mustReads", { title: "Dissemination of Results of the Health Promotion and Literacy Study", date: "2026-01-20" })
        await ctx.db.insert("mustReads", { title: "Advisory No. 1: 6th National Health Sector Meeting", date: "2026-01-15" })
        await ctx.db.insert("mustReads", { title: "Advisory No. 2: Cybersecurity Training and Digital Hygiene", date: "2026-01-10" })

        // ── Events ────────────────────────────────────────────────
        await ctx.db.insert("events", { title: "1st Semester 2026 Capacity Building for the Digital Workforce", dateRange: "Jan 01 - Jun 30, 2026", location: "N/A" })
        await ctx.db.insert("events", { title: "Training Programs for CY 2026 - Management Consultancy", dateRange: "Jan 01 - Dec 31, 2026", location: "N/A" })
        await ctx.db.insert("events", { title: "Massive Open Online Courses for ICT", dateRange: "Feb 15, 2026", location: "Online" })

        // ── Trainings ─────────────────────────────────────────────
        await ctx.db.insert("trainings", { title: "1st Semester 2026 Capacity Building for the Digital Workforce of DICT", dateRange: "Jan 01 - Jun 30, 2026", status: "N/A" })
        await ctx.db.insert("trainings", { title: "Training Programs for CY 2026 of the Cole Hopkins Management Consultancy", dateRange: "Jan 01 - Dec 31, 2026", status: "N/A" })
        await ctx.db.insert("trainings", { title: "Massive Open Online Courses for ICT", dateRange: "Mar 01, 2026", status: "Open" })

        // ── Downloadable Forms ────────────────────────────────────
        await ctx.db.insert("downloadableForms", { title: "ICT account request form", downloads: 5240 })
        await ctx.db.insert("downloadableForms", { title: "Application for Leave", downloads: 3202 })
        await ctx.db.insert("downloadableForms", { title: "Clearance Form", downloads: 3179 })
        await ctx.db.insert("downloadableForms", { title: "Routing Slip for Financial Transaction Processing", downloads: 3140 })
        await ctx.db.insert("downloadableForms", { title: "Document Control Request Form", downloads: 2720 })

        // ── Slides ────────────────────────────────────────────────
        await ctx.db.insert("slides", { title: "WORKPLACE HANDBOOK", subtitle: "On Safety Management and Prevention", version: "VERSION 2 | As of February 2026", caption: "Workplace Guidelines: a Handbook v2", order: 1 })
        await ctx.db.insert("slides", { title: "EMPLOYEE WELLNESS", subtitle: "Annual Health and Wellness Program", version: "Guidelines for CY 2026", caption: "Employee Wellness Program Guide", order: 2 })
        await ctx.db.insert("slides", { title: "DIGITAL TRANSFORMATION", subtitle: "Modernization of Internal Systems", version: "Phase 2 | Q1 2026", caption: "Digital Transformation Roadmap", order: 3 })

        // ── Users ─────────────────────────────────────────────────
        await ctx.db.insert("users", { name: "Bernadeth Olivas", email: "b.olivas@portal.org", department: "Administration", role: "admin", lastLogin: "2026-02-11", status: "active" })
        await ctx.db.insert("users", { name: "Marcus Chen", email: "m.chen@portal.org", department: "IT Department", role: "admin", lastLogin: "2026-02-10", status: "active" })
        await ctx.db.insert("users", { name: "Sofia Ramirez", email: "s.ramirez@portal.org", department: "HR Department", role: "user", lastLogin: "2026-02-09", status: "active" })
        await ctx.db.insert("users", { name: "David Park", email: "d.park@portal.org", department: "Finance", role: "user", lastLogin: "2026-02-08", status: "active" })
        await ctx.db.insert("users", { name: "Aisha Johnson", email: "a.johnson@portal.org", department: "Legal", role: "user", lastLogin: "2026-01-28", status: "inactive" })
        await ctx.db.insert("users", { name: "Carlos Mendez", email: "c.mendez@portal.org", department: "Operations", role: "user", lastLogin: "2026-02-07", status: "active" })
        await ctx.db.insert("users", { name: "Lina Tran", email: "l.tran@portal.org", department: "IT Department", role: "user", lastLogin: "2026-02-06", status: "active" })
        await ctx.db.insert("users", { name: "Robert Williams", email: "r.williams@portal.org", department: "Procurement", role: "user", lastLogin: "2026-01-15", status: "inactive" })

        return "✅ Database seeded successfully with all initial data!"
    },
})

export const seedRefData = mutation({
    args: {},
    handler: async (ctx) => {
        const existingCategories = await ctx.db.query("categories").first()
        if (!existingCategories) {
            await ctx.db.insert("categories", { name: "Department Memorandum", code: "doh-dm", type: "document" })
            await ctx.db.insert("categories", { name: "Department Circular", code: "doh-dc", type: "document" })
            await ctx.db.insert("categories", { name: "Advisory", code: "doh-advisory", type: "document" })
            await ctx.db.insert("categories", { name: "Hospital Memorandum", code: "hospital-memo", type: "document" })
            await ctx.db.insert("categories", { name: "Hospital Order", code: "hospital-hfo", type: "document" })
            await ctx.db.insert("categories", { name: "Administrative Order", code: "administrative-order", type: "legacy" })
        }

        const existingOffices = await ctx.db.query("offices").first()
        if (!existingOffices) {
            await ctx.db.insert("offices", { name: "Office of the Director", code: "OOD" })
            await ctx.db.insert("offices", { name: "Administrative Division", code: "ADMIN" })
            await ctx.db.insert("offices", { name: "Finance Division", code: "FIN" })
            await ctx.db.insert("offices", { name: "Legal Unit", code: "LEGAL" })
            await ctx.db.insert("offices", { name: "IT Section", code: "IT" })
        }

        return "✅ Reference data (Categories/Offices) seeded!"
    }
})

export const clearRefData = mutation({
    args: {},
    handler: async (ctx) => {
        const categories = await ctx.db.query("categories").collect()
        for (const cat of categories) {
            await ctx.db.delete(cat._id)
        }

        const offices = await ctx.db.query("offices").collect()
        for (const office of offices) {
            await ctx.db.delete(office._id)
        }

        return "✅ Reference data (Categories/Offices) CLEARED!"
    }
})
