import Groq from 'groq-sdk'

export function getGroqClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY! })
}

export const PRIMARY_MODEL = 'llama-3.3-70b-versatile'
export const FAST_MODEL = 'llama3-8b-8192'

export async function streamChatCompletion(
  messages: Groq.Chat.ChatCompletionMessageParam[],
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void
): Promise<void> {
  const groq = getGroqClient()
  let fullText = ''

  try {
    const stream = await groq.chat.completions.create({
      model: PRIMARY_MODEL,
      messages,
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      if (text) {
        fullText += text
        onChunk(text)
      }
    }
  } catch (error: unknown) {
    // Fallback to smaller model on rate limit
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      (error as { status: number }).status === 429
    ) {
      const fallbackStream = await groq.chat.completions.create({
        model: FAST_MODEL,
        messages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      })

      for await (const chunk of fallbackStream) {
        const text = chunk.choices[0]?.delta?.content ?? ''
        if (text) {
          fullText += text
          onChunk(text)
        }
      }
    } else {
      throw error
    }
  }

  onComplete(fullText)
}
