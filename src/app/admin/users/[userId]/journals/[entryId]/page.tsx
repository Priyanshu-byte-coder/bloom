import { requireAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const MOOD_EMOJIS = ['', '😭', '😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩']
const MOOD_LABELS = [
  '',
  'Terrible',
  'Very Bad',
  'Bad',
  'Poor',
  'Neutral',
  'Okay',
  'Good',
  'Great',
  'Very Great',
  'Amazing',
]

export default async function AdminJournalEntryPage({
  params,
}: {
  params: Promise<{ userId: string; entryId: string }>
}) {
  await requireAdmin()
  const { userId, entryId } = await params
  const db = createServiceClient()

  const [{ data: entry }, { data: profile }] = await Promise.all([
    db
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single(),
    db.from('profiles').select('display_name, email').eq('id', userId).single(),
  ])

  if (!entry) notFound()

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href={`/admin/users/${userId}`}
          className="text-sm text-gray-500 hover:text-gray-700 mt-1"
        >
          ← {profile?.display_name ?? profile?.email ?? 'User'}
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">
            {entry.title ?? 'Untitled Entry'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(entry.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Mood + tags */}
      {(entry.mood_score !== null || (entry.tags?.length ?? 0) > 0) && (
        <div className="flex items-center gap-3 flex-wrap">
          {entry.mood_score !== null && (
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2">
              <span className="text-2xl">{MOOD_EMOJIS[entry.mood_score]}</span>
              <div>
                <p className="text-xs text-gray-400">Mood</p>
                <p className="text-sm font-semibold text-gray-800">
                  {MOOD_LABELS[entry.mood_score]} ({entry.mood_score}/10)
                </p>
              </div>
            </div>
          )}
          {entry.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </p>
      </div>

      {/* Metadata */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Details</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Entry ID', entry.id],
            ['Created', new Date(entry.created_at).toLocaleString()],
            ['Updated', new Date(entry.updated_at).toLocaleString()],
            ['Embedding', entry.embedding_status ?? '—'],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-xs text-gray-400">{k}</dt>
              <dd className="text-gray-800 font-medium mt-0.5 break-all text-xs">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
