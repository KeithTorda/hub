export interface Announcement {
  id: string
  title: string
  content: string
  category: "urgent" | "general" | "memo" | "event"
  createdAt: string
  author: string
  pinned: boolean
}

export interface Document {
  id: string
  title: string
  category: "administrative-order" | "department-memo" | "department-circular" | "memo-circular"
  referenceNo: string
  description: string
  date: string
  downloads: number
}

export interface MustRead {
  id: string
  title: string
  subtitle?: string
  date: string
}

export interface EventItem {
  id: string
  title: string
  dateRange: string
  location: string
}

export interface Training {
  id: string
  title: string
  dateRange: string
  status: string
}

export interface DownloadableForm {
  id: string
  title: string
  downloads: number
}

export const announcements: Announcement[] = [
  {
    id: "1",
    title: "System Maintenance Scheduled",
    content: "The portal will undergo scheduled maintenance on February 15, 2026 from 10PM to 2AM.",
    category: "urgent",
    createdAt: "2026-02-10",
    author: "IT Department",
    pinned: true,
  },
  {
    id: "2",
    title: "New Employee Onboarding Guidelines Released",
    content: "Updated onboarding procedures are now available. All department heads must review.",
    category: "general",
    createdAt: "2026-02-08",
    author: "HR Department",
    pinned: false,
  },
  {
    id: "3",
    title: "Q1 2026 Budget Allocation Approved",
    content: "The quarterly budget allocation has been approved by management. Details attached.",
    category: "memo",
    createdAt: "2026-02-05",
    author: "Finance Department",
    pinned: false,
  },
]

export const documents: Document[] = [
  {
    id: "1",
    title: "2026-0011",
    category: "administrative-order",
    referenceNo: "2026-0011",
    description: "Revised Implementing Guidelines for the Medical Assistance to Indigent and Financially Incapacitated Patients (MAIFIP) Program",
    date: "2026-02-01",
    downloads: 1240,
  },
  {
    id: "2",
    title: "2026-0009",
    category: "administrative-order",
    referenceNo: "2026-0009",
    description: "Implementing Rules and Regulations of RA No. 12063 for Hospital Upgrading in Regional Medical Centers",
    date: "2026-01-28",
    downloads: 890,
  },
  {
    id: "3",
    title: "DM-2026-0045",
    category: "department-memo",
    referenceNo: "DM-2026-0045",
    description: "Guidelines on the Conduct of Year-End Performance Review for All Employees",
    date: "2026-01-25",
    downloads: 2100,
  },
  {
    id: "4",
    title: "DM-2026-0038",
    category: "department-memo",
    referenceNo: "DM-2026-0038",
    description: "Updated Protocol for Document Routing and Approval Process",
    date: "2026-01-20",
    downloads: 1560,
  },
  {
    id: "5",
    title: "DC-2026-0012",
    category: "department-circular",
    referenceNo: "DC-2026-0012",
    description: "Revised Schedule of Fees and Charges for Administrative Services",
    date: "2026-01-15",
    downloads: 780,
  },
  {
    id: "6",
    title: "MC-2026-0003",
    category: "memo-circular",
    referenceNo: "MC-2026-0003",
    description: "Compliance Requirements for the Updated Data Privacy Act Implementation",
    date: "2026-01-10",
    downloads: 650,
  },
]

export const mustReads: MustRead[] = [
  { id: "1", title: "Workplace Guidelines: a Handbook", date: "2026-02-01" },
  { id: "2", title: "Advisory No. 2 - 6th NHSM", subtitle: "nhsm, ADVISORY", date: "2026-01-28" },
  { id: "3", title: "Advisory No. 1 - 6th NHSM", subtitle: "nhsm, ADVISORY", date: "2026-01-25" },
  { id: "4", title: "Dissemination of Results of the Health Promotion and Literacy Study", date: "2026-01-20" },
  { id: "5", title: "Advisory No. 1: 6th National Health Sector Meeting", date: "2026-01-15" },
  { id: "6", title: "Advisory No. 2: Cybersecurity Training and Digital Hygiene", date: "2026-01-10" },
]

export const events: EventItem[] = [
  { id: "1", title: "1st Semester 2026 Capacity Building for the Digital Workforce", dateRange: "Jan 01 - Jun 30, 2026", location: "N/A" },
  { id: "2", title: "Training Programs for CY 2026 - Management Consultancy", dateRange: "Jan 01 - Dec 31, 2026", location: "N/A" },
  { id: "3", title: "Massive Open Online Courses for ICT", dateRange: "Feb 15, 2026", location: "Online" },
]

export const trainings: Training[] = [
  { id: "1", title: "1st Semester 2026 Capacity Building for the Digital Workforce of DICT", dateRange: "Jan 01 - Jun 30, 2026", status: "N/A" },
  { id: "2", title: "Training Programs for CY 2026 of the Cole Hopkins Management Consultancy", dateRange: "Jan 01 - Dec 31, 2026", status: "N/A" },
  { id: "3", title: "Massive Open Online Courses for ICT", dateRange: "Mar 01, 2026", status: "Open" },
]

export const downloadableForms: DownloadableForm[] = [
  { id: "1", title: "ICT account request form", downloads: 5240 },
  { id: "2", title: "Application for Leave", downloads: 3202 },
  { id: "3", title: "Clearance Form", downloads: 3179 },
  { id: "4", title: "Routing Slip for Financial Transaction Processing", downloads: 3140 },
  { id: "5", title: "Document Control Request Form", downloads: 2720 },
]

export const documentCategories = [
  { key: "administrative-order" as const, label: "Administrative Order" },
  { key: "department-memo" as const, label: "Department Memorandum" },
  { key: "department-circular" as const, label: "Department Circular" },
  { key: "memo-circular" as const, label: "Memorandum Circular" },
]
