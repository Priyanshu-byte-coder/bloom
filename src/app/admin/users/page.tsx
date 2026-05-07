import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function AdminUsersPage() {
  await requireAdmin()
  const db = createServiceClient()
  const d30 = new Date(Date.now() - 30 * 86400000).toISOString()

  const { data: profiles } = await db
    .from('profiles')
    .select('id, email, display_name, avatar_url, created_at, onboarding_completed')
    .order('created_at', { ascending: false })

  if (!profiles?.length) {
    return <div className="text-gray-500">No users yet.</div>
  }

  const userIds = profiles.map((p) => p.id)

  const [
    { data: msgCounts },
    { data: journalCounts },
    { data: crisisCounts },
    { data: exerciseCounts },
    { data: lastActiveRows },
  ] = await Promise.all([
    db.from('chat_messages').select('user_id').eq('role', 'user').in('user_id', userIds),
    db.from('journal_entries').select('user_id').is('deleted_at', null).in('user_id', userIds),
    db.from('crisis_events').select('user_id').in('user_id', userIds),
    db.from('user_exercise_log').select('user_id').eq('completed', true).in('user_id', userIds),
    db.from('chat_messages').select('user_id, created_at').eq('role', 'user').in('user_id', userIds).order('created_at', { ascending: false }),
  ])

  function countByUser(rows: Array<{ user_id: string }> | null) {
    const m: Record<string, number> = {}
    for (const r of rows ?? []) m[r.user_id] = (m[r.user_id] ?? 0) + 1
    return m
  }

  const msgMap = countByUser(msgCounts)
  const journalMap = countByUser(journalCounts)
  const crisisMap = countByUser(crisisCounts)
  const exerciseMap = countByUser(exerciseCounts)

  const lastActiveMap: Record<string, string> = {}
  for (const r of lastActiveRows ?? []) {
    if (!lastActiveMap[r.user_id]) lastActiveMap[r.user_id] = r.created_at
  }

  const users = profiles.map((p) => ({
    ...p,
    messages: msgMap[p.id] ?? 0,
    journals: journalMap[p.id] ?? 0,
    crisis_events: crisisMap[p.id] ?? 0,
    exercises: exerciseMap[p.id] ?? 0,
    last_active: lastActiveMap[p.id] ?? null,
  }))

  function relativeTime(iso: string | null) {
    if (!iso) return 'Never'
    const diff = Date.now() - new Date(iso).getTime()
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} total registered users</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Messages</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Journals</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Exercises</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Crisis</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Last Active</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 hover:underline">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm flex-shrink-0">👤</div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{u.display_name ?? '—'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 font-medium">{u.messages}</td>
                <td className="px-4 py-3 text-right text-gray-700">{u.journals}</td>
                <td className="px-4 py-3 text-right text-gray-700">{u.exercises}</td>
                <td className="px-4 py-3 text-right">
                  {u.crisis_events > 0 ? (
                    <span className="text-red-600 font-semibold">{u.crisis_events}</span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs">{relativeTime(u.last_active)}</td>
                <td className="px-4 py-3 text-right text-gray-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
