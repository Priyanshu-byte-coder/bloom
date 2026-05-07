import { CRISIS_KEYWORDS } from './crisis-keywords'
import type { CrisisAssessment, CrisisSeverity } from '@/types/safety'

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

function matchKeywords(text: string, keywords: string[]): string[] {
  const normalized = normalize(text)
  return keywords.filter((kw) => normalized.includes(normalize(kw)))
}

export function detectCrisis(userMessage: string): CrisisAssessment {
  const criticalMatches = matchKeywords(userMessage, CRISIS_KEYWORDS.critical)
  if (criticalMatches.length > 0) {
    return {
      severity: 'critical',
      detectedKeywords: criticalMatches,
      requiresImmediateResponse: true,
      shouldSuggestExercise: false,
    }
  }

  const highMatches = matchKeywords(userMessage, CRISIS_KEYWORDS.high)
  if (highMatches.length > 0) {
    return {
      severity: 'high',
      detectedKeywords: highMatches,
      requiresImmediateResponse: false,
      shouldSuggestExercise: false,
    }
  }

  const mediumMatches = matchKeywords(userMessage, CRISIS_KEYWORDS.medium)
  if (mediumMatches.length > 0) {
    return {
      severity: 'medium',
      detectedKeywords: mediumMatches,
      requiresImmediateResponse: false,
      shouldSuggestExercise: true,
    }
  }

  return {
    severity: 'none',
    detectedKeywords: [],
    requiresImmediateResponse: false,
    shouldSuggestExercise: false,
  }
}

// Fast LLM-based classifier using llama3-8b (runs in parallel with main call for high/critical)
export async function classifyWithLLM(
  userMessage: string,
  groqApiKey: string
): Promise<CrisisSeverity> {
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
              'You are a mental health crisis severity classifier. Analyze the message and return ONLY valid JSON with no markdown. Return: {"severity": "none|low|medium|high|critical"}',
          },
          {
            role: 'user',
            content: `Classify the mental health crisis severity of this message: "${userMessage.slice(0, 500)}"`,
          },
        ],
        max_tokens: 50,
        temperature: 0,
      }),
    })

    if (!response.ok) return 'none'

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content.trim())
    const valid: CrisisSeverity[] = ['none', 'low', 'medium', 'high', 'critical']
    return valid.includes(parsed.severity) ? parsed.severity : 'none'
  } catch {
    return 'none'
  }
}
