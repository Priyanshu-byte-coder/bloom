'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MOOD_EMOJIS = ['', '😭', '😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩']

export default function NewJournalPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [moodScore, setMoodScore] = useState<number | null>(null)
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!content.trim()) {
      setError('Please write something before saving.')
      return
    }
    setSaving(true)
    setError('')

    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)

    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || null, content, mood_score: moodScore, tags: tagList }),
    })

    if (res.ok) {
      router.push('/dashboard/journal')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save entry.')
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Journal Entry</h1>
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />

          <Textarea
            placeholder="What's on your mind? This is a safe space to be honest..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-y"
            maxLength={10000}
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">How are you feeling? (1 = very low, 10 = great)</p>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                <button
                  key={score}
                  onClick={() => setMoodScore(score === moodScore ? null : score)}
                  className={`w-10 h-10 rounded-lg text-lg transition-all ${
                    moodScore === score
                      ? 'bg-green-100 ring-2 ring-green-500 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {MOOD_EMOJIS[score]}
                </button>
              ))}
            </div>
            {moodScore && (
              <p className="text-sm text-muted-foreground mt-1">{moodScore}/10</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Tags (comma-separated, optional)</p>
            <Input
              placeholder="e.g. anxiety, work, relationships"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {saving ? 'Saving...' : 'Save Entry'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
