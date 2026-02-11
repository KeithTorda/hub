import { AdminHeader } from "@/components/admin-header"
import { AdminStats } from "@/components/admin-stats"
import { AuditLogWidget } from "@/components/admin/audit-log-widget"
import { AdminQuickActions } from "@/components/admin-quick-actions"
import { AdminTopDownloads } from "@/components/admin-top-downloads"

export default function AdminDashboardPage() {
  return (
    <>
      <AdminHeader title="Dashboard Overview" />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <AdminStats />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2">
            <AuditLogWidget />
          </div>
          <div className="space-y-6">
            <AdminQuickActions />
          </div>
        </div>

        <div className="mt-6">
          <AdminTopDownloads />
        </div>
      </main>
    </>
  )
}
