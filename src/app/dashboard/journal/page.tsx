import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function JournalListPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
        <Link href="/dashboard/journal/new">
          <Button className="bg-green-600 hover:bg-green-700">+ New Entry</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {entries?.length ? (
          entries.map((entry) => (
            <Link key={entry.id} href={`/dashboard/journal/${entry.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {entry.title ?? entry.content.slice(0, 60)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {entry.content.slice(0, 120)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                        {entry.tags?.length > 0 && entry.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    {entry.mood_score && (
                      <div className="flex-shrink-0 text-center">
                        <div className="text-2xl">{getMoodEmoji(entry.mood_score)}</div>
                        <div className="text-xs text-muted-foreground">{entry.mood_score}/10</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">📓</p>
            <p>No journal entries yet. Start writing!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getMoodEmoji(score: number): string {
  if (score <= 2) return '😔'
  if (score <= 4) return '😕'
  if (score <= 6) return '😐'
  if (score <= 8) return '🙂'
  return '😊'
}
