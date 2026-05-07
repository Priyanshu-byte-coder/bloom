import type { OutputFilterResult } from '@/types/safety'

const HARMFUL_PATTERNS = [
  /\b(take|use|consume)\s+\d+\s*(mg|ml|pills?|tablets?)/i,
  /how\s+to\s+(hang|shoot|overdose|cut\s+wrist|slit)/i,
  /you\s+(have|had)\s+no\s+reason\s+to\s+live/i,
  /better\s+off\s+(dead|without\s+you)/i,
  /you\s+should\s+(end|kill|harm)/i,
  /nobody\s+(cares|would\s+miss)\s+about\s+you/i,
  /you('re|\s+are)\s+worthless/i,
  /just\s+(do\s+it|end\s+it)/i,
]

const SAFE_FALLBACK =
  "I'm here with you. What you're going through sounds really difficult. I want to make sure you're safe — if you're in crisis, please reach out to the **988 Suicide & Crisis Lifeline** (call or text 988). Would you like to talk about what's been happening?"

export function filterOutput(content: string): OutputFilterResult {
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(content)) {
      return {
        safe: false,
        filteredContent: SAFE_FALLBACK,
        reason: `Matched harmful pattern: ${pattern.source}`,
      }
    }
  }

  return { safe: true, filteredContent: content }
}
