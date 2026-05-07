import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const distressLevel = parseInt(searchParams.get('distress_level') ?? '5', 10)
  const category = searchParams.get('category')

  let query = supabase
    .from('mental_exercises')
    .select('*')
    .eq('is_active', true)
    .lte('min_distress_level', distressLevel)
    .gte('max_distress_level', distressLevel)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query.order('difficulty', { ascending: true }).limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ exercises: data })
}
