'use client'

import { useState, useCallback } from 'react'
import type { MentalExercise } from '@/types/database'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  crisisDetected?: boolean
  isStreaming?: boolean
  exerciseOffer?: {
    exercise: MentalExercise
    accepted: boolean | null  // null = pending, true = accepted, false = skipped
  }
}

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  function setInitialMessages(msgs: Message[]) {
    setMessages(msgs)
  }

  function acceptExercise(messageId: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.exerciseOffer
          ? { ...m, exerciseOffer: { ...m.exerciseOffer, accepted: true } }
          : m
      )
    )
  }

  function skipExercise(messageId: string) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.exerciseOffer
          ? { ...m, exerciseOffer: { ...m.exerciseOffer, accepted: false } }
          : m
      )
    )
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

      // JSON response: crisis, scope redirect, or exercise offer
      if (contentType.includes('application/json')) {
        const data = await response.json()

        if (data.type === 'exercise_offer') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: data.message.content,
                    isStreaming: false,
                    exerciseOffer: { exercise: data.exercise, accepted: null },
                  }
                : m
            )
          )
          return
        }

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

  return { messages, isLoading, sendMessage, setInitialMessages, acceptExercise, skipExercise }
}
