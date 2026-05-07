import type { ScopeCheckResult } from '@/types/safety'

const OFF_TOPIC_PATTERNS = [
  { pattern: /\b(code|coding|program|function|algorithm|debug|javascript|python|typescript|html|css|sql|api)\b/i, domain: 'coding/programming' },
  { pattern: /\b(diagnose|diagnosis|what\s+disorder|do\s+i\s+have|condition\s+name)\b/i, domain: 'medical diagnosis' },
  { pattern: /\b(legal\s+advice|lawsuit|attorney|lawyer|sue|contract\s+law)\b/i, domain: 'legal advice' },
  { pattern: /\b(invest|stock|crypto|bitcoin|financial\s+advice|portfolio)\b/i, domain: 'financial advice' },
  { pattern: /\b(politics|election|political\s+party|government\s+policy|vote)\b/i, domain: 'politics' },
  { pattern: /\b(recipe|how\s+to\s+cook|ingredients)\b/i, domain: 'cooking' },
  { pattern: /\b(homework|essay\s+for|write\s+my\s+essay|school\s+assignment)\b/i, domain: 'academic work' },
]

const REDIRECT_MESSAGE =
  "I'm Bloom, and I'm here specifically to support your mental health and emotional wellbeing. That topic is outside what I can help with. Is there something on your mind about how you're feeling or coping with life?"

export function checkScope(userMessage: string): ScopeCheckResult {
  for (const { pattern } of OFF_TOPIC_PATTERNS) {
    if (pattern.test(userMessage)) {
      return {
        inScope: false,
        redirectMessage: REDIRECT_MESSAGE,
      }
    }
  }

  return { inScope: true }
}
