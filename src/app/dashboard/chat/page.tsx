import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NewChatButton } from './NewChatButton'

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <NewChatButton />
      </div>

      <div className="space-y-3">
        {sessions?.length ? (
          sessions.map((session) => (
            <Link key={session.id} href={`/dashboard/chat/${session.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 px-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{session.session_type === 'crisis' ? '🆘' : '💬'}</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.title ?? 'Conversation'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {session.crisis_flag && (
                    <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                      Crisis
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">🌸</p>
            <p>No conversations yet. Start a new chat!</p>
          </div>
        )}
      </div>
    </div>
  )
}
