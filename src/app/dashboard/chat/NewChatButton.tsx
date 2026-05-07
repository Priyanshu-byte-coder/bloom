'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function NewChatButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function createSession() {
    setLoading(true)
    const res = await fetch('/api/chat/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const { session } = await res.json()
    router.push(`/dashboard/chat/${session.id}`)
  }

  return (
    <Button onClick={createSession} disabled={loading} className="bg-green-600 hover:bg-green-700">
      {loading ? 'Starting...' : '+ New Chat'}
    </Button>
  )
}
