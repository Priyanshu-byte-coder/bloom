import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import type { Message } from '@/hooks/useChat'

export default async function ChatSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) notFound()

  const { data: messagesData } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(50)

  const initialMessages: Message[] = (messagesData ?? [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      crisisDetected: m.crisis_detected,
    }))

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b px-6 py-4 bg-white">
        <h1 className="font-semibold text-gray-900">{session.title ?? 'Conversation'}</h1>
        {session.crisis_flag && (
          <p className="text-xs text-red-600 mt-0.5">This session contained crisis content</p>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatContainer sessionId={sessionId} initialMessages={initialMessages} />
      </div>
    </div>
  )
}
