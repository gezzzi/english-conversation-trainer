"use client"

import { Progress, VocabularyWord } from '@/types'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Progress as ProgressIndicator } from './ui/progress'
import { ChevronLeft, Menu } from 'lucide-react'
import { LevelIndicator } from './level-indicator'
import { StreakCard } from './streak-card'
import { VocabularyCard } from './vocabulary-card'
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  progress: Progress
  onVocabularyStudyComplete?: (studiedWords: VocabularyWord[]) => void
  onAddWord?: (word: VocabularyWord) => void
  onRemoveWord?: (wordId: string) => void
  onUpdateProgress?: (update: Partial<Progress>) => void
}

export function Sidebar({ 
  isOpen,
  onToggle,
  progress,
  onVocabularyStudyComplete,
  onAddWord,
  onRemoveWord,
  onUpdateProgress
}: SidebarProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 hover:text-primary"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      <Sheet open={isOpen} onOpenChange={() => onToggle()}>
        <SheetContent side="left" className="w-[300px] pt-16 [&>button:last-child]:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-50 hover:text-primary"
            onClick={() => onToggle()}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="space-y-4">
            <LevelIndicator progress={progress} />
            
            <VocabularyCard 
              progress={progress} 
              onStudyComplete={onVocabularyStudyComplete} 
              onAddWord={onAddWord}
              onRemoveWord={onRemoveWord}
              onUpdateProgress={onUpdateProgress}
            />

            <StreakCard progress={progress} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}