import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AccessDeniedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4 max-w-sm px-6">
        <div className="text-4xl">🚫</div>
        <h1 className="text-xl font-bold text-gray-900">Admin access denied</h1>
        <p className="text-sm text-gray-600">
          Logged in as <strong>{user?.email}</strong>
        </p>
        <div className="bg-gray-100 rounded-lg p-3 text-left text-xs text-gray-600 space-y-1">
          <p>To fix: add your email to <code>.env.local</code></p>
          <code className="block bg-white rounded p-2 text-gray-800">
            ADMIN_EMAILS={user?.email}
          </code>
          <p>Then restart the dev server.</p>
        </div>
        <Link href="/dashboard" className="inline-block text-sm text-green-700 hover:underline">
          ← Back to app
        </Link>
      </div>
    </div>
  )
}
