import { requireAdmin } from '@/lib/admin'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* pt-[88px]: offset mobile fixed top bar (header ~44px + nav ~44px); md:pt-0: desktop has sidebar */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pt-[88px] md:pt-8">
        {children}
      </main>
    </div>
  )
}
