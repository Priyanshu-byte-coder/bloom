import { CrisisAlert } from './CrisisAlert'

type MessageBubbleProps = {
  role: 'user' | 'assistant'
  content: string
  crisisDetected?: boolean
  isStreaming?: boolean
}

export function MessageBubble({ role, content, crisisDetected, isStreaming }: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-base">
          🌸
        </div>
        <div className="max-w-[75%]">
          <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
            {content}
            {isStreaming && (
              <span className="inline-block w-1 h-4 bg-green-500 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      </div>
      {crisisDetected && <CrisisAlert />}
    </div>
  )
}
