export type Profile = {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  crisis_contact_email: string | null
  timezone: string
  onboarding_completed: boolean
  data_consent: boolean
  created_at: string
  updated_at: string
}

export type JournalEntry = {
  id: string
  user_id: string
  title: string | null
  content: string
  mood_score: number | null
  tags: string[]
  deleted_at: string | null
  embedding_status: 'pending' | 'processing' | 'done' | 'failed'
  created_at: string
  updated_at: string
}

export type ChatSession = {
  id: string
  user_id: string
  title: string | null
  session_type: 'general' | 'crisis' | 'exercise'
  crisis_flag: boolean
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  crisis_detected: boolean
  crisis_keywords: string[]
  embedding_status: 'pending' | 'processing' | 'done' | 'failed' | 'skip'
  token_count: number | null
  created_at: string
}

export type MentalExercise = {
  id: string
  title: string
  category: 'breathing' | 'grounding' | 'cognitive_reframe' | 'body_scan' | 'journaling_prompt' | 'distraction'
  difficulty: 'easy' | 'medium' | 'hard'
  duration_minutes: number | null
  description: string
  steps: ExerciseStep[]
  min_distress_level: number
  max_distress_level: number
  tags: string[]
  is_active: boolean
  created_at: string
}

export type ExerciseStep = {
  step: number
  instruction: string
  duration_seconds: number
  display_type: 'text' | 'timer'
  animation?: 'expand' | 'contract' | 'hold'
}

export type UserExerciseLog = {
  id: string
  user_id: string
  exercise_id: string
  session_id: string | null
  distress_before: number | null
  distress_after: number | null
  completed: boolean
  feedback: string | null
  created_at: string
}

export type EmbeddingChunk = {
  id: string
  source_type: 'journal' | 'chat_message'
  source_id: string
  content_chunk: string
  similarity: number
  metadata: Record<string, unknown>
}
