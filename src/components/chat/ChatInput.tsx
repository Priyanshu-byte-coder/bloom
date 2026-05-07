'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type ChatInputProps = {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t bg-white">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Share what's on your mind... (Enter to send, Shift+Enter for new line)"
        className="min-h-[44px] max-h-32 resize-none"
        disabled={disabled}
        maxLength={2000}
      />
      <Button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="bg-green-600 hover:bg-green-700 flex-shrink-0 h-11"
      >
        Send
      </Button>
    </div>
  )
}
