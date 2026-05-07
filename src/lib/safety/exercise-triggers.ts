import { EXERCISE_TRIGGER_KEYWORDS } from './crisis-keywords'

export function shouldSuggestExercise(userMessage: string): boolean {
  const lower = userMessage.toLowerCase()
  return EXERCISE_TRIGGER_KEYWORDS.some((kw) => lower.includes(kw))
}

export async function assessDistressLevel(
  userMessage: string,
  groqApiKey: string
): Promise<number> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content:
              'You are a distress level assessor. Return ONLY valid JSON: {"distress_level": <integer 1-10>} where 1=calm, 10=severe crisis.',
          },
          {
            role: 'user',
            content: `Assess the distress level of this message: "${userMessage.slice(0, 500)}"`,
          },
        ],
        max_tokens: 30,
        temperature: 0,
      }),
    })

    if (!response.ok) return 3

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content.trim())
    const level = parseInt(parsed.distress_level, 10)
    return isNaN(level) ? 3 : Math.max(1, Math.min(10, level))
  } catch {
    return 3
  }
}
