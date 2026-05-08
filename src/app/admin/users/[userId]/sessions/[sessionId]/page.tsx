import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-600 text-white',
}

export default async function AdminSessionPage({
  params,
}: {
  params: Promise<{ userId: string; sessionId: string }>
}) {
  await requireAdmin()
  const { userId, sessionId } = await params
  const db = createServiceClient()

  const [{ data: session }, { data: messages }, { data: profile }] = await Promise.all([
    db.from('chat_sessions').select('*').eq('id', sessionId).eq('user_id', userId).single(),
    db
      .from('chat_messages')
      .select('id, role, content, crisis_detected, crisis_keywords, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true }),
    db.from('profiles').select('display_name, email').eq('id', userId).single(),
  ])

  if (!session) notFound()

  const visible = messages?.filter((m) => m.role !== 'system') ?? []

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href={`/admin/users/${userId}`}
          className="text-sm text-gray-500 hover:text-gray-700 mt-1"
        >
          ← {profile?.display_name ?? profile?.email ?? 'User'}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{session.title ?? 'Conversation'}</h1>
            {session.crisis_flag && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                🚨 crisis
              </span>
            )}
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
              {session.session_type}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(session.created_at).toLocaleString()} · {visible.length} messages
          </p>
        </div>
      </div>

      {/* Message thread */}
      <div className="space-y-3">
        {visible.length ? (
          visible.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <p
                    className={`text-xs ${
                      msg.role === 'user' ? 'text-green-200' : 'text-gray-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                  {msg.crisis_detected && (
                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                      crisis detected
                    </span>
                  )}
                </div>
                {msg.crisis_detected && msg.crisis_keywords?.length > 0 && (
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-green-200' : 'text-red-500'
                    }`}
                  >
                    Keywords: {msg.crisis_keywords.slice(0, 5).join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-12">No messages in this session.</p>
        )}
      </div>
    </div>
  )
}
