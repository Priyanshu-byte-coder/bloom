import { embedText } from './embeddings'
import { createServiceClient } from '@/lib/supabase/service'
import type { EmbeddingChunk } from '@/types/database'

export async function retrieveContext(
  userMessage: string,
  userId: string,
  matchCount = 6,
  matchThreshold = 0.72
): Promise<EmbeddingChunk[]> {
  try {
    const queryEmbedding = await embedText(userMessage)
    const supabase = createServiceClient()

    const { data, error } = await supabase.rpc('match_user_embeddings', {
      query_embedding: queryEmbedding,
      match_user_id: userId,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error || !data) return []

    // Deduplicate by source_id (avoid repeating same journal entry twice)
    const seen = new Set<string>()
    return (data as EmbeddingChunk[]).filter((chunk) => {
      if (seen.has(chunk.source_id)) return false
      seen.add(chunk.source_id)
      return true
    })
  } catch {
    return []
  }
}

export function formatContextForPrompt(chunks: EmbeddingChunk[]): string {
  if (chunks.length === 0) return ''

  const lines = chunks.map((chunk) => {
    const meta = chunk.metadata as Record<string, unknown>
    const date = meta?.source_date
      ? new Date(meta.source_date as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'earlier'
    const sourceLabel = chunk.source_type === 'journal' ? 'journal entry' : 'conversation'
    return `[From ${sourceLabel} on ${date}]: ${chunk.content_chunk}`
  })

  return `RELEVANT CONTEXT FROM USER'S HISTORY:\n${lines.join('\n\n')}\n\nUse this context to personalize your response. Do not quote it verbatim.`
}
