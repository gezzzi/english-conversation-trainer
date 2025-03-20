"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Mic, MicOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { SpeechRecognitionManager } from '@/lib/speech-recognition'
import { toast } from 'sonner'
import { Progress } from '@/types'
import { LevelBadge } from '@/components/level-badge'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  progress: Progress
}

export function ChatInput({ onSend, isLoading, progress }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const speechRecognition = useRef<SpeechRecognitionManager | null>(null)

  useEffect(() => {
    // クライアントサイドでのみ初期化
    if (typeof window !== 'undefined') {
      speechRecognition.current = SpeechRecognitionManager.getInstance()
      setIsSpeechSupported(speechRecognition.current.isSupported())
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  const toggleSpeechRecognition = () => {
    if (!speechRecognition.current) return;

    if (isListening) {
      speechRecognition.current.stopListening();
    } else {
      speechRecognition.current.startListening(
        (text, isFinal) => {
          setInput(text);
          
          // 音声認識が完了したら
          if (isFinal) {
            if (text.trim()) {
              // 音声認識が完了し、テキストが存在する場合は自動送信
              setTimeout(() => {
                onSend(text.trim());
                setInput('');
              }, 500); // 少し遅延を入れてユーザーが認識できるようにする
            }
          }
        },
        () => {
          setIsListening(false);
        },
        (error) => {
          toast.error(`音声認識エラー: ${error}`);
          setIsListening(false);
        }
      );
      setIsListening(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-t shrink-0">
      <div className="w-full max-w-2xl mx-auto flex gap-2 items-center">
        <LevelBadge progress={progress} className="mr-1 hidden sm:flex" />
        <div className="flex-1 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="日本語でメッセージを入力してください..."
            className="h-12 pr-14"
          />
          {isSpeechSupported && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isListening && (
                <div className="absolute inset-0 z-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-30"></span>
                  <span className="animate-ripple absolute inline-flex h-full w-full rounded-full bg-destructive opacity-20"></span>
                </div>
              )}
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className={`relative z-10 h-8 w-8 rounded-full shadow-md transition-all duration-200 ${
                  isListening ? 'ring-2 ring-destructive ring-offset-2' : 'hover:bg-primary/10'
                }`}
                onClick={toggleSpeechRecognition}
                disabled={isLoading}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 animate-[wiggle_1s_ease-in-out_infinite]" />
                ) : (
                  <Mic className="h-4 w-4 text-primary" />
                )}
              </Button>
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0"
        >
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="h-12 w-12"
          >
            <Send className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </form>
  )
}