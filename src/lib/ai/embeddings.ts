// Server-side only: Transformers.js embedding generation
// Uses all-MiniLM-L6-v2 (384 dimensions) — no API cost

let pipeline: ((texts: string[], options?: Record<string, unknown>) => Promise<{ data: Float32Array[] }>) | null = null

async function getEmbeddingPipeline() {
  if (!pipeline) {
    // Dynamic import to avoid client-side bundling
    const { pipeline: createPipeline, env } = await import('@xenova/transformers')

    // Cache models in /tmp on Vercel
    env.cacheDir = process.env.TRANSFORMERS_CACHE ?? '/tmp/transformers-cache'
    env.allowLocalModels = false

    pipeline = createPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2') as unknown as (texts: string[], options?: Record<string, unknown>) => Promise<{ data: Float32Array[] }>
  }
  return pipeline
}

export async function embedText(text: string): Promise<number[]> {
  const embed = await getEmbeddingPipeline()
  const output = await embed([text], { pooling: 'mean', normalize: true })
  // output.data is a flat Float32Array for 1 input — convert to number[]
  const raw = output.data
  if (raw instanceof Float32Array) return Array.from(raw)
  // If it's Float32Array[] (multi-input), take the first
  return Array.from((raw as Float32Array[])[0])
}

// Chunk text into overlapping windows for better RAG recall
export function chunkText(text: string, maxTokens = 300, overlapTokens = 50): string[] {
  // Rough approximation: 1 token ≈ 4 chars
  const chunkSize = maxTokens * 4
  const overlap = overlapTokens * 4
  const minChunkSize = 20 * 4 // discard chunks shorter than 20 tokens

  if (text.length <= chunkSize) {
    return text.length >= minChunkSize ? [text.trim()] : []
  }

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end).trim()
    if (chunk.length >= minChunkSize) {
      chunks.push(chunk)
    }
    start += chunkSize - overlap
  }

  return chunks
}
