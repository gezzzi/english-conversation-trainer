"use client"

import { useState, useEffect } from 'react'
import { Progress, VocabularyWord } from '@/types'
import { Card } from '@/components/ui/card'
import { BookOpen, Award, Bookmark, BarChart, Brain, PlayCircle, Sparkles } from 'lucide-react'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VocabularyStudy } from './vocabulary-study'
import { VocabularyWordForm } from './vocabulary-word-form'
import { VocabularyList } from './vocabulary-list'
import { motion } from 'framer-motion'

interface VocabularyCardProps {
  progress: Progress
  className?: string
  onStudyComplete?: (studiedWords: VocabularyWord[]) => void
  onAddWord?: (word: VocabularyWord) => void
  onRemoveWord?: (wordId: string) => void
  onUpdateProgress?: (update: Partial<Progress>) => void
}

const VOCABULARY_MILESTONES = [
  { count: 0, title: '単語学習スタート', badgeColor: 'bg-slate-400' },
  { count: 50, title: '初級レベル', badgeColor: 'bg-blue-400' },
  { count: 100, title: '基礎語彙マスター', badgeColor: 'bg-green-400' },
  { count: 200, title: '日常会話レベル', badgeColor: 'bg-yellow-400' },
  { count: 500, title: '中級者レベル', badgeColor: 'bg-orange-400' },
  { count: 1000, title: '上級者レベル', badgeColor: 'bg-red-400' },
  { count: 2000, title: '語彙マスター', badgeColor: 'bg-purple-400' },
  { count: 5000, title: 'ネイティブレベル', badgeColor: 'bg-pink-400' }
]

export function VocabularyCard({ 
  progress, 
  className = '', 
  onStudyComplete,
  onAddWord,
  onRemoveWord,
  onUpdateProgress
}: VocabularyCardProps) {
  const [currentMilestone, setCurrentMilestone] = useState(VOCABULARY_MILESTONES[0])
  const [nextMilestone, setNextMilestone] = useState(VOCABULARY_MILESTONES[1])
  const [progressPercent, setProgressPercent] = useState(0)
  const [showStudy, setShowStudy] = useState(false)

  useEffect(() => {
    // 現在と次のマイルストーンを特定
    const currentIndex = VOCABULARY_MILESTONES.findIndex(
      (milestone, index, array) => 
        progress.vocabularyLearned >= milestone.count && 
        (index === array.length - 1 || progress.vocabularyLearned < array[index + 1].count)
    )
    
    const current = VOCABULARY_MILESTONES[currentIndex]
    const next = VOCABULARY_MILESTONES[Math.min(currentIndex + 1, VOCABULARY_MILESTONES.length - 1)]
    
    setCurrentMilestone(current)
    setNextMilestone(next)
    
    // 進捗率の計算
    if (current.count === next.count) {
      setProgressPercent(100) // 最終マイルストーンの場合
    } else {
      const progressInRange = progress.vocabularyLearned - current.count
      const rangeSize = next.count - current.count
      setProgressPercent((progressInRange / rangeSize) * 100)
    }
  }, [progress.vocabularyLearned])

  const handleStudyComplete = (studiedWords: VocabularyWord[]) => {
    setShowStudy(false)
    
    // 学習した単語を親コンポーネントに通知
    if (onStudyComplete) {
      onStudyComplete(studiedWords);
    }
  }
  
  const handleAddWord = (word: VocabularyWord) => {
    if (onAddWord) {
      onAddWord(word);
    }
  }
  
  const handleRemoveFromKnown = (wordId: string) => {
    if (onRemoveWord) {
      onRemoveWord(wordId);
      
      // 知っている単語数を更新
      if (onUpdateProgress) {
        onUpdateProgress({
          vocabularyLearned: Math.max(0, progress.vocabularyLearned - 1)
        });
      }
    }
  }
  
  const handleRemoveFromStudy = (wordId: string) => {
    if (onRemoveWord) {
      onRemoveWord(wordId);
    }
  }
  
  const handleAddToStudy = (word: VocabularyWord) => {
    if (onAddWord) {
      onAddWord({...word, lastStudied: new Date().toISOString(), reviewCount: 0});
    }
  }

  return (
    <>
      <Card className={`p-4 border-primary/20 bg-card/50 backdrop-blur-sm ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">学習語彙数</h2>
        </div>
        
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            <div className="text-2xl font-bold">{(progress.knownVocabulary || []).length}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>{currentMilestone.count}</span>
              <span className="text-muted-foreground">次のレベルまで: あと {Math.max(0, nextMilestone.count - (progress.knownVocabulary || []).length)} 語</span>
              <span>{nextMilestone.count}</span>
            </div>
            <ProgressBar value={progressPercent} className="h-2" />
          </div>
          
          <div className="flex gap-2 mt-4">
            <VocabularyWordForm onAddWord={handleAddWord} />
            
            <VocabularyList 
              knownVocabulary={progress.knownVocabulary || []}
              studyVocabulary={progress.studyVocabulary || []}
              onAddToStudy={handleAddToStudy}
              onRemoveFromKnown={handleRemoveFromKnown}
              onRemoveFromStudy={handleRemoveFromStudy}
            />
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4"
          >
            <Button 
              variant="default" 
              className="w-full relative group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md"
              onClick={() => setShowStudy(true)}
            >
              <span className="absolute left-0 top-0 h-full w-full bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-md"></span>
              <PlayCircle className="mr-2 h-5 w-5 animate-pulse text-purple-100" />
              <span className="font-medium tracking-wide">学習を始める</span>
              <Sparkles className="ml-2 h-4 w-4 text-yellow-200" />
            </Button>
          </motion.div>
        </div>
      </Card>
      
      {showStudy && (
        <VocabularyStudy 
          progress={progress} 
          onClose={() => setShowStudy(false)} 
          onComplete={handleStudyComplete} 
        />
      )}
    </>
  )
} 