"use client"

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Bot, User, Volume2, VolumeX, MessageCircle, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSpeech } from '@/hooks/use-speech'
import { Message } from '@/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
  showTranslation: boolean
  isPlaying?: boolean
}

export function ChatMessage({ message, showTranslation, isPlaying }: ChatMessageProps) {
  const { speak, stop } = useSpeech()
  const [isPlayingState, setIsPlayingState] = useState(isPlaying || false)

  const handleSpeak = () => {
    if (isPlayingState) {
      stop()
      setIsPlayingState(false)
    } else {
      speak(
        message.type === 'user' && message.translation ? message.translation : message.content,
        message.type === 'user',
        () => setIsPlayingState(false)
      )
      setIsPlayingState(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3",
        message.type === 'user' ? "flex-row-reverse" : "",
        isPlayingState && "ring-2 ring-primary"
      )}
    >
      <Avatar className={`h-10 w-10 relative ${message.type === 'user' ? 'bg-gradient-to-br from-blue-400 to-indigo-600 shadow-md' : 'bg-gradient-to-br from-green-400 to-teal-500 shadow-md'}`}>
        {message.type === 'user' ? (
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600">
            <User className="h-4 w-4 text-white" />
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-500">
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className={cn(
        "space-y-2 max-w-[80%]",
        message.type === 'user' ? "bg-primary/10" : "bg-muted"
      )}>
        <Card className={`p-4 shadow-lg ${message.type === 'user' ? 'chat-bubble-user border-primary/20' : 'chat-bubble-bot'}`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-relaxed">{message.content}</p>
            {message.type !== 'user' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 hover:text-primary"
                onClick={handleSpeak}
              >
                {isPlayingState ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {showTranslation && message.translation && (
            <div className="mt-2 border-t pt-2 flex items-start justify-between gap-2">
              <p className="text-sm text-muted-foreground">{message.translation}</p>
              {message.type === 'user' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 hover:text-primary"
                  onClick={handleSpeak}
                >
                  {isPlayingState ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          )}
        </Card>
        {message.correction && message.correction.length > 0 && (
          <Card className="p-3 bg-muted/50 border border-primary/20">
            <p className="text-xs font-medium text-primary">Grammar Corrections:</p>
            {message.correction.map((correction, index) => (
              <div key={index} className="mt-2 text-xs">
                <span className="text-destructive line-through">{correction.original}</span>
                {' → '}
                <span className="text-primary font-medium">{correction.correction}</span>
                <p className="mt-1 text-muted-foreground">{correction.explanation}</p>
              </div>
            ))}
          </Card>
        )}
      </div>
    </motion.div>
  )
}