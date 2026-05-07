import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MentalExercise } from '@/types/database'

const CATEGORY_LABELS: Record<string, string> = {
  breathing: '🫁 Breathing',
  grounding: '🌱 Grounding',
  cognitive_reframe: '🧠 Cognitive Reframing',
  body_scan: '🧘 Body Scan',
  journaling_prompt: '✍️ Journaling',
  distraction: '🎯 Distraction',
}

export default async function ExercisesPage() {
  const supabase = await createClient()

  const { data: exercises } = await supabase
    .from('mental_exercises')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  const grouped = (exercises ?? []).reduce<Record<string, MentalExercise[]>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = []
    acc[ex.category].push(ex)
    return acc
  }, {})

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
        <p className="text-muted-foreground mt-1">
          Coping techniques and guided exercises for different situations.
          These are also available in chat — just ask Bloom for help.
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([category, exs]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{CATEGORY_LABELS[category] ?? category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exs.map((ex) => (
                <Card key={ex.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{ex.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{ex.difficulty}</Badge>
                      {ex.duration_minutes && (
                        <span className="text-xs text-muted-foreground">{ex.duration_minutes} min</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{ex.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Best for distress level {ex.min_distress_level}–{ex.max_distress_level}/10
                    </p>
                    {ex.tags?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {ex.tags.map((tag: string) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
