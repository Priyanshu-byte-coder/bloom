'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Profile } from '@/types/database'

export function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [crisisEmail, setCrisisEmail] = useState(profile?.crisis_contact_email ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName, crisis_contact_email: crisisEmail }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? All your data will be permanently deleted. This cannot be undone.'
    )
    if (!confirmed) return
    await fetch('/api/user', { method: 'DELETE' })
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Safety</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Crisis Contact Email (optional)</label>
            <p className="text-xs text-muted-foreground mb-2">
              If crisis content is detected, Bloom may send a safety resource email to this address.
            </p>
            <Input
              type="email"
              value={crisisEmail}
              onChange={(e) => setCrisisEmail(e.target.value)}
              placeholder="trusted-person@email.com"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
      </Button>

      <Separator />

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-base text-red-700">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your account permanently removes all your journal entries, chat history, and profile data.
          </p>
          <Button
            variant="outline"
            onClick={handleDeleteAccount}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
