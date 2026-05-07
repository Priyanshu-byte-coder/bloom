import { NextResponse } from 'next/server'
import { embedText, chunkText } from '@/lib/ai/embeddings'
import { createServiceClient } from '@/lib/supabase/service'

// Internal route — only callable with service role key header
export async function POST(request: Request) {
  const authHeader = request.headers.get('x-service-key')
  if (authHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { text, user_id, source_type, source_id, metadata } = await request.json()

  if (!text || !user_id || !source_type || !source_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const chunks = chunkText(text)

  if (chunks.length === 0) {
    return NextResponse.json({ embedded: 0 })
  }

  const embeddings: Array<{
    user_id: string
    source_type: string
    source_id: string
    content_chunk: string
    embedding: number[]
    metadata: Record<string, unknown>
  }> = []

  for (const chunk of chunks) {
    const vector = await embedText(chunk)
    embeddings.push({
      user_id,
      source_type,
      source_id,
      content_chunk: chunk,
      embedding: vector,
      metadata: metadata ?? {},
    })
  }

  const { error } = await supabase.from('embeddings').insert(embeddings)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ embedded: embeddings.length })
}
