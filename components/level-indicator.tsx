"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/types'
import { Card } from '@/components/ui/card'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Star, Trophy } from 'lucide-react'

interface LevelIndicatorProps {
  progress: Progress
  className?: string
}

export function LevelIndicator({ progress, className = '' }: LevelIndicatorProps) {
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [prevLevel, setPrevLevel] = useState(progress.level)

  useEffect(() => {
    // レベルが上がった時のアニメーションを表示
    if (progress.level > prevLevel) {
      setShowLevelUp(true)
      const timer = setTimeout(() => setShowLevelUp(false), 3000)
      return () => clearTimeout(timer)
    }
    setPrevLevel(progress.level)
  }, [progress.level, prevLevel])

  // レベル進捗率を計算
  const levelProgress = (progress.experience % 100) / 100
  const nextLevel = progress.level + 1
  
  // 難易度レベルに基づくラベル
  const getLevelLabel = () => {
    // 10レベルごとに同じラベルを表示
    const labelIndex = Math.ceil(progress.level / 10);
    
    switch (labelIndex) {
      case 1: return '英語？食べられるの？' // レベル1-10
      case 2: return 'Hello と言った後、頭が真っ白' // レベル11-20
      case 3: return '道を尋ねたら、答えが長すぎて絶望' // レベル21-30
      case 4: return '外国人との会話、7割は頷くだけ' // レベル31-40
      case 5: return '映画は字幕ありでほぼ理解' // レベル41-50
      case 6: return '海外ドラマ、たまに字幕なしでも笑える' // レベル51-60
      case 7: return '英語での電話、もう震えない' // レベル61-70
      case 8: return '友達から通訳を頼まれがち' // レベル71-80
      case 9: return '英語で冗談を言って笑いを取れる' // レベル81-90
      case 10: return '英語を話すとき、もう母国語を忘れる' // レベル91-100
      default:
        if (labelIndex > 10) return '英語を話すとき、もう母国語を忘れる'
        return '英語？食べられるの？'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="p-4 border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Level {progress.level}</h2>
          <Badge variant="outline" className="ml-auto px-2 py-0.5 text-xs">
            {getLevelLabel()}
          </Badge>
        </div>
        
        <ProgressBar value={levelProgress * 100} className="h-2 mb-2 progress-gradient" />
        
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>レベル {progress.level}</span>
          <span>{Math.floor(progress.experience % 100)}/100 XP</span>
          <span>レベル {nextLevel}</span>
        </div>
      </Card>

      {/* レベルアップアニメーション */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-primary/90 text-primary-foreground rounded-lg p-4 shadow-lg flex flex-col items-center">
              <Sparkles className="h-8 w-8 text-yellow-300 mb-2" />
              <h3 className="text-lg font-bold">レベルアップ！</h3>
              <p className="font-semibold">レベル {progress.level} 達成</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 