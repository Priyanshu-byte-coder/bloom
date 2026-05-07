'use client'

import { useEffect, useRef } from 'react'
import { useChat, type Message } from '@/hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { ScrollArea } from '@/components/ui/scroll-area'

type ChatContainerProps = {
  sessionId: string
  initialMessages?: Message[]
}

export function ChatContainer({ sessionId, initialMessages = [] }: ChatContainerProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    setInitialMessages,
    acceptExercise,
    skipExercise,
  } = useChat(sessionId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialMessages.length > 0) setInitialMessages(initialMessages)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const displayMessages = messages.length > 0 ? messages : initialMessages

  function handleExerciseDone(messageId: string, distressAfter: number) {
    acceptExercise(messageId)
    // Send a follow-up after exercise completion
    setTimeout(() => {
      sendMessage(`I just finished the exercise. Feeling ${distressAfter <= 4 ? 'still a bit rough' : distressAfter <= 7 ? 'a little better' : 'much better'} now (${distressAfter}/10).`)
    }, 800)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ScrollArea className="flex-1 p-4">
        {displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="text-5xl mb-4">🌸</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Hi, I&apos;m Bloom</h2>
            <p className="text-gray-600 max-w-sm text-sm">
              I&apos;m here to listen. Share whatever&apos;s on your mind — no judgment here.
            </p>
          </div>
        )}

        {displayMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            sessionId={sessionId}
            onAcceptExercise={acceptExercise}
            onSkipExercise={skipExercise}
            onExerciseDone={handleExerciseDone}
          />
        ))}

        {isLoading && !messages.some((m) => m.isStreaming) && <TypingIndicator />}
        <div ref={bottomRef} />
      </ScrollArea>

      <div className="bg-white border-t">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}
