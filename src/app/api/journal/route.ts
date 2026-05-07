import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getJournalLimiter } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data, total: count, page, limit })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limiter = getJournalLimiter()
  const { success } = await limiter.limit(user.id)
  if (!success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const body = await request.json()
  const { title, content, mood_score, tags } = body

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  // Sanitize: strip HTML, truncate
  const safeContent = content.replace(/<[^>]*>/g, '').slice(0, 10000)
  const safeTitle = title ? String(title).replace(/<[^>]*>/g, '').slice(0, 200) : null
  const safeMood = typeof mood_score === 'number' ? Math.max(1, Math.min(10, Math.round(mood_score))) : null
  const safeTags = Array.isArray(tags) ? tags.slice(0, 10).map((t: unknown) => String(t).slice(0, 50)) : []

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      title: safeTitle,
      content: safeContent,
      mood_score: safeMood,
      tags: safeTags,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Trigger embedding in background
  triggerEmbedding(data.id, user.id, safeContent, {
    source_date: data.created_at,
    mood_score: safeMood,
  })

  return NextResponse.json({ entry: data }, { status: 201 })
}

async function triggerEmbedding(
  sourceId: string,
  userId: string,
  text: string,
  metadata: Record<string, unknown>
) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      body: JSON.stringify({
        text,
        user_id: userId,
        source_type: 'journal',
        source_id: sourceId,
        metadata,
      }),
    })
  } catch {
    // Non-critical — embedding failure doesn't break journal save
  }
}
