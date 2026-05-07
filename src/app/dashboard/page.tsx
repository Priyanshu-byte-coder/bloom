import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, BookHeart, ArrowRight } from 'lucide-react'

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
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Good to see you, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{name}</span> 🌸
        </h1>
        <p className="text-lg text-slate-500 font-medium">How are you feeling today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/chat">
          <Button className="w-full h-20 text-lg rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] group">
            <MessageCircle className="w-6 h-6 group-hover:animate-bounce" />
            Start a New Chat
          </Button>
        </Link>
        <Link href="/dashboard/journal/new">
          <Button variant="outline" className="w-full h-20 text-lg rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-700 shadow-sm gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] group">
            <BookHeart className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
            New Journal Entry
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-50/50 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <BookHeart className="w-5 h-5 text-emerald-500" />
                Recent Journal
              </CardTitle>
              <Link href="/dashboard/journal" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {recentJournal?.length ? (
              recentJournal.map((entry) => (
                <Link key={entry.id} href={`/dashboard/journal/${entry.id}`}>
                  <div className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800 truncate pr-4 group-hover:text-emerald-700 transition-colors">
                        {entry.title ?? entry.content.slice(0, 40)}
                      </span>
                      {entry.mood_score && (
                        <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 text-xs font-bold text-emerald-600">
                          {entry.mood_score}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(entry.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <BookHeart className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">No journal entries yet</p>
                <p className="text-xs text-slate-400">Start writing to track your feelings.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-50/50 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                Recent Chats
              </CardTitle>
              <Link href="/dashboard/chat" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {recentSessions?.length ? (
              recentSessions.map((session) => (
                <Link key={session.id} href={`/dashboard/chat/${session.id}`}>
                  <div className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{session.session_type === 'crisis' ? '🆘' : '💬'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {session.title ?? 'Conversation'}
                      </p>
                      <p className="text-xs font-medium text-slate-400 mt-1">
                        {new Date(session.created_at).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">No chats yet</p>
                <p className="text-xs text-slate-400">Say hello to Bloom whenever you're ready.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
