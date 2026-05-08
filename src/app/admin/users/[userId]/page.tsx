import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MiniBarChart } from '@/components/admin/MiniBarChart'

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-600 text-white',
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  await requireAdmin()
  const { userId } = await params
  const db = createServiceClient()

  const d30 = new Date(Date.now() - 30 * 86400000).toISOString()

  const [
    { data: profile },
    { data: sessions },
    { data: messages },
    { data: journals },
    { data: crisisEvents },
    { data: exerciseLogs },
  ] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).single(),
    db.from('chat_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    db.from('chat_messages').select('id, role, content, crisis_detected, created_at').eq('user_id', userId).eq('role', 'user').gte('created_at', d30).order('created_at', { ascending: true }),
    db.from('journal_entries').select('*').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false }).limit(10),
    db.from('crisis_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('user_exercise_log')
      .select('*, mental_exercises(title, category)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  if (!profile) notFound()

  // Messages per day chart
  const msgByDay: Record<string, number> = {}
  for (const m of messages ?? []) {
    const day = (m.created_at as string).slice(0, 10)
    msgByDay[day] = (msgByDay[day] ?? 0) + 1
  }
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: msgByDay[key] ?? 0 }
  })

  // Mood trend from journals
  const moodTrend = [...(journals ?? [])]
    .filter((j) => j.mood_score !== null)
    .reverse()
    .slice(-14)

  const avgMood = moodTrend.length
    ? (moodTrend.reduce((s, j) => s + (j.mood_score ?? 0), 0) / moodTrend.length).toFixed(1)
    : null

  const MOOD_EMOJIS = ['', '😭', '😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩']

  return (
    <div className="max-w-4xl space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-sm text-gray-500 hover:text-gray-700">← Users</Link>
        <div className="flex items-center gap-3">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} className="w-12 h-12 rounded-full" alt="" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl">👤</div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile.display_name ?? 'No name'}</h1>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Messages (30d)', value: messages?.length ?? 0, icon: '💬' },
          { label: 'Journal Entries', value: journals?.length ?? 0, icon: '📓' },
          { label: 'Crisis Events', value: crisisEvents?.length ?? 0, icon: '🚨', red: true },
          { label: 'Avg Mood', value: avgMood ? `${avgMood}/10` : '—', icon: '😊' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 bg-white ${s.red && (s.value as number) > 0 ? 'border-red-100' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${s.red && (s.value as number) > 0 ? 'text-red-600' : 'text-gray-900'}`}>{s.value}</p>
              </div>
              <span className="text-xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <MiniBarChart data={chartData} label="Messages per day (30 days)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent journal entries */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Journal Entries</h2>
          <div className="space-y-3">
            {journals?.length ? journals.slice(0, 6).map((j) => (
              <Link
                key={j.id}
                href={`/admin/users/${userId}/journals/${j.id}`}
                className="block border-b border-gray-50 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-800 font-medium truncate">{j.title ?? j.content.slice(0, 40)}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {j.mood_score && <span className="text-base">{MOOD_EMOJIS[j.mood_score]}</span>}
                    <span className="text-xs text-gray-400">→</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(j.created_at).toLocaleDateString()}</p>
              </Link>
            )) : <p className="text-sm text-gray-400">No journal entries.</p>}
          </div>
        </div>

        {/* Crisis events */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Crisis Events</h2>
          <div className="space-y-3">
            {crisisEvents?.length ? crisisEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-2 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${SEVERITY_COLORS[ev.severity]}`}>
                  {ev.severity}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-600 truncate">{ev.user_message_excerpt}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(ev.created_at).toLocaleString()}</p>
                  {ev.detected_keywords?.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {ev.detected_keywords.slice(0, 4).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )) : <p className="text-sm text-gray-400">No crisis events.</p>}
          </div>
        </div>
      </div>

      {/* Chat sessions */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Chat Sessions</h2>
        <div className="divide-y divide-gray-50">
          {sessions?.length ? sessions.map((s) => (
            <Link
              key={s.id}
              href={`/admin/users/${userId}/sessions/${s.id}`}
              className="flex items-center justify-between py-2.5 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{s.session_type === 'crisis' ? '🆘' : '💬'}</span>
                <p className="text-sm text-gray-800">{s.title ?? 'Conversation'}</p>
                {s.crisis_flag && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">crisis</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p>
                <span className="text-xs text-gray-400">→</span>
              </div>
            </Link>
          )) : <p className="text-sm text-gray-400">No sessions.</p>}
        </div>
      </div>

      {/* Exercise log */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Exercise Log</h2>
        <div className="divide-y divide-gray-50">
          {exerciseLogs?.length ? exerciseLogs.map((log) => {
            const ex = log.mental_exercises as { title?: string; category?: string } | null
            return (
              <div key={log.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-gray-800">{ex?.title ?? 'Unknown exercise'}</p>
                  <p className="text-xs text-gray-400 capitalize">{ex?.category}</p>
                </div>
                <div className="text-right">
                  {log.distress_before !== null && log.distress_after !== null && (
                    <p className="text-xs text-gray-600">
                      {log.distress_before} → {log.distress_after}
                      <span className={`ml-1 ${log.distress_after < log.distress_before ? 'text-green-600' : 'text-red-500'}`}>
                        {log.distress_after < log.distress_before ? '↓' : '↑'}
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )
          }) : <p className="text-sm text-gray-400">No exercise logs.</p>}
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Account Details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['User ID', profile.id],
            ['Email', profile.email],
            ['Timezone', profile.timezone],
            ['Onboarding', profile.onboarding_completed ? 'Complete' : 'Incomplete'],
            ['Data Consent', profile.data_consent ? 'Yes' : 'No'],
            ['Joined', new Date(profile.created_at).toLocaleString()],
            ['Crisis Contact', profile.crisis_contact_email ?? '—'],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-gray-400 text-xs">{k}</dt>
              <dd className="text-gray-800 font-medium mt-0.5 break-all">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
