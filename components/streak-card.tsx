"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Progress } from '@/types'
import { Card } from '@/components/ui/card'
import { Calendar, Info } from 'lucide-react'
import { format } from 'date-fns'
import { CalendarDialog } from './calendar-dialog'

interface StreakCardProps {
  progress: Progress
  className?: string
}

export function StreakCard({ progress, className = '' }: StreakCardProps) {
  const [lastActivity, setLastActivity] = useState<string>('')

  useEffect(() => {
    // 最終アクティビティ日の表示形式を設定
    const lastPracticed = new Date(progress.lastPracticed)
    setLastActivity(format(lastPracticed, 'yyyy/MM/dd'))
  }, [progress.lastPracticed])

  return (
    <div className={`relative ${className}`}>
      <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">学習記録</h2>
        </div>
        
        <div className="space-y-2">          
          <div className="flex justify-between items-center">
            <span className="text-sm">最終練習日:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{lastActivity}</span>
              <CalendarDialog lastPracticed={progress.lastPracticed}>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
              </CalendarDialog>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            毎日続けて学習を習慣化しましょう。
          </p>
        </div>
      </Card>
    </div>
  )
} 