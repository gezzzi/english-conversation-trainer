"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format, addDays, subDays, startOfMonth, endOfMonth, isSameDay, parseISO, isSameMonth, isBefore, isAfter } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Progress } from '@/types'
import { Calendar, Info } from 'lucide-react'

interface CalendarDialogProps {
  lastPracticed: string
  children?: React.ReactNode
}

export function CalendarDialog({ lastPracticed, children }: CalendarDialogProps) {
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
    <Dialog>
      <DialogTrigger asChild>
        {children || <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>練習カレンダー</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-3">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline"
              size="sm"
              onClick={prevMonth} 
              className="text-sm"
            >
              前月
            </Button>
            <h3 className="font-medium">
              {format(currentMonth, 'yyyy年 MM月', { locale: ja })}
            </h3>
            <Button 
              variant="outline"
              size="sm"
              onClick={nextMonth} 
              className="text-sm"
            >
              次月
            </Button>
          </div>
          
          <div className="grid grid-cols-7 text-center text-xs mb-2 border-b pb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
              <div key={day} className="py-1 font-medium">
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
                    "h-9 w-9 text-sm flex items-center justify-center rounded-full",
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
          
          <div className="mt-4 flex gap-4 text-sm justify-center border-t pt-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/60 rounded-full"></div>
              <span>練習した日</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400/40 rounded-full"></div>
              <span>練習なし</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 