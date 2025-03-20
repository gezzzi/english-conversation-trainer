"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { VocabularyWord } from '@/types'
import { Plus, Sparkles, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { generateWordDefinition } from '@/lib/dictionary'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface VocabularyWordFormProps {
  onAddWord: (word: VocabularyWord) => void
}

export function VocabularyWordForm({ onAddWord }: VocabularyWordFormProps) {
  const [open, setOpen] = useState(false)
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [example, setExample] = useState('')
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [isGenerating, setIsGenerating] = useState(false)
  
  const resetForm = () => {
    setWord('')
    setTranslation('')
    setExample('')
    setDifficulty('beginner')
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!word.trim()) {
      return
    }
    
    // 意味か例文が空の場合、AIで自動生成
    let finalTranslation = translation.trim()
    let finalExample = example.trim()
    
    if (!finalTranslation || !finalExample) {
      try {
        setIsGenerating(true)
        const generated = await generateWordDefinition(word, difficulty)
        
        if (!finalTranslation) {
          finalTranslation = generated.definition
          setTranslation(finalTranslation)
        }
        
        if (!finalExample) {
          finalExample = generated.example
          setExample(finalExample)
        }
      } catch (error) {
        console.error('自動生成中にエラーが発生しました:', error)
      } finally {
        setIsGenerating(false)
      }
    }
    
    const newWord: VocabularyWord = {
      id: uuidv4(),
      word: word.trim(),
      translation: finalTranslation || '（未入力）',
      example: finalExample || '',
      lastStudied: new Date().toISOString(),
    }
    
    onAddWord(newWord)
    setOpen(false)
    resetForm()
  }
  
  // 自動生成ボタンが押されたときの処理
  const handleAutoGenerate = async () => {
    if (!word.trim()) return
    
    try {
      setIsGenerating(true)
      const generated = await generateWordDefinition(word, difficulty)
      setTranslation(generated.definition)
      setExample(generated.example)
    } catch (error) {
      console.error('自動生成中にエラーが発生しました:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          <span>単語を追加</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新しい単語を追加</DialogTitle>
          <DialogDescription>
            学習したい英単語とその意味、例文を追加してください。
            意味や例文が空の場合は自動で生成されます。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="word" className="text-sm font-medium">
                英単語 <span className="text-destructive">*</span>
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleAutoGenerate}
                      disabled={!word.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      <span>AIで生成</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>意味と例文をAIで自動生成します</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="例: vocabulary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="translation" className="text-sm font-medium">
              意味
              <span className="text-xs ml-2 text-muted-foreground">（空白の場合は自動生成されます）</span>
            </label>
            <Input
              id="translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="例: 語彙、単語"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="example" className="text-sm font-medium">
              例文
              <span className="text-xs ml-2 text-muted-foreground">（空白の場合は自動生成されます）</span>
            </label>
            <Textarea
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="例: He has a wide vocabulary."
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="difficulty" className="text-sm font-medium">
              難易度 <span className="text-destructive">*</span>
            </label>
            <Select
              value={difficulty}
              onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setDifficulty(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="難易度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">初級 (Beginner)</SelectItem>
                <SelectItem value="intermediate">中級 (Intermediate)</SelectItem>
                <SelectItem value="advanced">上級 (Advanced)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button 
              type="submit" 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : '追加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 