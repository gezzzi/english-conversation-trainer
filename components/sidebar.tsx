"use client"

import { Progress, VocabularyWord } from '@/types'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Progress as ProgressIndicator } from './ui/progress'
import { ChevronLeft, ChevronRight, Trophy, Zap, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { LevelIndicator } from './level-indicator'
import { StreakCard } from './streak-card'
import { VocabularyCard } from './vocabulary-card'

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
    <motion.div
      initial={{ width: isOpen ? 300 : 0 }}
      animate={{ width: isOpen ? 300 : 0 }}
      className="border-r bg-card/50 backdrop-blur-sm relative"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-10 top-4 hover:text-primary"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      {isOpen && (
        <div className="p-4 space-y-4">
          <LevelIndicator progress={progress} />
          
          <StreakCard progress={progress} />
          
          <VocabularyCard 
            progress={progress} 
            onStudyComplete={onVocabularyStudyComplete} 
            onAddWord={onAddWord}
            onRemoveWord={onRemoveWord}
            onUpdateProgress={onUpdateProgress}
          />

          <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">メッセージ総数</h2>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold">{progress.totalMessages}</div>
                <p className="text-sm text-muted-foreground mt-1">送信したメッセージ数</p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">正確な文:</span>
                <span className="text-sm font-medium">{progress.correctSentences}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">正確率:</span>
                <span className="text-sm font-medium">
                  {progress.totalMessages > 0 
                    ? Math.round((progress.correctSentences / progress.totalMessages) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  )
}