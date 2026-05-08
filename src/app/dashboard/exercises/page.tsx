import { createClient } from '@/lib/supabase/server'
import { ExercisesClient } from '@/components/exercise/ExercisesClient'
import type { MentalExercise } from '@/types/database'

export default async function ExercisesPage() {
  const supabase = await createClient()

  const { data: exercises } = await supabase
    .from('mental_exercises')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tap any exercise to start it. Also available in chat — just ask Bloom.
        </p>
      </div>

      <ExercisesClient exercises={(exercises ?? []) as MentalExercise[]} />
    </div>
  )
}
