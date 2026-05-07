import { NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const admin = await checkAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createServiceClient()
  const now = new Date()
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString()
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString()

  const [
    { count: totalUsers },
    { count: totalMessages },
    { count: messages7d },
    { count: totalJournals },
    { count: journals7d },
    { count: totalCrisis },
    { count: crisis7d },
    { count: exercisesCompleted },
    { data: crisisBySeverity },
    { data: dailyMessages },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('chat_messages').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    db.from('chat_messages').select('*', { count: 'exact', head: true }).eq('role', 'user').gte('created_at', d7),
    db.from('journal_entries').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    db.from('journal_entries').select('*', { count: 'exact', head: true }).is('deleted_at', null).gte('created_at', d7),
    db.from('crisis_events').select('*', { count: 'exact', head: true }),
    db.from('crisis_events').select('*', { count: 'exact', head: true }).gte('created_at', d7),
    db.from('user_exercise_log').select('*', { count: 'exact', head: true }).eq('completed', true),
    db.from('crisis_events').select('severity').gte('created_at', d30),
    db.from('chat_messages')
      .select('created_at')
      .eq('role', 'user')
      .gte('created_at', d30)
      .order('created_at', { ascending: true }),
  ])

  // Aggregate crisis by severity
  const severityCount: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const row of (crisisBySeverity ?? [])) {
    severityCount[row.severity] = (severityCount[row.severity] ?? 0) + 1
  }

  // Aggregate messages per day (last 30 days)
  const msgByDay: Record<string, number> = {}
  for (const row of (dailyMessages ?? [])) {
    const day = row.created_at.slice(0, 10)
    msgByDay[day] = (msgByDay[day] ?? 0) + 1
  }
  const last30days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() - (29 - i) * 86400000)
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: msgByDay[key] ?? 0 }
  })

  return NextResponse.json({
    totals: {
      users: totalUsers ?? 0,
      messages: totalMessages ?? 0,
      messages7d: messages7d ?? 0,
      journals: totalJournals ?? 0,
      journals7d: journals7d ?? 0,
      crisisEvents: totalCrisis ?? 0,
      crisisEvents7d: crisis7d ?? 0,
      exercisesCompleted: exercisesCompleted ?? 0,
    },
    crisisBySeverity: severityCount,
    dailyMessages: last30days,
  })
}
