import { CrisisAlert } from './CrisisAlert'
import { ExercisePlayer } from '@/components/exercise/ExercisePlayer'
import type { Message } from '@/hooks/useChat'

type MessageBubbleProps = {
  message: Message
  sessionId: string
  onAcceptExercise: (messageId: string) => void
  onSkipExercise: (messageId: string) => void
  onExerciseDone: (messageId: string, distressAfter: number) => void
}

export function MessageBubble({
  message,
  sessionId,
  onAcceptExercise,
  onSkipExercise,
  onExerciseDone,
}: MessageBubbleProps) {
  const { id, role, content, crisisDetected, isStreaming, exerciseOffer } = message

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[75%] bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col mb-3">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-sm mt-0.5">
          🌸
        </div>
        <div className="max-w-[75%] space-y-2">
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-900 leading-relaxed shadow-sm">
            {content}
            {isStreaming && (
              <span className="inline-block w-1 h-3.5 bg-green-500 ml-0.5 animate-pulse" />
            )}
          </div>

          {/* Exercise offer — shown below the message bubble */}
          {exerciseOffer && exerciseOffer.accepted === null && (
            <div className="max-w-sm">
              <ExercisePlayer
                exercise={exerciseOffer.exercise}
                sessionId={sessionId}
                onComplete={(distressAfter) => onExerciseDone(id, distressAfter)}
                onSkip={() => onSkipExercise(id)}
              />
            </div>
          )}

          {exerciseOffer?.accepted === false && (
            <p className="text-xs text-gray-500 px-1">Exercise skipped. I&apos;m still here if you want to talk.</p>
          )}

          {exerciseOffer?.accepted === true && (
            <p className="text-xs text-green-700 px-1 font-medium">Great job completing that exercise! 🌿</p>
          )}
        </div>
      </div>
      {crisisDetected && <div className="mt-2 ml-9"><CrisisAlert /></div>}
    </div>
  )
}
