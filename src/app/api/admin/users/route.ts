import { NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const admin = await checkAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createServiceClient()

  // Get all profiles
  const { data: profiles } = await db
    .from('profiles')
    .select('id, email, display_name, avatar_url, created_at, onboarding_completed')
    .order('created_at', { ascending: false })

  if (!profiles) return NextResponse.json({ users: [] })

  // Get per-user counts in parallel
  const userIds = profiles.map((p) => p.id)

  const [
    { data: msgCounts },
    { data: journalCounts },
    { data: crisisCounts },
    { data: exerciseCounts },
    { data: lastActive },
  ] = await Promise.all([
    db.from('chat_messages').select('user_id').eq('role', 'user').in('user_id', userIds),
    db.from('journal_entries').select('user_id').is('deleted_at', null).in('user_id', userIds),
    db.from('crisis_events').select('user_id').in('user_id', userIds),
    db.from('user_exercise_log').select('user_id').eq('completed', true).in('user_id', userIds),
    db.from('chat_messages')
      .select('user_id, created_at')
      .eq('role', 'user')
      .in('user_id', userIds)
      .order('created_at', { ascending: false }),
  ])

  // Aggregate counts by user
  function countByUser(rows: Array<{ user_id: string }> | null) {
    const m: Record<string, number> = {}
    for (const r of rows ?? []) m[r.user_id] = (m[r.user_id] ?? 0) + 1
    return m
  }

  const msgMap = countByUser(msgCounts)
  const journalMap = countByUser(journalCounts)
  const crisisMap = countByUser(crisisCounts)
  const exerciseMap = countByUser(exerciseCounts)

  // Last active = most recent message per user
  const lastActiveMap: Record<string, string> = {}
  for (const r of lastActive ?? []) {
    if (!lastActiveMap[r.user_id]) lastActiveMap[r.user_id] = r.created_at
  }

  const users = profiles.map((p) => ({
    id: p.id,
    email: p.email,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    joined_at: p.created_at,
    onboarding_completed: p.onboarding_completed,
    messages: msgMap[p.id] ?? 0,
    journals: journalMap[p.id] ?? 0,
    crisis_events: crisisMap[p.id] ?? 0,
    exercises_completed: exerciseMap[p.id] ?? 0,
    last_active: lastActiveMap[p.id] ?? null,
  }))

  return NextResponse.json({ users })
}
