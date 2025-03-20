"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Progress } from '@/types'
import { Card } from '@/components/ui/card'
import { Zap, Award, Calendar, Flame, Info } from 'lucide-react'
import { format, differenceInCalendarDays } from 'date-fns'
import { CalendarDialog } from './calendar-dialog'

interface StreakCardProps {
  progress: Progress
  className?: string
}

export function StreakCard({ progress, className = '' }: StreakCardProps) {
  const [streakStatus, setStreakStatus] = useState<'active' | 'atrisk' | 'broken'>('active')
  const [lastActivity, setLastActivity] = useState<string>('')
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    // 最後の練習日からの日数を計算
    const lastPracticed = new Date(progress.lastPracticed)
    const today = new Date()
    const daysSinceLastPractice = differenceInCalendarDays(today, lastPracticed)
    
    // ステータス更新
    if (daysSinceLastPractice === 0) {
      setStreakStatus('active')
    } else if (daysSinceLastPractice === 1) {
      setStreakStatus('atrisk')
    } else {
      setStreakStatus('broken')
    }

    // 最終アクティビティ日の表示形式を設定
    setLastActivity(format(lastPracticed, 'yyyy/MM/dd'))

    // ストリークが10, 30, 50, 100の節目に達した場合にアニメーション表示
    const milestones = [10, 30, 50, 100]
    if (milestones.includes(progress.streak)) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [progress.lastPracticed, progress.streak])

  return (
    <div className={`relative ${className}`}>
      <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          {streakStatus === 'active' ? (
            <Flame className="h-6 w-6 text-amber-500 animate-pulse" />
          ) : streakStatus === 'atrisk' ? (
            <Zap className="h-6 w-6 text-amber-400" />
          ) : (
            <Calendar className="h-6 w-6 text-muted-foreground" />
          )}
          
          <h2 className="text-lg font-semibold">{progress.streak} 日連続</h2>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">ステータス:</span>
            <span className={`text-sm font-medium ${
              streakStatus === 'active' ? 'text-green-500' : 
              streakStatus === 'atrisk' ? 'text-amber-500' : 
              'text-destructive'
            }`}>
              {streakStatus === 'active' ? '継続中' : 
               streakStatus === 'atrisk' ? '今日練習が必要' : 
               'ブレイク'}
            </span>
          </div>
          
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
            {streakStatus === 'active' ? 
              '素晴らしい！毎日続けて学習を習慣化しましょう。' : 
              streakStatus === 'atrisk' ? 
              '今日練習してストリークを維持しましょう！' : 
              'ストリークが途切れてしまいました。今日から再開しましょう！'}
          </p>
        </div>
      </Card>

      {/* ストリークマイルストーン達成時のアニメーション */}
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.2, y: -20 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="bg-amber-500/90 text-white rounded-lg p-4 shadow-lg flex flex-col items-center">
            <Award className="h-8 w-8 text-white mb-2" />
            <h3 className="text-lg font-bold">{progress.streak}日達成！</h3>
            <p className="font-semibold">継続は力なり！</p>
          </div>
        </motion.div>
      )}
    </div>
  )
} 