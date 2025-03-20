"use client"

import { Progress } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface LevelBadgeProps {
  progress: Progress
  className?: string
}

export function LevelBadge({ progress, className = '' }: LevelBadgeProps) {
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

  const levelProgress = Math.floor(progress.experience % 100);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${className}`}>
            <Badge variant="outline" className="px-2 py-0.5 h-6 bg-primary/10 hover:bg-primary/15 transition-colors border-primary/20 text-xs font-semibold">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              Lv.{progress.level}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs p-2">
          <div className="space-y-1">
            <p className="font-semibold">{getLevelLabel()}</p>
            <p>{levelProgress}/100 XP</p>
            <p>次のレベルまであと {100 - levelProgress} XP</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 