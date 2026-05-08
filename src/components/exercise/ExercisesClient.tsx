'use client'

import { useState, useEffect, useCallback } from 'react'
import type { MentalExercise } from '@/types/database'
import { ExercisePlayer } from '@/components/exercise/ExercisePlayer'

const CATEGORY_META: Record<string, { label: string; iconBg: string; iconText: string }> = {
  breathing:         { label: '🫁 Breathing',          iconBg: 'bg-blue-100',   iconText: 'text-blue-700' },
  grounding:         { label: '🌱 Grounding',           iconBg: 'bg-green-100',  iconText: 'text-green-700' },
  cognitive_reframe: { label: '🧠 Cognitive Reframing', iconBg: 'bg-purple-100', iconText: 'text-purple-700' },
  body_scan:         { label: '🧘 Body Scan',           iconBg: 'bg-teal-100',   iconText: 'text-teal-700' },
  journaling_prompt: { label: '✍️ Journaling',          iconBg: 'bg-amber-100',  iconText: 'text-amber-700' },
  distraction:       { label: '🎯 Distraction',         iconBg: 'bg-rose-100',   iconText: 'text-rose-700' },
}

const DIFFICULTY_BADGE: Record<string, string> = {
  easy:   'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard:   'bg-red-100 text-red-700',
}

type SheetPhase = 'distress' | 'playing' | 'done'

export function ExercisesClient({ exercises }: { exercises: MentalExercise[] }) {
  const [selected, setSelected] = useState<MentalExercise | null>(null)
  const [sheetPhase, setSheetPhase] = useState<SheetPhase>('distress')
  const [distressBefore, setDistressBefore] = useState<number | null>(null)
  const [sheetVisible, setSheetVisible] = useState(false)

  const grouped = exercises.reduce<Record<string, MentalExercise[]>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = []
    acc[ex.category].push(ex)
    return acc
  }, {})

  function openSheet(ex: MentalExercise) {
    setSelected(ex)
    setSheetPhase('distress')
    setDistressBefore(null)
    // Tick needed so the element is mounted before the CSS transition fires
    requestAnimationFrame(() => setSheetVisible(true))
  }

  const closeSheet = useCallback(() => {
    setSheetVisible(false)
    setTimeout(() => setSelected(null), 300)
  }, [])

  // Scroll lock when sheet open
  useEffect(() => {
    if (sheetVisible) {
      document.body.classList.add('sheet-open')
    } else {
      document.body.classList.remove('sheet-open')
    }
    return () => document.body.classList.remove('sheet-open')
  }, [sheetVisible])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSheet() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeSheet])

  return (
    <>
      {/* Exercise library grid */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([category, exs]) => {
          const meta = CATEGORY_META[category]
          return (
            <div key={category}>
              <h2 className="text-base font-semibold text-gray-700 mb-3">{meta?.label ?? category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exs.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => openSheet(ex)}
                    className="text-left bg-white border border-gray-100 rounded-2xl p-4 hover:border-green-200 hover:shadow-md active:scale-[0.98] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${meta?.iconBg ?? 'bg-gray-100'} group-hover:scale-110 transition-transform`}>
                        {ex.category === 'breathing' ? '🫁' : ex.category === 'grounding' ? '🌱' : ex.category === 'cognitive_reframe' ? '🧠' : ex.category === 'body_scan' ? '🧘' : ex.category === 'journaling_prompt' ? '✍️' : '🎯'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">{ex.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 capitalize ${DIFFICULTY_BADGE[ex.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                            {ex.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ex.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {ex.duration_minutes && (
                            <span className="text-xs text-gray-400">⏱ {ex.duration_minutes} min</span>
                          )}
                          <span className="text-xs text-gray-400">Level {ex.min_distress_level}–{ex.max_distress_level}</span>
                          <span className="ml-auto text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Tap to start →</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom sheet */}
      {selected && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sheetVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeSheet}
          />

          {/* Sheet panel */}
          <div
            className={`relative bg-white rounded-t-3xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl transition-transform duration-300 ease-out will-change-transform ${sheetVisible ? 'translate-y-0' : 'translate-y-full'}`}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Close button */}
            <button
              onClick={closeSheet}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="px-5 pb-8 pt-2">
              {sheetPhase === 'distress' && (
                <DistressPicker
                  exercise={selected}
                  distressBefore={distressBefore}
                  onSelect={setDistressBefore}
                  onStart={() => {
                    if (distressBefore !== null) setSheetPhase('playing')
                  }}
                />
              )}

              {sheetPhase === 'playing' && (
                <ExercisePlayer
                  exercise={selected}
                  sessionId={null}
                  distressBefore={distressBefore ?? 6}
                  onComplete={() => setSheetPhase('done')}
                  onSkip={closeSheet}
                />
              )}

              {sheetPhase === 'done' && (
                <DoneView exercise={selected} onClose={closeSheet} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Sub-components ─────────────────────────────────────────────── */

function DistressPicker({
  exercise,
  distressBefore,
  onSelect,
  onStart,
}: {
  exercise: MentalExercise
  distressBefore: number | null
  onSelect: (n: number) => void
  onStart: () => void
}) {
  const meta = CATEGORY_META[exercise.category]
  return (
    <div className="space-y-5">
      {/* Exercise header */}
      <div className="flex items-start gap-3 pt-1">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${meta?.iconBg ?? 'bg-gray-100'}`}>
          {exercise.category === 'breathing' ? '🫁' : exercise.category === 'grounding' ? '🌱' : exercise.category === 'cognitive_reframe' ? '🧠' : exercise.category === 'body_scan' ? '🧘' : exercise.category === 'journaling_prompt' ? '✍️' : '🎯'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{exercise.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">
            {exercise.difficulty} · {exercise.duration_minutes ?? 3} min · {exercise.steps.length} steps
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{exercise.description}</p>

      {/* Distress picker */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">How are you feeling right now?</p>
        <p className="text-xs text-gray-400 mb-3">1 = very distressed, 10 = feeling great</p>
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <button
              key={n}
              onClick={() => onSelect(n)}
              className={`h-12 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                distressBefore === n
                  ? 'bg-green-600 text-white shadow-md shadow-green-200'
                  : n <= 3
                  ? 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'
                  : n <= 6
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-100'
                  : 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        disabled={distressBefore === null}
        className="w-full py-3.5 rounded-2xl bg-green-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all hover:bg-green-700"
      >
        {distressBefore === null ? 'Select how you feel to start' : "Let's begin →"}
      </button>
    </div>
  )
}

function DoneView({ exercise, onClose }: { exercise: MentalExercise; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 py-6">
      <div className="text-5xl">🌸</div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Great work!</h2>
        <p className="text-sm text-gray-500 mt-1">You completed <span className="font-medium text-gray-700">{exercise.title}</span></p>
      </div>
      <p className="text-sm text-gray-600 max-w-xs">
        Regular practice builds resilience. Come back whenever you need a moment of calm.
      </p>
      <button
        onClick={onClose}
        className="mt-2 w-full py-3.5 rounded-2xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 active:scale-[0.98] transition-all"
      >
        Done
      </button>
    </div>
  )
}
