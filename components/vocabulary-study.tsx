"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Check, X, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { Progress as UserProgress, VocabularyWord } from '@/types'
import { useSpeech } from '@/hooks/use-speech'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'

// サンプル単語データ（ユーザーが単語を追加する前のデフォルト）
const DEFAULT_VOCABULARY: VocabularyWord[] = [
  {
    id: "1",
    word: "abandon",
    definition: "見捨てる、放棄する",
    example: "He had to abandon his car in the flood.",
    level: "intermediate"
  },
  {
    id: "2",
    word: "ability",
    definition: "能力、才能",
    example: "She has the ability to learn languages quickly.",
    level: "beginner"
  },
  {
    id: "3", 
    word: "above",
    definition: "～の上に、以上の",
    example: "The temperature is above average for this time of year.",
    level: "beginner"
  },
  {
    id: "4",
    word: "abroad",
    definition: "海外に、外国で",
    example: "She's currently studying abroad in France.",
    level: "beginner"
  },
  {
    id: "5",
    word: "absolute",
    definition: "絶対的な、完全な",
    example: "I have absolute confidence in her abilities.",
    level: "intermediate"
  },
  {
    id: "6",
    word: "academic",
    definition: "学問の、大学の",
    example: "His academic achievements were impressive.",
    level: "intermediate"
  },
  {
    id: "7",
    word: "accept",
    definition: "受け入れる、承諾する",
    example: "She accepted their offer of employment.",
    level: "beginner"
  },
  {
    id: "8",
    word: "access",
    definition: "アクセス、接近",
    example: "You need a password to access the system.",
    level: "intermediate"
  },
  {
    id: "9",
    word: "accident",
    definition: "事故、偶然",
    example: "He was involved in a car accident last week.",
    level: "beginner"
  },
  {
    id: "10",
    word: "accommodate",
    definition: "収容する、対応する",
    example: "The hotel can accommodate up to 500 guests.",
    level: "advanced"
  }
]

interface VocabularyStudyProps {
  progress: UserProgress
  onClose: () => void
  onComplete: (studiedWords: VocabularyWord[]) => void
}

