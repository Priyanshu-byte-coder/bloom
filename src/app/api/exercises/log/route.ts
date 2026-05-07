import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { exercise_id, session_id, distress_before, distress_after, completed, feedback } = body

  if (!exercise_id) return NextResponse.json({ error: 'exercise_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('user_exercise_log')
    .insert({
      user_id: user.id,
      exercise_id,
      session_id: session_id ?? null,
      distress_before: distress_before != null ? Math.max(1, Math.min(10, Math.round(Number(distress_before)))) : null,
      distress_after: distress_after != null ? Math.max(1, Math.min(10, Math.round(Number(distress_after)))) : null,
      completed: Boolean(completed),
      feedback: feedback ? String(feedback).slice(0, 500) : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ log: data }, { status: 201 })
}
