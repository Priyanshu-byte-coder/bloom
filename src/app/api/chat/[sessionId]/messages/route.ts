import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { detectCrisis, classifyWithLLM } from '@/lib/safety/crisis-detector'
import { CRISIS_RESPONSE_CRITICAL } from '@/lib/safety/crisis-keywords'
import { filterOutput } from '@/lib/safety/output-filter'
import { checkScope } from '@/lib/safety/scope-check'
import { shouldSuggestExercise, assessDistressLevel } from '@/lib/safety/exercise-triggers'
import { retrieveContext, formatContextForPrompt } from '@/lib/ai/rag'
import { buildSystemMessages } from '@/lib/ai/prompts'
import { getChatLimiter, getGlobalLimiter } from '@/lib/rate-limit'
import { getGroqClient, PRIMARY_MODEL, FAST_MODEL } from '@/lib/ai/groq'
import type { ChatMessage } from '@/types/database'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = 50
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const offset = (page - 1) * limit

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ messages: data })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limiting
  const chatLimiter = getChatLimiter()
  const globalLimiter = getGlobalLimiter()
  const [chatLimit, globalLimit] = await Promise.all([
    chatLimiter.limit(user.id),
    globalLimiter.limit(user.id),
  ])

  if (!chatLimit.success || !globalLimit.success) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait before sending another.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const body = await request.json()
  const rawContent = body.content

  if (!rawContent || typeof rawContent !== 'string') {
    return NextResponse.json({ error: 'Message content required' }, { status: 400 })
  }

  // Sanitize input
  const userMessage = rawContent.replace(/<[^>]*>/g, '').slice(0, 2000).trim()
  if (!userMessage) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })

  // STEP 1: Crisis detection (synchronous keyword check — runs BEFORE everything else)
  const crisisAssessment = detectCrisis(userMessage)

  // If CRITICAL: return hardcoded response immediately — no LLM call
  if (crisisAssessment.requiresImmediateResponse) {
    const serviceClient = createServiceClient()

    // Store user message
    const { data: userMsg } = await serviceClient
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'user',
        content: userMessage,
        crisis_detected: true,
        crisis_keywords: crisisAssessment.detectedKeywords,
        embedding_status: 'skip',
      })
      .select()
      .single()

    // Store crisis response
    await serviceClient.from('chat_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'assistant',
      content: CRISIS_RESPONSE_CRITICAL,
      embedding_status: 'skip',
    })

    // Update session type
    await serviceClient
      .from('chat_sessions')
      .update({ session_type: 'crisis', crisis_flag: true })
      .eq('id', sessionId)

    // Log crisis event
    await serviceClient.from('crisis_events').insert({
      user_id: user.id,
      session_id: sessionId,
      message_id: userMsg?.id ?? null,
      detected_keywords: crisisAssessment.detectedKeywords,
      severity: crisisAssessment.severity,
      user_message_excerpt: userMessage.slice(0, 200),
      response_action: 'hardcoded_critical_response',
    })

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: CRISIS_RESPONSE_CRITICAL,
        crisis_detected: true,
      },
      crisis: true,
    })
  }

  // STEP 2: Scope check
  const scopeResult = checkScope(userMessage)
  if (!scopeResult.inScope) {
    // Store both messages but skip LLM
    const serviceClient = createServiceClient()
    await serviceClient.from('chat_messages').insert([
      { session_id: sessionId, user_id: user.id, role: 'user', content: userMessage, embedding_status: 'skip' },
      { session_id: sessionId, user_id: user.id, role: 'assistant', content: scopeResult.redirectMessage!, embedding_status: 'skip' },
    ])

    return NextResponse.json({
      message: { role: 'assistant', content: scopeResult.redirectMessage },
    })
  }

  // STEP 3: Fetch recent messages + RAG context in parallel
  // RAG is raced with a 5s timeout — Vercel free tier has 10s limit;
  // on cold start, Transformers.js model download can take >10s without this guard
  const ragWithTimeout = Promise.race([
    retrieveContext(userMessage, user.id),
    new Promise<[]>((resolve) => setTimeout(() => resolve([]), 5000)),
  ])

  const [recentMsgsResult, ragChunks, llmSeverity] = await Promise.all([
    supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(10),
    ragWithTimeout,
    crisisAssessment.severity !== 'none'
      ? classifyWithLLM(userMessage, process.env.GROQ_API_KEY!)
      : Promise.resolve('none' as const),
  ])

  const recentMessages = (recentMsgsResult.data ?? []).reverse() as ChatMessage[]
  const ragContext = formatContextForPrompt(ragChunks)

  const severityOrder = ['none', 'low', 'medium', 'high', 'critical']
  const effectiveSeverity =
    severityOrder.indexOf(llmSeverity) > severityOrder.indexOf(crisisAssessment.severity)
      ? llmSeverity
      : crisisAssessment.severity

  // STEP 3.5: Exercise injection — blocking, replaces LLM call
  // Triggers on: explicit request OR medium/high distress
  // Cooldown: skip if last 5 messages already had an exercise offer
  const shouldOfferExercise =
    shouldSuggestExercise(userMessage) ||
    effectiveSeverity === 'medium' ||
    effectiveSeverity === 'high'

  if (shouldOfferExercise) {
    const recentExerciseOffer = recentMessages
      .slice(-5)
      .some((m) => m.role === 'assistant' && m.content.includes('quick exercise'))

    if (!recentExerciseOffer) {
      // Map distress severity to distress level for exercise selection
      const distressLevel = effectiveSeverity === 'high' ? 8 : effectiveSeverity === 'medium' ? 6 : 5

      const { data: exercises } = await supabase
        .from('mental_exercises')
        .select('*')
        .eq('is_active', true)
        .lte('min_distress_level', distressLevel)
        .gte('max_distress_level', distressLevel)
        .limit(10)

      if (exercises && exercises.length > 0) {
        // Pick a random exercise the user hasn't seen recently
        const recentExerciseIds = recentMessages
          .filter((m) => m.content.includes('exercise_offer'))
          .map((m) => m.content)
        const fresh = exercises.filter((ex) => !recentExerciseIds.includes(ex.id))
        const exercise = (fresh.length > 0 ? fresh : exercises)[Math.floor(Math.random() * (fresh.length > 0 ? fresh.length : exercises.length))]

        const offerMessage = `I notice things feel heavy right now. Want to try a quick ${exercise.duration_minutes ?? 3}-minute exercise that might help?`

        const serviceClient = createServiceClient()
        // Store user message + offer message
        const { data: userMsg } = await serviceClient
          .from('chat_messages')
          .insert({ session_id: sessionId, user_id: user.id, role: 'user', content: userMessage, embedding_status: 'pending' })
          .select().single()
        await serviceClient.from('chat_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'assistant',
          content: offerMessage,
          embedding_status: 'skip',
        })

        // Trigger embedding for user message
        if (userMsg?.id) {
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/embed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-service-key': process.env.SUPABASE_SERVICE_ROLE_KEY! },
            body: JSON.stringify({ text: userMessage, user_id: user.id, source_type: 'chat_message', source_id: userMsg.id, metadata: { source_date: new Date().toISOString() } }),
          }).catch(() => {})
        }

        return NextResponse.json({
          type: 'exercise_offer',
          message: { role: 'assistant', content: offerMessage },
          exercise,
        })
      }
    }
  }

  // STEP 4: Build prompt
  const messages = buildSystemMessages(ragContext, recentMessages, effectiveSeverity)
  messages.push({ role: 'user', content: userMessage })

  // STEP 5: Stream Groq response
  const groq = getGroqClient()
  let fullResponse = ''

  try {
    const stream = await groq.chat.completions.create({
      model: PRIMARY_MODEL,
      messages,
      stream: true,
      max_tokens: 200,
      temperature: 0.7,
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              fullResponse += text
              controller.enqueue(new TextEncoder().encode(text))
            }
          }
        } finally {
          controller.close()
          // STEP 6: Post-stream — store messages, filter output, log crisis
          afterStream(
            fullResponse,
            userMessage,
            sessionId,
            user.id,
            crisisAssessment.detectedKeywords,
            effectiveSeverity
          )
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Crisis-Severity': effectiveSeverity,
      },
    })
  } catch (error: unknown) {
    // Fallback to smaller model
    if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 429) {
      const fallbackStream = await groq.chat.completions.create({
        model: FAST_MODEL,
        messages,
        stream: true,
        max_tokens: 200,
        temperature: 0.7,
      })

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of fallbackStream) {
              const text = chunk.choices[0]?.delta?.content ?? ''
              if (text) {
                fullResponse += text
                controller.enqueue(new TextEncoder().encode(text))
              }
            }
          } finally {
            controller.close()
            afterStream(fullResponse, userMessage, sessionId, user.id, crisisAssessment.detectedKeywords, effectiveSeverity)
          }
        },
      })

      return new Response(readable, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 503 })
  }
}

