import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user!.id)
    .single()

  const { data: recentJournal } = await supabase
    .from('journal_entries')
    .select('id, title, content, mood_score, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: recentSessions } = await supabase
    .from('chat_sessions')
    .select('id, title, created_at, session_type')
    .order('updated_at', { ascending: false })
    .limit(3)

  const name = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Good to see you, {name} 🌸</h1>
        <p className="text-muted-foreground mt-1">How are you feeling today?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/chat">
          <Button className="w-full h-16 text-base bg-green-600 hover:bg-green-700 gap-2">
            💬 New Chat
          </Button>
        </Link>
        <Link href="/dashboard/journal/new">
          <Button variant="outline" className="w-full h-16 text-base gap-2">
            📓 New Journal Entry
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Journal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJournal?.length ? (
              recentJournal.map((entry) => (
                <Link key={entry.id} href={`/dashboard/journal/${entry.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {entry.title ?? entry.content.slice(0, 40)}
                      </span>
                      {entry.mood_score && (
                        <span className="text-xs text-muted-foreground ml-2">{entry.mood_score}/10</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No journal entries yet. Start writing!</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSessions?.length ? (
              recentSessions.map((session) => (
                <Link key={session.id} href={`/dashboard/chat/${session.id}`}>
                  <div className="p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{session.session_type === 'crisis' ? '🆘' : '💬'}</span>
                      <span className="text-sm font-medium truncate">
                        {session.title ?? 'Conversation'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No chats yet. Say hello to Bloom!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
