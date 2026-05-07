import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profile: data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (body.display_name !== undefined) updates.display_name = String(body.display_name).slice(0, 100)
  if (body.crisis_contact_email !== undefined) {
    const email = String(body.crisis_contact_email).slice(0, 254)
    updates.crisis_contact_email = email || null
  }
  if (body.timezone !== undefined) updates.timezone = String(body.timezone).slice(0, 50)
  if (body.onboarding_completed !== undefined) updates.onboarding_completed = Boolean(body.onboarding_completed)
  if (body.data_consent !== undefined) updates.data_consent = Boolean(body.data_consent)

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profile: data })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceClient()

  // Delete user data (crisis_events retained by DB policy — set null on cascade)
  await serviceClient.from('profiles').delete().eq('id', user.id)

  // Delete auth user
  await serviceClient.auth.admin.deleteUser(user.id)

  return NextResponse.json({ success: true })
}
