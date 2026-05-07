import type { ChatMessage } from '@/types/database'
import type { CrisisSeverity } from '@/types/safety'
import type Groq from 'groq-sdk'

const IDENTITY_PROMPT = `You are Bloom, a warm mental health companion having a real conversation. You are not a therapist — you're a compassionate friend who listens deeply.

RULES:
- Reply in 2-3 SHORT sentences only. Be conversational, not clinical.
- Never say "you should see a therapist" or "consult a professional" — just listen and respond with warmth.
- Never diagnose. Never mention medications.
- Validate first, always. Lead with empathy before anything else.
- If off-topic (code, math, politics): gently say you're here to talk about feelings and emotions only.
- Do NOT use bullet points, numbered lists, or headers in responses. Plain conversational text only.
- If the user expresses suicidal intent or self-harm: provide crisis resources (988, text HOME to 741741, 911).`

const CRISIS_INJECTION_HIGH = `
CRITICAL: User may be in distress. Respond with deep empathy in 2-3 sentences. Share crisis resources: 988 (call/text), text HOME to 741741. Stay warm.`

const CRISIS_INJECTION_MEDIUM = `
NOTE: User seems distressed. Respond with empathy. Keep it brief and human.`

export function buildSystemMessages(
  ragContext: string,
  recentMessages: ChatMessage[],
  crisisSeverity: CrisisSeverity
): Groq.Chat.ChatCompletionMessageParam[] {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = []

  // Layer 1: Identity
  let systemContent = IDENTITY_PROMPT

  // Layer 3: Crisis injection (injected into system prompt)
  if (crisisSeverity === 'high' || crisisSeverity === 'critical') {
    systemContent += CRISIS_INJECTION_HIGH
  } else if (crisisSeverity === 'medium') {
    systemContent += CRISIS_INJECTION_MEDIUM
  }

  messages.push({ role: 'system', content: systemContent })

  // Layer 2: RAG context
  if (ragContext) {
    messages.push({ role: 'system', content: ragContext })
  }

  // Layer 4: Conversation history (last 10 messages)
  const history = recentMessages.slice(-10)
  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.content })
    }
  }

  return messages
}
