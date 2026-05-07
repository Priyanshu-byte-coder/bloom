'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { JournalEntry } from '@/types/database'

const MOOD_EMOJIS = ['', '😭', '😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩']

export function JournalEntryView({ entry }: { entry: JournalEntry }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(entry.title ?? '')
  const [content, setContent] = useState(entry.content)
  const [moodScore, setMoodScore] = useState<number | null>(entry.mood_score)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/journal/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || null, content, mood_score: moodScore }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Delete this journal entry?')) return
    setDeleting(true)
    await fetch(`/api/journal/${entry.id}`, { method: 'DELETE' })
    router.push('/dashboard/journal')
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{moodScore ? MOOD_EMOJIS[moodScore] : '📓'}</span>
          <div>
            <p className="text-xs text-muted-foreground">
              {new Date(entry.created_at).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
            {moodScore && <p className="text-sm text-muted-foreground">Mood: {moodScore}/10</p>}
          </div>
        </div>

        {editing ? (
          <>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] resize-y"
            />
            <div>
              <p className="text-sm font-medium mb-2">Mood</p>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                  <button
                    key={score}
                    onClick={() => setMoodScore(score === moodScore ? null : score)}
                    className={`w-9 h-9 rounded-lg text-base transition-all ${
                      moodScore === score ? 'bg-green-100 ring-2 ring-green-500' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {MOOD_EMOJIS[score]}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {entry.title && <h1 className="text-2xl font-bold text-gray-900">{entry.title}</h1>}
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">{entry.content}</div>
            {entry.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {entry.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
