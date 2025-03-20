"use client"

import { useState, useEffect } from 'react'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { format, addDays, subDays, startOfMonth, endOfMonth, isSameDay, parseISO, isSameMonth, isBefore, isAfter } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Progress } from '@/types'

interface CalendarTooltipProps {
  children: React.ReactNode
  lastPracticed: string
  className?: string
}

export function CalendarTooltip({ children, lastPracticed, className }: CalendarTooltipProps) {
  const [practiceDates, setPracticeDates] = useState<Date[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // 練習日のモックデータを生成（実際の実装では過去の練習履歴から取得する）
  useEffect(() => {
    // 最終練習日を含む
    const dates = [parseISO(lastPracticed)]
    
    // 過去30日のうちランダムな10日を練習日として追加
    const today = new Date()
    const past30Days = Array.from({ length: 30 }, (_, i) => {
      return subDays(today, i + 1)
    })
    
    // シャッフルしてランダムな10日を選択
    const shuffled = [...past30Days].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 10)
    
    setPracticeDates([...dates, ...selected])
  }, [lastPracticed])
  
  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = subDays(monthStart, monthStart.getDay())
    const endDate = addDays(monthEnd, 6 - monthEnd.getDay())
    
    const days = []
    let day = startDate
    
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    
    // 週ごとに分割
    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }
    
    return weeks
  }
  
  // 前月へ
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() - 1)
      return newMonth
    })
  }
  
  // 次月へ
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + 1)
      return newMonth
    })
  }
  
  // 特定の日が練習日かどうかチェック
  const isPracticeDay = (date: Date) => {
    return practiceDates.some(d => isSameDay(d, date))
  }
  
  // アプリ使用開始前かどうかチェック（最初の練習日より前）
  const isBeforeFirstUse = (date: Date) => {
    // 最初の練習日を取得（実際の実装ではユーザーの登録日などを使用）
    const firstPracticeDate = parseISO(lastPracticed)
    return isBefore(date, firstPracticeDate) 
  }
  
  // 未来の日付かどうかチェック
  const isFutureDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 時間をリセット
    return isAfter(date, today)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help border-dotted border-b", className)}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          sideOffset={10}
          align="center" 
          alignOffset={0}
          avoidCollisions={false}
          className="w-[300px] p-0 bg-card/95 backdrop-blur-sm border-primary/20 z-50"
        >
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <button 
                onClick={prevMonth} 
                className="text-sm hover:text-primary"
              >
                ＜
              </button>
              <h3 className="font-medium">
                {format(currentMonth, 'yyyy年 MM月', { locale: ja })}
              </h3>
              <button 
                onClick={nextMonth} 
                className="text-sm hover:text-primary"
              >
                ＞
              </button>
            </div>
            
            <div className="grid grid-cols-7 text-center text-xs mb-1">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().flat().map((day, i) => {
                const practiced = isPracticeDay(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isFuture = isFutureDate(day)
                const isBeforeApp = isBeforeFirstUse(day)
                
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "h-6 w-6 text-xs flex items-center justify-center rounded-full",
                      !isFuture && !isBeforeApp ? (
                        practiced ? "bg-green-500/60 text-white" : "bg-red-400/40"
                      ) : "bg-transparent text-muted-foreground",
                      !isCurrentMonth && "opacity-30",
                      isSameDay(day, parseISO(lastPracticed)) && "ring-2 ring-primary"
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                )
              })}
            </div>
            
            <div className="mt-2 flex gap-3 text-xs justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/60 rounded-full"></div>
                <span>練習した日</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400/40 rounded-full"></div>
                <span>練習なし</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 