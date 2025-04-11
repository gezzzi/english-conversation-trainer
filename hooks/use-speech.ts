"use client"

import { useCallback } from 'react'
import { SpeechManager } from '@/lib/speech'

export function useSpeech() {
  const speak = useCallback((text: string, isUserMessage: boolean = false, onEnd?: () => void) => {
    if (typeof window !== 'undefined') {
      const speechManager = SpeechManager.getInstance();
      speechManager.speak(text, isUserMessage, onEnd);
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') {
      const speechManager = SpeechManager.getInstance();
      speechManager.stop();
    }
  }, [])

  return { speak, stop }
}