async function afterStream(
  rawResponse: string,
  userMessage: string,
  sessionId: string,
  userId: string,
  detectedKeywords: string[],
  severity: string
) {
  const serviceClient = createServiceClient()

  // STEP 6a: Output filter
  const { filteredContent } = filterOutput(rawResponse)

  // STEP 6b: Store user message
  const { data: userMsg } = await serviceClient
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role: 'user',
      content: userMessage,
      crisis_detected: detectedKeywords.length > 0,
      crisis_keywords: detectedKeywords,
      embedding_status: 'pending',
    })
    .select()
    .single()

  // STEP 6c: Store assistant message
  await serviceClient.from('chat_messages').insert({
    session_id: sessionId,
    user_id: userId,
    role: 'assistant',
    content: filteredContent,
    embedding_status: 'skip',
  })

  // STEP 6d: Log crisis event if needed
  if (severity !== 'none' && detectedKeywords.length > 0) {
    await serviceClient.from('crisis_events').insert({
      user_id: userId,
      session_id: sessionId,
      message_id: userMsg?.id ?? null,
      detected_keywords: detectedKeywords,
      severity,
      user_message_excerpt: userMessage.slice(0, 200),
      response_action: 'llm_with_safety_prompt',
    })
  }

  // STEP 6e: Trigger embedding for user message (async, non-blocking)
  if (userMsg?.id) {
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      },
      body: JSON.stringify({
        text: userMessage,
        user_id: userId,
        source_type: 'chat_message',
        source_id: userMsg.id,
        metadata: { source_date: new Date().toISOString(), session_id: sessionId },
      }),
    }).catch(() => {})

    // Assess distress for exercise suggestion (async)
    if (shouldSuggestExercise(userMessage)) {
      // Exercise suggestion is handled client-side based on X-Crisis-Severity header
    }
  }
}
