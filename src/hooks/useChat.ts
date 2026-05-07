'use client'

import { useState, useCallback } from 'react'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  crisisDetected?: boolean
  isStreaming?: boolean
}

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  function setInitialMessages(msgs: Message[]) {
    setMessages(msgs)
  }

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    }

    const assistantId = `assistant-${Date.now()}`
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    try {
      const response = await fetch(`/api/chat/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const crisisSeverity = response.headers.get('X-Crisis-Severity')
      const crisisDetected = crisisSeverity === 'critical' || crisisSeverity === 'high'

      const contentType = response.headers.get('Content-Type') ?? ''

      // Non-streaming response (crisis/scope redirect)
      if (contentType.includes('application/json')) {
        const data = await response.json()
        const text = data.message?.content ?? 'Something went wrong.'
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: text, isStreaming: false, crisisDetected: data.crisis ?? false }
              : m
          )
        )
        return
      }

      // Streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated, crisisDetected } : m
          )
        )
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "I'm having trouble connecting right now. Please try again.", isStreaming: false }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  return { messages, isLoading, sendMessage, setInitialMessages }
}
