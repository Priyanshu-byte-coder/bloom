import { NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const admin = await checkAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createServiceClient()

  const [
    { data: profile },
    { data: sessions },
    { data: messages },
    { data: journals },
    { data: crisisEvents },
    { data: exerciseLogs },
  ] = await Promise.all([
    db.from('profiles').select('*').eq('id', userId).single(),
    db.from('chat_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    db.from('chat_messages').select('id, role, content, crisis_detected, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    db.from('journal_entries').select('id, title, content, mood_score, created_at, tags').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false }).limit(20),
    db.from('crisis_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('user_exercise_log')
      .select('*, mental_exercises(title, category)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  // Mood trend from journals
  const moodTrend = (journals ?? [])
    .filter((j) => j.mood_score !== null)
    .map((j) => ({ date: j.created_at.slice(0, 10), mood: j.mood_score }))
    .reverse()

  // Message volume per day (last 30d)
  const d30 = new Date(Date.now() - 30 * 86400000).toISOString()
  const recentMsgs = (messages ?? []).filter((m) => m.role === 'user' && m.created_at >= d30)
  const msgByDay: Record<string, number> = {}
  for (const m of recentMsgs) {
    const day = m.created_at.slice(0, 10)
    msgByDay[day] = (msgByDay[day] ?? 0) + 1
  }

  return NextResponse.json({
    profile,
    sessions: sessions ?? [],
    recentMessages: messages ?? [],
    journals: journals ?? [],
    crisisEvents: crisisEvents ?? [],
    exerciseLogs: exerciseLogs ?? [],
    moodTrend,
    msgByDay,
  })
}
