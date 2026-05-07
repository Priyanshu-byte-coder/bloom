import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { JournalEntryView } from './JournalEntryView'

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>
}) {
  const { entryId } = await params
  const supabase = await createClient()

  const { data: entry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .is('deleted_at', null)
    .single()

  if (!entry) notFound()

  return <JournalEntryView entry={entry} />
}
