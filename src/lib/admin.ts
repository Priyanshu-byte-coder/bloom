import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase())
}

/**
 * Call at top of any admin server component.
 * - Not logged in → redirect to /auth/login
 * - Logged in but not admin → redirect to /admin/denied
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  if (!isAdminEmail(user.email ?? '')) redirect('/access-denied')

  return user
}

/** For API routes — returns null (caller should return 403) if not admin. */
export async function checkAdminApi() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email ?? '')) return null
  return { user }
}
