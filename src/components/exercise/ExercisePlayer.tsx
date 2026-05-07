'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import type { MentalExercise, ExerciseStep } from '@/types/database'

type ExercisePlayerProps = {
  exercise: MentalExercise
  sessionId: string
  onComplete: (distressAfter: number) => void
  onSkip: () => void
}

export function ExercisePlayer({ exercise, sessionId, onComplete, onSkip }: ExercisePlayerProps) {
  const [phase, setPhase] = useState<'intro' | 'running' | 'done'>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [distressAfter, setDistressAfter] = useState<number | null>(null)
  const [distressBefore] = useState(6) // default assumption

  const currentStep: ExerciseStep | undefined = exercise.steps[stepIndex]

  const advanceStep = useCallback(() => {
    if (stepIndex < exercise.steps.length - 1) {
      const next = exercise.steps[stepIndex + 1]
      setStepIndex((i) => i + 1)
      setSecondsLeft(next.duration_seconds)
    } else {
      setPhase('done')
    }
  }, [stepIndex, exercise.steps])

  // Timer countdown for timed steps
  useEffect(() => {
    if (phase !== 'running' || !currentStep) return
    if (currentStep.display_type === 'text') {
      // Auto-advance text steps after duration
      const t = setTimeout(() => advanceStep(), currentStep.duration_seconds * 1000)
      return () => clearTimeout(t)
    }
    // Timer step: countdown
    setSecondsLeft(currentStep.duration_seconds)
  }, [phase, stepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'running' || !currentStep || currentStep.display_type !== 'timer') return
    if (secondsLeft <= 0) {
      advanceStep()
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, phase, currentStep, advanceStep])

  function startExercise() {
    setPhase('running')
    setStepIndex(0)
    setSecondsLeft(exercise.steps[0]?.duration_seconds ?? 5)
  }

  async function handleComplete() {
    if (!distressAfter) return
    try {
      await fetch('/api/exercises/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exercise.id,
          session_id: sessionId,
          distress_before: distressBefore,
          distress_after: distressAfter,
          completed: true,
        }),
      })
    } catch { /* non-critical */ }
    onComplete(distressAfter)
  }

  // Breathing animation class
  const animationClass = currentStep?.animation === 'expand'
    ? 'scale-125'
    : currentStep?.animation === 'contract'
    ? 'scale-75'
    : 'scale-100'

  if (phase === 'done') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-4">
        <div className="text-center">
          <div className="text-3xl mb-2">✨</div>
          <p className="font-semibold text-green-800">Well done!</p>
          <p className="text-sm text-gray-600 mt-1">How are you feeling now?</p>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {[1,2,3,4,5,6,7,8,9,10].map((n) => (
            <button
              key={n}
              onClick={() => setDistressAfter(n)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                distressAfter === n
                  ? 'bg-green-600 text-white scale-110'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-gray-500">1 = still struggling, 10 = feeling much better</p>
        <Button
          onClick={handleComplete}
          disabled={!distressAfter}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Done
        </Button>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧘</span>
          <div>
            <p className="font-semibold text-green-900">{exercise.title}</p>
            <p className="text-xs text-gray-600">{exercise.duration_minutes ?? 3} min · {exercise.difficulty}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">{exercise.description}</p>
        <div className="flex gap-2">
          <Button onClick={startExercise} className="flex-1 bg-green-600 hover:bg-green-700 text-sm">
            Let&apos;s do it
          </Button>
          <Button onClick={onSkip} variant="outline" className="flex-1 text-sm">
            Skip
          </Button>
        </div>
      </div>
    )
  }

  // Running phase
  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          Step {stepIndex + 1} of {exercise.steps.length}
        </span>
        <div className="h-1.5 flex-1 mx-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / exercise.steps.length) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-gray-800 text-sm leading-relaxed text-center">{currentStep?.instruction}</p>

      {currentStep?.display_type === 'timer' && (
        <div className="flex justify-center">
          <div className={`w-24 h-24 rounded-full border-4 border-green-200 bg-green-50 flex items-center justify-center transition-transform duration-1000 ${animationClass}`}>
            <span className="text-2xl font-bold text-green-700">{secondsLeft}</span>
          </div>
        </div>
      )}

      {currentStep?.display_type === 'text' && (
        <div className="flex justify-center">
          <Button
            onClick={advanceStep}
            className="bg-green-600 hover:bg-green-700"
          >
            {stepIndex === exercise.steps.length - 1 ? 'Finish' : 'Next →'}
          </Button>
        </div>
      )}
    </div>
  )
}
