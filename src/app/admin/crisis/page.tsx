import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-600 text-white border-red-600',
}

export default async function AdminCrisisPage() {
  await requireAdmin()
  const db = createServiceClient()

  const { data: events } = await db
    .from('crisis_events')
    .select('*, profiles(id, email, display_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(200)

  // Counts by severity
  const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const ev of events ?? []) counts[ev.severity] = (counts[ev.severity] ?? 0) + 1

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crisis Events</h1>
        <p className="text-gray-500 text-sm mt-1">All detected crisis events. Audit log — never deleted.</p>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['critical', 'high', 'medium', 'low'].map((sev) => (
          <div key={sev} className={`rounded-xl border p-4 ${SEVERITY_COLORS[sev]} bg-opacity-30`}>
            <p className="text-xs font-medium uppercase tracking-wide opacity-70">{sev}</p>
            <p className="text-3xl font-bold mt-1">{counts[sev] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Events table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Severity</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Message excerpt</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Keywords</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Action taken</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events?.length ? events.map((ev) => {
              const profile = ev.profiles as { id?: string; email?: string; display_name?: string } | null
              return (
                <tr key={ev.id} className="hover:bg-gray-50 transition-colors align-top">
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${SEVERITY_COLORS[ev.severity]}`}>
                      {ev.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {profile?.id ? (
                      <Link href={`/admin/users/${profile.id}`} className="hover:underline text-green-700">
                        <p className="font-medium">{profile.display_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{profile.email}</p>
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-xs">Deleted user</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">
                      {ev.user_message_excerpt ?? '—'}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-[140px]">
                    <div className="flex flex-wrap gap-1">
                      {ev.detected_keywords?.slice(0, 3).map((kw: string) => (
                        <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-gray-500">{ev.response_action?.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400 whitespace-nowrap">
                    {new Date(ev.created_at).toLocaleString()}
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No crisis events recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
