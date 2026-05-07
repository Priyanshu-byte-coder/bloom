import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'
import { StatCard } from '@/components/admin/StatCard'
import { MiniBarChart } from '@/components/admin/MiniBarChart'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  await requireAdmin()
  const db = createServiceClient()

  const now = new Date()
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString()
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString()

  const [
    { count: totalUsers },
    { count: newUsers7d },
    { count: totalMessages },
    { count: messages7d },
    { count: totalJournals },
    { count: totalCrisis },
    { count: crisis7d },
    { count: exercisesCompleted },
    { data: crisisRows },
    { data: dailyMsgRows },
    { data: recentCrisis },
    { data: topUsers },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', d7),
    db.from('chat_messages').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    db.from('chat_messages').select('*', { count: 'exact', head: true }).eq('role', 'user').gte('created_at', d7),
    db.from('journal_entries').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    db.from('crisis_events').select('*', { count: 'exact', head: true }),
    db.from('crisis_events').select('*', { count: 'exact', head: true }).gte('created_at', d7),
    db.from('user_exercise_log').select('*', { count: 'exact', head: true }).eq('completed', true),
    db.from('crisis_events').select('severity').gte('created_at', d30),
    db.from('chat_messages').select('created_at').eq('role', 'user').gte('created_at', d30).order('created_at'),
    db.from('crisis_events')
      .select('*, profiles(email, display_name)')
      .order('created_at', { ascending: false })
      .limit(5),
    db.from('chat_messages')
      .select('user_id')
      .eq('role', 'user')
      .gte('created_at', d30),
  ])

  // Severity breakdown
  const severityCount: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const r of crisisRows ?? []) severityCount[r.severity] = (severityCount[r.severity] ?? 0) + 1

  // Daily messages chart
  const msgByDay: Record<string, number> = {}
  for (const r of dailyMsgRows ?? []) {
    const day = (r.created_at as string).slice(0, 10)
    msgByDay[day] = (msgByDay[day] ?? 0) + 1
  }
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() - (29 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: msgByDay[key] ?? 0 }
  })

  // Top 5 most active users (by message count last 30d)
  const userMsgCount: Record<string, number> = {}
  for (const r of topUsers ?? []) userMsgCount[r.user_id] = (userMsgCount[r.user_id] ?? 0) + 1
  const topUserIds = Object.entries(userMsgCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ id, count }))

  const { data: topProfiles } = await db
    .from('profiles')
    .select('id, email, display_name, avatar_url')
    .in('id', topUserIds.map((u) => u.id))

  const topUsersWithCount = topUserIds.map((u) => ({
    ...u,
    profile: topProfiles?.find((p) => p.id === u.id),
  }))

  const SEVERITY_COLORS: Record<string, string> = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-600 text-white',
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide analytics</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Total Users" value={totalUsers ?? 0} sub={`+${newUsers7d ?? 0} this week`} icon="👥" color="green" />
        <StatCard label="User Messages" value={totalMessages ?? 0} sub={`${messages7d ?? 0} this week`} icon="💬" />
        <StatCard label="Journal Entries" value={totalJournals ?? 0} icon="📓" />
        <StatCard label="Exercises Done" value={exercisesCompleted ?? 0} icon="🧘" color="green" />
        <StatCard label="Crisis Events (total)" value={totalCrisis ?? 0} sub={`${crisis7d ?? 0} this week`} icon="🚨" color="red" />
        <StatCard label="Critical" value={severityCount.critical} icon="🆘" color="red" />
        <StatCard label="High Severity" value={severityCount.high} icon="⚠️" color="yellow" />
        <StatCard label="Medium" value={severityCount.medium} icon="📋" />
      </div>

      {/* Activity chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <MiniBarChart data={chartData} label="Daily messages (last 30 days)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most active users */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Most Active Users (30d)</h2>
            <Link href="/admin/users" className="text-xs text-green-700 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {topUsersWithCount.map((u, i) => (
              <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 -mx-1 transition-colors">
                <span className="text-sm text-gray-400 w-4">{i + 1}</span>
                {u.profile?.avatar_url ? (
                  <img src={u.profile.avatar_url} className="w-7 h-7 rounded-full" alt="" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs">👤</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.profile?.display_name ?? u.profile?.email ?? u.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{u.profile?.email}</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">{u.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent crisis events */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Crisis Events</h2>
            <Link href="/admin/crisis" className="text-xs text-red-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentCrisis?.length ? recentCrisis.map((ev) => (
              <div key={ev.id} className="flex items-start gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${SEVERITY_COLORS[ev.severity]}`}>
                  {ev.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700 truncate">
                    {(ev.profiles as { email?: string } | null)?.email ?? 'Unknown user'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(ev.created_at).toLocaleString()}
                  </p>
                  {ev.detected_keywords?.length > 0 && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      Keywords: {ev.detected_keywords.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400">No crisis events yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
