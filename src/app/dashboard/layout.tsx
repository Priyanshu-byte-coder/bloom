import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="flex h-[100dvh] bg-transparent">
      <Sidebar />
      {/* pt-16: offset mobile top header; pb-20: offset mobile bottom nav */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0 pb-20 md:pb-0 relative z-10">
        {children}
      </main>
    </div>
  )
}
