"use client"

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from '@/components/chat-message'
import { Message } from '@/types'

interface ChatContainerProps {
  messages: Message[]
  showTranslation: boolean
  currentPlayingIndex: number
}

export function ChatContainer({ messages, showTranslation, currentPlayingIndex }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <ScrollArea className="flex-1 px-4 min-h-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-4 space-y-4"
      >
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            showTranslation={showTranslation}
            isPlaying={index === currentPlayingIndex}
          />
        ))}
        <div ref={bottomRef} />
      </motion.div>
    </ScrollArea>
  )
}