export function VocabularyStudy({ progress, onClose, onComplete }: VocabularyStudyProps) {
  const [open, setOpen] = useState(true)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [studiedWords, setStudiedWords] = useState<string[]>([])
  const [knownWords, setKnownWords] = useState<VocabularyWord[]>([])
  const [unknownWords, setUnknownWords] = useState<VocabularyWord[]>([])
  const [isFlipped, setIsFlipped] = useState(false)
  const { speak, stop } = useSpeech()
  
  // 学習する単語のリストを生成
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(() => {
    // ユーザーが追加した学習中の単語があれば、それを使用
    if ((progress.studyVocabulary || []).length > 0) {
      return [...(progress.studyVocabulary || [])]
    }
    
    // ユーザーが知っている単語のIDのリスト
    const knownWordIds = (progress.knownVocabulary || []).map(word => word.id)
    
    // ユーザーのレベルに合わせてデフォルト単語をフィルタリング
    const userLevel = progress.level
    const userLevelCategory = userLevel < 10 ? 'beginner' : userLevel < 20 ? 'intermediate' : 'advanced'
    
    const filteredVocabulary = DEFAULT_VOCABULARY.filter(word => {
      // 知っている単語は除外
      if (knownWordIds.includes(word.id)) return false
      
      // レベルに応じてフィルタリング
      if (userLevelCategory === 'advanced') return true
      if (userLevelCategory === 'intermediate') return word.level !== 'advanced'
      return word.level === 'beginner'
    })
    
    // ランダムに並べ替えて最大10件を返す
    return [...filteredVocabulary].sort(() => Math.random() - 0.5).slice(0, 10)
  })
  
  const currentWord = vocabulary[currentWordIndex]
  
  useEffect(() => {
    // ダイアログを閉じるときの処理
    if (!open) {
      stop()
      onComplete(knownWords)
      onClose()
    }
  }, [open, onComplete, onClose, stop, knownWords])
  
  // 単語を読み上げる
  useEffect(() => {
    if (currentWord && !isFlipped) {
      const timer = setTimeout(() => {
        speak(currentWord.word)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentWord, isFlipped, speak])
  
  // カードを裏返す
  const flipCard = () => {
    setIsFlipped(!isFlipped)
    
    // 裏面の場合は例文を読み上げる
    if (!isFlipped) {
      stop()
      setTimeout(() => {
        speak(currentWord.example)
      }, 300)
    } else {
      stop()
      speak(currentWord.word)
    }
  }
  
  // 次の単語へ
  const nextWord = () => {
    // まだ学習していない単語の場合、学習済みリストに追加
    if (!studiedWords.includes(currentWord.id)) {
      setStudiedWords([...studiedWords, currentWord.id])
    }
    
    // 最後の単語の場合は終了
    if (currentWordIndex === vocabulary.length - 1) {
      setOpen(false)
      return
    }
    
    setIsFlipped(false)
    setCurrentWordIndex(prevIndex => prevIndex + 1)
  }
  
  // 前の単語へ
  const prevWord = () => {
    if (currentWordIndex > 0) {
      setIsFlipped(false)
      setCurrentWordIndex(prevIndex => prevIndex - 1)
    }
  }
  
  // 知っている単語としてマーク
  const markAsKnown = () => {
    const currentWordObj = {...currentWord, lastStudied: new Date().toISOString()}
    
    if (!knownWords.some(w => w.id === currentWord.id)) {
      setKnownWords([...knownWords, currentWordObj])
    }
    
    // 知らない単語リストから削除
    setUnknownWords(unknownWords.filter(w => w.id !== currentWord.id))
    
    nextWord()
  }
  
  // 知らない単語としてマーク
  const markAsUnknown = () => {
    const currentWordObj = {...currentWord, lastStudied: new Date().toISOString()}
    
    // 知らない単語リストに追加
    if (!unknownWords.some(w => w.id === currentWord.id)) {
      setUnknownWords([...unknownWords, currentWordObj])
    }
    
    // 知っている単語リストから削除
    setKnownWords(knownWords.filter(w => w.id !== currentWord.id))
    
    nextWord()
  }
  
  // 進捗パーセンテージ
  const progressPercent = ((currentWordIndex + 1) / vocabulary.length) * 100
  
  if (vocabulary.length === 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>単語学習</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6 text-center space-y-4">
            <p>学習する単語がありません。単語を追加してください。</p>
            <Button onClick={() => setOpen(false)}>閉じる</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>単語学習</span>
          </DialogTitle>
          <DialogDescription>
            単語カードをクリックして意味と例文を確認できます。
            知っている単語と知らない単語を分類して学習効率を高めましょう。
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 py-4">
          {/* 進捗バー */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{currentWordIndex + 1}/{vocabulary.length}</span>
              <div className="flex items-center gap-2">
                <span>学習済み: {studiedWords.length}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>「知っている」としてマークした単語: {knownWords.length}</p>
                      <p>「知らない」としてマークした単語: {unknownWords.length}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          
          {/* 単語カード */}
          <Card 
            className="w-full h-60 flex items-center justify-center cursor-pointer relative"
            onClick={flipCard}
          >
            <div className={`absolute w-full h-full flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${
              isFlipped ? 'opacity-0' : 'opacity-100'
            }`}>
              <h3 className="text-3xl font-bold mb-2">{currentWord?.word}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute bottom-4 right-4"
                onClick={(e) => {
                  e.stopPropagation()
                  speak(currentWord.word)
                }}
              >
                🔊
              </Button>
            </div>
            
            <div className={`absolute w-full h-full flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${
              isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              <div className="text-center space-y-4">
                <h4 className="text-xl font-semibold">{currentWord?.definition}</h4>
                <p className="text-sm italic">&ldquo;{currentWord?.example}&rdquo;</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute bottom-4 right-4"
                onClick={(e) => {
                  e.stopPropagation()
                  speak(currentWord.example)
                }}
              >
                🔊
              </Button>
            </div>
          </Card>
          
          {/* ナビゲーションボタン */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={prevWord}
              disabled={currentWordIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex items-center gap-1"
                onClick={markAsUnknown}
              >
                <X className="h-4 w-4" />
                <span>知らない</span>
              </Button>
              
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                onClick={markAsKnown}
              >
                <Check className="h-4 w-4" />
                <span>知っている</span>
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={nextWord}
              disabled={currentWordIndex === vocabulary.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <div>
            <span className="text-sm text-muted-foreground">
              知っている単語: {knownWords.length}/{vocabulary.length}
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            学習を終了
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 