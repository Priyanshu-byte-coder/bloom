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
  const { messages, isLoading, sendMessage, setInitialMessages } = useChat(sessionId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialMessages.length > 0) {
      setInitialMessages(initialMessages)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const displayMessages = messages.length > 0 ? messages : initialMessages

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="text-5xl mb-4">🌸</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Hi, I'm Bloom</h2>
            <p className="text-muted-foreground max-w-sm">
              I'm here to listen, support, and help you explore your feelings.
              Share whatever's on your mind — there's no judgment here.
            </p>
          </div>
        )}

        {displayMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            crisisDetected={msg.crisisDetected}
            isStreaming={msg.isStreaming}
          />
        ))}

        {isLoading && !messages.some((m) => m.isStreaming) && <TypingIndicator />}
        <div ref={bottomRef} />
      </ScrollArea>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
