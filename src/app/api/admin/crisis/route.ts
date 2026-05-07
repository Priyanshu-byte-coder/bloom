import { NextResponse } from 'next/server'
import { checkAdminApi } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const admin = await checkAdminApi()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const severity = searchParams.get('severity')
  const limit = parseInt(searchParams.get('limit') ?? '100', 10)

  const db = createServiceClient()
  let query = db
    .from('crisis_events')
    .select('*, profiles(email, display_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (severity) query = query.eq('severity', severity)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ events: data ?? [] })
}
