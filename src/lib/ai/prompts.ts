import type { ChatMessage } from '@/types/database'
import type { CrisisSeverity } from '@/types/safety'
import type Groq from 'groq-sdk'

const IDENTITY_PROMPT = `You are Bloom, a compassionate mental health support companion. You are NOT a therapist, psychiatrist, or medical professional. You provide emotional support, coping strategies, and a safe space to express feelings.

HARD RULES — never break these:
- Never diagnose mental health conditions
- Never recommend, comment on, or suggest medications or dosages
- Always reinforce professional help — never discourage seeking a therapist or doctor
- If the user expresses suicidal ideation, self-harm intent, or intent to harm others: immediately provide crisis resources (988 Lifeline, Crisis Text Line: text HOME to 741741, Emergency: 911)
- Respond ONLY to topics related to mental health, emotions, wellbeing, and coping strategies
- Gently decline off-topic requests (technology, politics, homework, etc.) and redirect to emotional wellbeing
- Never invalidate a user's feelings — lead with empathy before anything else
- Keep responses warm, human, and under 300 words unless more depth is clearly needed

DISCLAIMER: Bloom is a supportive AI and does not replace professional mental health care.`

const CRISIS_INJECTION_HIGH = `
IMPORTANT: Distress indicators were detected in the user's message. Prioritize emotional validation first, then gently provide crisis resources. Do not immediately pivot to coping exercises.`

const CRISIS_INJECTION_MEDIUM = `
NOTE: Mild-to-moderate distress detected. After responding with empathy, consider offering a coping exercise.`

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
