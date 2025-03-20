"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/types'
import { format } from 'date-fns'
import { BarChart, MessageSquare, BookOpen } from 'lucide-react'

interface ProgressCardProps {
  progress: Progress
}

export function ProgressCard({ progress }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <MessageSquare className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{progress.totalMessages}</div>
            <div className="text-sm text-muted-foreground">Messages</div>
          </div>
          <div className="flex flex-col items-center">
            <BarChart className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{progress.correctSentences}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="flex flex-col items-center">
            <BookOpen className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{progress.vocabularyLearned}</div>
            <div className="text-sm text-muted-foreground">Vocabulary</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Last practiced: {format(new Date(progress.lastPracticed), 'PPP')}
        </div>
      </CardContent>
    </Card>
  )
}